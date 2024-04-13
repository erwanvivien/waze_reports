import { z } from "zod";

export const WazeCategoriesTranslation = {
  ACCIDENT: "Accident",
  ACCIDENT_MINOR: "Accident Mineur",
  ACCIDENT_MAJOR: "Accident Majeur",

  HAZARD: "Danger",
  HAZARD_ON_ROAD: "Danger sur la route",
  HAZARD_ON_ROAD_CAR_STOPPED: "Voiture arrêtée",
  HAZARD_ON_ROAD_CONSTRUCTION: "Construction",
  HAZARD_ON_ROAD_EMERGENCY_VEHICLE: "Véhicule d'urgence",
  HAZARD_ON_ROAD_ICE: "Glace",
  HAZARD_ON_ROAD_LANE_CLOSED: "Route fermée",
  HAZARD_ON_ROAD_OBJECT: "Objet sur la route",
  HAZARD_ON_ROAD_OIL: "Essence sur la route",
  HAZARD_ON_ROAD_POT_HOLE: "Nid de poule",
  HAZARD_ON_ROAD_ROAD_KILL: "Animal mort",
  HAZARD_ON_ROAD_TRAFFIC_LIGHT_FAULT: "Signalisation défectueuse",
  HAZARD_ON_SHOULDER: "Danger sur le bas-côté",
  HAZARD_ON_SHOULDER_ANIMALS: "Animal sur le bas-côté",
  HAZARD_ON_SHOULDER_CAR_STOPPED: "Voiture sur le bas-côté",
  HAZARD_ON_SHOULDER_MISSING_SIGN: "Panneau de signalisation manquant",
  HAZARD_WEATHER: "Danger météo",
  HAZARD_WEATHER_FLOOD: "Innondation",
  HAZARD_WEATHER_FOG: "Brouillard",
  HAZARD_WEATHER_FREEZING_RAIN: "Gelure",
  HAZARD_WEATHER_HAIL: "Grêle",
  HAZARD_WEATHER_HEAT_WAVE: "Vague de chaleur",
  HAZARD_WEATHER_HEAVY_RAIN: "Pluie diluvienne",
  HAZARD_WEATHER_HEAVY_SNOW: "Neige diluvienne",
  HAZARD_WEATHER_HURRICANE: "Ouragan",
  HAZARD_WEATHER_MONSOON: "Mousson",
  HAZARD_WEATHER_TORNADO: "Tornade",

  ROAD_CLOSED: "Route fermée",
  ROAD_CLOSED_HAZARD: "Route fermée pour danger",
  ROAD_CLOSED_CONSTRUCTION: "Route en travaux",
  ROAD_CLOSED_EVENT: "Route fermée pour événement",

  JAM: "Bouchon",
  JAM_LIGHT_TRAFFIC: "Bouchon léger",
  JAM_MODERATE_TRAFFIC: "Bouchon modéré",
  JAM_HEAVY_TRAFFIC: "Bouchon sévère",
  JAM_STAND_STILL_TRAFFIC: "Bouchon à l'arrêt",

  POLICE: "Police",
  POLICE_VISIBLE: "Police visible",
  POLICE_HIDDEN: "Police cachée",

  CHITCHAT: "Discussions sur la route",
} as const;

export type WazeCategory = keyof typeof WazeCategoriesTranslation;

export type OptionCategoryDefinition = {
  [key in WazeCategory]?: WazeCategory[] | OptionCategoryDefinition;
};

export const categories = {
  ACCIDENT: ["ACCIDENT_MINOR", "ACCIDENT_MAJOR"] as const,
  HAZARD: {
    HAZARD_ON_ROAD: [
      "HAZARD_ON_ROAD_CAR_STOPPED",
      "HAZARD_ON_ROAD_CONSTRUCTION",
      "HAZARD_ON_ROAD_EMERGENCY_VEHICLE",
      "HAZARD_ON_ROAD_ICE",
      "HAZARD_ON_ROAD_LANE_CLOSED",
      "HAZARD_ON_ROAD_OBJECT",
      "HAZARD_ON_ROAD_OIL",
      "HAZARD_ON_ROAD_POT_HOLE",
      "HAZARD_ON_ROAD_ROAD_KILL",
      "HAZARD_ON_ROAD_TRAFFIC_LIGHT_FAULT",
    ] as const,
    HAZARD_ON_SHOULDER: [
      "HAZARD_ON_SHOULDER_ANIMALS",
      "HAZARD_ON_SHOULDER_CAR_STOPPED",
      "HAZARD_ON_SHOULDER_MISSING_SIGN",
    ] as const,
    HAZARD_WEATHER: [
      "HAZARD_WEATHER_FLOOD",
      "HAZARD_WEATHER_FOG",
      "HAZARD_WEATHER_FREEZING_RAIN",
      "HAZARD_WEATHER_HAIL",
      "HAZARD_WEATHER_HEAT_WAVE",
      "HAZARD_WEATHER_HEAVY_RAIN",
      "HAZARD_WEATHER_HEAVY_SNOW",
      "HAZARD_WEATHER_HURRICANE",
      "HAZARD_WEATHER_MONSOON",
      "HAZARD_WEATHER_TORNADO",
    ] as const,
  } as const,
  ROAD_CLOSED: [
    "ROAD_CLOSED_HAZARD",
    "ROAD_CLOSED_CONSTRUCTION",
    "ROAD_CLOSED_EVENT",
  ] as const,
  JAM: [
    "JAM_LIGHT_TRAFFIC",
    "JAM_MODERATE_TRAFFIC",
    "JAM_HEAVY_TRAFFIC",
    "JAM_STAND_STILL_TRAFFIC",
  ] as const,
  POLICE: ["POLICE_VISIBLE", "POLICE_HIDDEN"] as const,
  CHITCHAT: [] as const,
} satisfies OptionCategoryDefinition;
