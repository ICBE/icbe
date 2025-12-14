import { useState, useMemo, useEffect } from "react";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { ChartContainer } from "./ui/chart";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

// import { ThemeToggle } from "./components/theme-toggle";
const ThemeToggle = () => null;

import { history } from "~/lib/history";
import { getYAxisTickInterval } from "~/lib/chart-settings";
import { TIME_RANGE_PRESETS } from "~/lib/time-range-presets";

interface DataPoint {
  timestamp: number;
  proven: number | null;
  disproven: number | null;
}

export default function Component() {
  const rawData: DataPoint[] = history;

  // Filter out entries where both proven and disproven are null
  const validData = rawData
    .filter((item) => item.proven !== null || item.disproven !== null)
    .sort((a, b) => a.timestamp - b.timestamp);

  const minTimestamp = validData[0]?.timestamp || 0;
  const maxTimestamp = validData[validData.length - 1]?.timestamp || 0;

  // State for time range selection, initialized to "All Time"
  const [timeRange, setTimeRange] = useState<[number, number]>([
    minTimestamp,
    maxTimestamp,
  ]);
  const [activePreset, setActivePreset] = useState<string>("All Time"); // State to track active preset button

  // State for line visibility
  const [showProven, setShowProven] = useState(true);
  const [showDisproven, setShowDisproven] = useState(true);

  const [isChartMounted, setIsChartMounted] = useState(false);

  useEffect(() => {
    // Set a small timeout to allow the DOM to settle before rendering the chart
    const timer = setTimeout(() => {
      setIsChartMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Helper for linear interpolation
  const interpolateValue = (
    targetX: number,
    x1: number,
    y1: number | null,
    x2: number,
    y2: number | null,
  ): number | null => {
    if (y1 === null || y2 === null) return null; // If any value is null, cannot interpolate meaningfully
    if (x1 === x2) return y1; // Avoid division by zero if timestamps are identical

    return y1 + (y2 - y1) * ((targetX - x1) / (x2 - x1));
  };

  // Helper to format date as day/month/year
  const formatDate = (timestamp: number): string => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(timestamp);
  };

  const chartData = useMemo(() => {
    const dataPointsForChart: DataPoint[] = [];

    // Find the point immediately before the selected range start
    const pointBeforeStart = validData.findLast(
      (item) => item.timestamp < timeRange[0],
    );
    // Find the first point within or after the selected range start
    const firstPointInOrAfterRange = validData.find(
      (item) => item.timestamp >= timeRange[0],
    );

    // Add interpolated start point if necessary
    if (
      pointBeforeStart &&
      firstPointInOrAfterRange &&
      firstPointInOrAfterRange.timestamp > timeRange[0]
    ) {
      dataPointsForChart.push({
        timestamp: timeRange[0],
        proven: interpolateValue(
          timeRange[0],
          pointBeforeStart.timestamp,
          pointBeforeStart.proven,
          firstPointInOrAfterRange.timestamp,
          firstPointInOrAfterRange.proven,
        ),
        disproven: interpolateValue(
          timeRange[0],
          pointBeforeStart.timestamp,
          pointBeforeStart.disproven,
          firstPointInOrAfterRange.timestamp,
          firstPointInOrAfterRange.disproven,
        ),
      });
    } else if (
      firstPointInOrAfterRange &&
      firstPointInOrAfterRange.timestamp === timeRange[0]
    ) {
      // If the first point is exactly at the start of the range, add it
      dataPointsForChart.push(firstPointInOrAfterRange);
    }

    // Add all points strictly within the selected range
    validData.forEach((item) => {
      if (item.timestamp > timeRange[0] && item.timestamp < timeRange[1]) {
        dataPointsForChart.push(item);
      }
    });

    // Find the last point within or before the selected range end
    const lastPointInOrBeforeRange = validData.findLast(
      (item) => item.timestamp <= timeRange[1],
    );
    // Find the point immediately after the selected range end
    const pointAfterEnd = validData.find(
      (item) => item.timestamp > timeRange[1],
    );

    // Add interpolated end point if necessary
    if (
      lastPointInOrBeforeRange &&
      pointAfterEnd &&
      lastPointInOrBeforeRange.timestamp < timeRange[1]
    ) {
      dataPointsForChart.push({
        timestamp: timeRange[1],
        proven: interpolateValue(
          timeRange[1],
          lastPointInOrBeforeRange.timestamp,
          lastPointInOrBeforeRange.proven,
          pointAfterEnd.timestamp,
          pointAfterEnd.proven,
        ),
        disproven: interpolateValue(
          timeRange[1],
          lastPointInOrBeforeRange.timestamp,
          lastPointInOrBeforeRange.disproven,
          pointAfterEnd.timestamp,
          pointAfterEnd.disproven,
        ),
      });
    } else if (
      lastPointInOrBeforeRange &&
      lastPointInOrBeforeRange.timestamp === timeRange[1]
    ) {
      // If the last point is exactly at the end of the range, add it (avoiding duplicates if it's also the start point)
      if (
        !(
          dataPointsForChart.length > 0 &&
          dataPointsForChart[dataPointsForChart.length - 1]!.timestamp ===
            timeRange[1]
        )
      ) {
        dataPointsForChart.push(lastPointInOrBeforeRange);
      }
    }

    // Sort the final data points by timestamp to ensure correct line drawing
    dataPointsForChart.sort((a, b) => a.timestamp - b.timestamp);

    // Map to the format needed by Recharts, ensuring all necessary fields are present
    return dataPointsForChart.map((item) => ({
      timestamp: item.timestamp,
      date: formatDate(item.timestamp),
      fullDate: new Date(item.timestamp).toLocaleString(),
      proven: item.proven,
      disproven: item.disproven,
    }));
  }, [validData, timeRange]);

  // Calculate Y-axis domain and ticks based on current chartData and dynamic intervals
  const { yAxisDomain, yAxisTicks } = useMemo(() => {
    if (chartData.length === 0)
      return { yAxisDomain: [0, 1000], yAxisTicks: [0, 500, 1000] };

    const allValues = chartData.flatMap((d) => {
      const values = [];
      if (showProven && d.proven !== null) values.push(d.proven);
      if (showDisproven && d.disproven !== null) values.push(d.disproven);
      return values;
    });
    if (allValues.length === 0)
      return { yAxisDomain: [0, 1000], yAxisTicks: [0, 500, 1000] };

    const currentMin = Math.min(...allValues);
    const currentMax = Math.max(...allValues);
    const valueRange = currentMax - currentMin;

    const tickInterval = getYAxisTickInterval(valueRange);

    // Calculate the lowest multiple of tickInterval that is less than or equal to currentMin
    let floorMin = Math.floor(currentMin / tickInterval) * tickInterval;
    // Calculate the highest multiple of tickInterval that is greater than or equal to currentMax
    let ceilMax = Math.ceil(currentMax / tickInterval) * tickInterval;

    // Ensure a minimum range for the Y-axis if min and max are the same
    if (floorMin === ceilMax) {
      floorMin = Math.max(0, floorMin - tickInterval); // Go one interval below, but not negative
      ceilMax = ceilMax + tickInterval; // Go one interval above
    }

    const ticks = [];
    for (let i = floorMin; i <= ceilMax; i += tickInterval) {
      ticks.push(i);
    }

    return { yAxisDomain: [floorMin, ceilMax], yAxisTicks: ticks };
  }, [chartData, showProven, showDisproven]);

  const chartConfig = {
    proven: {
      label: "Proven",
      color: "#22c55e", // Green
    },
    disproven: {
      label: "Disproven",
      color: "#ef4444", // Red
    },
  };

  // Handle preset button clicks
  const handlePresetClick = (label: string, durationMs: number | "all") => {
    setActivePreset(label);
    if (durationMs === "all") {
      setTimeRange([minTimestamp, maxTimestamp]);
    } else {
      const newMin = Math.max(minTimestamp, maxTimestamp - durationMs);
      setTimeRange([newMin, maxTimestamp]);
    }
  };

  // Display message if no valid data at all
  if (validData.length === 0) {
    return (
      <div className="h-screen bg-background text-foreground">
        <div className="flex justify-end p-4">
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-center h-[400px] border rounded-lg mx-4">
          <p className="text-muted-foreground">
            No data to display. Please add data to the array.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col p-4 gap-4 bg-background text-foreground">
      {/* Top bar with checkboxes, presets, and theme toggle */}
      <div className="shrink-0 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="proven"
              checked={showProven}
              onCheckedChange={setShowProven}
            />
            <label
              htmlFor="proven"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
            >
              <div className="w-3 h-3 bg-[#22c55e] rounded-sm"></div>
              Proven
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="disproven"
              checked={showDisproven}
              onCheckedChange={setShowDisproven}
            />
            <label
              htmlFor="disproven"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
            >
              <div className="w-3 h-3 bg-[#ef4444] rounded-sm"></div>
              Disproven
            </label>
          </div>
          {/* Time Range Presets */}
          <div className="flex gap-2">
            {TIME_RANGE_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant={activePreset === preset.label ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  handlePresetClick(preset.label, preset.durationMs)
                }
                className={`h-7 px-3 text-xs ${
                  activePreset === preset.label
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : ""
                }`}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Conditionally render ChartContainer based on chartData and isChartMounted */}
      {isChartMounted &&
      chartData.length > 0 &&
      (showProven || showDisproven) ? (
        <ChartContainer
          config={chartConfig}
          className="flex-1 min-h-0"
          key={`chart-wrapper-${timeRange[0]}-${timeRange[1]}-${showProven}-${showDisproven}`}
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid
              vertical={false}
              className="stroke-muted-foreground/20"
            />
            <XAxis
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={[timeRange[0], timeRange[1]]} // This ensures the axis matches the slider exactly
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                return formatDate(value);
              }}
              angle={-45}
              textAnchor="end"
              height={80}
              className="fill-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={yAxisDomain} // Use calculated domain
              ticks={yAxisTicks} // Use calculated ticks
              className="fill-muted-foreground"
            />
            {showProven && (
              <Line
                dataKey="proven"
                type="linear"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{
                  fill: "#22c55e",
                  strokeWidth: 2,
                  r: 4,
                }}
                connectNulls={false}
                isAnimationActive={false}
              />
            )}
            {showDisproven && (
              <Line
                dataKey="disproven"
                type="linear"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{
                  fill: "#ef4444",
                  strokeWidth: 2,
                  r: 4,
                }}
                connectNulls={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ChartContainer>
      ) : (
        <div className="flex-1 min-h-0 flex items-center justify-center border border-border rounded-lg bg-card">
          <p className="text-muted-foreground">
            {!isChartMounted
              ? "Loading chart..." // Show loading message during initial delay
              : chartData.length === 0
                ? "No data in selected time range."
                : "No lines selected. Use the checkboxes above to show data."}
          </p>
        </div>
      )}

      <div className="shrink-0 px-4 pb-2">
        <div className="relative">
          <Slider
            value={timeRange}
            onValueChange={(value) => {
              setTimeRange(value as [number, number]);
              setActivePreset("");
            }}
            min={minTimestamp}
            max={maxTimestamp}
            step={86400000}
            className="w-full h-2 cursor-ew-resize"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatDate(timeRange[0])}</span>
            <span className="text-center flex-1">
              {formatDate(timeRange[0])} - {formatDate(timeRange[1])}
            </span>
            <span>{formatDate(timeRange[1])}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
