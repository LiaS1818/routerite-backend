import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core';
import Oas from 'oas';
import APICore from 'api/dist/core';
declare class SDK {
    spec: Oas;
    core: APICore;
    constructor();
    config(config: ConfigOptions): void;
    auth(...values: string[] | number[]): this;
    server(url: string, variables?: {}): void;
    autocomplete(metadata: types.AutocompleteMetadataParam): Promise<FetchResponse<200, types.AutocompleteResponse200>>;
    placeSearch(metadata: types.PlaceSearchMetadataParam): Promise<FetchResponse<200, types.PlaceSearchResponse200>>;
    placeDetails(metadata: types.PlaceDetailsMetadataParam): Promise<FetchResponse<200, types.PlaceDetailsResponse200>>;
    placeTips(metadata: types.PlaceTipsMetadataParam): Promise<FetchResponse<200, types.PlaceTipsResponse200>>;
    placePhotos(metadata: types.PlacePhotosMetadataParam): Promise<FetchResponse<200, types.PlacePhotosResponse200>>;
    suggestMerge(metadata: types.SuggestMergeMetadataParam): Promise<FetchResponse<200, types.SuggestMergeResponse200>>;
    placeSuggestEdit(metadata: types.PlaceSuggestEditMetadataParam): Promise<FetchResponse<200, types.PlaceSuggestEditResponse200>>;
    placeSuggestRemove(metadata: types.PlaceSuggestRemoveMetadataParam): Promise<FetchResponse<200, types.PlaceSuggestRemoveResponse200>>;
    placeFlag(metadata: types.PlaceFlagMetadataParam): Promise<FetchResponse<200, types.PlaceFlagResponse200>>;
    placesSuggestPlace(metadata: types.PlacesSuggestPlaceMetadataParam): Promise<FetchResponse<200, types.PlacesSuggestPlaceResponse200>>;
    placeSuggestStatus(metadata: types.PlaceSuggestStatusMetadataParam): Promise<FetchResponse<200, types.PlaceSuggestStatusResponse200>>;
    placeTopVenueWoes(metadata: types.PlaceTopVenueWoesMetadataParam): Promise<FetchResponse<200, types.PlaceTopVenueWoesResponse200>>;
    geotaggingCandidates(metadata: types.GeotaggingCandidatesMetadataParam): Promise<FetchResponse<200, types.GeotaggingCandidatesResponse200>>;
    geotaggingConfirm(metadata: types.GeotaggingConfirmMetadataParam): Promise<FetchResponse<200, types.GeotaggingConfirmResponse200>>;
}
declare const createSDK: SDK;
export default createSDK;
export type { AutocompleteMetadataParam, AutocompleteResponse200, GeotaggingCandidatesMetadataParam, GeotaggingCandidatesResponse200, GeotaggingConfirmMetadataParam, GeotaggingConfirmResponse200, PlaceDetailsMetadataParam, PlaceDetailsResponse200, PlaceFlagMetadataParam, PlaceFlagResponse200, PlacePhotosMetadataParam, PlacePhotosResponse200, PlaceSearchMetadataParam, PlaceSearchResponse200, PlaceSuggestEditMetadataParam, PlaceSuggestEditResponse200, PlaceSuggestRemoveMetadataParam, PlaceSuggestRemoveResponse200, PlaceSuggestStatusMetadataParam, PlaceSuggestStatusResponse200, PlaceTipsMetadataParam, PlaceTipsResponse200, PlaceTopVenueWoesMetadataParam, PlaceTopVenueWoesResponse200, PlacesSuggestPlaceMetadataParam, PlacesSuggestPlaceResponse200, SuggestMergeMetadataParam, SuggestMergeResponse200 } from './types';
