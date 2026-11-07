import "./index.css";
import { Composition } from "remotion";
import { Promo, PROMO_DURATION_IN_FRAMES, height, width } from "./Promo";
import { fps } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Promo"
      component={Promo}
      durationInFrames={PROMO_DURATION_IN_FRAMES}
      fps={fps}
      width={width}
      height={height}
    />
  );
};
