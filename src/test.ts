import { z } from "zod";
import { wazeGeoRSSApiResponseSchema } from "./schema";

type WazeGeoRSSApiResponse = z.output<typeof wazeGeoRSSApiResponseSchema>;

/**
 * Fetches the Waze alerts around a given point
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

const main = async () => {
  const _data = await wazeAlerts(48.739644, 2.401422, 0.05);
};

main();
