import * as z from "astro/zod";

const MetadataSchema = z
  .object({
    lastUpdated: z.object({ "unix-timestamp": z.number() }).readonly(),
    proven: z.object({ count: z.number() }).readonly(),
    disproven: z.object({ count: z.number() }).readonly(),
  })
  .readonly();

type Metadata = z.infer<typeof MetadataSchema>;

export { type Metadata, MetadataSchema };
