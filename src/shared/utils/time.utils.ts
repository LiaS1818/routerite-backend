/**
 * Funciones utilitarias para manejo de tiempo en formato HH:MM
 */

/**
 * Calcula la diferencia en minutos entre dos horas en formato HH:MM
 * Si endTime es menor que startTime, asume que cruza la medianoche
 * @param startTime Hora de inicio en formato HH:MM
 * @param endTime Hora de fin en formato HH:MM
 * @returns Diferencia en minutos
 */
export function calculateMinutesDifference(startTime: string, endTime: string): number {
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    throw new Error('Formato de tiempo inválido. Debe ser HH:MM');
  }

  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  // Si endTime es menor que startTime, asumimos que cruza la medianoche
  if (endMinutes < startMinutes) {
    return endMinutes + (1440 - startMinutes); // 1440 = 24 horas * 60 minutos
  }

  return endMinutes - startMinutes;
}

/**
 * Convierte una hora base más un desplazamiento en minutos a una nueva hora
 * @param baseTime Hora base en formato HH:MM
 * @param offsetMinutes Desplazamiento en minutos (puede ser negativo)
 * @returns Nueva hora en formato HH:MM
 */
export function convertMinutesToTime(baseTime: string, offsetMinutes: number): string {
  if (!isValidTimeFormat(baseTime)) {
    throw new Error('Formato de tiempo inválido. Debe ser HH:MM');
  }

  const baseMinutes = parseTimeToMinutes(baseTime);
  let totalMinutes = baseMinutes + offsetMinutes;

  // Normalizar para manejar overflow/underflow
  while (totalMinutes < 0) {
    totalMinutes += 1440; // Añadir un día completo
  }

  return formatMinutesToTime(totalMinutes);
}

/**
 * Parsea una hora en formato HH:MM a minutos desde la medianoche
 * @param time Hora en formato HH:MM
 * @returns Minutos desde la medianoche
 */
export function parseTimeToMinutes(time: string): number {
  if (!isValidTimeFormat(time)) {
    throw new Error('Formato de tiempo inválido. Debe ser HH:MM');
  }

  const [hours, minutes] = time.split(':').map(Number);
  return (hours * 60) + minutes;
}

/**
 * Formatea una cantidad de minutos a formato de hora HH:MM
 * @param minutes Minutos desde la medianoche
 * @returns Hora en formato HH:MM
 */
export function formatMinutesToTime(minutes: number): string {
  // Normalizar minutos para asegurarse que está en el rango [0-1439]
  const normalizedMinutes = minutes % 1440;

  const hours = Math.floor(normalizedMinutes / 60);
  const mins = normalizedMinutes % 60;

  // Formatear con padding para asegurar formato HH:MM
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Valida si una cadena tiene un formato de hora válido HH:MM
 * @param time Cadena a validar
 * @returns true si tiene formato válido, false en caso contrario
 */
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  return timeRegex.test(time);
}
