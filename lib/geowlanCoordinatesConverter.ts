export const convertGlobalCoordToLocal = (lat: number, lng: number) => {
  const x =
    81747.7052693547 * (lng - 23.0194807888111) +
    -232.430711203508 * (lat - 42.6138619860138);

  const y =
    -38.4635349678089 * (lng - 23.0194807888111) +
    110992.569969183 * (lat - 42.6138619860138);
  console.log(x, y);
  return { x, y };
};

export const convertLocalCoordToGlobal = (x: number, y: number) => {
  const lat =
    4.23916328755212e-9 * x + 9.00962096462296e-6 * y + 42.6138619860138;
  const lng =
    0.0000122327713299937 * x + 2.56167754382995e-8 * y + 23.0194807888111;
  return { lat, lng };
};

