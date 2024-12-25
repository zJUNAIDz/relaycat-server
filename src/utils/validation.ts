import { z } from "zod";

export const newServerInputValidation = (name: string, imageUrl: string) =>
  z
    .object({
      name: z.string().min(1).max(50),
      imageUrl: z.string().url(),
    })
    .safeParse({ name, imageUrl });
