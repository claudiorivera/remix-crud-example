import { z } from "zod";

export const catSchema = z.object({
  name: z.string().min(1, "Name must contain at least 1 character"),
  age: z.coerce.number().gt(0, "Age must be greater than 0"),
});
