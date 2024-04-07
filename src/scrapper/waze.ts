import { z } from "zod";
import { wazeGeoRSSApiResponseSchema } from "./schema";
import { prismaClient } from "../prisma";
import { WazeAlerts as DatabaseWazeAlert } from "@prisma/client";

type WazeGeoRSSApiResponse = z.output<typeof wazeGeoRSSApiResponseSchema>;

type APIWazeAlert = WazeGeoRSSApiResponse["alerts"][number];

/**
 * Fetches the Waze alerts around a given point, will return a max of 200 alerts
 *
 * @param lat Latitude
 * @param lon Longitude
 * @param squareSearch Padding around the point to search for alerts
 */
const wazeAlerts = async (
  lat: number,
  lon: number,
  squareSearch = 0.01
): Promise<WazeGeoRSSApiResponse> => {
  const url = new URL("https://www.waze.com/live-map/api/georss");
  url.searchParams.set("top", String(lat - squareSearch));
  url.searchParams.set("bottom", String(lat + squareSearch));
  url.searchParams.set("left", String(lon - squareSearch));
  url.searchParams.set("right", String(lon + squareSearch));
  url.searchParams.set("env", "row");
  url.searchParams.set("types", "alerts");

  const resp = await fetch(url, {
    credentials: "include",
    referrer: "https://www.waze.com/live-map",
    method: "GET",
    mode: "cors",
  });

  const data = await resp.json();
  return wazeGeoRSSApiResponseSchema.parse(data);
};

const apiAlertToDatabaseAlert = (
  alert: APIWazeAlert
): Omit<DatabaseWazeAlert, "insertedAt"> => ({
  uuid: alert.uuid,
  type: alert.type,
  subtype: alert.subtype,

  street: alert.street ?? null,
  city: alert.city ?? null,
  country: alert.country ?? null,

  lon: alert.location.x,
  lat: alert.location.y,

  pubMillis: BigInt(alert.pubMillis),
  reportMillis: alert.reportMillis ? BigInt(alert.reportMillis) : null,
});

type NewAlertsResult = {
  newAlerts: Omit<DatabaseWazeAlert, "insertedAt">[];
  allFetchedAlerts: APIWazeAlert[];
};

/**
 * Main function to fetch new alerts and store them in the database
 *
 * @param lat Latitude
 * @param lon Longitude
 * @param squareSearch Padding around the point to search for alerts
 */
export const fetchNewAlerts = async (
  lat: number,
  lon: number,
  squareSearch = 0.01
): Promise<NewAlertsResult> => {
  const data = await wazeAlerts(lat, lon, squareSearch);

  const existingAlerts = await prismaClient.wazeAlerts.findMany({
    select: { uuid: true },
    where: {
      uuid: { in: data.alerts.map((alert) => alert.uuid) },
    },
  });

  const existingAlertsSet = new Set(existingAlerts.map((alert) => alert.uuid));

  const newAlerts = data.alerts
    .filter((alert) => !existingAlertsSet.has(alert.uuid))
    .map(apiAlertToDatabaseAlert);

  await prismaClient.wazeAlerts.createMany({
    data: newAlerts,
    skipDuplicates: true,
  });

  return {
    newAlerts,
    allFetchedAlerts: data.alerts,
  };
};
