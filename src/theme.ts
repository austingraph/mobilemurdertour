/** Shared "gaslight gothic" palette and type scale. */
export const colors = {
  background: "#0b0b10",
  surface: "#15151d",
  surfaceRaised: "#1d1d28",
  border: "#2c2c3a",
  text: "#e8e4d8",
  textDim: "#9a94a6",
  accent: "#c9a227", // gaslight amber
  blood: "#8e1c1c",
  bloodBright: "#c0392b",
  ghost: "#aebfd0",
  success: "#4c7c54",
};

export const fonts = {
  // System serif reads as "period print" without bundling a font file.
  // To go further, drop a free font (e.g. IM Fell English from Google Fonts)
  // into assets/fonts and load it with expo-font.
  display: "serif",
  body: undefined as string | undefined,
};

export const spacing = (n: number) => n * 8;
