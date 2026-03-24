import * as z from "astro/zod";

const ElementsHistoryEntrySchema = z
  .object({
    timestamp: z.number(),
    "iso-timestamp": z.iso.datetime(),
    proven: z.nullable(z.number()),
    disproven: z.nullable(z.number()),
  })
  .readonly();

const ElementsHistorySchema = z.array(ElementsHistoryEntrySchema);

type ElementsHistoryEntry = z.infer<typeof ElementsHistoryEntrySchema>;

type ElementsHistory = z.infer<typeof ElementsHistorySchema>;

export {
  type ElementsHistory,
  type ElementsHistoryEntry,
  ElementsHistorySchema,
};
