import { Config } from "@remotion/cli/config";
import fs from "node:fs";

// PNG frames and a BT.709 colour matrix keep the app colours exact
// (the defaults are JPEG and BT.601, which shift reds and blues).
Config.setVideoImageFormat("png");
Config.setColorSpace("bt709");
Config.setOverwriteOutput(true);

// Use the system Chromium when Remotion's own download is unavailable.
const local = "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome";
if (fs.existsSync(local)) Config.setBrowserExecutable(local);
