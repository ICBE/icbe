interface TimeRangePreset {
  label: string;
  durationMs: number | "all"; // 'all' for all time, otherwise duration in milliseconds
}

export const TIME_RANGE_PRESETS: TimeRangePreset[] = [
  { label: "All Time", durationMs: "all" },
  { label: "1y", durationMs: 365 * 24 * 60 * 60 * 1000 },
  { label: "1m", durationMs: 30 * 24 * 60 * 60 * 1000 },
  { label: "1w", durationMs: 7 * 24 * 60 * 60 * 1000 },
  { label: "3d", durationMs: 3 * 24 * 60 * 60 * 1000 },
  { label: "1d", durationMs: 1 * 24 * 60 * 60 * 1000 },
];
