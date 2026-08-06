export async function detectCurrentAddress(): Promise<string> {
  if (!("geolocation" in navigator)) {
    throw new Error("Brauzeringiz joylashuvni aniqlashni qo'llab-quvvatlamaydi");
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  }).catch((err: GeolocationPositionError) => {
    if (err.code === err.PERMISSION_DENIED) {
      throw new Error("Joylashuvga ruxsat berilmadi");
    }
    throw new Error("Joylashuvni aniqlab bo'lmadi");
  });

  const { latitude, longitude } = position.coords;
  const res = await fetch(`/api/geocode/reverse?lat=${latitude}&lon=${longitude}`);
  if (!res.ok) {
    throw new Error("Manzilni aniqlab bo'lmadi");
  }
  const data = (await res.json()) as { address: string };
  return data.address;
}
