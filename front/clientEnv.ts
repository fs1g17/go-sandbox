import z from "zod";

const schema = z.object({
  API_BASE: z.url(),
});

export const clientEnv = schema.parse({
  API_BASE: process.env.NEXT_PUBLIC_API_BASE,
});
