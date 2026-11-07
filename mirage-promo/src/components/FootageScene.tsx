import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { footage, type Footage } from "../footage";

/**
 * One beat of recorded app footage, filling the frame.
 *
 * A slow push keeps the still UI from feeling like a static screenshot. The
 * clip's usable range was measured by the capture script, so the in-point is
 * exact rather than guessed.
 *
 * `startFrom`/`endAt` index the *source* video's frames, so they are scaled by
 * the clip's own frame rate — the recorder writes 25fps even though the
 * composition runs at 30.
 */
export const FootageScene: React.FC<{
  beat: string;
  durationInFrames: number;
  /** Seconds further into the clip to start, when a beat opens mid-action. */
  leadInSeconds?: number;
  push?: number;
}> = ({ beat, durationInFrames, leadInSeconds = 0, push = 0.045 }) => {
  const frame = useCurrentFrame();
  const clip = footage[beat] as Footage | undefined;
  if (!clip) throw new Error(`unknown footage beat: ${beat}`);

  const startFrom = Math.round((clip.from + leadInSeconds) * clip.frameRate);
  const endAt = Math.round((clip.from + clip.duration) * clip.frameRate);
  const scale = interpolate(frame, [0, durationInFrames], [1, 1 + push], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0c", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <OffthreadVideo
          src={staticFile(clip.src)}
          startFrom={startFrom}
          endAt={endAt}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
