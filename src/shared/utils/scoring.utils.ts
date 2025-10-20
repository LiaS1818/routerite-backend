/**
 * Funciones para cálculo de scores y estimaciones de lugares
 */
import { FSQRPlace } from '../../common/interfaces/FSQRPlace.interface';

interface PlaceSearchParams {
  categories?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  budget?: number;
  // Otros parámetros de búsqueda
}

/**
 * Calcula un score para un lugar basado en múltiples factores
 * @param place Información del lugar
 * @param searchParams Parámetros de búsqueda
 * @returns Score del lugar (0-100)
 */
export function calculatePlaceScore(place: FSQRPlace, searchParams: PlaceSearchParams): number {
  // Inicializar componentes de score
  let ratingScore = 0;
  let categoryScore = 0;
  let proximityScore = 0;
  let popularityScore = 0;
  let priceScore = 0;

  // 1. Score de Rating (35 puntos max)
  if (place.rating !== undefined) {
    ratingScore = (place.rating / 10) * 35;
  } else {
    ratingScore = 17.5; // Penalización del 50% si no tiene rating
  }

  // 2. Score de Relevancia de Categoría (25 puntos max)
  if (place.categories && place.categories.length > 0 && searchParams.categories) {
    const mainCategoryId = place.categories[0].fsq_category_id;

    // Match exacto
    if (searchParams.categories.includes(mainCategoryId)) {
      categoryScore = 25;
    } else {
      // Verificar si es una categoría relacionada
      // Aquí se podría implementar una lógica más compleja con tabla de relaciones
      const isRelated = checkRelatedCategories(mainCategoryId, searchParams.categories);
      if (isRelated) {
        categoryScore = 15;
      } else {
        categoryScore = 5; // Categoría genérica
      }
    }
  } else {
    categoryScore = 5; // Valor base si no hay información de categorías
  }

  // 3. Score de Proximidad (20 puntos max)
  if (place && place.latitude && place.longitude &&
      searchParams.location && searchParams.location.latitude && searchParams.location.longitude) {

    const distanceMeters = calculateHaversineDistance(
      place.latitude,
      place.longitude,
      searchParams.location.latitude,
      searchParams.location.longitude
    );

    // Estimación de minutos basada en distancia
    const distanceMinutes = distanceMeters / 80; // Aprox. 80 metros por minuto caminando

    proximityScore = (1 - Math.min(distanceMinutes / 45, 1.0)) * 20;
  } else {
    proximityScore = 10; // Valor medio si no hay información de ubicación
  }

  // 4. Score de Popularidad (10 puntos max)
  if (place.photos) {
    const numPhotos = place.photos.length;
    popularityScore = Math.min(numPhotos / 5, 1.0) * 10;
  } else {
    popularityScore = 5; // Valor medio si no hay información de fotos
  }

  // 5. Score de Precio (10 puntos max)
  if (place.price !== undefined && searchParams.budget) {
    // Calcular price_target basado en presupuesto
    let priceTarget;
    if (searchParams.budget < 150) {
      priceTarget = 1;
    } else if (searchParams.budget < 400) {
      priceTarget = 2;
    } else if (searchParams.budget < 800) {
      priceTarget = 3;
    } else {
      priceTarget = 4;
    }

    priceScore = (1 - Math.abs(place.price - priceTarget) / 4) * 10;
  } else {
    priceScore = 5; // Valor medio si no hay información de precio
  }

  // 6. Sumar todos los componentes
  const totalScore = ratingScore + categoryScore + proximityScore + popularityScore + priceScore;

  // 7. Limitar entre 0-100 por seguridad
  return Math.max(0, Math.min(100, totalScore));
}

/**
 * Estima la duración de visita a un lugar en minutos
 * @param place Información del lugar
 * @returns Duración estimada en minutos
 */
export function estimateVisitDuration(place: FSQRPlace): number {
  let baseDuration = 75; // Duración por defecto

  // 1. Extraer categoría principal
  let mainCategory = '';
  if (place.categories && place.categories.length > 0) {
    mainCategory = place.categories[0].name.toLowerCase();
  }

  // 2. Asignar duración según categoría
  if (mainCategory.includes('restaurant') || mainCategory.includes('café') || mainCategory.includes('cafe')) {
    baseDuration = 75;
  } else if (mainCategory.includes('museum') || mainCategory.includes('gallery')) {
    baseDuration = 105;
  } else if (mainCategory.includes('park') || mainCategory.includes('plaza')) {
    baseDuration = 60;
  } else if (mainCategory.includes('zoo') || mainCategory.includes('aquarium')) {
    baseDuration = 120;
  } else if (mainCategory.includes('shopping') || mainCategory.includes('market')) {
    baseDuration = 90;
  } else if (mainCategory.includes('entertainment') || mainCategory.includes('show')) {
    baseDuration = 150;
  } else if (mainCategory.includes('beach') || mainCategory.includes('natural')) {
    baseDuration = 120;
  } else if (mainCategory.includes('monument') || mainCategory.includes('viewpoint')) {
    baseDuration = 45;
  } else if (mainCategory.includes('bar') || mainCategory.includes('nightclub')) {
    baseDuration = 90;
  } else if (mainCategory.includes('theater') || mainCategory.includes('performance')) {
    baseDuration = 135;
  }

  // 3. Aplicar ajustes
  let adjustments = 0;

  if (place.rating && place.rating > 9.0) {
    adjustments += 15;
  }

  if (place.photos && place.photos.length > 10) {
    adjustments += 10;
  }

  if (place.price === 4) {
    adjustments += 15;
  }

  // 4. Retornar duración total
  return baseDuration + adjustments;
}

/**
 * Estima el costo de visitar un lugar
 * @param place Información del lugar
 * @param travelersCount Número de viajeros
 * @returns Costo estimado en MXN
 */
export function estimateCost(place: FSQRPlace, travelersCount: number): number {
  // Valor por defecto
  let baseCost = 250;
  let costMultiplier = 1.0;

  // 1. Extraer categoría y price_level
  let mainCategory = '';
  const priceLevel = place.price || 2; // Nivel de precio medio por defecto

  if (place.categories && place.categories.length > 0) {
    mainCategory = place.categories[0].name.toLowerCase();
  }

  // 2. Asignar costo base según categoría y price_level
  if (mainCategory.includes('restaurant') || mainCategory.includes('café') || mainCategory.includes('cafe')) {
    switch (priceLevel) {
      case 1: baseCost = 150; break;
      case 2: baseCost = 300; break;
      case 3: baseCost = 550; break;
      case 4: baseCost = 1000; break;
      default: baseCost = 300;
    }
    costMultiplier = 1.0; // Cada quien paga
  }
  else if (mainCategory.includes('museum') || mainCategory.includes('gallery') || mainCategory.includes('zoo')) {
    switch (priceLevel) {
      case 1: baseCost = 80; break;
      case 2: baseCost = 180; break;
      case 3: baseCost = 350; break;
      case 4: baseCost = 600; break;
      default: baseCost = 180;
    }
    costMultiplier = 1.0; // Boleto individual
  }
  else if (mainCategory.includes('park') || mainCategory.includes('plaza')) {
    switch (priceLevel) {
      case 1: baseCost = 0; break;
      case 2: baseCost = 50; break;
      case 3: baseCost = 100; break;
      case 4: baseCost = 200; break;
      default: baseCost = 50;
    }
    costMultiplier = 1.0;
  }
  else if (mainCategory.includes('shopping')) {
    baseCost = 200 * priceLevel;
    costMultiplier = 1.0;
  }
  else if (mainCategory.includes('entertainment')) {
    switch (priceLevel) {
      case 1: baseCost = 200; break;
      case 2: baseCost = 400; break;
      case 3: baseCost = 800; break;
      case 4: baseCost = 1500; break;
      default: baseCost = 400;
    }
    costMultiplier = 1.0;
  }
  else if (mainCategory.includes('tour') || mainCategory.includes('transportation')) {
    switch (priceLevel) {
      case 1: baseCost = 100; break;
      case 2: baseCost = 250; break;
      case 3: baseCost = 450; break;
      case 4: baseCost = 800; break;
      default: baseCost = 250;
    }
    costMultiplier = 0.7; // Se comparte el costo
  }
  else {
    // Default para otras categorías
    switch (priceLevel) {
      case 1: baseCost = 100; break;
      case 2: baseCost = 250; break;
      case 3: baseCost = 450; break;
      case 4: baseCost = 800; break;
      default: baseCost = 250;
    }
    costMultiplier = 1.0;
  }

  // 3. Calcular costo total
  const totalCost = baseCost * costMultiplier * travelersCount;

  // 4. Redondear a 2 decimales
  return Math.round(totalCost * 100) / 100;
}

/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
 * @param lat1 Latitud del punto 1
 * @param lng1 Longitud del punto 1
 * @param lat2 Latitud del punto 2
 * @param lng2 Longitud del punto 2
 * @returns Distancia en metros
 */
export function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  // Radio de la Tierra en metros
  const R = 6371000;

  // Convertir grados a radianes
  const toRadians = (degrees: number): number => degrees * (Math.PI / 180);

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  // Fórmula de Haversine
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Función auxiliar para verificar si una categoría está relacionada con las categorías de búsqueda
 * @param categoryId ID de la categoría a verificar
 * @param searchCategories Lista de categorías de búsqueda
 * @returns true si está relacionada, false en caso contrario
 */
function checkRelatedCategories(categoryId: string, searchCategories: string[]): boolean {
  // Implementación básica - aquí se podría expandir con una tabla completa de relaciones
  // Este es un ejemplo simple que podría mejorarse con una tabla real

  // Mapa simple de relaciones de categorías (podría expandirse)
  const categoryRelations: Record<string, string[]> = {
    'restaurant': ['cafe', 'food', 'dining'],
    'cafe': ['restaurant', 'coffee', 'bakery'],
    'museum': ['gallery', 'exhibition', 'cultural'],
    'gallery': ['museum', 'art'],
    'park': ['outdoors', 'nature', 'garden'],
    // Expandir según sea necesario
  };

  // Extraer la parte principal de la categoría (antes del primer punto o guión)
  const mainCategoryPart = categoryId.split(/[.-]/)[0].toLowerCase();

  // Verificar si hay relaciones para alguna categoría de búsqueda
  for (const searchCategory of searchCategories) {
    const searchCategoryMain = searchCategory.split(/[.-]/)[0].toLowerCase();

    // Verificar match directo en la parte principal
    if (mainCategoryPart === searchCategoryMain) {
      return true;
    }

    // Verificar en el mapa de relaciones
    const relatedCategories = categoryRelations[searchCategoryMain] || [];
    if (relatedCategories.includes(mainCategoryPart)) {
      return true;
    }

    // Verificar relación inversa
    const relatedToMain = categoryRelations[mainCategoryPart] || [];
    if (relatedToMain.includes(searchCategoryMain)) {
      return true;
    }
  }

  return false;
}
