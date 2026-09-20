import type { ComponentProps, ReactNode } from "react";

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

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "brand" | "success" | "danger" }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function Alert({ children }: { children: ReactNode }) {
  return (
    <p className="alert" role="alert">
      {children}
    </p>
  );
}
