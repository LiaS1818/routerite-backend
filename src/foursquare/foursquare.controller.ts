// src/foursquare/foursquare.controller.ts
import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { FoursquareMockService } from '../common/services/foursquare/foursquare-mock.service';

@Controller('foursquare')
export class FoursquareController {
	constructor(private readonly foursquareService: FoursquareMockService) {}

	
}
