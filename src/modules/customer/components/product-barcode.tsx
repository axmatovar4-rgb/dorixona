"use client";

import * as React from "react";
import JsBarcode from "jsbarcode";

export function ProductBarcode({ value }: { value: string }) {
  const svgRef = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    if (svgRef.current) {
      JsBarcode(svgRef.current, value, {
        format: "CODE128",
        height: 34,
        width: 1.4,
        fontSize: 11,
        margin: 6,
      });
    }
  }, [value]);

  return (
    <div className="mx-auto flex w-fit items-center justify-center rounded-xl border bg-white p-2 dark:bg-white">
      <svg ref={svgRef} />
    </div>
  );
}
