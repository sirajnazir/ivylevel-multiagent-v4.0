export interface ExtendedMetadata {
  original: Record<string, any>;
  enriched: Record<string, any>;
  version: string;
  enrichedAt: string;
}

export function extendMetadata(chip: any): ExtendedMetadata {
  const meta = chip.metadata || {};

  const enriched = {
    ...meta,
    hasEQ: !!meta.eq_signal,
    hasTactic: meta.type?.toLowerCase()?.includes("tactic"),
    seniority:
      meta.phase?.includes("P5")
        ? "senior"
        : meta.phase?.includes("P4")
        ? "junior"
        : "underclass",
    confidenceCategory:
      meta.confidence_score >= 0.9
        ? "high"
        : meta.confidence_score >= 0.75
        ? "medium"
        : "low",
  };

  return {
    original: meta,
    enriched,
    version: "ext-v1",
    enrichedAt: new Date().toISOString(),
  };
}
