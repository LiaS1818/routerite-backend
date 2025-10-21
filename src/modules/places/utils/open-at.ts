import { FsqPlace } from '../interfaces/fsq-place';

/**
 * Verifica si un lugar está abierto en una fecha/hora dada.
 * - Soporta formato de hora HHmm (p. ej. "0730", "2300", "+0000").
 * - Soporta spans que cruzan medianoche.
 * - Si no hay info de horarios, devuelve false.
 * 
 * @param place Lugar del mock
 * @param openAt Fecha/hora a verificar (ISO o epoch)
 * @returns boolean
 */
export function isOpenAt(place: FsqPlace, openAt?: string): boolean {
  if (!openAt) return true;
  if (!Array.isArray(place.hours?.regular) || place.hours!.regular!.length === 0) return false;

  // Parsear fecha/hora enviada
  let dt: Date;
  if (/^\d+$/.test(openAt)) {
    const n = Number(openAt);
    dt = new Date(n > 2_000_000_000 ? n : n * 1000);
  } else {
    dt = new Date(openAt);
  }
  if (Number.isNaN(dt.getTime())) return false;

  // Día de la semana (1=Lunes, 7=Domingo, como en el mock)
  const jsDay = dt.getDay();        // JS: 0=domingo, 6=sábado
  const mockDay = jsDay === 0 ? 7 : jsDay;

  // Formatear hora actual en HHmm
  const hh = dt.getHours().toString().padStart(2, '0');
  const mm = dt.getMinutes().toString().padStart(2, '0');
  const currentTime = `${hh}${mm}`;

  // Recorrer spans del día correspondiente
  const spans = place.hours!.regular!.filter(s => s.day === mockDay);
  for (const s of spans) {
    const open = normalizeTime(s.open);
    const close = normalizeTime(s.close);

    // +0000 o "0000" (sin cierre definido) => 24 horas
    if (close === '+0000' || close === '0000') return true;

    // Si hay apertura y cierre válidos
    if (open && close) {
      if (open <= close) {
        if (currentTime >= open && currentTime < close) return true;
      } else {
        // Caso cruzando medianoche
        if (currentTime >= open || currentTime < close) return true;
      }
    }
  }

  return false;
}

/**
 * Normaliza las horas a formato "HHmm".
 * - Convierte "+0000" o "0000" (usado en Foursquare) en "+0000".
 * - Quita espacios o símbolos raros.
 */
function normalizeTime(t?: string): string {
  if (!t) return '';
  const s = t.trim().replace(/[^0-9+]/g, '');
  if (s === '0000' || s === '+0000') return '+0000';
  if (s.length === 3) return `0${s}`;
  if (s.length === 2) return `${s}00`;
  return s;
}
