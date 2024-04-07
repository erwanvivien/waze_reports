import { fetchNewAlerts } from "./waze";

type LatLong = [lat: number, lon: number];

type BoundingBox = {
  topLeft: LatLong;
  bottomRight: LatLong;
};

// Found using https://bboxfinder.com
const parisBoundingBox: BoundingBox = {
  topLeft: [48.811612, 2.237091],
  bottomRight: [48.91009, 2.42],
};

const ileDeFranceBoundingBox: BoundingBox = {
  topLeft: [48.571155, 1.933594],
  bottomRight: [49.117029, 2.785034],
};

const fetchAllParis = async (currentBB: BoundingBox): Promise<number> => {
  const center: LatLong = [
    (currentBB.topLeft[0] + currentBB.bottomRight[0]) / 2,
    (currentBB.topLeft[1] + currentBB.bottomRight[1]) / 2,
  ];
  const squareSearch = Math.max(
    (currentBB.bottomRight[0] - currentBB.topLeft[0]) / 2,
    (currentBB.bottomRight[1] - currentBB.topLeft[1]) / 2
  );

  const { newAlerts, allFetchedAlerts } = await fetchNewAlerts(
    center[0],
    center[1],
    squareSearch
  );

  // If no new alerts and Waze returned less than 180 alerts, we can stop
  // searching for more alerts
  if (newAlerts.length === 0 && allFetchedAlerts.length < 180) {
    return newAlerts.length;
  }

  const topLeft = await fetchAllParis({
    topLeft: [currentBB.topLeft[0], currentBB.topLeft[1]],
    bottomRight: center,
  });
  const topRight = await fetchAllParis({
    topLeft: [currentBB.topLeft[0], center[1]],
    bottomRight: [center[0], currentBB.bottomRight[1]],
  });
  const bottomLeft = await fetchAllParis({
    topLeft: [center[0], currentBB.topLeft[1]],
    bottomRight: [currentBB.bottomRight[0], center[1]],
  });
  const bottomRight = await fetchAllParis({
    topLeft: center,
    bottomRight: [currentBB.bottomRight[0], currentBB.bottomRight[1]],
  });

  return newAlerts.length + topLeft + topRight + bottomLeft + bottomRight;
};

const main = async () => {
  const newAlertsCount = await fetchAllParis(parisBoundingBox);
  console.log(`Fetched ${newAlertsCount} new alerts`);
};

main();
