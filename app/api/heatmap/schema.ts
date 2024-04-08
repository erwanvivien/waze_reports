import { z } from "zod";

export const heatmapResponseSchema = z.union([
  z.object({ count: z.number(), lat: z.number(), lon: z.number() }).array(),
  z.literal(null),
]);
