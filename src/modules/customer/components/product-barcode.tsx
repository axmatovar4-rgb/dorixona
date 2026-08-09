"use client";

import * as React from "react";
import JsBarcode from "jsbarcode";

export function ProductBarcode({ value }: { value: string }) {
  const svgRef = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    JsBarcode(svg, value, {
      format: "CODE128",
      height: 80,
      width: 3,
      fontSize: 18,
      margin: 12,
    });
    // JsBarcode renders fixed-pixel width/height — swap to a viewBox so the
    // svg scales down on narrow screens instead of overflowing horizontally.
    const w = svg.getAttribute("width");
    const h = svg.getAttribute("height");
    if (w && h) {
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.removeAttribute("width");
      svg.setAttribute("height", "auto");
      svg.style.width = "100%";
      svg.style.maxWidth = `${w}px`;
    }
  }, [value]);

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col items-center gap-1.5 rounded-xl border bg-white p-3 dark:bg-white">
      <svg ref={svgRef} className="w-full" />
      <span className="text-[11px] text-neutral-500">
        POS kamerasi uchun — bu ekranni kameraga <strong>tik va tekis</strong> (qiyalatmasdan) tuting, 10&ndash;15 sm
        masofada, yorug&apos;lik yetarli joyda, ekranga aks tushmasin
      </span>
    </div>
  );
}
