"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@99billiards/ui";

export function ProductGallerySlider({ images, productName }: { images: string[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const activeImage = images[activeIndex] || images[0] || "";

  useEffect(() => {
    if (!fullscreen) return;

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") setFullscreen(false);
      if (event.key === "ArrowRight") setActiveIndex((current) => (current + 1) % images.length);
      if (event.key === "ArrowLeft") setActiveIndex((current) => (current - 1 + images.length) % images.length);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeydown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [fullscreen, images.length]);

  if (!activeImage) {
    return <div className="aspect-square border border-black/10 bg-white" />;
  }

  function previousImage() {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  }

  function nextImage() {
    setActiveIndex((current) => (current + 1) % images.length);
  }

  return (
    <>
      <div className="grid gap-4">
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className="relative aspect-square overflow-hidden border border-black/10 bg-white text-left"
          aria-label="Xem anh san pham phong to"
        >
          <Image src={activeImage} alt={productName} fill priority className="object-cover" />
        </button>

        {images.length > 1 ? (
          <div className="grid grid-cols-4 gap-3 md:grid-cols-6">
            {images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={[
                  "relative aspect-square overflow-hidden border bg-white",
                  index === activeIndex ? "border-[#00684a] ring-2 ring-[#00684a]/25" : "border-black/10",
                ].join(" ")}
                aria-label={`Xem anh ${index + 1}`}
              >
                <Image src={image} alt={`${productName} ${index + 1}`} fill className="object-cover transition hover:scale-105" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {fullscreen ? (
        <div className="fixed inset-0 z-[80] bg-black text-white">
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="absolute right-4 top-4 z-10 min-h-11 border border-white/25 bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-black"
          >
            <span className="inline-flex items-center gap-2">
              <FontAwesomeIcon icon="xmark" className="h-4 w-4" />
              Dong
            </span>
          </button>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={previousImage}
                className="absolute left-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center border border-white/25 bg-white/12 text-3xl font-black"
                aria-label="Anh truoc"
              >
                <FontAwesomeIcon icon="chevron-left" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center border border-white/25 bg-white/12 text-3xl font-black"
                aria-label="Anh tiep theo"
              >
                <FontAwesomeIcon icon="chevron-right" className="h-5 w-5" />
              </button>
            </>
          ) : null}

          <div className="relative h-full w-full">
            <Image src={activeImage} alt={productName} fill className="object-contain p-4 md:p-10" sizes="100vw" />
          </div>

          {images.length > 1 ? (
            <div className="absolute bottom-4 left-1/2 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 gap-2 overflow-auto border border-white/15 bg-black/45 p-2 backdrop-blur">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={[
                    "relative h-16 w-16 shrink-0 overflow-hidden border",
                    index === activeIndex ? "border-[#d6ff3f]" : "border-white/20",
                  ].join(" ")}
                  aria-label={`Xem anh ${index + 1}`}
                >
                  <Image src={image} alt={`${productName} ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
