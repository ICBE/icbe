import * as z from "astro/zod";

const ProvenToBaseElementInfoSchema = z
  .object({
    steps: z.number(),
    proof: z.object({ url: z.url() }),
  })
  .partial();

const DataProvenEntrySchema = z.object({
  name: z.string(),
  earth: z.optional(ProvenToBaseElementInfoSchema),
  water: z.optional(ProvenToBaseElementInfoSchema),
  fire: z.optional(ProvenToBaseElementInfoSchema),
  wind: z.optional(ProvenToBaseElementInfoSchema),
  all: z.optional(ProvenToBaseElementInfoSchema),
});

const DataProvenSchema = z.array(DataProvenEntrySchema);

type DataProvenEntry = z.infer<typeof DataProvenEntrySchema>;

type DataProven = z.infer<typeof DataProvenSchema>;

export { type DataProven, type DataProvenEntry, DataProvenSchema };
