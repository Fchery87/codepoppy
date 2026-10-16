export type SavedResponse = {
  category: string;
  severity: "critical" | "high" | "medium" | "low" | "informational";
  verdict: "affirm" | "reject" | "unresolved";
  claim: string;
  path: string;
  line: number;
  scenario: string;
  context: string;
  consequence: string;
  nextStep: string;
};

export function readSaved(response: SavedResponse): SavedResponse {
  return response;
}
