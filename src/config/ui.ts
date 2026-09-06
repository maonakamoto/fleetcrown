export const HEALTH_THRESHOLDS = {
  warningPct: 66,
  criticalPct: 86,
} as const;

export const GOAL_PROGRESS_THRESHOLDS = {
  cautionPct: 50,
  healthyPct: 80,
} as const;

/** Maps session health short labels to their Tailwind tag classes. */
export const HEALTH_TAG_STYLE: Record<string, string> = {
  good: "ui-tag ui-tag-positive",
  excellent: "ui-tag ui-tag-positive",
  "needs attention": "ui-tag ui-tag-warning",
  degraded: "ui-tag ui-tag-warning",
  critical: "ui-tag ui-tag-negative",
};
