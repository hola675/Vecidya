import { existsSync } from "node:fs";
import { chromium } from "playwright";

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

export function getVisualQaBrowserOptions({ executableOverride = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, edgeExists = existsSync } = {}) {
  const override = executableOverride === null ? undefined : executableOverride;
  const executablePath = override ?? (edgeExists(edgePath) ? edgePath : undefined);
  return executablePath ? { executablePath } : {};
}

export function launchVisualQaBrowser(options) {
  return chromium.launch(getVisualQaBrowserOptions(options));
}
