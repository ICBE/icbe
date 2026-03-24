import type { APIRoute } from "astro";
import { getDisprovenData, getProvenData } from "#utils/gitlab";
import { respondWithJSON } from "#utils/respond-json";

export const GET: APIRoute = async () => {
  const [provenData, disprovenData] = await Promise.all([
    getProvenData(),
    getDisprovenData(),
  ]);

  const data = {
    proven: provenData.map((x) => x.name),
    disproven: disprovenData,
  } as const;

  return respondWithJSON<{
    readonly proven: string[];
    readonly disproven: string[];
  }>(data).response;
};
