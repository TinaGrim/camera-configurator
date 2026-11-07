import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { display, sans } from "../fonts";
import { color } from "../theme";

/** Closing lockup. No footage — the promo ends on the brand, not the product. */
export const EndCard: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 24 });
  const leave = interpolate(frame, [durationInFrames - 16, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color.bg,
        alignItems: "center",
        justifyContent: "center",
        opacity: 1 - leave,
      }}
    >
      <div style={{ textAlign: "center", opacity: enter }}>
        <div
          style={{
            fontFamily: sans,
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: color.accent,
          }}
        >
          Camera Atelier
        </div>

        <div
          style={{
            fontFamily: display,
            fontSize: 150,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: color.ink,
            marginTop: 22,
          }}
        >
          Mirage<span style={{ color: color.accent }}>.</span>
        </div>

        <div
          style={{
            height: 2,
            width: 300,
            margin: "38px auto 0",
            backgroundColor: color.accent,
            transform: `scaleX(${interpolate(enter, [0.25, 0.75], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })})`,
          }}
        />

        <div
          style={{
            fontFamily: display,
            fontSize: 56,
            lineHeight: 1.2,
            color: color.inkMuted,
            marginTop: 38,
          }}
        >
          Pretty price, pretty quality.
        </div>

        <div
          style={{
            fontFamily: sans,
            fontSize: 38,
            fontWeight: 600,
            letterSpacing: "0.04em",
            color: color.accent,
            marginTop: 40,
          }}
        >
          mirage.cam
        </div>
      </div>
    </AbsoluteFill>
  );
};
