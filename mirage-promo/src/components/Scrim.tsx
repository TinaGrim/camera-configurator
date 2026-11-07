import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { color } from "../theme";

/**
 * A legibility scrim. The app is already near-black, so this is only enough to
 * hold big type off the busier parts of the UI — a vignette rather than a box.
 */
export const Scrim: React.FC<{ strength?: number }> = ({ strength = 0.72 }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(to top, rgba(10,10,12,${strength}) 0%, rgba(10,10,12,${strength * 0.72}) 26%, rgba(10,10,12,0) 58%), radial-gradient(120% 68% at 50% 62%, rgba(10,10,12,0) 0%, rgba(10,10,12,${strength * 0.5}) 100%)`,
    }}
  />
);

/** A gold hairline that draws across, used to separate statement from detail. */
export const GoldRule: React.FC<{
  progress: number;
  width?: number;
  height?: number;
  margin?: string;
}> = ({ progress, width = 240, height = 3, margin = "30px auto 0" }) => (
  <div
    style={{
      width,
      height,
      margin,
      backgroundColor: color.accent,
      transform: `scaleX(${interpolate(progress, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
    }}
  />
);