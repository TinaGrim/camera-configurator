import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { display, sans } from "../fonts";
import { color, safe } from "../theme";

/**
 * A quiet line of type for beats where the app's own UI is the headline and a
 * full sheet would only cover it.
 */
export const Caption: React.FC<{
  line: string;
  durationInFrames: number;
  size?: number;
  face?: "display" | "sans";
  accent?: string;
}> = ({ line, durationInFrames, size = 52, face = "display", accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 18 });
  const leave = interpolate(frame, [durationInFrames - 12, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        opacity: 1 - leave,
      }}
    >
      <div
        style={{
          margin: `0 ${safe.x}px ${safe.bottom + 40}px`,
          fontFamily: face === "display" ? display : sans,
          fontSize: size,
          lineHeight: 1.15,
          letterSpacing: face === "display" ? "-0.01em" : "0",
          textAlign: "center",
          color: color.ink,
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [22, 0])}px)`,
        }}
      >
        {line}
        {accent ? (
          <div
            style={{
              fontFamily: sans,
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: color.accent,
              marginTop: 18,
            }}
          >
            {accent}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
