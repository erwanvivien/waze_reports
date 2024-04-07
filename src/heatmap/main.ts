import { Readable } from "stream";
import { prismaClient } from "../prisma";
import { WazeAlerts as DatabaseWazeAlerts } from "@prisma/client";

const BOX_SIZE = 0.001;

type StreamAlerts = {
  batchSize: number;
};

type FindManyParams = NonNullable<
  Parameters<typeof prismaClient.wazeAlerts.findMany>[0]
>;

type WhereParams = FindManyParams["where"];

const streamAlerts = (
  { batchSize }: StreamAlerts,
  whereParams?: WhereParams
): Readable => {
  let cursorId: string | null = null;

  const read = async function (this: Readable) {
    const data = await prismaClient.wazeAlerts.findMany({
      where: whereParams,
      take: batchSize,
      skip: cursorId ? 1 : 0,
      cursor: cursorId ? { uuid: cursorId } : undefined,
      orderBy: { uuid: "asc" },
    });

    if (data.length === 0) {
      this.push(null);
      return;
    }

    cursorId = data[data.length - 1].uuid;

    this.push(data);
  };

  return new Readable({
    objectMode: true,
    highWaterMark: batchSize,
    read,
  });
};

const DAY_IN_MILLIS = 24 * 60 * 60 * 1000;

const streamAlertsInDay = (day: Date): Readable => {
  const millisSinceEpoch = day.getTime();

  // Be sure that
  const startOfDay =
    Math.floor(millisSinceEpoch / DAY_IN_MILLIS) * DAY_IN_MILLIS;
  const endOfDay = startOfDay + DAY_IN_MILLIS;

  return streamAlerts(
    { batchSize: 100 },
    {
      AND: [
        { pubMillis: { gte: startOfDay } },
        { pubMillis: { lt: endOfDay } },
      ],
    }
  );
};

type MapKey = `${number}_${number}`;

type MapValue = {
  alignedLatitude: number;
  alignedLongitude: number;
  alerts: DatabaseWazeAlerts[];
};

const distinctAlertsType = (
  alerts: DatabaseWazeAlerts[]
): DatabaseWazeAlerts[][] => {
  type AlertKey = `${string}___${string}`;

  const alertsMap = new Map<string, DatabaseWazeAlerts[]>();

  for (const alert of alerts) {
    const key: AlertKey = `${alert.type}___${alert.subtype}`;

    if (!alertsMap.has(key)) {
      alertsMap.set(key, []);
    }

    alertsMap.get(key)!.push(alert);
  }

  return [...alertsMap.values()];
};

const processAlerts = async (day: Date) => {
  for await (const alertBatch of streamAlertsInDay(day)) {
    const batchBoxes = new Map<MapKey, MapValue>();

    for (const alert of alertBatch as DatabaseWazeAlerts[]) {
      const alignedLatitude = Math.floor(alert.lat / BOX_SIZE) * BOX_SIZE;
      const alignedLongitude = Math.floor(alert.lon / BOX_SIZE) * BOX_SIZE;

      const key: MapKey = `${alignedLatitude}_${alignedLongitude}`;

      if (!batchBoxes.has(key)) {
        batchBoxes.set(key, { alignedLatitude, alignedLongitude, alerts: [] });
      }

      batchBoxes.get(key)!.alerts.push(alert);
    }

    for (const [_, value] of [...batchBoxes.entries()]) {
      const boxData = {
        centerLat: value.alignedLatitude + BOX_SIZE / 2,
        centerLon: value.alignedLongitude - BOX_SIZE / 2,
      };

      const box = await prismaClient.box.upsert({
        create: boxData,
        update: {},
        where: { centerLat_centerLon: boxData },
      });

      const alertsByType = distinctAlertsType(value.alerts);

      for (const alerts of alertsByType) {
        await prismaClient.heatmapData.createMany({
          data: {
            boxId: box.id,
            count: value.alerts.length,
            date: day,
            type: alerts[0].type,
            subType: alerts[0].subtype,
          },
          skipDuplicates: true,
        });
      }
    }
  }
};

processAlerts(new Date());
