import { z } from "zod";

const jsonDataSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  age: z.number(),
});

export { jsonDataSchema };
