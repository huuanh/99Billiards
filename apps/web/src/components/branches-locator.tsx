"use client";

import "leaflet/dist/leaflet.css";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Branch } from "@99billiards/db/seed";

// Leaflet phải import động bên client vì nó dùng `window`.
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), {
  ssr: false,
});

// Helper sống bên trong <MapContainer> để pan/zoom mượt khi đổi cơ sở.
const MapFlyTo = dynamic(
  async () => {
    const mod = await import("react-leaflet");
    function MapFlyToInner({ center, zoom }: { center: [number, number]; zoom: number }) {
      const map = mod.useMap();
      useEffect(() => {
        map.flyTo(center, zoom, { duration: 0.9 });
      }, [center, zoom, map]);
      return null;
    }
    return MapFlyToInner;
  },
  { ssr: false },
);

const DEFAULT_ZOOM = 16;

function statusLabel(status: Branch["status"]) {
  switch (status) {
    case "open":
      return "Đang mở cửa";
    case "coming-soon":
      return "Đang mở cửa";
    case "busy":
      return "Đông";
    default:
      return status;
  }
}

function statusPillClass(status: Branch["status"]) {
  switch (status) {
    case "open":
    case "busy":
    case "coming-soon":
      return "bg-[#2EB958] text-black";
    default:
      return "bg-white/15 text-white";
  }
}

export function BranchesLocator({ branches }: { branches: Branch[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(branches[0]?.id ?? null);
  const [leafletReady, setLeafletReady] = useState(false);
  const infoCardRef = useRef<HTMLDivElement | null>(null);

  // Khi user click cơ sở trên mobile, scroll info card vào giữa viewport.
  function handleSelectBranch(id: string) {
    setSelectedId(id);
    if (typeof window === "undefined") return;
    // Chỉ scroll trên viewport < lg (1024px) — desktop đã thấy cả 2 cột.
    if (window.innerWidth >= 1024) return;
    // Đợi 1 frame để DOM update theo state mới (iframe / card có thể đổi size).
    requestAnimationFrame(() => {
      infoCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  // Patch icon mặc định của Leaflet (path icon images bị broken khi bundle).
  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled) return;
      // @ts-expect-error _getIconUrl is internal but well-known fix.
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setLeafletReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const branchesWithCoords = useMemo(
    () => branches.filter((b) => typeof b.lat === "number" && typeof b.lng === "number"),
    [branches],
  );

  const selected = branches.find((b) => b.id === selectedId) ?? branches[0] ?? null;
  const selectedHasCoords =
    selected && typeof selected.lat === "number" && typeof selected.lng === "number";
  const initialCoords: [number, number] | null = useMemo(() => {
    const first = branchesWithCoords[0];
    return first ? [first.lat as number, first.lng as number] : null;
  }, [branchesWithCoords]);

  function openBookingModal() {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("open-booking-modal", {
        detail: { branchId: selected?.id ?? null },
      }),
    );
  }

  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      {/* LIST TABLE (left) */}
      <div className="flex flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0c1110]">
        <div className="grid grid-cols-[3rem_1fr] gap-3 border-b border-white/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
          <span>No.</span>
          <span>Cơ sở · Địa chỉ</span>
        </div>
        <ul className="lg:max-h-[680px] lg:overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(46,185,88,0.45)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:hover:bg-[#2EB958]/55 [&::-webkit-scrollbar-track]:bg-transparent">
          {branches.map((branch, idx) => {
            const isActive = branch.id === selectedId;
            return (
              <li key={branch.id}>
                <button
                  type="button"
                  onClick={() => handleSelectBranch(branch.id)}
                  className={`grid w-full grid-cols-[3rem_1fr] items-center gap-3 border-b border-white/[0.06] px-4 py-5 text-left transition ${
                    isActive
                      ? "bg-[#2EB958] text-black"
                      : "text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <span
                    className={`text-base font-black tabular-nums ${
                      isActive ? "text-black/65" : "text-white"
                    }`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black uppercase tracking-[0.08em]">
                      {branch.name.replace(/^99 Billiards\s+/i, "")}
                      <span
                        className={`ml-2 text-[10px] font-bold uppercase tracking-[0.18em] ${
                          isActive ? "text-black/55" : "text-white"
                        }`}
                      >
                        · {branch.district}
                      </span>
                    </span>
                    <span
                      className={`mt-1 block truncate text-xs font-medium ${
                        isActive ? "text-black/70" : "text-white"
                      }`}
                    >
                      {branch.address}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* MAP + SELECTED CARD (right) */}
      <div
        ref={infoCardRef}
        className="overflow-hidden rounded-lg border border-white/10 bg-[#0c1110] scroll-mt-32"
      >
        <div
          className="relative h-72 md:h-96"
          style={{ touchAction: "pan-y" }}
        >
          {leafletReady && initialCoords ? (
            <MapContainer
              center={initialCoords}
              zoom={DEFAULT_ZOOM}
              scrollWheelZoom={false}
              dragging={false}
              touchZoom={false}
              doubleClickZoom={false}
              boxZoom={false}
              keyboard={false}
              zoomControl={false}
              tap={false}
              style={{ height: "100%", width: "100%", touchAction: "pan-y" }}
            >
              {/* CartoDB Voyager — màu Google Maps-like, crisp hơn OSM raw. */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                subdomains={["a", "b", "c", "d"]}
                maxZoom={20}
              />
              {selectedHasCoords ? (
                <>
                  <Marker
                    key={selected.id}
                    position={[selected.lat as number, selected.lng as number]}
                  />
                  <MapFlyTo
                    center={[selected.lat as number, selected.lng as number]}
                    zoom={DEFAULT_ZOOM}
                  />
                </>
              ) : null}
            </MapContainer>
          ) : (
            <div className="grid h-full place-items-center text-sm text-white/40">
              Đang tải bản đồ...
            </div>
          )}
        </div>

        {selected ? (
          <div className="border-t border-white/10 p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/45">
              {selected.code}
              {typeof selected.lat === "number" && typeof selected.lng === "number" ? (
                <>
                  {" · "}
                  {selected.lat.toFixed(4)}°N · {selected.lng.toFixed(4)}°E
                </>
              ) : null}
            </p>
            <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
              <h3 className="text-3xl font-black uppercase tracking-[0.04em]">
                {selected.name.replace(/^99 Billiards\s+/i, "")}
              </h3>
              <span
                className={`rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] ${statusPillClass(selected.status)}`}
              >
                · {statusLabel(selected.status)}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/65">{selected.address}</p>
            {selectedHasCoords ? (
              <a
                href={`https://www.google.com/maps?q=${selected.lat},${selected.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#2EB958] hover:text-white"
              >
                Mở trong Google Maps
                <span aria-hidden>↗</span>
              </a>
            ) : null}
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Bàn
                </p>
                <p className="mt-1 text-2xl font-black">{selected.tables ?? "-"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Hotline
                </p>
                <p className="mt-1 text-base font-black">{selected.phone}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={openBookingModal}
              className="focus-ring mt-5 block w-full rounded-full bg-[#2EB958] py-4 text-center text-sm font-black uppercase tracking-[0.18em] text-black shadow-[0_18px_38px_-18px_rgba(46,185,88,0.7)] transition hover:bg-[#27a04b] hover:shadow-[0_22px_44px_-18px_rgba(46,185,88,0.85)]"
            >
              Đặt bàn ngay →
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
