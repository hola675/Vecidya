import type { ComponentProps, ReactNode } from "react";

export type IconName =
  | "home"
  | "building"
  | "shield"
  | "spark"
  | "user"
  | "menu"
  | "admin"
  | "organizations"
  | "integrations"
  | "audit"
  | "eye"
  | "team";

const iconPaths: Record<IconName, ReactNode> = {
  home: <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9Z M9 21v-6h6v6" />,
  building: <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M2 21h20M8 7h4M8 11h4M8 15h4M16 9h2M16 13h2" />,
  shield: <path d="M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Zm-3 9 2 2 4-4" />,
  spark: <path d="m12 3 .9 5.1L18 9l-5.1.9L12 15l-.9-5.1L6 9l5.1-.9L12 3Zm7 12 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />,
  user: <path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  admin: <path d="M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Zm0 5v7m-3-3 3 3 3-3" />,
  organizations: <path d="M3 21V6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v15M1 21h22M7 8h5m-5 4h5m-5 4h5m7-7h1a2 2 0 0 1 2 2v10m-5-8h2m-2 4h2" />,
  integrations: <path d="M8 7V4m8 3V4M7 11h10m-8 5h6m-8 4h10a3 3 0 0 0 3-3V8H4v9a3 3 0 0 0 3 3Z" />,
  audit: <path d="M5 4h14v16H5zM8 8h8M8 12h8m-8 4h5" />,
  eye: <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
  team: <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-7.5a4 4 0 0 1 0 7.8m3 9.7v-2a4 4 0 0 0-3-3.9" />,
};

export function Icon({ name, className = "icon" }: { name: IconName; className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      {iconPaths[name]}
    </svg>
  );
}

type ButtonProps = ComponentProps<"button"> & {
  tone?: "primary" | "secondary" | "ghost";
};

export function Button({
  className = "",
  tone = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return <button className={`button button--${tone} ${className}`} type={type} {...props} />;
}

export function Card({
  children,
  className = "",
  ...props
}: ComponentProps<"section">) {
  return (
    <section className={`card ${className}`} {...props}>
      {children}
    </section>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "brand" | "success" | "danger" | "warning" }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function Alert({ children }: { children: ReactNode }) {
  return (
    <p className="alert" role="alert">
      {children}
    </p>
  );
}
