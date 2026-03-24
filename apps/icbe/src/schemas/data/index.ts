import { DataDisprovenSchema } from "./disproven";
import { ElementsHistorySchema } from "./history";
import { MetadataSchema } from "./metadata";
import { DataProvenSchema } from "./proven";

export * from "./disproven";
export * from "./history";
export * from "./metadata";
export * from "./proven";

export const schemas = {
  meta: MetadataSchema,
  history: ElementsHistorySchema,
  proven: DataProvenSchema,
  disproven: DataDisprovenSchema,
} as const;
