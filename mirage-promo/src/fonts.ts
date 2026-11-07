// The same two faces the app loads in index.html, resolved through
// @remotion/google-fonts so Remotion waits for them before rendering a frame.
import { loadFont } from "@remotion/google-fonts/Inter";
import { loadVariableFont as loadFraunces } from "@remotion/google-fonts/Fraunces";

const { fontFamily: inter } = loadFont("normal", {
  weights: ["400", "600"],
  subsets: ["latin"],
});

const { fontFamily: fraunces } = loadFraunces("normal", { subsets: ["latin"] });

export const sans = `${inter}, ui-sans-serif, system-ui, sans-serif`;
export const display = `${fraunces}, ui-serif, Georgia, serif`;
