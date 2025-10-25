export const getYAxisTickInterval = (valueRange: number): number => {
  if (valueRange <= 100) {
    return 10;
  } else if (valueRange <= 500) {
    return 50;
  } else if (valueRange <= 1000) {
    return 100;
  } else if (valueRange <= 1600) {
    return 200;
  } else if (valueRange <= 3500) {
    return 500;
  } else if (valueRange <= 10_000) {
    return 1000;
  } else {
    return 2000;
  }
};
