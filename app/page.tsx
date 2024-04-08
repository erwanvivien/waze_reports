"use client";

import { useEffect, useRef, useState } from "react";
import { heatmapResponseSchema } from "./api/heatmap/route";
import { set, z } from "zod";

let map: google.maps.Map;
let heatmap: google.maps.visualization.HeatmapLayer;

const PARIS_CENTER = { lat: 48.854579, lng: 2.347341 };

const convertDataToWeightedLocation = (
  heatdata: NonNullable<z.output<typeof heatmapResponseSchema>>
): google.maps.visualization.WeightedLocation[] =>
  heatdata.map((data) => ({
    location: new google.maps.LatLng(data.lat, data.lon),
    weight: Math.pow(data.count, 1.5),
  }));

type InitMapParams = {
  mapHTMLElement: HTMLElement;
  setCenter: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>>;
  setMapType: React.Dispatch<React.SetStateAction<string>>;
};

const initMap = (params: InitMapParams): google.maps.Map => {
  const paris = new google.maps.LatLng(PARIS_CENTER.lat, PARIS_CENTER.lng);

  const map = new google.maps.Map(params.mapHTMLElement, {
    center: paris,
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  });

  map.addListener("center_changed", () => {
    const latLng = map.getCenter();
    if (latLng) {
      params.setCenter({ lat: latLng.lat(), lng: latLng.lng() });
    }
  });

  // https://developers.google.com/maps/documentation/javascript/reference/map#MapTypeId
  map.addListener("maptypeid_changed", () => {
    const mapType = map.getMapTypeId();
    if (mapType) {
      params.setMapType(mapType);
    }
  });

  return map;
};

type FetchDataParams = {
  center: { lat: number; lng: number };
  bounds: google.maps.LatLngBounds | undefined;
};

const fetchNewData = async (
  params: FetchDataParams,
  signal: AbortSignal
): Promise<google.maps.visualization.WeightedLocation[] | null> => {
  const { bounds, center } = params;

  const topLeftLat = bounds?.getSouthWest().lat() || center.lat - 0.1;
  const topLeftLon = bounds?.getSouthWest().lng() || center.lng - 0.1;
  const bottomRightLat = bounds?.getNorthEast().lat() || center.lat + 0.1;
  const bottomRightLon = bounds?.getNorthEast().lng() || center.lng + 0.1;

  const url = new URL("/api/heatmap", window.location.origin);
  url.searchParams.append("topLeftLat", topLeftLat.toString());
  url.searchParams.append("topLeftLon", topLeftLon.toString());
  url.searchParams.append("bottomRightLat", bottomRightLat.toString());
  url.searchParams.append("bottomRightLon", bottomRightLon.toString());
  url.searchParams.append("date", new Date().toISOString());

  const response = await fetch(url, { signal });
  const data = await response.json();
  const parsed = heatmapResponseSchema.safeParse(data);

  if (parsed.success && parsed.data !== null) {
    return convertDataToWeightedLocation(parsed.data);
  }

  return null;
};

const getTimeout = (
  currentCenter: typeof PARIS_CENTER,
  lastCenter: typeof PARIS_CENTER | undefined
) => {
  if (!lastCenter) {
    return 0;
  }

  const distance = Math.sqrt(
    Math.pow(currentCenter.lat - lastCenter.lat, 2) +
      Math.pow(currentCenter.lng - lastCenter.lng, 2)
  );

  return distance > 0.1 ? 500 : 2000;
};

const Home: React.FC = () => {
  const mapRef = useRef(null);

  const lastCenter = useRef<typeof PARIS_CENTER | undefined>(undefined);
  const [center, setCenter] = useState(PARIS_CENTER);
  const [mapType, setMapType] = useState<string>(
    google.maps.MapTypeId.SATELLITE
  );
  const [currentData, setCurrentData] = useState<
    google.maps.visualization.WeightedLocation[]
  >([]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    map ??= initMap({
      mapHTMLElement: mapRef.current,
      setCenter,
      setMapType,
    });
  }, [mapRef]);

  useEffect(() => {
    if (!map) {
      return;
    }

    const abortController = new AbortController();
    const { signal } = abortController;

    // Check if the center has changed significantly
    const timeoutTime = getTimeout(center, lastCenter.current);

    const bounds = map.getBounds();

    const timeoutId = setTimeout(async () => {
      const result = await fetchNewData({ center, bounds }, signal);
      if (Array.isArray(result)) {
        setCurrentData(result);
        lastCenter.current = center;
      }
    }, timeoutTime);

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [center]);

  useEffect(() => {
    const purple = "#3b1c6f";
    const lightOrange = "#ffaf79";
    const lightYellow = "#ffcf40";

    const gradient =
      mapType === google.maps.MapTypeId.SATELLITE
        ? ["transparent", lightYellow, purple]
        : ["transparent", lightOrange, purple];

    heatmap ??= new google.maps.visualization.HeatmapLayer({
      data: [],
      gradient,
      radius: 20,
    });

    heatmap.setData(currentData);
    heatmap.setMap(map);
  }, [currentData, mapType]);

  return (
    <div
      ref={mapRef}
      style={{ height: "100vh" }}
      tabIndex={-1}
      aria-hidden={true}
    />
  );
};

export default Home;
