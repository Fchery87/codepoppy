export type SetupStep = { name: "github-app" | "cloudflare" | "postgres" | "runner" | "provider"; write: string };

export const SETUP_STEPS: SetupStep[] = [
  { name: "github-app", write: "store the app id" },
  { name: "cloudflare", write: "store the workers name" },
  { name: "postgres", write: "store the database url name" },
  { name: "runner", write: "store the runner repository id" },
  { name: "provider", write: "store the provider alias" },
];

export type SetupEvent = { step: string; confirmed: boolean; attempted: boolean };

export function runSetup(answers: Record<string, boolean>, completed: string[] = []): { events: SetupEvent[]; completed: string[] } {
  const events: SetupEvent[] = [];
  const done = new Set(completed);
  for (const step of SETUP_STEPS) {
    if (done.has(step.name)) {
      events.push({ step: step.name, confirmed: true, attempted: false });
      continue;
    }
    const confirmed = answers[step.name] === true;
    events.push({ step: step.name, confirmed, attempted: confirmed });
    if (!confirmed) break;
    done.add(step.name);
  }
  return { events, completed: [...done] };
}

export function usage(): string {
  return ["codepoppy setup", "codepoppy doctor --pr <number>"].join("\n");
}
