import { prismaClient } from "@/src/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  heatmapResponseSchema,
  subtypeSchema,
  typeSchema,
  WazeSubtype,
  WazeType,
} from "./schema";

const querySchema = z.object({
  topLeftLat: z.coerce.number().max(90).min(-90),
  topLeftLon: z.coerce.number().max(180).min(-180),

  bottomRightLat: z.coerce.number().max(90).min(-90),
  bottomRightLon: z.coerce.number().max(180).min(-180),

  date: z.string().transform((arg) => new Date(arg)),

  types: z
    .string()
    .transform((arg) => arg.split(",") as WazeType[])
    .refine((arg) => arg.every((type) => typeSchema.safeParse(type).success))
    .optional(),
  subtypes: z
    .string()
    .transform((arg) => arg.split(",") as WazeSubtype[])
    .refine((arg) =>
      arg.every((subtype) => subtypeSchema.safeParse(subtype).success)
    )
    .optional(),
});

type HeatmapResponse = z.output<typeof heatmapResponseSchema>;

type QueryWhere = NonNullable<
  Parameters<typeof prismaClient.heatmapData.findMany>[0]
>["where"];

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
    types,
    subtypes,
  } = querySchema.parse(searchParams);

  let typeSelection: QueryWhere;
  if (types !== undefined && subtypes !== undefined) {
    typeSelection = {
      OR: [{ type: { in: types } }, { subType: { in: subtypes } }],
    };
  } else if (types !== undefined) {
    typeSelection = { type: { in: types } };
  } else if (subtypes !== undefined) {
    typeSelection = { subType: { in: subtypes } };
  } else {
    typeSelection = {};
  }

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
      ...typeSelection,
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
