"use client";

import * as React from "react";
import JsBarcode from "jsbarcode";
import { QRCodeSVG } from "qrcode.react";

export function BarcodeDisplay({
  barcodeValue,
  qrValue,
}: {
  barcodeValue: string;
  qrValue: string;
}) {
  const svgRef = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    if (svgRef.current) {
      JsBarcode(svgRef.current, barcodeValue, {
        format: "CODE128",
        height: 50,
        fontSize: 12,
        margin: 4,
      });
    }
  }, [barcodeValue]);

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border bg-white p-4 dark:bg-card">
      <svg ref={svgRef} />
      <div className="flex flex-col items-center gap-1">
        <QRCodeSVG value={qrValue} size={96} />
        <span className="text-xs text-muted-foreground">QR kod — mijoz sahifasiga ochadi</span>
      </div>
    </div>
  );
}
