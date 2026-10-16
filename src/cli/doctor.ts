export type DoctorReport = { webhook: boolean; runnerPinned: boolean; routeEligible: boolean; shadowComplete: boolean; githubWrites: number; selectedPr: number | undefined };

export function doctor(input: { webhookDelivered: boolean; pinnedSha: string | undefined; routePriced: boolean; shadowComplete: boolean; selectedPr: number | undefined; enabled: boolean; namedPr: number }): DoctorReport {
  if (!input.enabled) return { webhook: false, runnerPinned: false, routeEligible: false, shadowComplete: false, githubWrites: 0, selectedPr: undefined };
  if (input.selectedPr !== input.namedPr) return { webhook: input.webhookDelivered, runnerPinned: Boolean(input.pinnedSha), routeEligible: input.routePriced, shadowComplete: false, githubWrites: 0, selectedPr: undefined };
  return {
    webhook: input.webhookDelivered,
    runnerPinned: Boolean(input.pinnedSha),
    routeEligible: input.routePriced,
    shadowComplete: input.shadowComplete,
    githubWrites: 0,
    selectedPr: input.namedPr,
  };
}
