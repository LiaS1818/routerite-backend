import { FsqPlace } from '../interfaces/fsq-place';

/**
 * Comprueba si el lugar está abierto en un timestamp dado.
 * - `openAt`: epoch segundos o milisegundos (detecta) o ISO8601
 * - Usa hours.regular con { day, open, close } (HH:mm, hora local)
 * - Asume hora local == hora del servidor (simplificación para mock).
 */
export function isOpenAt(place: FsqPlace, openAt?: string): boolean {
  if (!openAt) return true;
  if (!place.hours?.regular?.length) return false;

  let dt: Date;
  if (/^\d+$/.test(openAt)) {
    const n = Number(openAt);
    dt = new Date(n > 2_000_000_000 ? n : n * 1000);
  } else {
    dt = new Date(openAt);
  }
  if (Number.isNaN(dt.getTime())) return false;

  const weekday = (dt.getDay() + 7) % 7; // 0=domingo … 6=sábado
  const hh = dt.getHours().toString().padStart(2, '0');
  const mm = dt.getMinutes().toString().padStart(2, '0');
  const t = `${hh}:${mm}`;

  // Permite spans que crucen medianoche: si close < open => cierra al día siguiente
  const spans = place.hours.regular.filter(s => s.day === weekday);
  for (const s of spans) {
    if (!s.open || !s.close) continue;
    if (s.open <= s.close) {
      if (t >= s.open && t < s.close) return true;
    } else {
      // ejemplo: open 18:00, close 02:00
      if (t >= s.open || t < s.close) return true;
    }
  }
  return false;
}
