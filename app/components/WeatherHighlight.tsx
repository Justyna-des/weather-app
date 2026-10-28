import { Sunrise, Sunset } from "lucide-react";
import { getWeatherIcon } from "../lib/weatherIcons";

const COLUMN_WIDTH = 56;
const CHART_HEIGHT = 64;
const CHART_PADDING_Y = 14;

const weatherHighlightData = {
  sunrise: { label: "7:12 AM", hour: 7, minute: 12 },
  sunset: { label: "4:38 PM", hour: 16, minute: 38 },
  hours: [
    { time: "Now", hour: 13, temperature: 16, weatherCode: 2, precipitationChance: 10, isNight: false },
    { time: "2 PM", hour: 14, temperature: 17, weatherCode: 2, precipitationChance: 10, isNight: false },
    { time: "3 PM", hour: 15, temperature: 17, weatherCode: 2, precipitationChance: 15, isNight: false },
    { time: "4 PM", hour: 16, temperature: 16, weatherCode: 3, precipitationChance: 25, isNight: false },
    { time: "5 PM", hour: 17, temperature: 14, weatherCode: 61, precipitationChance: 40, isNight: true },
    { time: "6 PM", hour: 18, temperature: 13, weatherCode: 61, precipitationChance: 55, isNight: true },
    { time: "7 PM", hour: 19, temperature: 12, weatherCode: 63, precipitationChance: 70, isNight: true },
    { time: "8 PM", hour: 20, temperature: 12, weatherCode: 61, precipitationChance: 60, isNight: true },
    { time: "9 PM", hour: 21, temperature: 11, weatherCode: 3, precipitationChance: 35, isNight: true },
    { time: "10 PM", hour: 22, temperature: 11, weatherCode: 2, precipitationChance: 20, isNight: true },
    { time: "11 PM", hour: 23, temperature: 10, weatherCode: 2, precipitationChance: 15, isNight: true },
    { time: "12 AM", hour: 0, temperature: 10, weatherCode: 2, precipitationChance: 10, isNight: true },
    { time: "1 AM", hour: 1, temperature: 9, weatherCode: 1, precipitationChance: 10, isNight: true },
    { time: "2 AM", hour: 2, temperature: 9, weatherCode: 1, precipitationChance: 5, isNight: true },
    { time: "3 AM", hour: 3, temperature: 8, weatherCode: 0, precipitationChance: 5, isNight: true },
    { time: "4 AM", hour: 4, temperature: 8, weatherCode: 0, precipitationChance: 0, isNight: true },
    { time: "5 AM", hour: 5, temperature: 8, weatherCode: 0, precipitationChance: 0, isNight: true },
    { time: "6 AM", hour: 6, temperature: 7, weatherCode: 0, precipitationChance: 0, isNight: true },
    { time: "7 AM", hour: 7, temperature: 8, weatherCode: 1, precipitationChance: 0, isNight: true },
    { time: "8 AM", hour: 8, temperature: 9, weatherCode: 1, precipitationChance: 0, isNight: false },
    { time: "9 AM", hour: 9, temperature: 11, weatherCode: 2, precipitationChance: 5, isNight: false },
    { time: "10 AM", hour: 10, temperature: 13, weatherCode: 2, precipitationChance: 10, isNight: false },
    { time: "11 AM", hour: 11, temperature: 14, weatherCode: 2, precipitationChance: 10, isNight: false },
    { time: "12 PM", hour: 12, temperature: 15, weatherCode: 2, precipitationChance: 10, isNight: false },
  ],
};

function minutesFromMidnight(hour: number, minute = 0) {
  return hour * 60 + minute;
}

function timeToX(
  hour: number,
  minute: number,
  startMinutes: number,
  columnWidth: number
) {
  let delta = minutesFromMidnight(hour, minute) - startMinutes;
  if (delta < 0) {
    delta += 24 * 60;
  }
  return (delta / 60) * columnWidth + columnWidth / 2;
}

function temperatureToY(temperature: number, min: number, max: number) {
  const range = Math.max(max - min, 1);
  return (
    CHART_PADDING_Y +
    (1 - (temperature - min) / range) * (CHART_HEIGHT - CHART_PADDING_Y * 2)
  );
}

function toSmoothPath(points: { x: number; y: number }[]) {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const previous = points[i === 0 ? 0 : i - 1];
    const current = points[i];
    const next = points[i + 1];
    const afterNext = points[i + 2] ?? next;
    const control1X = current.x + (next.x - previous.x) / 6;
    const control1Y = current.y + (next.y - previous.y) / 6;
    const control2X = next.x - (afterNext.x - current.x) / 6;
    const control2Y = next.y - (afterNext.y - current.y) / 6;

    path += ` C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${next.x} ${next.y}`;
  }

  return path;
}

export function WeatherHighlight() {
  const { hours, sunrise, sunset } = weatherHighlightData;
  const temperatures = hours.map((hour) => hour.temperature);
  const minTemperature = Math.min(...temperatures) - 1;
  const maxTemperature = Math.max(...temperatures) + 1;
  const startMinutes = minutesFromMidnight(hours[0].hour);
  const chartWidth = hours.length * COLUMN_WIDTH;
  const points = hours.map((hour, index) => ({
    x: index * COLUMN_WIDTH + COLUMN_WIDTH / 2,
    y: temperatureToY(hour.temperature, minTemperature, maxTemperature),
  }));
  const linePath = toSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${CHART_HEIGHT} L ${points[0].x} ${CHART_HEIGHT} Z`;
  const sunEvents = [
    {
      ...sunrise,
      name: "Sunrise",
      Icon: Sunrise,
    },
    {
      ...sunset,
      name: "Sunset",
      Icon: Sunset,
    },
  ].map((event) => ({
    ...event,
    x: timeToX(event.hour, event.minute, startMinutes, COLUMN_WIDTH),
  }));

  return (
    <section aria-label="Hourly temperature, conditions, and chance of precipitation">
      <h2 className="text-base font-semibold mb-4 text-shadow-md">
        Next 24 Hours
      </h2>
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          className="relative"
          style={{ width: chartWidth, minWidth: "100%" }}
        >
          <ol className="flex">
            {hours.map((hour) => {
              const Icon = getWeatherIcon(hour.weatherCode);

              return (
                <li
                  key={hour.time}
                  className="flex flex-col items-center gap-2 border-t border-border pt-3 [--animation-duration:0]"
                  style={{ width: COLUMN_WIDTH }}
                >
                  <h3 className="text-xs font-medium text-muted-foreground text-shadow-sm">
                    {hour.time}
                  </h3>
                  <Icon
                    isNight={hour.isNight}
                    className="size-8"
                  />
                  <span className="text-base font-medium text-shadow-sm">
                    {hour.temperature}°
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="relative h-8 mt-1">
            {sunEvents.map((event) => (
              <div
                key={event.name}
                className="absolute top-1/2 flex w-max -translate-x-1/2 -translate-y-1/2 items-center gap-1"
                style={{ left: event.x }}
              >
                <event.Icon
                  className="size-3.5 drop-shadow-sm"
                  aria-hidden="true"
                />
                <span className="text-[10px] font-medium text-muted-foreground text-shadow-sm whitespace-nowrap">
                  {event.name} {event.label}
                </span>
              </div>
            ))}
          </div>

          <div className="relative" style={{ height: CHART_HEIGHT }}>
            <svg
              width={chartWidth}
              height={CHART_HEIGHT}
              viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
              fill="none"
              aria-hidden="true"
              className="overflow-visible"
            >
              <path
                d={areaPath}
                className="fill-foreground/10"
              />
              <path
                d={linePath}
                className="stroke-foreground"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {points.map((point, index) => (
                <circle
                  key={hours[index].time}
                  cx={point.x}
                  cy={point.y}
                  r="2.5"
                  className="fill-foreground"
                />
              ))}
              {sunEvents.map((event) => (
                <line
                  key={event.name}
                  x1={event.x}
                  y1={0}
                  x2={event.x}
                  y2={CHART_HEIGHT}
                  className="stroke-foreground/40"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              ))}
            </svg>
          </div>

          <ol className="flex">
            {hours.map((hour) => (
              <li
                key={`${hour.time}-precip`}
                className="flex flex-col items-center pt-2 pb-1"
                style={{ width: COLUMN_WIDTH }}
              >
                <span
                  className={`text-xs text-shadow-sm ${
                    hour.precipitationChance === 0
                      ? "text-muted-foreground/60"
                      : "text-muted-foreground"
                  }`}
                  aria-label={`${hour.precipitationChance}% chance of precipitation`}
                >
                  {hour.precipitationChance}%
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
