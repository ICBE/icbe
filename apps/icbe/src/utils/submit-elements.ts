import type {
  DataDisproven,
  DataProven,
  ElementsHistory,
  ElementsHistoryEntry,
  Metadata,
} from "#schemas";
import {
  getDisprovenData,
  getElementsHistory,
  getProvenData,
  type SaveToCloudData,
} from "./gitlab";
import { mergeProvenData } from "./merge-data";

function getUpdatedMetaInfo<T extends "proven" | "disproven">(
  oldHistory: ElementsHistory,
  elements: { type: T; count: number },
): { metadata: Metadata; history: ElementsHistory } {
  const unixTimestamp = Date.now();
  const isoTimestamp = new Date(unixTimestamp).toISOString();

  const lastEntry = oldHistory.at(-1);

  const counts =
    elements.type === "proven"
      ? { proven: elements.count, disproven: lastEntry?.disproven ?? null }
      : { proven: lastEntry?.proven ?? null, disproven: elements.count };

  const newHistoryEntry: ElementsHistoryEntry = {
    timestamp: unixTimestamp,
    "iso-timestamp": isoTimestamp,
    proven: counts.proven,
    disproven: counts.disproven,
  };

  const history: ElementsHistory = [...oldHistory, newHistoryEntry];

  const metadata: Metadata = {
    lastUpdated: { "unix-timestamp": unixTimestamp },
    proven: { count: counts.proven ?? 0 },
    disproven: { count: counts.disproven ?? 0 },
  };
  return { metadata, history };
}

export async function getProvenToSave(
  elements: DataProven,
): Promise<SaveToCloudData> {
  const [existing, oldHistory] = await Promise.all([
    getProvenData(),
    getElementsHistory(),
  ]);

  const combined = mergeProvenData(existing, elements);

  const { metadata, history } = getUpdatedMetaInfo(oldHistory, {
    type: "proven",
    count: combined.length,
  });

  const dataToSave: SaveToCloudData = {
    elements: { type: "proven", data: combined },
    history,
    metadata,
  };

  return dataToSave;
}

export async function getDisprovenToSave(
  elements: DataDisproven,
): Promise<SaveToCloudData> {
  const [existing, oldHistory] = await Promise.all([
    getDisprovenData(),
    getElementsHistory(),
  ]);

  const combined = [...new Set([...existing, ...elements])];

  const { metadata, history } = getUpdatedMetaInfo(oldHistory, {
    type: "disproven",
    count: combined.length,
  });

  const dataToSave: SaveToCloudData = {
    elements: { type: "disproven", data: combined },
    history,
    metadata,
  };

  return dataToSave;
}
