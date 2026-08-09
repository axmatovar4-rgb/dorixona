"use client";

import * as React from "react";
import JsBarcode from "jsbarcode";

export function ProductBarcode({ value }: { value: string }) {
  const svgRef = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    if (svgRef.current) {
      JsBarcode(svgRef.current, value, {
        format: "CODE128",
        height: 80,
        width: 3,
        fontSize: 18,
        margin: 12,
      });
    }
  }, [value]);

  return (
    <div className="mx-auto flex w-fit flex-col items-center gap-1.5 rounded-xl border bg-white p-3 dark:bg-white">
      <svg ref={svgRef} />
      <span className="text-[11px] text-neutral-500">
        POS kamerasi uchun — yorug&apos;lik yetarli joyda, ekrandan 10&ndash;15 sm masofada ushlang
      </span>
    </div>
  );
}
