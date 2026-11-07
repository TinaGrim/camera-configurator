import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { display, sans } from "../fonts";
import { color, safe } from "../theme";
import { GoldRule } from "./Scrim";

export type Model = {
  name: string;
  finish: string;
  sensor: string;
  price: string;
};

/**
 * The card that names whichever body is on screen. Each one gets its own scene
 * frame window so it lands exactly on the recorded cut.
 */
export const ModelCard: React.FC<{
  model: Model;
  from: number;
  to: number;
  index: number;
}> = ({ model, from, to, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from || frame >= to) return null;

  const local = frame - from;
  const untilOut = to - frame;
  const enter = spring({ frame: local, fps, config: { damping: 200 }, durationInFrames: 14 });
  const exit = interpolate(untilOut, [0, 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const progress = Math.min(enter, 1 - exit);

  // Each card enters from the opposite side of the one before it.
  const fromLeft = index % 2 === 0;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end" }}>
      <div style={{ margin: `0 ${safe.x}px ${safe.bottom}px` }}>
        <div
          style={{
            opacity: progress,
            transform: `translateX(${interpolate(progress, [0, 1], [fromLeft ? -70 : 70, 0])}px)`,
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: color.accent,
            }}
          >
            {model.finish}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 28,
              marginTop: 12,
            }}
          >
            <div style={{ fontFamily: display, fontSize: 88, lineHeight: 1, letterSpacing: "-0.025em", color: color.ink }}>
              {model.name}
            </div>
            <div style={{ fontFamily: sans, fontSize: 62, fontWeight: 600, color: color.accent, whiteSpace: "nowrap" }}>
              {model.price}
            </div>
          </div>

          <GoldRule progress={progress} width={520} margin="26px 0 0" />

          <div
            style={{
              fontFamily: sans,
              fontSize: 30,
              color: color.inkMuted,
              marginTop: 22,
            }}
          >
            {model.sensor}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};