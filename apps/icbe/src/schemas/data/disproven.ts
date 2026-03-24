import * as z from "astro/zod";

const DataDisprovenSchema = z.array(z.string());
type DataDisproven = z.infer<typeof DataDisprovenSchema>;

export { type DataDisproven, DataDisprovenSchema };
