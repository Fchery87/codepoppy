export type Profile = "precise" | "balanced" | "thorough";
export type Posture = "shadow" | "publish";

export type TrustedConfig = {
  version: 1;
  profile: Profile;
  posture: Posture;
  routeAlias?: string;
  repositoryBudgetCents?: number;
  excludes: string[];
};

const PROFILES = new Set<Profile>(["precise", "balanced", "thorough"]);
const POSTURES = new Set<Posture>(["shadow", "publish"]);
const FIELDS = new Set(["version", "profile", "posture", "routeAlias", "repositoryBudgetCents", "excludes"]);

export function parseTrustedConfig(raw: unknown, bounds: { personalCeilingCents: number; approvedAliases: string[] }): TrustedConfig {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) throw Error("invalid configuration: body");
  const record = raw as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (!FIELDS.has(key)) throw Error(`invalid configuration: ${key}`);
  }
  if (record.version !== 1) throw Error("invalid configuration: version");
  if (!PROFILES.has(record.profile as Profile)) throw Error("invalid configuration: profile");
  if (!POSTURES.has(record.posture as Posture)) throw Error("invalid configuration: posture");
  if (record.routeAlias !== undefined) {
    if (typeof record.routeAlias !== "string" || !bounds.approvedAliases.includes(record.routeAlias)) {
      throw Error("invalid configuration: routeAlias");
    }
  }
  if (record.repositoryBudgetCents !== undefined) {
    if (!Number.isSafeInteger(record.repositoryBudgetCents) || (record.repositoryBudgetCents as number) < 0) {
      throw Error("invalid configuration: repositoryBudgetCents");
    }
    if ((record.repositoryBudgetCents as number) > bounds.personalCeilingCents) {
      throw Error("invalid configuration: repositoryBudgetCents");
    }
  }
  const excludes = record.excludes ?? [];
  if (!Array.isArray(excludes) || excludes.some((item) => typeof item !== "string")) throw Error("invalid configuration: excludes");
  return {
    version: 1,
    profile: record.profile as Profile,
    posture: record.posture as Posture,
    routeAlias: record.routeAlias as string | undefined,
    repositoryBudgetCents: record.repositoryBudgetCents as number | undefined,
    excludes: excludes as string[],
  };
}

export function installationDefaults(): TrustedConfig {
  return { version: 1, profile: "precise", posture: "shadow", excludes: [] };
}
