import type { APIRoute } from "astro";
import type { Metadata } from "#schemas";
import { getElementsMetadata } from "#utils/gitlab";
import { respondWithJSON } from "#utils/respond-json";

// biome-ignore lint/nursery/useReactFunctionComponentDefinition: False positive
export const GET: APIRoute = async () => {
  const meta = await getElementsMetadata();

  const data = { meta } as const;

  return respondWithJSON<{
    readonly meta: Metadata;
  }>(data).response;
};
