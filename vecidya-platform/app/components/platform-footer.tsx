import packageJson from "../../package.json";

export const platformVersion = packageJson.version;

export function PlatformFooter({ area = "public" }: { area?: "public" | "app" | "admin" }) {
  const label = area === "admin" ? "Admin" : area === "app" ? "App" : "Público";

  return (
    <div className={`platform-footer platform-footer--${area}`}>
      <span>© 2026 Vecidya</span>
      <span aria-label={`Versión ${label} ${platformVersion}`}>Versión {label} v{platformVersion}</span>
    </div>
  );
}
