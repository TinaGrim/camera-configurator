import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { display, sans } from "../fonts";
import { color, safe } from "../theme";

/**
 * A price that lands hard and holds. Used for the two numbers the promo is
 * actually about: what the body costs, and what the whole order comes to.
 */
export const StatSlam: React.FC<{
  label: string;
  value: string;
  sub?: string;
  from?: number;
  size?: number;
  /** Counts the number up to `value` instead of slamming it in whole. */
  countUp?: { to: number; prefix?: string; decimals?: number };
}> = ({ label, value, sub, from = 0, size = 150, countUp }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const local = frame - from;
  if (local < 0) return null;

  const slam = spring({ frame: local, fps, config: { damping: 14, stiffness: 180 }, durationInFrames: 22 });
  const shown = countUp
    ? (countUp.to * interpolate(local, [0, countUp.to > 500 ? 34 : 24], [0, 1], { extrapolateRight: "clamp" })).toFixed(
        countUp.decimals ?? 0,
      )
    : value;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center" }}>
      <div style={{ margin: `0 ${safe.x}px ${safe.bottom + 80}px`, textAlign: "center", width: "100%" }}>
        <div
          style={{
            fontFamily: sans,
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: color.accent,
            opacity: interpolate(slam, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontFamily: display,
            fontSize: size,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: color.ink,
            marginTop: 16,
            opacity: slam,
            // Overshoot on entry is the whole point — a number should land.
            transform: `scale(${interpolate(slam, [0, 1], [0.82, 1])})`,
          }}
        >
          {countUp ? `${countUp.prefix ?? "$"}${shown}` : value}
        </div>

        {sub ? (
          <div
            style={{
              fontFamily: sans,
              fontSize: 30,
              color: color.inkMuted,
              marginTop: 22,
              opacity: interpolate(slam, [0.5, 1], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            {sub}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};