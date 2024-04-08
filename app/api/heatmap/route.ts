import { prismaClient } from "@/src/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  topLeftLat: z.coerce.number().max(90).min(-90),
  topLeftLon: z.coerce.number().max(180).min(-180),

  bottomRightLat: z.coerce.number().max(90).min(-90),
  bottomRightLon: z.coerce.number().max(180).min(-180),

  date: z.string().transform((arg) => new Date(arg)),

  type: z.string().optional(),
  subtype: z.string().optional(),
});

export const heatmapResponseSchema = z.union([
  z.object({ count: z.number(), lat: z.number(), lon: z.number() }).array(),
  z.literal(null),
]);

type HeatmapResponse = z.output<typeof heatmapResponseSchema>;

export const GET = async (
  req: NextRequest
): Promise<NextResponse<HeatmapResponse | null>> => {
  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  const {
    date,
    bottomRightLat,
    bottomRightLon,
    topLeftLat,
    topLeftLon,
    type,
    subtype,
  } = querySchema.parse(searchParams);

  const heatmapData = await prismaClient.heatmapData.findMany({
    select: {
      count: true,
      Box: { select: { centerLat: true, centerLon: true } },
    },
    where: {
      date: { gte: date, lte: new Date(date.getTime() + 24 * 60 * 60 * 1000) },
      Box: {
        centerLat: { gte: topLeftLat, lte: bottomRightLat },
        centerLon: { gte: topLeftLon, lte: bottomRightLon },
      },
      type: type ? { equals: type } : undefined,
      subType: subtype ? { equals: subtype } : undefined,
    },
  });

  if (heatmapData.length === 0) {
    return NextResponse.json(null);
  }

  return NextResponse.json(
    heatmapData.map((data) => ({
      count: data.count,
      lat: data.Box.centerLat,
      lon: data.Box.centerLon,
    }))
  );
};
