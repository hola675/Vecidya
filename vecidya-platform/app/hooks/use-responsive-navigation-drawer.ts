import { useEffect, useRef, useState } from "react";

type ResponsiveNavigationDrawerOptions = {
  breakpoint: number;
  firstItemSelector: string;
  enabled?: boolean;
};

export function useResponsiveNavigationDrawer({ breakpoint, firstItemSelector, enabled = true }: ResponsiveNavigationDrawerOptions) {
  const [isMobileNavigation, setIsMobileNavigation] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const isNavigationOpen = navigationOpen && enabled;
  const navigationRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const wasNavigationOpen = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const updateMobileNavigation = () => {
      setIsMobileNavigation(mediaQuery.matches);
      if (!mediaQuery.matches) setNavigationOpen(false);
    };
    updateMobileNavigation();
    mediaQuery.addEventListener("change", updateMobileNavigation);
    return () => mediaQuery.removeEventListener("change", updateMobileNavigation);
  }, [breakpoint]);

  useEffect(() => {
    if (!isMobileNavigation) {
      wasNavigationOpen.current = false;
      return;
    }
    if (!isNavigationOpen) {
      if (wasNavigationOpen.current) requestAnimationFrame(() => menuButtonRef.current?.focus());
      wasNavigationOpen.current = false;
      return;
    }
    wasNavigationOpen.current = true;

    const sidebar = navigationRef.current;
    if (!sidebar) return;

    const focusable = () => [...sidebar.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )].filter((element) => element.getAttribute("aria-hidden") !== "true");
    const firstItem = sidebar.querySelector<HTMLElement>(firstItemSelector);
    (firstItem ?? focusable()[0])?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setNavigationOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const elements = focusable();
      if (elements.length === 0) {
        event.preventDefault();
        sidebar.focus();
        return;
      }
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || !sidebar.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !sidebar.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [firstItemSelector, isMobileNavigation, isNavigationOpen]);

  const closeNavigation = (restoreFocus = false) => {
    setNavigationOpen(false);
    if (restoreFocus) wasNavigationOpen.current = true;
  };

  return { closeNavigation, isMobileNavigation, menuButtonRef, navigationOpen: isNavigationOpen, navigationRef, setNavigationOpen };
}
