import { 
    Controller, 
    Get, 
    Query,
    Param 

} from '@nestjs/common';
import { FoursquareService } from './foursquare.service';

@Controller('foursquare')
export class FoursquareController {
    constructor(private readonly foursquareService: FoursquareService) { }

    @Get('nearby')
    async getNearby(
        @Query('lat') lat: number,
        @Query('lon') lon: number,
        @Query('query') query?: string,
    ) {
        return this.foursquareService.getNearbyPlaces(lat, lon, query);
    }

    @Get('photos/:fsqId')
    async getPhotos(@Param('fsqId') fsqId: string) {
        return this.foursquareService.getPlacePhotos(fsqId);
    }

}
