"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Branch } from "@99billiards/db/seed";

const ALL = "__all__";

export function BranchesSection({ branches }: { branches: Branch[] }) {
  const districts = useMemo(
    () => Array.from(new Set(branches.map((branch) => branch.district))),
    [branches],
  );
  const [selected, setSelected] = useState<string>(ALL);

  const filtered = selected === ALL ? branches : branches.filter((b) => b.district === selected);

  return (
    <>
      <div className="mt-8 flex gap-3 overflow-auto pb-2">
        <FilterTag active={selected === ALL} onClick={() => setSelected(ALL)}>
          Tất cả cơ sở
        </FilterTag>
        {districts.map((district) => (
          <FilterTag key={district} active={selected === district} onClick={() => setSelected(district)}>
            {district}
          </FilterTag>
        ))}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {filtered.length ? (
          filtered.map((branch) => (
            <article
              key={branch.id}
              className="grid overflow-hidden rounded-lg border border-white/10 bg-black/25 md:grid-cols-[0.9fr_1.1fr]"
            >
              <div className="relative min-h-64 overflow-hidden">
                <Image src={branch.image} alt={branch.name} fill className="object-cover" />
                <span className="absolute left-4 top-4 rounded-full bg-[#2EB958] px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-black">
                  {branch.code}
                </span>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={branch.status} />
                </div>
                <h3 className="mt-5 text-2xl font-black">{branch.name}</h3>
                <p className="mt-3 text-white/64">{branch.address}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {branch.highlights.map((item) => (
                    <span key={item} className="rounded-full bg-white/8 px-3 py-2 text-xs">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/co-so/${branch.id}`}
                    className="focus-ring rounded-full bg-white px-5 py-3 text-sm font-black text-black"
                  >
                    Xem chi tiết
                  </Link>
                  <a
                    href={branch.mapUrl || "#branches"}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-ring rounded-full border border-white/15 px-5 py-3 text-sm font-black text-white/75"
                  >
                    Chỉ đường
                  </a>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-8 text-center text-white/64 lg:col-span-2">
            <p className="text-lg font-bold text-white">Chưa có cơ sở tại khu vực này</p>
            <p className="mt-2 text-sm">
              99 Billiards đang mở rộng thêm chi nhánh. Hãy chọn khu vực khác hoặc xem tất cả cơ sở.
            </p>
            <button
              type="button"
              onClick={() => setSelected(ALL)}
              className="focus-ring mt-5 inline-flex rounded-full bg-[#2EB958] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black"
            >
              Xem tất cả
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function FilterTag({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`focus-ring shrink-0 rounded-full border px-5 py-3 text-sm font-bold whitespace-nowrap transition ${
        active
          ? "border-[#2EB958] bg-[#2EB958] text-black"
          : "border-white/15 text-white/75 hover:border-[#2EB958]/60 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const text = status === "busy" ? "Đông bàn" : "Đang mở cửa";
  return (
    <span className="rounded-full bg-[#2EB958] px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-black">
      {text}
    </span>
  );
}
