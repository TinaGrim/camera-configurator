import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Caption } from "./components/Caption";
import { EndCard } from "./components/EndCard";
import { FootageScene } from "./components/FootageScene";
import { ModelCard, type Model } from "./components/ModelCard";
import { Scrim } from "./components/Scrim";
import { StatSlam } from "./components/StatSlam";
import { TypeSwap } from "./components/TypeSwap";
import { color, fps, height, width } from "./theme";

/**
 * The cut opens on the object and the price, then spends its time proving both
 * — the app's own flow, interrupted by type that tracks what is on screen.
 */
const FADE = 10;

// browse.webm's usable range starts at 4.708s. These are file-time in-points,
// measured at the frame each body has settled rather than the frame the swap
// begins, so a card never leads the footage it describes.
const BROWSE = 4.708;
const CUT_VELA = 7.6;
const CUT_DRIFT = 8.9;
const CUT_AURORA = 10.4;
const toFrames = (t: number, start: number) => Math.round((t - start) * fps);

const MODELS: Model[] = [
  { name: "Vela Pro", finish: "Gunmetal", sensor: "33MP stacked CMOS · 8K", price: "$460" },
  { name: "Drift Mini", finish: "Charcoal", sensor: "Compact APS-C traveler", price: "$280" },
  { name: "Aurora X7", finish: "Matte Black", sensor: "24MP full-frame sensor", price: "$410" },
];

type Beat = {
  id: string;
  durationInFrames: number;
  render: (durationInFrames: number) => React.ReactNode;
};

const BEATS: Beat[] = [
  {
    // Cold open. No app chrome yet — just the body turning and the promise.
    id: "hook",
    durationInFrames: 72,
    render: (d) => (
      <>
        <FootageScene beat="browse" durationInFrames={d} push={0.06} />
        <Scrim strength={0.78} />
        <TypeSwap
          lines={[
            { text: "A full-frame camera.", in: 6, out: 34 },
            { text: "Under $350.", in: 36, out: d, size: 104, accent: color.accent },
          ]}
        />
      </>
    ),
  },
  {
    // The app's own opening card does the pivot. "Tap anywhere to begin" is the
    // setup the next beat pays off.
    id: "pivot",
    durationInFrames: 54,
    render: (d) => <FootageScene beat="hero" durationInFrames={d} push={0.02} />,
  },
  {
    id: "reveal",
    durationInFrames: 66,
    render: (d) => (
      <>
        <FootageScene beat="reveal" durationInFrames={d} leadInSeconds={0.35} />
        <Scrim strength={0.6} />
        <TypeSwap lines={[{ text: "It appears, in real time.", in: 8, out: d, size: 74 }]} />
      </>
    ),
  },
  {
    // The centrepiece: one card per recorded camera swap, each landing on the
    // exact frame the body actually changes. Segments are 1.3s / 1.5s / 2.4s.
    id: "bodies",
    durationInFrames: 156,
    render: (d) => {
      const vela = toFrames(CUT_VELA, CUT_VELA);
      const drift = toFrames(CUT_DRIFT, CUT_VELA);
      const aurora = toFrames(CUT_AURORA, CUT_VELA);
      return (
        <>
          <FootageScene beat="browse" durationInFrames={d} leadInSeconds={CUT_VELA - BROWSE} push={0.05} />
          <Scrim strength={0.8} />
          <ModelCard model={MODELS[0]} from={vela} to={drift} index={0} />
          <ModelCard model={MODELS[1]} from={drift} to={aurora} index={1} />
          <ModelCard model={MODELS[2]} from={aurora} to={d} index={2} />
        </>
      );
    },
  },
  {
    // The payoff. This is the number the hook promised.
    id: "price",
    durationInFrames: 66,
    render: (d) => (
      <>
        <FootageScene beat="browse" durationInFrames={d} leadInSeconds={13.4 - BROWSE} push={0.04} />
        <Scrim strength={0.86} />
        <StatSlam
          label="Fifteen percent off, applied"
          value="$348.50"
          sub="Aurora X7 · down from $410"
          size={138}
        />
      </>
    ),
  },
  {
    id: "kit",
    durationInFrames: 108,
    render: (d) => (
      <>
        <FootageScene beat="kit" durationInFrames={d} leadInSeconds={1.2} />
        <Scrim strength={0.76} />
        <TypeSwap
          lines={[
            { text: "Then the extras.", in: 6, out: 52, size: 70 },
            { text: "Keychain $19 · Strap $29", in: 54, out: 86, size: 50, family: "sans", accent: color.inkMuted },
            { text: "Make it yours.", in: 86, out: d, size: 70 },
          ]}
        />
      </>
    ),
  },
  {
    id: "order",
    durationInFrames: 132,
    render: (d) => (
      <>
        <FootageScene beat="review" durationInFrames={d} push={0.03} />
        <Scrim strength={0.8} />
        <TypeSwap lines={[{ text: "One order. One total.", in: 8, out: 60, size: 70 }]} />
        <StatSlam
          label="Total"
          value="$415.50"
          sub="Aurora X7 · strap · two keychains"
          from={62}
          size={120}
        />
      </>
    ),
  },
  {
    id: "ready",
    durationInFrames: 84,
    render: (d) => (
      <>
        <FootageScene beat="sent" durationInFrames={d} />
        <Scrim strength={0.62} />
        <Caption line="Straight to your shop chat." durationInFrames={d} face="sans" size={46} accent="@PanMengLy" />
      </>
    ),
  },
  {
    id: "end",
    durationInFrames: 108,
    render: (d) => <EndCard durationInFrames={d} />,
  },
];

export const Promo: React.FC = () => {
  const frame = useCurrentFrame();

  let cursor = 0;
  const at = BEATS.map((beat) => {
    const from = cursor;
    cursor += beat.durationInFrames;
    return { beat, from };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: color.bg }}>
      {at.map(({ beat, from }) => {
        const local = frame - from;
        if (local < 0 || local >= beat.durationInFrames) return null;
        const opacity = interpolate(
          local,
          [0, FADE, beat.durationInFrames - FADE, beat.durationInFrames],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        return (
          <Sequence key={beat.id} from={from} durationInFrames={beat.durationInFrames}>
            <AbsoluteFill style={{ opacity }}>{beat.render(beat.durationInFrames)}</AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const PROMO_DURATION_IN_FRAMES = BEATS.reduce((sum, beat) => sum + beat.durationInFrames, 0);
export { BEATS, fps, width, height };