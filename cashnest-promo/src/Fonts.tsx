import React, { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

const faces: [number, string][] = [
  [300, "Inter-Light"],
  [400, "Inter-Regular"],
  [500, "Inter-Medium"],
  [600, "Inter-SemiBold"],
  [700, "Inter-Bold"],
];

/** Loads the app's bundled Inter weights before the first frame renders. */
export const Fonts: React.FC = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const css = faces
      .map(
        ([w, f]) =>
          `@font-face{font-family:Inter;font-weight:${w};src:url(${staticFile(
            `fonts/${f}.ttf`,
          )}) format("truetype");}`,
      )
      .join("\n");
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    Promise.all(faces.map(([w]) => document.fonts.load(`${w} 16px Inter`)))
      .catch(() => undefined)
      .then(() => continueRender(handle));
  }, [handle]);
  return null;
};
