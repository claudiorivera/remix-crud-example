import { z } from "zod";

export const deleteCatSchema = z.object({
  id: z.string().cuid(),
});
