export interface ViajeFiltersInterface {
	fechaInicio?: Date;
	fechaFin?: Date;
	tipoExperiencia?: string;
	presupuestoMin?: number;
	presupuestoMax?: number;
	status?: string;
	destino?: string;
	limit?: number;
	offset?: number;
	orderBy?: string;
	orderDirection?: 'ASC' | 'DESC';
}

export interface ViajeStatsInterface {
	totalViajes: number;
	viajesPorStatus: {
		draft: number;
		planned: number;
		active: number;
		completed: number;
		cancelled: number;
	};
	presupuestoTotalGastado: number;
	destinosUnicos: string[];
	tipoExperienciaMasFrecuente: string;
}

export interface PaginatedResult<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
