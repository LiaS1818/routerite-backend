import { FoursquareFieldsLevel } from '../foursquare-fields';

export interface FoursquarePlaceDetailsRequest {
    fields?: string;
}

export interface FoursquarePlaceDetailsExtendedRequest extends FoursquarePlaceDetailsRequest {
    fieldsLevel?: FoursquareFieldsLevel;
    customFields?: string[];
}
