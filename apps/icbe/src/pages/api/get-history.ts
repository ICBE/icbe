import type { APIRoute } from "astro";
import type { ElementsHistory } from "#schemas";
import { getElementsHistory } from "#utils/gitlab";
import { respondWithJSON } from "#utils/respond-json";

// biome-ignore lint/nursery/useReactFunctionComponentDefinition: False positive
export const GET: APIRoute = async () => {
  const history = await getElementsHistory();

  const data = { history } as const;

  return respondWithJSON<{
    readonly history: ElementsHistory;
  }>(data).response;
};
