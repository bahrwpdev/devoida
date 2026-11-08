import { Config } from "@remotion/cli/config";
import fs from "node:fs";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Use the system Chromium when Remotion's own download is unavailable.
const local = "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome";
if (fs.existsSync(local)) Config.setBrowserExecutable(local);
