import { planPublication, type PublicationFinding, type PublicationInput, type PublicationPlan } from "../core/evidence";

export type GitHubObject = { id: string; kind: "walkthrough" | "check" | "inline"; headSha: string; body: string; fingerprint?: string };

const MARKER = "<!-- codepoppy:walkthrough -->";

export class Publisher {
  readonly objects: GitHubObject[] = [];
  safeMode = false;
  writes = 0;

  constructor(private readonly currentHead: () => string) {}

  publish(input: PublicationInput, posture: "shadow" | "publish"): PublicationPlan {
    if (posture === "shadow") return { kind: "none", reason: "shadow" };
    if (this.currentHead() !== input.snapshot.headSha) return { kind: "none", reason: "stale head" };
    const markers = this.objects.filter((item) => item.kind === "walkthrough" && item.body.startsWith(MARKER));
    if (markers.length > 1) {
      this.safeMode = true;
      return { kind: "none", reason: "duplicate walkthrough" };
    }
    const plan = planPublication(input);
    if (plan.kind === "none") return plan;
    if (plan.kind === "failure-check") {
      this.upsert({ id: `check:${input.snapshot.headSha}`, kind: "check", headSha: input.snapshot.headSha, body: "failure: review did not finish" });
      return plan;
    }
    const body = renderWalkthrough(plan, input.snapshot.headSha);
    const existing = markers[0];
    this.upsert({ id: existing?.id ?? "walkthrough:1", kind: "walkthrough", headSha: input.snapshot.headSha, body });
    this.upsert({ id: `check:${input.snapshot.headSha}`, kind: "check", headSha: input.snapshot.headSha, body: plan.check });
    for (const finding of plan.inline) {
      const prior = this.objects.find((item) => item.kind === "inline" && item.fingerprint === finding.fingerprint && item.headSha === input.snapshot.headSha);
      this.upsert({ id: prior?.id ?? `inline:${finding.fingerprint}`, kind: "inline", headSha: input.snapshot.headSha, fingerprint: finding.fingerprint, body: renderFinding(finding) });
    }
    return plan;
  }

  private upsert(object: GitHubObject): void {
    if (this.safeMode) return;
    const index = this.objects.findIndex((item) => item.id === object.id);
    if (index >= 0) this.objects[index] = object;
    else this.objects.push(object);
    this.writes += 1;
  }
}

export function renderWalkthrough(plan: Extract<PublicationPlan, { kind: "publish" }>, headSha: string): string {
  const summary = plan.inline.length === 0 && plan.check === "success"
    ? "No actionable finding was found. This does not say the pull request is safe to merge."
    : `Reviewed ${headSha}. ${plan.inline.length} inline findings. Omitted ${plan.omitted.join(", ") || "none"}.`;
  return `${MARKER}\n${summary}`;
}

export function renderFinding(finding: PublicationFinding): string {
  return [`Scenario: ${finding.scenario}`, `Changed line: ${finding.path}:${finding.line}`, `Context: ${finding.context}`, `Consequence: ${finding.consequence}`, `Next step: ${finding.nextStep}`].join("\n");
}

export function preview(input: PublicationInput): string {
  const plan = planPublication({ ...input, approved: true, qualified: true });
  if (plan.kind !== "publish") return "";
  return renderWalkthrough(plan, input.snapshot.headSha);
}
