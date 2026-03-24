import { describe, expect, it } from "bun:test";
import type { DataProven } from "#schemas";
import { mergeProvenData } from "#utils/merge-data";

describe("mergeProvenData", () => {
  it("correctly merges data", () => {
    const existing: DataProven = [
      { name: "Wood", fire: { steps: 9 } },
      { name: "Teal", earth: { steps: 16 } },
    ];
    const elements: DataProven = [{ name: "Teal", water: { steps: 15 } }];
    const merged = mergeProvenData(existing, elements);
    expect(merged).toEqual([
      { name: "Wood", fire: { steps: 9 } },
      { name: "Teal", earth: { steps: 16 }, water: { steps: 15 } },
    ]);
  });
});
