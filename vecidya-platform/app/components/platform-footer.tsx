import { version as platformVersion } from "../../package.json";

export { platformVersion };

export function PlatformFooter({ area = "public" }: { area?: "public" | "app" | "admin" }) {
  const label = area === "admin" ? "Admin" : area === "app" ? "App" : "pública";

  return (
    <div className={`platform-footer platform-footer--${area}`}>
      <span>© 2026 Vecidya</span>
      <span aria-label={`Versión ${label} ${platformVersion}`}>Versión {label} {platformVersion}</span>
    </div>
  );
}
