export class FiltrosLugarDto {
	category: string;
	priceMin: number;
	priceMax: number;
	orderBy: 'price-asc' | 'price-desc';
}
