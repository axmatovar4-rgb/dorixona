import { NextRequest } from "next/server";

export const runtime = "nodejs";

type NominatimAddress = {
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  region?: string;
};

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lon = req.nextUrl.searchParams.get("lon");
  if (!lat || !lon) {
    return new Response("lat/lon kerak", { status: 400 });
  }

  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&accept-language=uz`,
    { headers: { "User-Agent": "PharmCare-ERP/1.0 (dorixona-chi.vercel.app)" } }
  );

  if (!res.ok) {
    return new Response("Manzilni aniqlab bo'lmadi", { status: 502 });
  }

  const data = (await res.json()) as { address?: NominatimAddress; display_name?: string };
  const a = data.address ?? {};

  const parts = [
    a.state ?? a.region,
    a.city_district ?? a.suburb ?? a.neighbourhood,
    a.city ?? a.town ?? a.village,
    [a.road, a.house_number].filter(Boolean).join(" "),
  ].filter((p): p is string => !!p && p.trim().length > 0);

  const address = parts.length > 0 ? parts.join(", ") : data.display_name ?? "";
  if (!address) {
    return new Response("Manzil topilmadi", { status: 404 });
  }

  return Response.json({ address });
}
