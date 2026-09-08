import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function WorkspaceDrawer({
  open,
  title,
  children,
  onClose,
  theme = "light",
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  theme?: "light" | "dark";
}) {
  const panel = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const appRoot = document.getElementById("root");
    const wasInert = appRoot?.inert ?? false;
    const focusables = () =>
      Array.from(
        panel.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), textarea, select, summary, [tabindex="0"]',
        ) ?? [],
      ).filter((el) => el.getClientRects().length > 0);
    focusables()[0]?.focus();
    if (appRoot) appRoot.inert = true;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key !== "Tab") return;
      const elements = focusables();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first) {
        event.preventDefault();
        panel.current?.focus();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !panel.current?.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !panel.current?.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      if (appRoot) appRoot.inert = wasInert;
      previousFocus?.focus();
    };
  }, [open]);
  if (!open) return null;
  return createPortal(
    <div className={`workspace-overlay workspace-overlay--${theme}`}>
      <button
        className="workspace-backdrop"
        onClick={onClose}
        aria-label="关闭面板"
        tabIndex={-1}
      />
      <section
        className="workspace-drawer"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header>
          <div>
            <small>一叶问茶 · 春声三鸣</small>
            <h2 id={titleId}>{title}</h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="关闭窗口"
          >
            <X size={22} />
          </button>
        </header>
        <div className="workspace-drawer__body">{children}</div>
      </section>
    </div>,
    document.body,
  );
}
