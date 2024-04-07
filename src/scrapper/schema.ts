import { z } from "zod";

const alertTypeSchema = z.union([
  z.object({
    type: z.literal("ROAD_CLOSED"),
    subtype: z.union([
      z.literal(""),
      z.literal("ROAD_CLOSED_HAZARD"),
      z.literal("ROAD_CLOSED_CONSTRUCTION"),
      z.literal("ROAD_CLOSED_EVENT"),
    ]),
  }),
  z.object({
    type: z.literal("ACCIDENT"),
    subtype: z.union([
      z.literal(""),
      z.literal("ACCIDENT_MINOR"),
      z.literal("ACCIDENT_MAJOR"),
    ]),
  }),
  z.object({
    type: z.literal("HAZARD"),
    subtype: z.union([
      z.literal(""),
      z.literal("HAZARD_ON_ROAD"),
      z.literal("HAZARD_ON_ROAD_CAR_STOPPED"),
      z.literal("HAZARD_ON_ROAD_CONSTRUCTION"),
      z.literal("HAZARD_ON_ROAD_EMERGENCY_VEHICLE"),
      z.literal("HAZARD_ON_ROAD_ICE"),
      z.literal("HAZARD_ON_ROAD_LANE_CLOSED"),
      z.literal("HAZARD_ON_ROAD_OBJECT"),
      z.literal("HAZARD_ON_ROAD_OIL"),
      z.literal("HAZARD_ON_ROAD_POT_HOLE"),
      z.literal("HAZARD_ON_ROAD_ROAD_KILL"),
      z.literal("HAZARD_ON_ROAD_TRAFFIC_LIGHT_FAULT"),
      z.literal("HAZARD_ON_SHOULDER"),
      z.literal("HAZARD_ON_SHOULDER_ANIMALS"),
      z.literal("HAZARD_ON_SHOULDER_CAR_STOPPED"),
      z.literal("HAZARD_ON_SHOULDER_MISSING_SIGN"),
      z.literal("HAZARD_WEATHER"),
      z.literal("HAZARD_WEATHER_FLOOD"),
      z.literal("HAZARD_WEATHER_FOG"),
      z.literal("HAZARD_WEATHER_FREEZING_RAIN"),
      z.literal("HAZARD_WEATHER_HAIL"),
      z.literal("HAZARD_WEATHER_HEAT_WAVE"),
      z.literal("HAZARD_WEATHER_HEAVY_RAIN"),
      z.literal("HAZARD_WEATHER_HEAVY_SNOW"),
      z.literal("HAZARD_WEATHER_HURRICANE"),
      z.literal("HAZARD_WEATHER_MONSOON"),
      z.literal("HAZARD_WEATHER_TORNADO"),
    ]),
  }),
  z.object({
    type: z.literal("POLICE"),
    subtype: z.union([
      z.literal(""),
      z.literal("POLICE_VISIBLE"),
      z.literal("POLICE_HIDING"),
    ]),
  }),
  z.object({
    type: z.literal("CHIT_CHAT"),
    subtype: z.union([z.literal(""), z.literal("CHIT_CHAT")]),
  }),
  z.object({
    type: z.literal("JAM"),
    subtype: z.union([
      z.literal(""),
      z.literal("JAM_LIGHT_TRAFFIC"),
      z.literal("JAM_MODERATE_TRAFFIC"),
      z.literal("JAM_HEAVY_TRAFFIC"),
      z.literal("JAM_STAND_STILL_TRAFFIC"),
    ]),
  }),
]);

export const commentSchema = z.object({});

export const locationSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const alertSchema = alertTypeSchema.and(
  z.object({
    country: z.string().optional(),
    nThumbsUp: z.number().optional(),
    city: z.string().optional(),
    reportRating: z.number(),
    reportMillis: z.number().optional(),
    reportByMunicipalityUser: z.string(),
    reliability: z.number(),
    uuid: z.string(),
    speed: z.number(),
    reportMood: z.number(),
    street: z.string().optional(),
    additionalInfo: z.string(),
    id: z.string(),
    text: z.string().optional(),
    nComments: z.number().optional(),
    reportBy: z.string().optional(),
    inscale: z.boolean(),
    comments: z.array(commentSchema).optional(),
    confidence: z.number(),
    roadType: z.number().optional(),
    magvar: z.number(),
    wazeData: z.string(),
    location: locationSchema,
    pubMillis: z.number(),
    isThumbsUp: z.boolean().optional(),
    reportDescription: z.string().optional(),
  })
);

export const wazeGeoRSSApiResponseSchema = z.object({
  alerts: z.array(alertSchema).default(() => []),
  endTimeMillis: z.number(),
  startTimeMillis: z.number(),
  startTime: z.string(),
  endTime: z.string(),
});
