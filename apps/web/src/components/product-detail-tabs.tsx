"use client";

import { useState, type ReactNode } from "react";

type TabKey = "description" | "warranty";

export function ProductDetailTabs({
  description,
  warranty,
}: {
  description: ReactNode;
  warranty: ReactNode;
}) {
  const [active, setActive] = useState<TabKey>("description");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "description", label: "Mô tả sản phẩm" },
    { key: "warranty", label: "Chính sách bảo hành" },
  ];

  return (
    <div>
      <div role="tablist" aria-label="Thông tin sản phẩm" className="flex gap-1 border-b border-black/10">
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.key}`}
              id={`tab-${tab.key}`}
              onClick={() => setActive(tab.key)}
              className={`relative px-5 py-3 text-sm font-black uppercase tracking-[0.12em] transition ${
                isActive
                  ? "text-[#2EB958]"
                  : "text-black/55 hover:text-black/80"
              }`}
            >
              {tab.label}
              {isActive ? (
                <span
                  aria-hidden
                  className="absolute -bottom-px left-0 right-0 h-[3px] rounded-full bg-[#2EB958]"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`tabpanel-${active}`}
        aria-labelledby={`tab-${active}`}
        className="pt-6"
      >
        {active === "description" ? description : warranty}
      </div>
    </div>
  );
}
