import { ActionError, defineAction } from "astro:actions";
import * as z from "astro/zod";
import { DataProvenSchema } from "#schemas";
import { saveToCloud } from "#utils/gitlab";
import { getDisprovenToSave, getProvenToSave } from "#utils/submit-elements";

const submitDisprovenElements = defineAction({
  input: z.object({ elements: z.array(z.object({ name: z.string() })) }),
  async handler(input, _context) {
    const role = null;

    if (!role) {
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "Please login to use this feature.",
      });
    }

    const canSubmitElements = false;

    if (!canSubmitElements) {
      throw new ActionError({
        code: "FORBIDDEN",
        message: "You don't have permissions to use this feature.",
      });
    }

    const elements = input.elements.map((element) => element.name);

    const data = await getDisprovenToSave(elements);
    await saveToCloud(data);

    return { success: true } as const;
  },
});

const submitProvenElements = defineAction({
  input: z.object({ elements: DataProvenSchema }),
  async handler(input, _context) {
    const role = null;

    if (!role) {
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "Please login to use this feature.",
      });
    }

    const canSubmitElements = false;

    if (!canSubmitElements) {
      throw new ActionError({
        code: "FORBIDDEN",
        message: "You don't have permissions to use this feature.",
      });
    }

    const data = await getProvenToSave(input.elements);
    await saveToCloud(data);

    return { success: true } as const;
  },
});

export { submitDisprovenElements, submitProvenElements };
