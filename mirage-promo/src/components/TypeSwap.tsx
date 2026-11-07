import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { display, sans } from "../fonts";
import { color, safe } from "../theme";

export type SwapLine = {
  text: string;
  /** Scene-local frames this line is on screen. */
  in: number;
  out: number;
  size?: number;
  accent?: string;
  family?: "display" | "sans";
};

/**
 * Lines that hand off to one another — the old one lifts away as the new one
 * arrives, so a beat can change its statement mid-scene without a cut.
 *
 * The ramps are short (10 in, 8 out) so a line holds full opacity for most of
 * its window; a long ramp would leave a beat's copy permanently half-faded.
 */
export const TypeSwap: React.FC<{
  lines: SwapLine[];
  align?: "left" | "center";
  bottom?: number;
}> = ({ lines, align = "center", bottom = safe.bottom + 120 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: align === "center" ? "center" : "flex-start" }}>
      <div style={{ margin: `0 ${safe.x}px ${bottom}px`, textAlign: align, width: "100%" }}>
        {lines.map((line) => {
          if (frame < line.in || frame >= line.out) return null;
          const local = frame - line.in;
          const untilOut = line.out - frame;
          const enter = spring({ frame: local, fps, config: { damping: 200 }, durationInFrames: 10 });
          const exit = interpolate(untilOut, [0, 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const progress = Math.min(enter, 1 - exit);

          return (
            <div
              key={`${line.in}-${line.text}`}
              style={{
                fontFamily: line.family === "sans" ? sans : display,
                fontSize: line.size ?? 92,
                lineHeight: 1.04,
                letterSpacing: "-0.025em",
                color: line.accent ?? color.ink,
                opacity: progress,
                transform: `translateY(${interpolate(exit, [0, 1], [0, -46])}px)`,
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};