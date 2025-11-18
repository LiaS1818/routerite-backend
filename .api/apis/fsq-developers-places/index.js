"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const oas_1 = require("oas");
const core_1 = require("api/dist/core");
const definitionModule = require("./openapi.json");
const definition = definitionModule.default || definitionModule;
class SDK {
    spec;
    core;
    constructor() {
        this.spec = oas_1.default.init(definition);
        this.core = new core_1.default(this.spec, 'fsq-developers-places/20250617 (api/6.1.3)');
    }
    config(config) {
        this.core.setConfig(config);
    }
    auth(...values) {
        this.core.setAuth(...values);
        return this;
    }
    server(url, variables = {}) {
        this.core.setServer(url, variables);
    }
    autocomplete(metadata) {
        return this.core.fetch('/autocomplete', 'get', metadata);
    }
    placeSearch(metadata) {
        return this.core.fetch('/places/search', 'get', metadata);
    }
    placeDetails(metadata) {
        return this.core.fetch('/places/{fsq_place_id}', 'get', metadata);
    }
    placeTips(metadata) {
        return this.core.fetch('/places/{fsq_place_id}/tips', 'get', metadata);
    }
    placePhotos(metadata) {
        return this.core.fetch('/places/{fsq_place_id}/photos', 'get', metadata);
    }
    suggestMerge(metadata) {
        return this.core.fetch('/places/{fsq_place_id}/suggest/merge', 'post', metadata);
    }
    placeSuggestEdit(metadata) {
        return this.core.fetch('/places/{fsq_place_id}/suggest/edit', 'post', metadata);
    }
    placeSuggestRemove(metadata) {
        return this.core.fetch('/places/{fsq_place_id}/suggest/remove', 'post', metadata);
    }
    placeFlag(metadata) {
        return this.core.fetch('/places/{fsq_place_id}/suggest/flag', 'post', metadata);
    }
    placesSuggestPlace(metadata) {
        return this.core.fetch('/places/suggest/place', 'post', metadata);
    }
    placeSuggestStatus(metadata) {
        return this.core.fetch('/places/suggest/status', 'get', metadata);
    }
    placeTopVenueWoes(metadata) {
        return this.core.fetch('/places/suggest/review', 'get', metadata);
    }
    geotaggingCandidates(metadata) {
        return this.core.fetch('/geotagging/candidates', 'get', metadata);
    }
    geotaggingConfirm(metadata) {
        return this.core.fetch('/geotagging/confirm', 'post', metadata);
    }
}
const createSDK = (() => { return new SDK(); })();
exports.default = createSDK;
//# sourceMappingURL=index.js.map