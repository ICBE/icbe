import type { DataProven, DataProvenEntry } from "#schemas";

function mergeOne(
  existing: DataProvenEntry,
  item: DataProvenEntry,
  key: "earth" | "water" | "fire" | "wind" | "all",
): Record<string, unknown> {
  const existingVal = existing[key];
  const itemVal = item[key];

  if (!existingVal && !itemVal) return {};

  return { [key]: { ...existingVal, ...itemVal } };
}

export function mergeProvenData(
  existing: DataProven,
  elements: DataProven,
): DataProven {
  const combinedMap = new Map<string, DataProvenEntry>();

  for (const item of [...existing, ...elements]) {
    const existingItem = combinedMap.get(item.name);

    if (existingItem) {
      combinedMap.set(item.name, {
        ...existingItem,
        ...item,
        // Only include the key if it exists in either object
        ...mergeOne(existingItem, item, "earth"),
        ...mergeOne(existingItem, item, "water"),
        ...mergeOne(existingItem, item, "fire"),
        ...mergeOne(existingItem, item, "wind"),
        ...mergeOne(existingItem, item, "all"),
      });
    } else {
      combinedMap.set(item.name, item);
    }
  }

  return Array.from(combinedMap.values());
}
