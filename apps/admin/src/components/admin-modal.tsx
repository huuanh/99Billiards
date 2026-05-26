"use client";

import { FontAwesomeIcon } from "@99billiards/ui";
import { useEffect, useState } from "react";

export function FormModal({
  trigger,
  title,
  subtitle,
  children,
  intent = "default",
}: {
  trigger: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  intent?: "default" | "primary";
}) {
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const triggerIcon = trigger.toLowerCase().includes("sua") ? "pen-to-square" : "cart-shopping";

  function close(message?: string) {
    setOpen(false);
    if (message) {
      setNotice(message);
      window.setTimeout(() => setNotice(""), 3200);
    }
  }

  useEffect(() => {
    function handleSuccess(event: Event) {
      if (!open) return;
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      close(detail?.message);
    }

    window.addEventListener("admin-form-success", handleSuccess);
    return () => window.removeEventListener("admin-form-success", handleSuccess);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          intent === "primary"
            ? "focus-ring min-h-9 rounded-md bg-[#d6ff3f] px-3 py-2 text-sm font-black text-black"
            : "focus-ring min-h-9 rounded-md border border-[#cfd5c8] bg-white px-3 py-2 text-sm font-bold text-[#111713]"
        }
      >
        <span className="inline-flex items-center gap-2">
          <FontAwesomeIcon icon={triggerIcon} className="h-3.5 w-3.5" />
          {trigger}
        </span>
      </button>

      {notice ? (
        <div className="fixed right-4 top-4 z-[60] max-w-sm rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 shadow-lg">
          {notice}
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 bg-[#f6f7f3] text-[#111713]">
          <div className="flex h-full flex-col">
            <header className="flex flex-col gap-3 border-b border-[#dfe3d8] bg-white px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#007a53]">
                  CMS editor
                </p>
                <h2 className="mt-1 text-2xl font-black md:text-3xl">{title}</h2>
                {subtitle ? <p className="mt-1 text-sm text-[#657064]">{subtitle}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => close()}
                className="focus-ring min-h-10 rounded-md border border-[#cfd5c8] bg-[#111713] px-4 py-2 text-sm font-bold text-white"
              >
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon icon="xmark" className="h-3.5 w-3.5" />
                  Dong
                </span>
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-auto px-4 py-5 md:px-6">
              <div className="mx-auto max-w-6xl">{children}</div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
