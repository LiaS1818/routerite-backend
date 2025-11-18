declare const Autocomplete: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly query: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "A search term to be applied against titles. Must be at least 3 characters long.";
                };
                readonly ll: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The latitude/longitude around which you wish to retrieve place information. Specified as latitude,longitude (e.g., ll=41.8781,-87.6298). If you do not specify ll, the server will attempt to retrieve the IP address from the request, and geolocate that IP address.";
                };
                readonly radius: {
                    readonly type: "integer";
                    readonly format: "int32";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Defines the distance (in meters) within which to return place results. Setting a radius biases the results to the indicated area, but may not fully restrict results to that specified area. If not provided, default radius is set to 5000 meters.";
                };
                readonly types: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The types of results to return; any combination of place, search, and/or geo.If no types are specified, all types will be returned.";
                };
                readonly bias: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Bias the autocomplete results by a specific type; one of place, search, or geo.";
                };
                readonly session_token: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "A user-generated token to to group the user's query and the user's selected result into a discrete session for billing purposes. Learn more about [session tokens](https://docs.foursquare.com/reference/session-tokens).\n\n*If the session_token parameter is omitted, the session is charged per keystroke/request.*";
                };
                readonly limit: {
                    readonly maximum: 50;
                    readonly minimum: 1;
                    readonly type: "integer";
                    readonly format: "int32";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The number of results to return, up to 50. Defaults to 10.";
                };
            };
            readonly required: readonly ["query"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "X-Places-Api-Version": {
                    readonly type: "string";
                    readonly default: "2025-06-17";
                    readonly enum: readonly ["2025-06-17"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The version of the API to use.";
                };
            };
            readonly required: readonly ["X-Places-Api-Version"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly results: {
                    readonly type: "array";
                    readonly properties: {
                        readonly traversable_again: {
                            readonly type: "boolean";
                        };
                    };
                    readonly items: {
                        readonly type: "object";
                        readonly properties: {
                            readonly type: {
                                readonly type: "string";
                            };
                            readonly text: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly primary: {
                                        readonly type: "string";
                                    };
                                    readonly secondary: {
                                        readonly type: "string";
                                    };
                                    readonly highlight: {
                                        readonly type: "array";
                                        readonly properties: {
                                            readonly traversable_again: {
                                                readonly type: "boolean";
                                            };
                                        };
                                        readonly items: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly start: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly length: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                            readonly icon: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly id: {
                                        readonly type: "string";
                                    };
                                    readonly created_at: {
                                        readonly type: "string";
                                        readonly format: "date-time";
                                    };
                                    readonly prefix: {
                                        readonly type: "string";
                                    };
                                    readonly suffix: {
                                        readonly type: "string";
                                    };
                                    readonly width: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                    readonly height: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                    readonly classifications: {
                                        readonly type: "array";
                                        readonly properties: {
                                            readonly traversable_again: {
                                                readonly type: "boolean";
                                            };
                                        };
                                        readonly items: {
                                            readonly type: "string";
                                        };
                                    };
                                    readonly tip: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly id: {
                                                readonly type: "string";
                                            };
                                            readonly created_at: {
                                                readonly type: "string";
                                                readonly format: "date-time";
                                            };
                                            readonly text: {
                                                readonly type: "string";
                                            };
                                            readonly url: {
                                                readonly type: "string";
                                            };
                                            readonly photo: {};
                                            readonly lang: {
                                                readonly type: "string";
                                            };
                                            readonly agree_count: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                            readonly disagree_count: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                        };
                                    };
                                };
                            };
                            readonly link: {
                                readonly type: "string";
                            };
                            readonly place: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly fsq_place_id: {
                                        readonly type: "string";
                                    };
                                    readonly categories: {
                                        readonly type: "array";
                                        readonly properties: {
                                            readonly traversable_again: {
                                                readonly type: "boolean";
                                            };
                                        };
                                        readonly items: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly id: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly name: {
                                                    readonly type: "string";
                                                };
                                                readonly short_name: {
                                                    readonly type: "string";
                                                };
                                                readonly plural_name: {
                                                    readonly type: "string";
                                                };
                                                readonly icon: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly id: {
                                                            readonly type: "string";
                                                        };
                                                        readonly created_at: {
                                                            readonly type: "string";
                                                            readonly format: "date-time";
                                                        };
                                                        readonly prefix: {
                                                            readonly type: "string";
                                                        };
                                                        readonly suffix: {
                                                            readonly type: "string";
                                                        };
                                                        readonly width: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly height: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly classifications: {
                                                            readonly type: "array";
                                                            readonly properties: {
                                                                readonly traversable_again: {
                                                                    readonly type: "boolean";
                                                                };
                                                            };
                                                            readonly items: {
                                                                readonly type: "string";
                                                            };
                                                        };
                                                        readonly tip: {
                                                            readonly type: "object";
                                                            readonly properties: {
                                                                readonly id: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly created_at: {
                                                                    readonly type: "string";
                                                                    readonly format: "date-time";
                                                                };
                                                                readonly text: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly url: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly photo: {};
                                                                readonly lang: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly agree_count: {
                                                                    readonly type: "integer";
                                                                    readonly format: "int32";
                                                                    readonly minimum: -2147483648;
                                                                    readonly maximum: 2147483647;
                                                                };
                                                                readonly disagree_count: {
                                                                    readonly type: "integer";
                                                                    readonly format: "int32";
                                                                    readonly minimum: -2147483648;
                                                                    readonly maximum: 2147483647;
                                                                };
                                                            };
                                                        };
                                                    };
                                                };
                                            };
                                        };
                                    };
                                    readonly chains: {
                                        readonly type: "array";
                                        readonly properties: {
                                            readonly traversable_again: {
                                                readonly type: "boolean";
                                            };
                                        };
                                        readonly items: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly id: {
                                                    readonly type: "string";
                                                };
                                                readonly name: {
                                                    readonly type: "string";
                                                };
                                                readonly logo: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly id: {
                                                            readonly type: "string";
                                                        };
                                                        readonly created_at: {
                                                            readonly type: "string";
                                                            readonly format: "date-time";
                                                        };
                                                        readonly prefix: {
                                                            readonly type: "string";
                                                        };
                                                        readonly suffix: {
                                                            readonly type: "string";
                                                        };
                                                        readonly width: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly height: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly classifications: {
                                                            readonly type: "array";
                                                            readonly properties: {
                                                                readonly traversable_again: {
                                                                    readonly type: "boolean";
                                                                };
                                                            };
                                                            readonly items: {
                                                                readonly type: "string";
                                                            };
                                                        };
                                                        readonly tip: {
                                                            readonly type: "object";
                                                            readonly properties: {
                                                                readonly id: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly created_at: {
                                                                    readonly type: "string";
                                                                    readonly format: "date-time";
                                                                };
                                                                readonly text: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly url: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly photo: {};
                                                                readonly lang: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly agree_count: {
                                                                    readonly type: "integer";
                                                                    readonly format: "int32";
                                                                    readonly minimum: -2147483648;
                                                                    readonly maximum: 2147483647;
                                                                };
                                                                readonly disagree_count: {
                                                                    readonly type: "integer";
                                                                    readonly format: "int32";
                                                                    readonly minimum: -2147483648;
                                                                    readonly maximum: 2147483647;
                                                                };
                                                            };
                                                        };
                                                    };
                                                };
                                                readonly parent_id: {
                                                    readonly type: "string";
                                                };
                                            };
                                        };
                                    };
                                    readonly closed_bucket: {
                                        readonly type: "string";
                                    };
                                    readonly date_closed: {
                                        readonly type: "string";
                                        readonly format: "date";
                                    };
                                    readonly description: {
                                        readonly type: "string";
                                    };
                                    readonly distance: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                    readonly email: {
                                        readonly type: "string";
                                    };
                                    readonly fax: {
                                        readonly type: "string";
                                    };
                                    readonly features: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly payment: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly credit_cards: {
                                                        readonly type: "object";
                                                        readonly properties: {
                                                            readonly accepts_credit_cards: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly amex: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly discover: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly visa: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly diners_club: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly master_card: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly union_pay: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                        };
                                                    };
                                                    readonly digital_wallet: {
                                                        readonly type: "object";
                                                        readonly properties: {
                                                            readonly accepts_nfc: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                        };
                                                    };
                                                };
                                            };
                                            readonly food_and_drink: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly alcohol: {
                                                        readonly type: "object";
                                                        readonly properties: {
                                                            readonly bar_service: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly beer: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly byo: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly cocktails: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly full_bar: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly wine: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                        };
                                                    };
                                                    readonly meals: {
                                                        readonly type: "object";
                                                        readonly properties: {
                                                            readonly bar_snacks: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly breakfast: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly brunch: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly lunch: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly happy_hour: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly dessert: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly dinner: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly tasting_menu: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                        };
                                                    };
                                                };
                                            };
                                            readonly services: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly delivery: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                    readonly takeout: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                    readonly drive_through: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                    readonly dine_in: {
                                                        readonly type: "object";
                                                        readonly properties: {
                                                            readonly reservations: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly online_reservations: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly groups_only_reservations: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly essential_reservations: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                        };
                                                    };
                                                };
                                            };
                                            readonly amenities: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly restroom: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                    readonly smoking: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                    readonly jukebox: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                    readonly music: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                    readonly live_music: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                    readonly private_room: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                    readonly outdoor_seating: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                    readonly tvs: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                    readonly atm: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                    readonly coat_check: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                    readonly wheelchair_accessible: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                    readonly parking: {
                                                        readonly type: "object";
                                                        readonly properties: {
                                                            readonly parking: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly street_parking: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly valet_parking: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly public_lot: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                            readonly private_lot: {
                                                                readonly type: "object";
                                                                readonly additionalProperties: true;
                                                            };
                                                        };
                                                    };
                                                    readonly sit_down_dining: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                    readonly wifi: {
                                                        readonly type: "string";
                                                    };
                                                };
                                            };
                                            readonly attributes: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly business_meeting: {
                                                        readonly type: "string";
                                                    };
                                                    readonly clean: {
                                                        readonly type: "string";
                                                    };
                                                    readonly crowded: {
                                                        readonly type: "string";
                                                    };
                                                    readonly dates_popular: {
                                                        readonly type: "string";
                                                    };
                                                    readonly dressy: {
                                                        readonly type: "string";
                                                    };
                                                    readonly families_popular: {
                                                        readonly type: "string";
                                                    };
                                                    readonly gluten_free_diet: {
                                                        readonly type: "string";
                                                    };
                                                    readonly good_for_dogs: {
                                                        readonly type: "string";
                                                    };
                                                    readonly groups_popular: {
                                                        readonly type: "string";
                                                    };
                                                    readonly healthy_diet: {
                                                        readonly type: "string";
                                                    };
                                                    readonly late_night: {
                                                        readonly type: "string";
                                                    };
                                                    readonly noisy: {
                                                        readonly type: "string";
                                                    };
                                                    readonly quick_bite: {
                                                        readonly type: "string";
                                                    };
                                                    readonly romantic: {
                                                        readonly type: "string";
                                                    };
                                                    readonly service_quality: {
                                                        readonly type: "string";
                                                    };
                                                    readonly singles_popular: {
                                                        readonly type: "string";
                                                    };
                                                    readonly special_occasion: {
                                                        readonly type: "string";
                                                    };
                                                    readonly trendy: {
                                                        readonly type: "string";
                                                    };
                                                    readonly value_for_money: {
                                                        readonly type: "string";
                                                    };
                                                    readonly vegan_diet: {
                                                        readonly type: "string";
                                                    };
                                                    readonly vegetarian_diet: {
                                                        readonly type: "string";
                                                    };
                                                };
                                            };
                                        };
                                    };
                                    readonly geocodes: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly drop_off: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly latitude: {
                                                        readonly type: "number";
                                                        readonly format: "double";
                                                        readonly minimum: -1.7976931348623157e+308;
                                                        readonly maximum: 1.7976931348623157e+308;
                                                    };
                                                    readonly longitude: {
                                                        readonly type: "number";
                                                        readonly format: "double";
                                                        readonly minimum: -1.7976931348623157e+308;
                                                        readonly maximum: 1.7976931348623157e+308;
                                                    };
                                                };
                                            };
                                            readonly front_door: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly latitude: {
                                                        readonly type: "number";
                                                        readonly format: "double";
                                                        readonly minimum: -1.7976931348623157e+308;
                                                        readonly maximum: 1.7976931348623157e+308;
                                                    };
                                                    readonly longitude: {
                                                        readonly type: "number";
                                                        readonly format: "double";
                                                        readonly minimum: -1.7976931348623157e+308;
                                                        readonly maximum: 1.7976931348623157e+308;
                                                    };
                                                };
                                            };
                                            readonly main: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly latitude: {
                                                        readonly type: "number";
                                                        readonly format: "double";
                                                        readonly minimum: -1.7976931348623157e+308;
                                                        readonly maximum: 1.7976931348623157e+308;
                                                    };
                                                    readonly longitude: {
                                                        readonly type: "number";
                                                        readonly format: "double";
                                                        readonly minimum: -1.7976931348623157e+308;
                                                        readonly maximum: 1.7976931348623157e+308;
                                                    };
                                                };
                                            };
                                            readonly road: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly latitude: {
                                                        readonly type: "number";
                                                        readonly format: "double";
                                                        readonly minimum: -1.7976931348623157e+308;
                                                        readonly maximum: 1.7976931348623157e+308;
                                                    };
                                                    readonly longitude: {
                                                        readonly type: "number";
                                                        readonly format: "double";
                                                        readonly minimum: -1.7976931348623157e+308;
                                                        readonly maximum: 1.7976931348623157e+308;
                                                    };
                                                };
                                            };
                                            readonly roof: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly latitude: {
                                                        readonly type: "number";
                                                        readonly format: "double";
                                                        readonly minimum: -1.7976931348623157e+308;
                                                        readonly maximum: 1.7976931348623157e+308;
                                                    };
                                                    readonly longitude: {
                                                        readonly type: "number";
                                                        readonly format: "double";
                                                        readonly minimum: -1.7976931348623157e+308;
                                                        readonly maximum: 1.7976931348623157e+308;
                                                    };
                                                };
                                            };
                                        };
                                    };
                                    readonly hours: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly display: {
                                                readonly type: "string";
                                            };
                                            readonly is_local_holiday: {
                                                readonly type: "boolean";
                                            };
                                            readonly open_now: {
                                                readonly type: "boolean";
                                            };
                                            readonly regular: {
                                                readonly type: "array";
                                                readonly properties: {
                                                    readonly traversable_again: {
                                                        readonly type: "boolean";
                                                    };
                                                };
                                                readonly items: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly close: {
                                                            readonly type: "string";
                                                        };
                                                        readonly day: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly open: {
                                                            readonly type: "string";
                                                        };
                                                    };
                                                };
                                            };
                                        };
                                    };
                                    readonly hours_popular: {
                                        readonly type: "array";
                                        readonly properties: {
                                            readonly traversable_again: {
                                                readonly type: "boolean";
                                            };
                                        };
                                        readonly items: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly close: {
                                                    readonly type: "string";
                                                };
                                                readonly day: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly open: {
                                                    readonly type: "string";
                                                };
                                            };
                                        };
                                    };
                                    readonly link: {
                                        readonly type: "string";
                                    };
                                    readonly location: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly address: {
                                                readonly type: "string";
                                            };
                                            readonly address_extended: {
                                                readonly type: "string";
                                            };
                                            readonly admin_region: {
                                                readonly type: "string";
                                            };
                                            readonly census_block: {
                                                readonly type: "string";
                                            };
                                            readonly country: {
                                                readonly type: "string";
                                            };
                                            readonly cross_street: {
                                                readonly type: "string";
                                            };
                                            readonly dma: {
                                                readonly type: "string";
                                            };
                                            readonly formatted_address: {
                                                readonly type: "string";
                                            };
                                            readonly locality: {
                                                readonly type: "string";
                                            };
                                            readonly neighborhood: {
                                                readonly type: "array";
                                                readonly properties: {
                                                    readonly traversable_again: {
                                                        readonly type: "boolean";
                                                    };
                                                };
                                                readonly items: {
                                                    readonly type: "string";
                                                };
                                            };
                                            readonly po_box: {
                                                readonly type: "string";
                                            };
                                            readonly post_town: {
                                                readonly type: "string";
                                            };
                                            readonly postcode: {
                                                readonly type: "string";
                                            };
                                            readonly region: {
                                                readonly type: "string";
                                            };
                                        };
                                    };
                                    readonly menu: {
                                        readonly type: "string";
                                    };
                                    readonly name: {
                                        readonly type: "string";
                                    };
                                    readonly photos: {
                                        readonly type: "array";
                                        readonly properties: {
                                            readonly traversable_again: {
                                                readonly type: "boolean";
                                            };
                                        };
                                        readonly items: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly id: {
                                                    readonly type: "string";
                                                };
                                                readonly created_at: {
                                                    readonly type: "string";
                                                    readonly format: "date-time";
                                                };
                                                readonly prefix: {
                                                    readonly type: "string";
                                                };
                                                readonly suffix: {
                                                    readonly type: "string";
                                                };
                                                readonly width: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly height: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly classifications: {
                                                    readonly type: "array";
                                                    readonly properties: {
                                                        readonly traversable_again: {
                                                            readonly type: "boolean";
                                                        };
                                                    };
                                                    readonly items: {
                                                        readonly type: "string";
                                                    };
                                                };
                                                readonly tip: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly id: {
                                                            readonly type: "string";
                                                        };
                                                        readonly created_at: {
                                                            readonly type: "string";
                                                            readonly format: "date-time";
                                                        };
                                                        readonly text: {
                                                            readonly type: "string";
                                                        };
                                                        readonly url: {
                                                            readonly type: "string";
                                                        };
                                                        readonly photo: {};
                                                        readonly lang: {
                                                            readonly type: "string";
                                                        };
                                                        readonly agree_count: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly disagree_count: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                    };
                                                };
                                            };
                                        };
                                    };
                                    readonly popularity: {
                                        readonly type: "number";
                                        readonly format: "double";
                                        readonly minimum: -1.7976931348623157e+308;
                                        readonly maximum: 1.7976931348623157e+308;
                                    };
                                    readonly price: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                    readonly rating: {
                                        readonly type: "number";
                                        readonly format: "double";
                                        readonly minimum: -1.7976931348623157e+308;
                                        readonly maximum: 1.7976931348623157e+308;
                                    };
                                    readonly related_places: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly children: {
                                                readonly type: "array";
                                                readonly properties: {
                                                    readonly traversable_again: {
                                                        readonly type: "boolean";
                                                    };
                                                };
                                                readonly items: {};
                                            };
                                        };
                                    };
                                    readonly social_media: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly facebook_id: {
                                                readonly type: "string";
                                            };
                                            readonly instagram: {
                                                readonly type: "string";
                                            };
                                            readonly twitter: {
                                                readonly type: "string";
                                            };
                                        };
                                    };
                                    readonly stats: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly total_photos: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                            readonly total_ratings: {
                                                readonly type: "integer";
                                                readonly format: "int64";
                                                readonly minimum: -9223372036854776000;
                                                readonly maximum: 9223372036854776000;
                                            };
                                            readonly total_tips: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                        };
                                    };
                                    readonly store_id: {
                                        readonly type: "string";
                                    };
                                    readonly tastes: {
                                        readonly type: "array";
                                        readonly properties: {
                                            readonly traversable_again: {
                                                readonly type: "boolean";
                                            };
                                        };
                                        readonly items: {
                                            readonly type: "string";
                                        };
                                    };
                                    readonly tel: {
                                        readonly type: "string";
                                    };
                                    readonly timezone: {
                                        readonly type: "string";
                                    };
                                    readonly tips: {
                                        readonly type: "array";
                                        readonly properties: {
                                            readonly traversable_again: {
                                                readonly type: "boolean";
                                            };
                                        };
                                        readonly items: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly id: {
                                                    readonly type: "string";
                                                };
                                                readonly created_at: {
                                                    readonly type: "string";
                                                    readonly format: "date-time";
                                                };
                                                readonly text: {
                                                    readonly type: "string";
                                                };
                                                readonly url: {
                                                    readonly type: "string";
                                                };
                                                readonly photo: {};
                                                readonly lang: {
                                                    readonly type: "string";
                                                };
                                                readonly agree_count: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly disagree_count: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                            };
                                        };
                                    };
                                    readonly venue_reality_bucket: {
                                        readonly type: "string";
                                    };
                                    readonly verified: {
                                        readonly type: "boolean";
                                    };
                                    readonly website: {
                                        readonly type: "string";
                                    };
                                };
                            };
                            readonly address: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly address_id: {
                                        readonly type: "string";
                                    };
                                };
                            };
                            readonly search: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly query: {
                                        readonly type: "string";
                                    };
                                    readonly category: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly id: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                            readonly name: {
                                                readonly type: "string";
                                            };
                                            readonly short_name: {
                                                readonly type: "string";
                                            };
                                            readonly plural_name: {
                                                readonly type: "string";
                                            };
                                            readonly icon: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly id: {
                                                        readonly type: "string";
                                                    };
                                                    readonly created_at: {
                                                        readonly type: "string";
                                                        readonly format: "date-time";
                                                    };
                                                    readonly prefix: {
                                                        readonly type: "string";
                                                    };
                                                    readonly suffix: {
                                                        readonly type: "string";
                                                    };
                                                    readonly width: {
                                                        readonly type: "integer";
                                                        readonly format: "int32";
                                                        readonly minimum: -2147483648;
                                                        readonly maximum: 2147483647;
                                                    };
                                                    readonly height: {
                                                        readonly type: "integer";
                                                        readonly format: "int32";
                                                        readonly minimum: -2147483648;
                                                        readonly maximum: 2147483647;
                                                    };
                                                    readonly classifications: {
                                                        readonly type: "array";
                                                        readonly properties: {
                                                            readonly traversable_again: {
                                                                readonly type: "boolean";
                                                            };
                                                        };
                                                        readonly items: {
                                                            readonly type: "string";
                                                        };
                                                    };
                                                    readonly tip: {
                                                        readonly type: "object";
                                                        readonly properties: {
                                                            readonly id: {
                                                                readonly type: "string";
                                                            };
                                                            readonly created_at: {
                                                                readonly type: "string";
                                                                readonly format: "date-time";
                                                            };
                                                            readonly text: {
                                                                readonly type: "string";
                                                            };
                                                            readonly url: {
                                                                readonly type: "string";
                                                            };
                                                            readonly photo: {};
                                                            readonly lang: {
                                                                readonly type: "string";
                                                            };
                                                            readonly agree_count: {
                                                                readonly type: "integer";
                                                                readonly format: "int32";
                                                                readonly minimum: -2147483648;
                                                                readonly maximum: 2147483647;
                                                            };
                                                            readonly disagree_count: {
                                                                readonly type: "integer";
                                                                readonly format: "int32";
                                                                readonly minimum: -2147483648;
                                                                readonly maximum: 2147483647;
                                                            };
                                                        };
                                                    };
                                                };
                                            };
                                        };
                                    };
                                    readonly chain: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly id: {
                                                readonly type: "string";
                                            };
                                            readonly name: {
                                                readonly type: "string";
                                            };
                                            readonly logo: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly id: {
                                                        readonly type: "string";
                                                    };
                                                    readonly created_at: {
                                                        readonly type: "string";
                                                        readonly format: "date-time";
                                                    };
                                                    readonly prefix: {
                                                        readonly type: "string";
                                                    };
                                                    readonly suffix: {
                                                        readonly type: "string";
                                                    };
                                                    readonly width: {
                                                        readonly type: "integer";
                                                        readonly format: "int32";
                                                        readonly minimum: -2147483648;
                                                        readonly maximum: 2147483647;
                                                    };
                                                    readonly height: {
                                                        readonly type: "integer";
                                                        readonly format: "int32";
                                                        readonly minimum: -2147483648;
                                                        readonly maximum: 2147483647;
                                                    };
                                                    readonly classifications: {
                                                        readonly type: "array";
                                                        readonly properties: {
                                                            readonly traversable_again: {
                                                                readonly type: "boolean";
                                                            };
                                                        };
                                                        readonly items: {
                                                            readonly type: "string";
                                                        };
                                                    };
                                                    readonly tip: {
                                                        readonly type: "object";
                                                        readonly properties: {
                                                            readonly id: {
                                                                readonly type: "string";
                                                            };
                                                            readonly created_at: {
                                                                readonly type: "string";
                                                                readonly format: "date-time";
                                                            };
                                                            readonly text: {
                                                                readonly type: "string";
                                                            };
                                                            readonly url: {
                                                                readonly type: "string";
                                                            };
                                                            readonly photo: {};
                                                            readonly lang: {
                                                                readonly type: "string";
                                                            };
                                                            readonly agree_count: {
                                                                readonly type: "integer";
                                                                readonly format: "int32";
                                                                readonly minimum: -2147483648;
                                                                readonly maximum: 2147483647;
                                                            };
                                                            readonly disagree_count: {
                                                                readonly type: "integer";
                                                                readonly format: "int32";
                                                                readonly minimum: -2147483648;
                                                                readonly maximum: 2147483647;
                                                            };
                                                        };
                                                    };
                                                };
                                            };
                                            readonly parent_id: {
                                                readonly type: "string";
                                            };
                                        };
                                    };
                                };
                            };
                            readonly geo: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly name: {
                                        readonly type: "string";
                                    };
                                    readonly center: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly latitude: {
                                                readonly type: "number";
                                                readonly format: "double";
                                                readonly minimum: -1.7976931348623157e+308;
                                                readonly maximum: 1.7976931348623157e+308;
                                            };
                                            readonly longitude: {
                                                readonly type: "number";
                                                readonly format: "double";
                                                readonly minimum: -1.7976931348623157e+308;
                                                readonly maximum: 1.7976931348623157e+308;
                                            };
                                        };
                                    };
                                    readonly bounds: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly ne: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly latitude: {
                                                        readonly type: "number";
                                                        readonly format: "double";
                                                        readonly minimum: -1.7976931348623157e+308;
                                                        readonly maximum: 1.7976931348623157e+308;
                                                    };
                                                    readonly longitude: {
                                                        readonly type: "number";
                                                        readonly format: "double";
                                                        readonly minimum: -1.7976931348623157e+308;
                                                        readonly maximum: 1.7976931348623157e+308;
                                                    };
                                                };
                                            };
                                            readonly sw: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly latitude: {
                                                        readonly type: "number";
                                                        readonly format: "double";
                                                        readonly minimum: -1.7976931348623157e+308;
                                                        readonly maximum: 1.7976931348623157e+308;
                                                    };
                                                    readonly longitude: {
                                                        readonly type: "number";
                                                        readonly format: "double";
                                                        readonly minimum: -1.7976931348623157e+308;
                                                        readonly maximum: 1.7976931348623157e+308;
                                                    };
                                                };
                                            };
                                        };
                                    };
                                    readonly cc: {
                                        readonly type: "string";
                                    };
                                    readonly type: {
                                        readonly type: "string";
                                    };
                                };
                            };
                            readonly debug: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly score: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                };
                            };
                        };
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GeotaggingCandidates: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly fields: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Indicate which fields to return in the response, separated by commas. If no fields are specified, all <a href=\"response-fields#places-pro\" target=\"_blank\">Pro Fields</a> are returned by default. \n\nFor a complete list of returnable fields, refer to the <a href=\"response-fields\" target=\"_blank\">Places Response Fields</a> page.";
                };
                readonly ll: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The latitude/longitude around which to retrieve place information. This must be specified as latitude,longitude (e.g., ll=41.8781,-87.6298). If you do not specify ll, the server will attempt to retrieve the IP address from the request, and geolocate that IP address.";
                };
                readonly hacc: {
                    readonly type: "number";
                    readonly format: "double";
                    readonly minimum: -1.7976931348623157e+308;
                    readonly maximum: 1.7976931348623157e+308;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The estimated horizontal accuracy radius in meters of the user’s location at the 68th percentile confidence level as returned by the user’s cell phone OS.";
                };
                readonly altitude: {
                    readonly type: "number";
                    readonly format: "double";
                    readonly minimum: -1.7976931348623157e+308;
                    readonly maximum: 1.7976931348623157e+308;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The altitude of the user’s location in meters above the World Geodetic System 1984 (WGS84) reference ellipsoid as returned by the user’s cell phone OS.";
                };
                readonly query: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "A string to be matched against place name for candidates.";
                };
                readonly limit: {
                    readonly maximum: 50;
                    readonly minimum: 1;
                    readonly type: "integer";
                    readonly format: "int32";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The number of results to return, up to 50. Defaults to 10.";
                };
            };
            readonly required: readonly [];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "X-Places-Api-Version": {
                    readonly type: "string";
                    readonly default: "2025-06-17";
                    readonly enum: readonly ["2025-06-17"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The version of the API to use.";
                };
            };
            readonly required: readonly ["X-Places-Api-Version"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly candidates: {
                    readonly type: "array";
                    readonly properties: {
                        readonly traversable_again: {
                            readonly type: "boolean";
                        };
                    };
                    readonly items: {
                        readonly type: "object";
                        readonly properties: {
                            readonly fsq_place_id: {
                                readonly type: "string";
                            };
                            readonly latitude: {
                                readonly type: "object";
                                readonly additionalProperties: true;
                            };
                            readonly longitude: {
                                readonly type: "object";
                                readonly additionalProperties: true;
                            };
                            readonly categories: {
                                readonly type: "array";
                                readonly properties: {
                                    readonly traversable_again: {
                                        readonly type: "boolean";
                                    };
                                };
                                readonly items: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly fsq_category_id: {
                                            readonly type: "string";
                                        };
                                        readonly name: {
                                            readonly type: "string";
                                        };
                                        readonly short_name: {
                                            readonly type: "string";
                                        };
                                        readonly plural_name: {
                                            readonly type: "string";
                                        };
                                        readonly icon: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly id: {
                                                    readonly type: "string";
                                                };
                                                readonly created_at: {
                                                    readonly type: "string";
                                                    readonly format: "date-time";
                                                };
                                                readonly prefix: {
                                                    readonly type: "string";
                                                };
                                                readonly suffix: {
                                                    readonly type: "string";
                                                };
                                                readonly width: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly height: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly classifications: {
                                                    readonly type: "array";
                                                    readonly properties: {
                                                        readonly traversable_again: {
                                                            readonly type: "boolean";
                                                        };
                                                    };
                                                    readonly items: {
                                                        readonly type: "string";
                                                    };
                                                };
                                                readonly tip: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly id: {
                                                            readonly type: "string";
                                                        };
                                                        readonly created_at: {
                                                            readonly type: "string";
                                                            readonly format: "date-time";
                                                        };
                                                        readonly text: {
                                                            readonly type: "string";
                                                        };
                                                        readonly url: {
                                                            readonly type: "string";
                                                        };
                                                        readonly photo: {};
                                                        readonly lang: {
                                                            readonly type: "string";
                                                        };
                                                        readonly agree_count: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly disagree_count: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                    };
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                            readonly chains: {
                                readonly type: "array";
                                readonly properties: {
                                    readonly traversable_again: {
                                        readonly type: "boolean";
                                    };
                                };
                                readonly items: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly fsq_chain_id: {
                                            readonly type: "string";
                                        };
                                        readonly name: {
                                            readonly type: "string";
                                        };
                                        readonly logo: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly id: {
                                                    readonly type: "string";
                                                };
                                                readonly created_at: {
                                                    readonly type: "string";
                                                    readonly format: "date-time";
                                                };
                                                readonly prefix: {
                                                    readonly type: "string";
                                                };
                                                readonly suffix: {
                                                    readonly type: "string";
                                                };
                                                readonly width: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly height: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly classifications: {
                                                    readonly type: "array";
                                                    readonly properties: {
                                                        readonly traversable_again: {
                                                            readonly type: "boolean";
                                                        };
                                                    };
                                                    readonly items: {
                                                        readonly type: "string";
                                                    };
                                                };
                                                readonly tip: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly id: {
                                                            readonly type: "string";
                                                        };
                                                        readonly created_at: {
                                                            readonly type: "string";
                                                            readonly format: "date-time";
                                                        };
                                                        readonly text: {
                                                            readonly type: "string";
                                                        };
                                                        readonly url: {
                                                            readonly type: "string";
                                                        };
                                                        readonly photo: {};
                                                        readonly lang: {
                                                            readonly type: "string";
                                                        };
                                                        readonly agree_count: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly disagree_count: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                    };
                                                };
                                            };
                                        };
                                        readonly parent_id: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                            };
                            readonly date_closed: {
                                readonly type: "string";
                                readonly format: "date";
                            };
                            readonly date_created: {
                                readonly type: "string";
                            };
                            readonly date_refreshed: {
                                readonly type: "string";
                            };
                            readonly description: {
                                readonly type: "string";
                            };
                            readonly distance: {
                                readonly type: "integer";
                                readonly format: "int32";
                                readonly minimum: -2147483648;
                                readonly maximum: 2147483647;
                            };
                            readonly email: {
                                readonly type: "string";
                            };
                            readonly extended_location: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly dma: {
                                        readonly type: "string";
                                    };
                                    readonly census_block_id: {
                                        readonly type: "string";
                                    };
                                };
                            };
                            readonly attributes: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly restroom: {
                                        readonly type: "object";
                                        readonly additionalProperties: true;
                                    };
                                    readonly outdoor_seating: {
                                        readonly type: "object";
                                        readonly additionalProperties: true;
                                    };
                                    readonly atm: {
                                        readonly type: "object";
                                        readonly additionalProperties: true;
                                    };
                                    readonly has_parking: {
                                        readonly type: "object";
                                        readonly additionalProperties: true;
                                    };
                                    readonly wifi: {
                                        readonly type: "string";
                                    };
                                    readonly delivery: {
                                        readonly type: "object";
                                        readonly additionalProperties: true;
                                    };
                                    readonly reservations: {
                                        readonly type: "object";
                                        readonly additionalProperties: true;
                                    };
                                    readonly takes_credit_card: {
                                        readonly type: "object";
                                        readonly additionalProperties: true;
                                    };
                                };
                            };
                            readonly hours: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly display: {
                                        readonly type: "string";
                                    };
                                    readonly is_local_holiday: {
                                        readonly type: "boolean";
                                    };
                                    readonly open_now: {
                                        readonly type: "boolean";
                                    };
                                    readonly regular: {
                                        readonly type: "array";
                                        readonly properties: {
                                            readonly traversable_again: {
                                                readonly type: "boolean";
                                            };
                                        };
                                        readonly items: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly close: {
                                                    readonly type: "string";
                                                };
                                                readonly day: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly open: {
                                                    readonly type: "string";
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                            readonly hours_popular: {
                                readonly type: "array";
                                readonly properties: {
                                    readonly traversable_again: {
                                        readonly type: "boolean";
                                    };
                                };
                                readonly items: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly close: {
                                            readonly type: "string";
                                        };
                                        readonly day: {
                                            readonly type: "integer";
                                            readonly format: "int32";
                                            readonly minimum: -2147483648;
                                            readonly maximum: 2147483647;
                                        };
                                        readonly open: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                            };
                            readonly link: {
                                readonly type: "string";
                            };
                            readonly location: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly address: {
                                        readonly type: "string";
                                    };
                                    readonly locality: {
                                        readonly type: "string";
                                    };
                                    readonly region: {
                                        readonly type: "string";
                                    };
                                    readonly postcode: {
                                        readonly type: "string";
                                    };
                                    readonly admin_region: {
                                        readonly type: "string";
                                    };
                                    readonly post_town: {
                                        readonly type: "string";
                                    };
                                    readonly po_box: {
                                        readonly type: "string";
                                    };
                                    readonly country: {
                                        readonly type: "string";
                                    };
                                    readonly formatted_address: {
                                        readonly type: "string";
                                    };
                                };
                            };
                            readonly menu: {
                                readonly type: "string";
                            };
                            readonly name: {
                                readonly type: "string";
                            };
                            readonly photos: {
                                readonly type: "array";
                                readonly properties: {
                                    readonly traversable_again: {
                                        readonly type: "boolean";
                                    };
                                };
                                readonly items: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly id: {
                                            readonly type: "string";
                                        };
                                        readonly created_at: {
                                            readonly type: "string";
                                            readonly format: "date-time";
                                        };
                                        readonly prefix: {
                                            readonly type: "string";
                                        };
                                        readonly suffix: {
                                            readonly type: "string";
                                        };
                                        readonly width: {
                                            readonly type: "integer";
                                            readonly format: "int32";
                                            readonly minimum: -2147483648;
                                            readonly maximum: 2147483647;
                                        };
                                        readonly height: {
                                            readonly type: "integer";
                                            readonly format: "int32";
                                            readonly minimum: -2147483648;
                                            readonly maximum: 2147483647;
                                        };
                                        readonly tip: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly id: {
                                                    readonly type: "string";
                                                };
                                                readonly created_at: {
                                                    readonly type: "string";
                                                    readonly format: "date-time";
                                                };
                                                readonly text: {
                                                    readonly type: "string";
                                                };
                                                readonly url: {
                                                    readonly type: "string";
                                                };
                                                readonly photo: {};
                                                readonly lang: {
                                                    readonly type: "string";
                                                };
                                                readonly agree_count: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly disagree_count: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                            readonly popularity: {
                                readonly type: "number";
                                readonly format: "double";
                                readonly minimum: -1.7976931348623157e+308;
                                readonly maximum: 1.7976931348623157e+308;
                            };
                            readonly placemaker_url: {
                                readonly type: "string";
                            };
                            readonly price: {
                                readonly type: "integer";
                                readonly format: "int32";
                                readonly minimum: -2147483648;
                                readonly maximum: 2147483647;
                            };
                            readonly rating: {
                                readonly type: "number";
                                readonly format: "double";
                                readonly minimum: -1.7976931348623157e+308;
                                readonly maximum: 1.7976931348623157e+308;
                            };
                            readonly related_places: {};
                            readonly social_media: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly facebook_id: {
                                        readonly type: "string";
                                    };
                                    readonly instagram: {
                                        readonly type: "string";
                                    };
                                    readonly twitter: {
                                        readonly type: "string";
                                    };
                                };
                            };
                            readonly stats: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly total_photos: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                    readonly total_ratings: {
                                        readonly type: "integer";
                                        readonly format: "int64";
                                        readonly minimum: -9223372036854776000;
                                        readonly maximum: 9223372036854776000;
                                    };
                                    readonly total_tips: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                };
                            };
                            readonly store_id: {
                                readonly type: "string";
                            };
                            readonly tastes: {
                                readonly type: "array";
                                readonly properties: {
                                    readonly traversable_again: {
                                        readonly type: "boolean";
                                    };
                                };
                                readonly items: {
                                    readonly type: "string";
                                };
                            };
                            readonly tel: {
                                readonly type: "string";
                            };
                            readonly tips: {
                                readonly type: "array";
                                readonly properties: {
                                    readonly traversable_again: {
                                        readonly type: "boolean";
                                    };
                                };
                                readonly items: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly id: {
                                            readonly type: "string";
                                        };
                                        readonly created_at: {
                                            readonly type: "string";
                                            readonly format: "date-time";
                                        };
                                        readonly text: {
                                            readonly type: "string";
                                        };
                                        readonly url: {
                                            readonly type: "string";
                                        };
                                        readonly photo: {};
                                        readonly lang: {
                                            readonly type: "string";
                                        };
                                        readonly agree_count: {
                                            readonly type: "integer";
                                            readonly format: "int32";
                                            readonly minimum: -2147483648;
                                            readonly maximum: 2147483647;
                                        };
                                        readonly disagree_count: {
                                            readonly type: "integer";
                                            readonly format: "int32";
                                            readonly minimum: -2147483648;
                                            readonly maximum: 2147483647;
                                        };
                                    };
                                };
                            };
                            readonly verified: {
                                readonly type: "boolean";
                            };
                            readonly website: {
                                readonly type: "string";
                            };
                        };
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GeotaggingConfirm: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly request_id: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The request ID pulled from the header of the /geotagging/candidates request that generated the list of candidates shown to the user. The header key is X-Fsq-Request-Id.";
                };
                readonly fsq_place_id: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The FSQ Place ID of the place which was selected by the user from the candidates list";
                };
                readonly confirm_context: {
                    readonly type: "string";
                    readonly enum: readonly ["CurrentLocation", "Nearby", "Destination", "Search"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Specify the use case for specified request. Options are: CurrentLocation, Nearby, Destination, Search";
                };
                readonly delayed: {
                    readonly type: "boolean";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                };
            };
            readonly required: readonly [];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "X-Places-Api-Version": {
                    readonly type: "string";
                    readonly default: "2025-06-17";
                    readonly enum: readonly ["2025-06-17"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The version of the API to use.";
                };
            };
            readonly required: readonly ["X-Places-Api-Version"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly response: {
                    readonly type: "string";
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const PlaceDetails: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly fsq_place_id: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "A unique string identifier for a FSQ Place (formerly known as Venue ID). E.g., Foursquare HQ's fsq_place_id = 5a187743ccad6b307315e6fe";
                };
            };
            readonly required: readonly ["fsq_place_id"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly fields: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Indicate which fields to return in the response, separated by commas. If no fields are specified, all <a href=\"response-fields#places-pro\" target=\"_blank\">Pro Fields</a> are returned by default. \n\nFor a complete list of returnable fields, refer to the <a href=\"response-fields\" target=\"_blank\">Places Response Fields</a> page.";
                };
            };
            readonly required: readonly [];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "X-Places-Api-Version": {
                    readonly type: "string";
                    readonly default: "2025-06-17";
                    readonly enum: readonly ["2025-06-17"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The version of the API to use.";
                };
            };
            readonly required: readonly ["X-Places-Api-Version"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly fsq_place_id: {
                    readonly type: "string";
                };
                readonly latitude: {
                    readonly type: "object";
                    readonly additionalProperties: true;
                };
                readonly longitude: {
                    readonly type: "object";
                    readonly additionalProperties: true;
                };
                readonly categories: {
                    readonly type: "array";
                    readonly properties: {
                        readonly traversable_again: {
                            readonly type: "boolean";
                        };
                    };
                    readonly items: {
                        readonly type: "object";
                        readonly properties: {
                            readonly fsq_category_id: {
                                readonly type: "string";
                            };
                            readonly name: {
                                readonly type: "string";
                            };
                            readonly short_name: {
                                readonly type: "string";
                            };
                            readonly plural_name: {
                                readonly type: "string";
                            };
                            readonly icon: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly id: {
                                        readonly type: "string";
                                    };
                                    readonly created_at: {
                                        readonly type: "string";
                                        readonly format: "date-time";
                                    };
                                    readonly prefix: {
                                        readonly type: "string";
                                    };
                                    readonly suffix: {
                                        readonly type: "string";
                                    };
                                    readonly width: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                    readonly height: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                    readonly classifications: {
                                        readonly type: "array";
                                        readonly properties: {
                                            readonly traversable_again: {
                                                readonly type: "boolean";
                                            };
                                        };
                                        readonly items: {
                                            readonly type: "string";
                                        };
                                    };
                                    readonly tip: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly id: {
                                                readonly type: "string";
                                            };
                                            readonly created_at: {
                                                readonly type: "string";
                                                readonly format: "date-time";
                                            };
                                            readonly text: {
                                                readonly type: "string";
                                            };
                                            readonly url: {
                                                readonly type: "string";
                                            };
                                            readonly photo: {};
                                            readonly lang: {
                                                readonly type: "string";
                                            };
                                            readonly agree_count: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                            readonly disagree_count: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
                readonly chains: {
                    readonly type: "array";
                    readonly properties: {
                        readonly traversable_again: {
                            readonly type: "boolean";
                        };
                    };
                    readonly items: {
                        readonly type: "object";
                        readonly properties: {
                            readonly fsq_chain_id: {
                                readonly type: "string";
                            };
                            readonly name: {
                                readonly type: "string";
                            };
                            readonly logo: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly id: {
                                        readonly type: "string";
                                    };
                                    readonly created_at: {
                                        readonly type: "string";
                                        readonly format: "date-time";
                                    };
                                    readonly prefix: {
                                        readonly type: "string";
                                    };
                                    readonly suffix: {
                                        readonly type: "string";
                                    };
                                    readonly width: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                    readonly height: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                    readonly classifications: {
                                        readonly type: "array";
                                        readonly properties: {
                                            readonly traversable_again: {
                                                readonly type: "boolean";
                                            };
                                        };
                                        readonly items: {
                                            readonly type: "string";
                                        };
                                    };
                                    readonly tip: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly id: {
                                                readonly type: "string";
                                            };
                                            readonly created_at: {
                                                readonly type: "string";
                                                readonly format: "date-time";
                                            };
                                            readonly text: {
                                                readonly type: "string";
                                            };
                                            readonly url: {
                                                readonly type: "string";
                                            };
                                            readonly photo: {};
                                            readonly lang: {
                                                readonly type: "string";
                                            };
                                            readonly agree_count: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                            readonly disagree_count: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                        };
                                    };
                                };
                            };
                            readonly parent_id: {
                                readonly type: "string";
                            };
                        };
                    };
                };
                readonly date_closed: {
                    readonly type: "string";
                    readonly format: "date";
                };
                readonly date_created: {
                    readonly type: "string";
                };
                readonly date_refreshed: {
                    readonly type: "string";
                };
                readonly description: {
                    readonly type: "string";
                };
                readonly distance: {
                    readonly type: "integer";
                    readonly format: "int32";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly email: {
                    readonly type: "string";
                };
                readonly extended_location: {
                    readonly type: "object";
                    readonly properties: {
                        readonly dma: {
                            readonly type: "string";
                        };
                        readonly census_block_id: {
                            readonly type: "string";
                        };
                    };
                };
                readonly attributes: {
                    readonly type: "object";
                    readonly properties: {
                        readonly restroom: {
                            readonly type: "object";
                            readonly additionalProperties: true;
                        };
                        readonly outdoor_seating: {
                            readonly type: "object";
                            readonly additionalProperties: true;
                        };
                        readonly atm: {
                            readonly type: "object";
                            readonly additionalProperties: true;
                        };
                        readonly has_parking: {
                            readonly type: "object";
                            readonly additionalProperties: true;
                        };
                        readonly wifi: {
                            readonly type: "string";
                        };
                        readonly delivery: {
                            readonly type: "object";
                            readonly additionalProperties: true;
                        };
                        readonly reservations: {
                            readonly type: "object";
                            readonly additionalProperties: true;
                        };
                        readonly takes_credit_card: {
                            readonly type: "object";
                            readonly additionalProperties: true;
                        };
                    };
                };
                readonly hours: {
                    readonly type: "object";
                    readonly properties: {
                        readonly display: {
                            readonly type: "string";
                        };
                        readonly is_local_holiday: {
                            readonly type: "boolean";
                        };
                        readonly open_now: {
                            readonly type: "boolean";
                        };
                        readonly regular: {
                            readonly type: "array";
                            readonly properties: {
                                readonly traversable_again: {
                                    readonly type: "boolean";
                                };
                            };
                            readonly items: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly close: {
                                        readonly type: "string";
                                    };
                                    readonly day: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                    readonly open: {
                                        readonly type: "string";
                                    };
                                };
                            };
                        };
                    };
                };
                readonly hours_popular: {
                    readonly type: "array";
                    readonly properties: {
                        readonly traversable_again: {
                            readonly type: "boolean";
                        };
                    };
                    readonly items: {
                        readonly type: "object";
                        readonly properties: {
                            readonly close: {
                                readonly type: "string";
                            };
                            readonly day: {
                                readonly type: "integer";
                                readonly format: "int32";
                                readonly minimum: -2147483648;
                                readonly maximum: 2147483647;
                            };
                            readonly open: {
                                readonly type: "string";
                            };
                        };
                    };
                };
                readonly link: {
                    readonly type: "string";
                };
                readonly location: {
                    readonly type: "object";
                    readonly properties: {
                        readonly address: {
                            readonly type: "string";
                        };
                        readonly locality: {
                            readonly type: "string";
                        };
                        readonly region: {
                            readonly type: "string";
                        };
                        readonly postcode: {
                            readonly type: "string";
                        };
                        readonly admin_region: {
                            readonly type: "string";
                        };
                        readonly post_town: {
                            readonly type: "string";
                        };
                        readonly po_box: {
                            readonly type: "string";
                        };
                        readonly country: {
                            readonly type: "string";
                        };
                        readonly formatted_address: {
                            readonly type: "string";
                        };
                    };
                };
                readonly menu: {
                    readonly type: "string";
                };
                readonly name: {
                    readonly type: "string";
                };
                readonly photos: {
                    readonly type: "array";
                    readonly properties: {
                        readonly traversable_again: {
                            readonly type: "boolean";
                        };
                    };
                    readonly items: {
                        readonly type: "object";
                        readonly properties: {
                            readonly fsq_photo_id: {
                                readonly type: "string";
                            };
                            readonly created_at: {
                                readonly type: "string";
                                readonly format: "date-time";
                            };
                            readonly prefix: {
                                readonly type: "string";
                            };
                            readonly suffix: {
                                readonly type: "string";
                            };
                            readonly width: {
                                readonly type: "integer";
                                readonly format: "int32";
                                readonly minimum: -2147483648;
                                readonly maximum: 2147483647;
                            };
                            readonly height: {
                                readonly type: "integer";
                                readonly format: "int32";
                                readonly minimum: -2147483648;
                                readonly maximum: 2147483647;
                            };
                            readonly classifications: {
                                readonly type: "array";
                                readonly properties: {
                                    readonly traversable_again: {
                                        readonly type: "boolean";
                                    };
                                };
                                readonly items: {
                                    readonly type: "string";
                                };
                            };
                            readonly tip: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly fsq_tip_id: {
                                        readonly type: "string";
                                    };
                                    readonly created_at: {
                                        readonly type: "string";
                                        readonly format: "date-time";
                                    };
                                    readonly text: {
                                        readonly type: "string";
                                    };
                                    readonly url: {
                                        readonly type: "string";
                                    };
                                    readonly photo: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly id: {
                                                readonly type: "string";
                                            };
                                            readonly created_at: {
                                                readonly type: "string";
                                                readonly format: "date-time";
                                            };
                                            readonly prefix: {
                                                readonly type: "string";
                                            };
                                            readonly suffix: {
                                                readonly type: "string";
                                            };
                                            readonly width: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                            readonly height: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                            readonly classifications: {
                                                readonly type: "array";
                                                readonly properties: {
                                                    readonly traversable_again: {
                                                        readonly type: "boolean";
                                                    };
                                                };
                                                readonly items: {
                                                    readonly type: "string";
                                                };
                                            };
                                            readonly tip: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly id: {
                                                        readonly type: "string";
                                                    };
                                                    readonly created_at: {
                                                        readonly type: "string";
                                                        readonly format: "date-time";
                                                    };
                                                    readonly text: {
                                                        readonly type: "string";
                                                    };
                                                    readonly url: {
                                                        readonly type: "string";
                                                    };
                                                    readonly photo: {};
                                                    readonly lang: {
                                                        readonly type: "string";
                                                    };
                                                    readonly agree_count: {
                                                        readonly type: "integer";
                                                        readonly format: "int32";
                                                        readonly minimum: -2147483648;
                                                        readonly maximum: 2147483647;
                                                    };
                                                    readonly disagree_count: {
                                                        readonly type: "integer";
                                                        readonly format: "int32";
                                                        readonly minimum: -2147483648;
                                                        readonly maximum: 2147483647;
                                                    };
                                                };
                                            };
                                        };
                                    };
                                    readonly lang: {
                                        readonly type: "string";
                                    };
                                    readonly agree_count: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                    readonly disagree_count: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                };
                            };
                        };
                    };
                };
                readonly popularity: {
                    readonly type: "number";
                    readonly format: "double";
                    readonly minimum: -1.7976931348623157e+308;
                    readonly maximum: 1.7976931348623157e+308;
                };
                readonly placemaker_url: {
                    readonly type: "string";
                };
                readonly price: {
                    readonly type: "integer";
                    readonly format: "int32";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly rating: {
                    readonly type: "number";
                    readonly format: "double";
                    readonly minimum: -1.7976931348623157e+308;
                    readonly maximum: 1.7976931348623157e+308;
                };
                readonly related_places: {
                    readonly type: "object";
                    readonly properties: {
                        readonly parent: {
                            readonly type: "object";
                            readonly properties: {
                                readonly fsq_place_id: {
                                    readonly type: "string";
                                };
                                readonly latitude: {
                                    readonly type: "object";
                                    readonly additionalProperties: true;
                                };
                                readonly longitude: {
                                    readonly type: "object";
                                    readonly additionalProperties: true;
                                };
                                readonly categories: {
                                    readonly type: "array";
                                    readonly properties: {
                                        readonly traversable_again: {
                                            readonly type: "boolean";
                                        };
                                    };
                                    readonly items: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly fsq_category_id: {
                                                readonly type: "string";
                                            };
                                            readonly name: {
                                                readonly type: "string";
                                            };
                                            readonly short_name: {
                                                readonly type: "string";
                                            };
                                            readonly plural_name: {
                                                readonly type: "string";
                                            };
                                            readonly icon: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly id: {
                                                        readonly type: "string";
                                                    };
                                                    readonly created_at: {
                                                        readonly type: "string";
                                                        readonly format: "date-time";
                                                    };
                                                    readonly prefix: {
                                                        readonly type: "string";
                                                    };
                                                    readonly suffix: {
                                                        readonly type: "string";
                                                    };
                                                    readonly width: {
                                                        readonly type: "integer";
                                                        readonly format: "int32";
                                                        readonly minimum: -2147483648;
                                                        readonly maximum: 2147483647;
                                                    };
                                                    readonly height: {
                                                        readonly type: "integer";
                                                        readonly format: "int32";
                                                        readonly minimum: -2147483648;
                                                        readonly maximum: 2147483647;
                                                    };
                                                    readonly classifications: {
                                                        readonly type: "array";
                                                        readonly properties: {
                                                            readonly traversable_again: {
                                                                readonly type: "boolean";
                                                            };
                                                        };
                                                        readonly items: {
                                                            readonly type: "string";
                                                        };
                                                    };
                                                    readonly tip: {
                                                        readonly type: "object";
                                                        readonly properties: {
                                                            readonly id: {
                                                                readonly type: "string";
                                                            };
                                                            readonly created_at: {
                                                                readonly type: "string";
                                                                readonly format: "date-time";
                                                            };
                                                            readonly text: {
                                                                readonly type: "string";
                                                            };
                                                            readonly url: {
                                                                readonly type: "string";
                                                            };
                                                            readonly photo: {};
                                                            readonly lang: {
                                                                readonly type: "string";
                                                            };
                                                            readonly agree_count: {
                                                                readonly type: "integer";
                                                                readonly format: "int32";
                                                                readonly minimum: -2147483648;
                                                                readonly maximum: 2147483647;
                                                            };
                                                            readonly disagree_count: {
                                                                readonly type: "integer";
                                                                readonly format: "int32";
                                                                readonly minimum: -2147483648;
                                                                readonly maximum: 2147483647;
                                                            };
                                                        };
                                                    };
                                                };
                                            };
                                        };
                                    };
                                };
                                readonly chains: {
                                    readonly type: "array";
                                    readonly properties: {
                                        readonly traversable_again: {
                                            readonly type: "boolean";
                                        };
                                    };
                                    readonly items: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly fsq_chain_id: {
                                                readonly type: "string";
                                            };
                                            readonly name: {
                                                readonly type: "string";
                                            };
                                            readonly logo: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly id: {
                                                        readonly type: "string";
                                                    };
                                                    readonly created_at: {
                                                        readonly type: "string";
                                                        readonly format: "date-time";
                                                    };
                                                    readonly prefix: {
                                                        readonly type: "string";
                                                    };
                                                    readonly suffix: {
                                                        readonly type: "string";
                                                    };
                                                    readonly width: {
                                                        readonly type: "integer";
                                                        readonly format: "int32";
                                                        readonly minimum: -2147483648;
                                                        readonly maximum: 2147483647;
                                                    };
                                                    readonly height: {
                                                        readonly type: "integer";
                                                        readonly format: "int32";
                                                        readonly minimum: -2147483648;
                                                        readonly maximum: 2147483647;
                                                    };
                                                    readonly classifications: {
                                                        readonly type: "array";
                                                        readonly properties: {
                                                            readonly traversable_again: {
                                                                readonly type: "boolean";
                                                            };
                                                        };
                                                        readonly items: {
                                                            readonly type: "string";
                                                        };
                                                    };
                                                    readonly tip: {
                                                        readonly type: "object";
                                                        readonly properties: {
                                                            readonly id: {
                                                                readonly type: "string";
                                                            };
                                                            readonly created_at: {
                                                                readonly type: "string";
                                                                readonly format: "date-time";
                                                            };
                                                            readonly text: {
                                                                readonly type: "string";
                                                            };
                                                            readonly url: {
                                                                readonly type: "string";
                                                            };
                                                            readonly photo: {};
                                                            readonly lang: {
                                                                readonly type: "string";
                                                            };
                                                            readonly agree_count: {
                                                                readonly type: "integer";
                                                                readonly format: "int32";
                                                                readonly minimum: -2147483648;
                                                                readonly maximum: 2147483647;
                                                            };
                                                            readonly disagree_count: {
                                                                readonly type: "integer";
                                                                readonly format: "int32";
                                                                readonly minimum: -2147483648;
                                                                readonly maximum: 2147483647;
                                                            };
                                                        };
                                                    };
                                                };
                                            };
                                            readonly parent_id: {
                                                readonly type: "string";
                                            };
                                        };
                                    };
                                };
                                readonly date_closed: {
                                    readonly type: "string";
                                    readonly format: "date";
                                };
                                readonly date_created: {
                                    readonly type: "string";
                                };
                                readonly date_refreshed: {
                                    readonly type: "string";
                                };
                                readonly description: {
                                    readonly type: "string";
                                };
                                readonly distance: {
                                    readonly type: "integer";
                                    readonly format: "int32";
                                    readonly minimum: -2147483648;
                                    readonly maximum: 2147483647;
                                };
                                readonly email: {
                                    readonly type: "string";
                                };
                                readonly extended_location: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly dma: {
                                            readonly type: "string";
                                        };
                                        readonly census_block_id: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                                readonly attributes: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly restroom: {
                                            readonly type: "object";
                                            readonly additionalProperties: true;
                                        };
                                        readonly outdoor_seating: {
                                            readonly type: "object";
                                            readonly additionalProperties: true;
                                        };
                                        readonly atm: {
                                            readonly type: "object";
                                            readonly additionalProperties: true;
                                        };
                                        readonly has_parking: {
                                            readonly type: "object";
                                            readonly additionalProperties: true;
                                        };
                                        readonly wifi: {
                                            readonly type: "string";
                                        };
                                        readonly delivery: {
                                            readonly type: "object";
                                            readonly additionalProperties: true;
                                        };
                                        readonly reservations: {
                                            readonly type: "object";
                                            readonly additionalProperties: true;
                                        };
                                        readonly takes_credit_card: {
                                            readonly type: "object";
                                            readonly additionalProperties: true;
                                        };
                                    };
                                };
                                readonly hours: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly display: {
                                            readonly type: "string";
                                        };
                                        readonly is_local_holiday: {
                                            readonly type: "boolean";
                                        };
                                        readonly open_now: {
                                            readonly type: "boolean";
                                        };
                                        readonly regular: {
                                            readonly type: "array";
                                            readonly properties: {
                                                readonly traversable_again: {
                                                    readonly type: "boolean";
                                                };
                                            };
                                            readonly items: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly close: {
                                                        readonly type: "string";
                                                    };
                                                    readonly day: {
                                                        readonly type: "integer";
                                                        readonly format: "int32";
                                                        readonly minimum: -2147483648;
                                                        readonly maximum: 2147483647;
                                                    };
                                                    readonly open: {
                                                        readonly type: "string";
                                                    };
                                                };
                                            };
                                        };
                                    };
                                };
                                readonly hours_popular: {
                                    readonly type: "array";
                                    readonly properties: {
                                        readonly traversable_again: {
                                            readonly type: "boolean";
                                        };
                                    };
                                    readonly items: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly close: {
                                                readonly type: "string";
                                            };
                                            readonly day: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                            readonly open: {
                                                readonly type: "string";
                                            };
                                        };
                                    };
                                };
                                readonly link: {
                                    readonly type: "string";
                                };
                                readonly location: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly address: {
                                            readonly type: "string";
                                        };
                                        readonly locality: {
                                            readonly type: "string";
                                        };
                                        readonly region: {
                                            readonly type: "string";
                                        };
                                        readonly postcode: {
                                            readonly type: "string";
                                        };
                                        readonly admin_region: {
                                            readonly type: "string";
                                        };
                                        readonly post_town: {
                                            readonly type: "string";
                                        };
                                        readonly po_box: {
                                            readonly type: "string";
                                        };
                                        readonly country: {
                                            readonly type: "string";
                                        };
                                        readonly formatted_address: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                                readonly menu: {
                                    readonly type: "string";
                                };
                                readonly name: {
                                    readonly type: "string";
                                };
                                readonly photos: {
                                    readonly type: "array";
                                    readonly properties: {
                                        readonly traversable_again: {
                                            readonly type: "boolean";
                                        };
                                    };
                                    readonly items: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly id: {
                                                readonly type: "string";
                                            };
                                            readonly created_at: {
                                                readonly type: "string";
                                                readonly format: "date-time";
                                            };
                                            readonly prefix: {
                                                readonly type: "string";
                                            };
                                            readonly suffix: {
                                                readonly type: "string";
                                            };
                                            readonly width: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                            readonly height: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                            readonly tip: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly id: {
                                                        readonly type: "string";
                                                    };
                                                    readonly created_at: {
                                                        readonly type: "string";
                                                        readonly format: "date-time";
                                                    };
                                                    readonly text: {
                                                        readonly type: "string";
                                                    };
                                                    readonly url: {
                                                        readonly type: "string";
                                                    };
                                                    readonly photo: {};
                                                    readonly lang: {
                                                        readonly type: "string";
                                                    };
                                                    readonly agree_count: {
                                                        readonly type: "integer";
                                                        readonly format: "int32";
                                                        readonly minimum: -2147483648;
                                                        readonly maximum: 2147483647;
                                                    };
                                                    readonly disagree_count: {
                                                        readonly type: "integer";
                                                        readonly format: "int32";
                                                        readonly minimum: -2147483648;
                                                        readonly maximum: 2147483647;
                                                    };
                                                };
                                            };
                                        };
                                    };
                                };
                                readonly popularity: {
                                    readonly type: "number";
                                    readonly format: "double";
                                    readonly minimum: -1.7976931348623157e+308;
                                    readonly maximum: 1.7976931348623157e+308;
                                };
                                readonly placemaker_url: {
                                    readonly type: "string";
                                };
                                readonly price: {
                                    readonly type: "integer";
                                    readonly format: "int32";
                                    readonly minimum: -2147483648;
                                    readonly maximum: 2147483647;
                                };
                                readonly rating: {
                                    readonly type: "number";
                                    readonly format: "double";
                                    readonly minimum: -1.7976931348623157e+308;
                                    readonly maximum: 1.7976931348623157e+308;
                                };
                                readonly related_places: {};
                                readonly social_media: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly facebook_id: {
                                            readonly type: "string";
                                        };
                                        readonly instagram: {
                                            readonly type: "string";
                                        };
                                        readonly twitter: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                                readonly stats: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly total_photos: {
                                            readonly type: "integer";
                                            readonly format: "int32";
                                            readonly minimum: -2147483648;
                                            readonly maximum: 2147483647;
                                        };
                                        readonly total_ratings: {
                                            readonly type: "integer";
                                            readonly format: "int64";
                                            readonly minimum: -9223372036854776000;
                                            readonly maximum: 9223372036854776000;
                                        };
                                        readonly total_tips: {
                                            readonly type: "integer";
                                            readonly format: "int32";
                                            readonly minimum: -2147483648;
                                            readonly maximum: 2147483647;
                                        };
                                    };
                                };
                                readonly store_id: {
                                    readonly type: "string";
                                };
                                readonly tastes: {
                                    readonly type: "array";
                                    readonly properties: {
                                        readonly traversable_again: {
                                            readonly type: "boolean";
                                        };
                                    };
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                };
                                readonly tel: {
                                    readonly type: "string";
                                };
                                readonly tips: {
                                    readonly type: "array";
                                    readonly properties: {
                                        readonly traversable_again: {
                                            readonly type: "boolean";
                                        };
                                    };
                                    readonly items: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly id: {
                                                readonly type: "string";
                                            };
                                            readonly created_at: {
                                                readonly type: "string";
                                                readonly format: "date-time";
                                            };
                                            readonly text: {
                                                readonly type: "string";
                                            };
                                            readonly url: {
                                                readonly type: "string";
                                            };
                                            readonly photo: {};
                                            readonly lang: {
                                                readonly type: "string";
                                            };
                                            readonly agree_count: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                            readonly disagree_count: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                        };
                                    };
                                };
                                readonly verified: {
                                    readonly type: "boolean";
                                };
                                readonly website: {
                                    readonly type: "string";
                                };
                            };
                        };
                        readonly children: {
                            readonly type: "array";
                            readonly properties: {
                                readonly traversable_again: {
                                    readonly type: "boolean";
                                };
                            };
                            readonly items: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly fsq_place_id: {
                                        readonly type: "string";
                                    };
                                    readonly latitude: {
                                        readonly type: "object";
                                        readonly additionalProperties: true;
                                    };
                                    readonly longitude: {
                                        readonly type: "object";
                                        readonly additionalProperties: true;
                                    };
                                    readonly categories: {
                                        readonly type: "array";
                                        readonly properties: {
                                            readonly traversable_again: {
                                                readonly type: "boolean";
                                            };
                                        };
                                        readonly items: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly fsq_category_id: {
                                                    readonly type: "string";
                                                };
                                                readonly name: {
                                                    readonly type: "string";
                                                };
                                                readonly short_name: {
                                                    readonly type: "string";
                                                };
                                                readonly plural_name: {
                                                    readonly type: "string";
                                                };
                                                readonly icon: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly id: {
                                                            readonly type: "string";
                                                        };
                                                        readonly created_at: {
                                                            readonly type: "string";
                                                            readonly format: "date-time";
                                                        };
                                                        readonly prefix: {
                                                            readonly type: "string";
                                                        };
                                                        readonly suffix: {
                                                            readonly type: "string";
                                                        };
                                                        readonly width: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly height: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly classifications: {
                                                            readonly type: "array";
                                                            readonly properties: {
                                                                readonly traversable_again: {
                                                                    readonly type: "boolean";
                                                                };
                                                            };
                                                            readonly items: {
                                                                readonly type: "string";
                                                            };
                                                        };
                                                        readonly tip: {
                                                            readonly type: "object";
                                                            readonly properties: {
                                                                readonly id: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly created_at: {
                                                                    readonly type: "string";
                                                                    readonly format: "date-time";
                                                                };
                                                                readonly text: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly url: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly photo: {};
                                                                readonly lang: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly agree_count: {
                                                                    readonly type: "integer";
                                                                    readonly format: "int32";
                                                                    readonly minimum: -2147483648;
                                                                    readonly maximum: 2147483647;
                                                                };
                                                                readonly disagree_count: {
                                                                    readonly type: "integer";
                                                                    readonly format: "int32";
                                                                    readonly minimum: -2147483648;
                                                                    readonly maximum: 2147483647;
                                                                };
                                                            };
                                                        };
                                                    };
                                                };
                                            };
                                        };
                                    };
                                    readonly chains: {
                                        readonly type: "array";
                                        readonly properties: {
                                            readonly traversable_again: {
                                                readonly type: "boolean";
                                            };
                                        };
                                        readonly items: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly fsq_chain_id: {
                                                    readonly type: "string";
                                                };
                                                readonly name: {
                                                    readonly type: "string";
                                                };
                                                readonly logo: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly id: {
                                                            readonly type: "string";
                                                        };
                                                        readonly created_at: {
                                                            readonly type: "string";
                                                            readonly format: "date-time";
                                                        };
                                                        readonly prefix: {
                                                            readonly type: "string";
                                                        };
                                                        readonly suffix: {
                                                            readonly type: "string";
                                                        };
                                                        readonly width: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly height: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly classifications: {
                                                            readonly type: "array";
                                                            readonly properties: {
                                                                readonly traversable_again: {
                                                                    readonly type: "boolean";
                                                                };
                                                            };
                                                            readonly items: {
                                                                readonly type: "string";
                                                            };
                                                        };
                                                        readonly tip: {
                                                            readonly type: "object";
                                                            readonly properties: {
                                                                readonly id: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly created_at: {
                                                                    readonly type: "string";
                                                                    readonly format: "date-time";
                                                                };
                                                                readonly text: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly url: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly photo: {};
                                                                readonly lang: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly agree_count: {
                                                                    readonly type: "integer";
                                                                    readonly format: "int32";
                                                                    readonly minimum: -2147483648;
                                                                    readonly maximum: 2147483647;
                                                                };
                                                                readonly disagree_count: {
                                                                    readonly type: "integer";
                                                                    readonly format: "int32";
                                                                    readonly minimum: -2147483648;
                                                                    readonly maximum: 2147483647;
                                                                };
                                                            };
                                                        };
                                                    };
                                                };
                                                readonly parent_id: {
                                                    readonly type: "string";
                                                };
                                            };
                                        };
                                    };
                                    readonly date_closed: {
                                        readonly type: "string";
                                        readonly format: "date";
                                    };
                                    readonly date_created: {
                                        readonly type: "string";
                                    };
                                    readonly date_refreshed: {
                                        readonly type: "string";
                                    };
                                    readonly description: {
                                        readonly type: "string";
                                    };
                                    readonly distance: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                    readonly email: {
                                        readonly type: "string";
                                    };
                                    readonly extended_location: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly dma: {
                                                readonly type: "string";
                                            };
                                            readonly census_block_id: {
                                                readonly type: "string";
                                            };
                                        };
                                    };
                                    readonly attributes: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly restroom: {
                                                readonly type: "object";
                                                readonly additionalProperties: true;
                                            };
                                            readonly outdoor_seating: {
                                                readonly type: "object";
                                                readonly additionalProperties: true;
                                            };
                                            readonly atm: {
                                                readonly type: "object";
                                                readonly additionalProperties: true;
                                            };
                                            readonly has_parking: {
                                                readonly type: "object";
                                                readonly additionalProperties: true;
                                            };
                                            readonly wifi: {
                                                readonly type: "string";
                                            };
                                            readonly delivery: {
                                                readonly type: "object";
                                                readonly additionalProperties: true;
                                            };
                                            readonly reservations: {
                                                readonly type: "object";
                                                readonly additionalProperties: true;
                                            };
                                            readonly takes_credit_card: {
                                                readonly type: "object";
                                                readonly additionalProperties: true;
                                            };
                                        };
                                    };
                                    readonly hours: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly display: {
                                                readonly type: "string";
                                            };
                                            readonly is_local_holiday: {
                                                readonly type: "boolean";
                                            };
                                            readonly open_now: {
                                                readonly type: "boolean";
                                            };
                                            readonly regular: {
                                                readonly type: "array";
                                                readonly properties: {
                                                    readonly traversable_again: {
                                                        readonly type: "boolean";
                                                    };
                                                };
                                                readonly items: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly close: {
                                                            readonly type: "string";
                                                        };
                                                        readonly day: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly open: {
                                                            readonly type: "string";
                                                        };
                                                    };
                                                };
                                            };
                                        };
                                    };
                                    readonly hours_popular: {
                                        readonly type: "array";
                                        readonly properties: {
                                            readonly traversable_again: {
                                                readonly type: "boolean";
                                            };
                                        };
                                        readonly items: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly close: {
                                                    readonly type: "string";
                                                };
                                                readonly day: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly open: {
                                                    readonly type: "string";
                                                };
                                            };
                                        };
                                    };
                                    readonly link: {
                                        readonly type: "string";
                                    };
                                    readonly location: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly address: {
                                                readonly type: "string";
                                            };
                                            readonly locality: {
                                                readonly type: "string";
                                            };
                                            readonly region: {
                                                readonly type: "string";
                                            };
                                            readonly postcode: {
                                                readonly type: "string";
                                            };
                                            readonly admin_region: {
                                                readonly type: "string";
                                            };
                                            readonly post_town: {
                                                readonly type: "string";
                                            };
                                            readonly po_box: {
                                                readonly type: "string";
                                            };
                                            readonly country: {
                                                readonly type: "string";
                                            };
                                            readonly formatted_address: {
                                                readonly type: "string";
                                            };
                                        };
                                    };
                                    readonly menu: {
                                        readonly type: "string";
                                    };
                                    readonly name: {
                                        readonly type: "string";
                                    };
                                    readonly photos: {
                                        readonly type: "array";
                                        readonly properties: {
                                            readonly traversable_again: {
                                                readonly type: "boolean";
                                            };
                                        };
                                        readonly items: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly id: {
                                                    readonly type: "string";
                                                };
                                                readonly created_at: {
                                                    readonly type: "string";
                                                    readonly format: "date-time";
                                                };
                                                readonly prefix: {
                                                    readonly type: "string";
                                                };
                                                readonly suffix: {
                                                    readonly type: "string";
                                                };
                                                readonly width: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly height: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly tip: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly id: {
                                                            readonly type: "string";
                                                        };
                                                        readonly created_at: {
                                                            readonly type: "string";
                                                            readonly format: "date-time";
                                                        };
                                                        readonly text: {
                                                            readonly type: "string";
                                                        };
                                                        readonly url: {
                                                            readonly type: "string";
                                                        };
                                                        readonly photo: {};
                                                        readonly lang: {
                                                            readonly type: "string";
                                                        };
                                                        readonly agree_count: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly disagree_count: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                    };
                                                };
                                            };
                                        };
                                    };
                                    readonly popularity: {
                                        readonly type: "number";
                                        readonly format: "double";
                                        readonly minimum: -1.7976931348623157e+308;
                                        readonly maximum: 1.7976931348623157e+308;
                                    };
                                    readonly placemaker_url: {
                                        readonly type: "string";
                                    };
                                    readonly price: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                    readonly rating: {
                                        readonly type: "number";
                                        readonly format: "double";
                                        readonly minimum: -1.7976931348623157e+308;
                                        readonly maximum: 1.7976931348623157e+308;
                                    };
                                    readonly related_places: {};
                                    readonly social_media: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly facebook_id: {
                                                readonly type: "string";
                                            };
                                            readonly instagram: {
                                                readonly type: "string";
                                            };
                                            readonly twitter: {
                                                readonly type: "string";
                                            };
                                        };
                                    };
                                    readonly stats: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly total_photos: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                            readonly total_ratings: {
                                                readonly type: "integer";
                                                readonly format: "int64";
                                                readonly minimum: -9223372036854776000;
                                                readonly maximum: 9223372036854776000;
                                            };
                                            readonly total_tips: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                        };
                                    };
                                    readonly store_id: {
                                        readonly type: "string";
                                    };
                                    readonly tastes: {
                                        readonly type: "array";
                                        readonly properties: {
                                            readonly traversable_again: {
                                                readonly type: "boolean";
                                            };
                                        };
                                        readonly items: {
                                            readonly type: "string";
                                        };
                                    };
                                    readonly tel: {
                                        readonly type: "string";
                                    };
                                    readonly tips: {
                                        readonly type: "array";
                                        readonly properties: {
                                            readonly traversable_again: {
                                                readonly type: "boolean";
                                            };
                                        };
                                        readonly items: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly id: {
                                                    readonly type: "string";
                                                };
                                                readonly created_at: {
                                                    readonly type: "string";
                                                    readonly format: "date-time";
                                                };
                                                readonly text: {
                                                    readonly type: "string";
                                                };
                                                readonly url: {
                                                    readonly type: "string";
                                                };
                                                readonly photo: {};
                                                readonly lang: {
                                                    readonly type: "string";
                                                };
                                                readonly agree_count: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly disagree_count: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                            };
                                        };
                                    };
                                    readonly verified: {
                                        readonly type: "boolean";
                                    };
                                    readonly website: {
                                        readonly type: "string";
                                    };
                                };
                            };
                        };
                    };
                };
                readonly social_media: {
                    readonly type: "object";
                    readonly properties: {
                        readonly facebook_id: {
                            readonly type: "string";
                        };
                        readonly instagram: {
                            readonly type: "string";
                        };
                        readonly twitter: {
                            readonly type: "string";
                        };
                    };
                };
                readonly stats: {
                    readonly type: "object";
                    readonly properties: {
                        readonly total_photos: {
                            readonly type: "integer";
                            readonly format: "int32";
                            readonly minimum: -2147483648;
                            readonly maximum: 2147483647;
                        };
                        readonly total_ratings: {
                            readonly type: "integer";
                            readonly format: "int64";
                            readonly minimum: -9223372036854776000;
                            readonly maximum: 9223372036854776000;
                        };
                        readonly total_tips: {
                            readonly type: "integer";
                            readonly format: "int32";
                            readonly minimum: -2147483648;
                            readonly maximum: 2147483647;
                        };
                    };
                };
                readonly store_id: {
                    readonly type: "string";
                };
                readonly tastes: {
                    readonly type: "array";
                    readonly properties: {
                        readonly traversable_again: {
                            readonly type: "boolean";
                        };
                    };
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly tel: {
                    readonly type: "string";
                };
                readonly tips: {
                    readonly type: "array";
                    readonly properties: {
                        readonly traversable_again: {
                            readonly type: "boolean";
                        };
                    };
                    readonly items: {
                        readonly type: "object";
                        readonly properties: {
                            readonly fsq_tip_id: {
                                readonly type: "string";
                            };
                            readonly created_at: {
                                readonly type: "string";
                                readonly format: "date-time";
                            };
                            readonly text: {
                                readonly type: "string";
                            };
                            readonly url: {
                                readonly type: "string";
                            };
                            readonly photo: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly id: {
                                        readonly type: "string";
                                    };
                                    readonly created_at: {
                                        readonly type: "string";
                                        readonly format: "date-time";
                                    };
                                    readonly prefix: {
                                        readonly type: "string";
                                    };
                                    readonly suffix: {
                                        readonly type: "string";
                                    };
                                    readonly width: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                    readonly height: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                    readonly classifications: {
                                        readonly type: "array";
                                        readonly properties: {
                                            readonly traversable_again: {
                                                readonly type: "boolean";
                                            };
                                        };
                                        readonly items: {
                                            readonly type: "string";
                                        };
                                    };
                                    readonly tip: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly id: {
                                                readonly type: "string";
                                            };
                                            readonly created_at: {
                                                readonly type: "string";
                                                readonly format: "date-time";
                                            };
                                            readonly text: {
                                                readonly type: "string";
                                            };
                                            readonly url: {
                                                readonly type: "string";
                                            };
                                            readonly photo: {};
                                            readonly lang: {
                                                readonly type: "string";
                                            };
                                            readonly agree_count: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                            readonly disagree_count: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                        };
                                    };
                                };
                            };
                            readonly lang: {
                                readonly type: "string";
                            };
                            readonly agree_count: {
                                readonly type: "integer";
                                readonly format: "int32";
                                readonly minimum: -2147483648;
                                readonly maximum: 2147483647;
                            };
                            readonly disagree_count: {
                                readonly type: "integer";
                                readonly format: "int32";
                                readonly minimum: -2147483648;
                                readonly maximum: 2147483647;
                            };
                        };
                    };
                };
                readonly verified: {
                    readonly type: "boolean";
                };
                readonly unresolved_flags: {
                    readonly uniqueItems: true;
                    readonly type: "array";
                    readonly properties: {
                        readonly traversable_again: {
                            readonly type: "boolean";
                        };
                    };
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly veracity_rating: {
                    readonly type: "object";
                    readonly additionalProperties: true;
                };
                readonly website: {
                    readonly type: "string";
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const PlaceFlag: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly fsq_place_id: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "A unique string identifier for a FSQ Place (formerly known as Venue ID). E.g., Foursquare HQ's fsq_place_id = 5a187743ccad6b307315e6fe.";
                };
            };
            readonly required: readonly ["fsq_place_id"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly dry_run: {
                    readonly type: "boolean";
                    readonly default: true;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "If true, return the expected result without actually submitting the suggestion. Useful for testing.\n**Note this defaults to *false* in all cases EXCEPT when calling through this docs page.**";
                };
                readonly fields: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "List of fields being flagged as incorrect. Possible values are:<ul><li>address</li><li>latitude</li><li>longitude</li><li>locality</li><li>name</li><li>tel</li><li>postcode</li><li>region</li><li>state</li><li>website</li></ul>";
                };
                readonly comment: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "A comment describing the issue being flagged.";
                };
            };
            readonly required: readonly ["fields"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "X-Places-Api-Version": {
                    readonly type: "string";
                    readonly default: "2025-06-17";
                    readonly enum: readonly ["2025-06-17"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The version of the API to use.";
                };
            };
            readonly required: readonly ["X-Places-Api-Version"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly suggested_edits: {
                    readonly type: "array";
                    readonly properties: {
                        readonly traversable_again: {
                            readonly type: "boolean";
                        };
                    };
                    readonly items: {
                        readonly type: "object";
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                            };
                            readonly fsq_place_id: {
                                readonly type: "string";
                            };
                            readonly suggested_edit_type: {
                                readonly type: "string";
                            };
                            readonly created_at: {
                                readonly type: "string";
                                readonly format: "date-time";
                            };
                            readonly resolved_time: {
                                readonly type: "string";
                                readonly format: "date-time";
                            };
                            readonly rolled_back: {
                                readonly type: "object";
                                readonly additionalProperties: true;
                            };
                            readonly status: {
                                readonly type: "string";
                            };
                            readonly created_fsq_place_id: {
                                readonly type: "string";
                            };
                            readonly matched_fsq_place_id: {
                                readonly type: "string";
                            };
                        };
                    };
                };
                readonly errors: {
                    readonly type: "array";
                    readonly properties: {
                        readonly traversable_again: {
                            readonly type: "boolean";
                        };
                    };
                    readonly items: {
                        readonly type: "string";
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const PlacePhotos: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly fsq_place_id: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "A unique string identifier for a FSQ Place (formerly known as Venue ID). E.g., Foursquare HQ's fsq_place_id = 5a187743ccad6b307315e6fe";
                };
            };
            readonly required: readonly ["fsq_place_id"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly limit: {
                    readonly maximum: 50;
                    readonly type: "integer";
                    readonly format: "int32";
                    readonly minimum: -2147483648;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The specified number of photos per page. Returns 10 photos by default, up to a maximum number of 50.";
                };
                readonly sort: {
                    readonly type: "string";
                    readonly enum: readonly ["POPULAR", "NEWEST"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Specifies the order in which results are listed. Possible values are:<ul><li>popular (default) - sorts results based on their popularity among Foursquare users</li><li>newest - sorts results from most recently added to least recently added</li></ul>";
                };
                readonly classifications: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Restricts the results to photos matching the specified classifications, separated by a comma. Possible values are:<ul><li>exhibit</li><li>facilities</li><li>food_or_drink</li><li>indoor_facilities_and_classrooms</li><li>indoor_general</li><li>indoor_or_ambience</li><li>logos</li><li>menu</li><li>monuments_and_landmark_buildings</li><li>outdoor</li><li>outdoor_building_and_grounds</li><li>outdoor_building_exterior</li><li>outdoor_grounds</li><li>outdoor_or_storefront</li><li>outdoor_scenery</li><li>product</li></ul>";
                };
            };
            readonly required: readonly [];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "X-Places-Api-Version": {
                    readonly type: "string";
                    readonly default: "2025-06-17";
                    readonly enum: readonly ["2025-06-17"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The version of the API to use.";
                };
            };
            readonly required: readonly ["X-Places-Api-Version"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                    };
                    readonly created_at: {
                        readonly type: "string";
                        readonly format: "date-time";
                    };
                    readonly prefix: {
                        readonly type: "string";
                    };
                    readonly suffix: {
                        readonly type: "string";
                    };
                    readonly width: {
                        readonly type: "integer";
                        readonly format: "int32";
                        readonly minimum: -2147483648;
                        readonly maximum: 2147483647;
                    };
                    readonly height: {
                        readonly type: "integer";
                        readonly format: "int32";
                        readonly minimum: -2147483648;
                        readonly maximum: 2147483647;
                    };
                    readonly classifications: {
                        readonly type: "array";
                        readonly properties: {
                            readonly traversable_again: {
                                readonly type: "boolean";
                            };
                        };
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly tip: {
                        readonly type: "object";
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                            };
                            readonly created_at: {
                                readonly type: "string";
                                readonly format: "date-time";
                            };
                            readonly text: {
                                readonly type: "string";
                            };
                            readonly url: {
                                readonly type: "string";
                            };
                            readonly photo: {};
                            readonly lang: {
                                readonly type: "string";
                            };
                            readonly agree_count: {
                                readonly type: "integer";
                                readonly format: "int32";
                                readonly minimum: -2147483648;
                                readonly maximum: 2147483647;
                            };
                            readonly disagree_count: {
                                readonly type: "integer";
                                readonly format: "int32";
                                readonly minimum: -2147483648;
                                readonly maximum: 2147483647;
                            };
                        };
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const PlaceSearch: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly query: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "A string to be matched against all content for this place, including but not limited to venue name, category, telephone number, taste, and tips.";
                };
                readonly ll: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The latitude/longitude around which to retrieve place information. This must be specified as latitude,longitude (e.g., ll=41.8781,-87.6298).";
                };
                readonly radius: {
                    readonly maximum: 100000;
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly format: "int32";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sets a radius distance (in meters) used to define an area to bias search results. The maximum allowed radius is 100,000 meters. Radius can be used in combination with ll or ip biased geolocation only. By using radius, global search results will be omitted. If not provided, default radius applied is 22000 meters.";
                };
                readonly fsq_category_ids: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Filters the response and returns FSQ Places matching the specified categories. Supports multiple Category IDs, separated by commas.\n\nFor a complete list of Foursquare Category IDs, refer to the <a href=\"https://docs.foursquare.com/data-products/docs/categories\" target=\"blank\">Category Taxonomy</a> page.";
                };
                readonly fsq_chain_ids: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Filters the response and returns FSQ Places matching the specified chains. Supports multiple chain IDs, separated by commas.\n\nFor more information on Foursquare Chain IDs, refer to the <a href=\"https://docs.foursquare.com/data-products/docs/chains\" target=\"blank\">Chains</a> page.";
                };
                readonly exclude_fsq_chain_ids: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Filters the response and returns FSQ Places not matching any of the specified chains. Supports multiple chain IDs, separated by commas. Cannot be used in conjunction with exclude_all_chains.\n\nFor more information on Foursquare Chain IDs, refer to the <a href=\"https://docs.foursquare.com/data-products/docs/chains\" target=\"blank\">Chains</a> page.";
                };
                readonly exclude_all_chains: {
                    readonly type: "boolean";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Filters the response by only returning FSQ Places that are not known to be part of any chain. Cannot be used in conjunction with exclude_chains.";
                };
                readonly fields: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Indicate which fields to return in the response, separated by commas. If no fields are specified, all <a href=\"response-fields#places-pro\" target=\"_blank\">Pro Fields</a> are returned by default. \n\nFor a complete list of returnable fields, refer to the <a href=\"response-fields\" target=\"_blank\">Places Response Fields</a> page.";
                };
                readonly min_price: {
                    readonly maximum: 4;
                    readonly minimum: 1;
                    readonly type: "integer";
                    readonly format: "int32";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Restricts results to only those places within the specified price range. Valid values range between 1 (most affordable) to 4 (most expensive), inclusive.";
                };
                readonly max_price: {
                    readonly maximum: 4;
                    readonly minimum: 1;
                    readonly type: "integer";
                    readonly format: "int32";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Restricts results to only those places within the specified price range. Valid values range between 1 (most affordable) to 4 (most expensive), inclusive.";
                };
                readonly open_at: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Support local day and local time requests through this parameter. To be specified as DOWTHHMM (e.g., 1T2130), where DOW is the day number 1-7 (Monday = 1, Sunday = 7) and time is in 24 hour format.\n\nPlaces that do not have opening hours will not be returned if this parameter is specified. Cannot be specified in conjunction with `open_now`.";
                };
                readonly open_now: {
                    readonly type: "boolean";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Restricts results to only those places that are open now.\n\nPlaces that do not have opening hours will not be returned if this parameter is specified. Cannot be specified in conjunction with `open_at`.";
                };
                readonly tel_format: {
                    readonly type: "string";
                    readonly enum: readonly ["NATIONAL", "E164"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Specifies the format of the returned telephone number. Possible values are:<ul><li>national (default)</li><li>e164</li></ul>";
                };
                readonly ne: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The latitude/longitude representing the north/east points of a rectangle. Must be used with sw parameter to specify a rectangular search box. Global search results will be omitted.";
                };
                readonly sw: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The latitude/longitude representing the south/west points of a rectangle. Must be used with ne parameter to specify a rectangular search box. Global search results will be omitted.";
                };
                readonly near: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "A string naming a locality in the world (e.g., \"Chicago, IL\"). If the value is not geocodable, returns an error. Global search results will be omitted.";
                };
                readonly sort: {
                    readonly type: "string";
                    readonly enum: readonly ["RELEVANCE", "RATING", "DISTANCE", "POPULARITY"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Specifies the order in which results are listed. Possible values are:<ul><li>relevance (default)</li><li>rating</li><li>distance</li></ul>";
                };
                readonly limit: {
                    readonly maximum: 50;
                    readonly minimum: 1;
                    readonly type: "integer";
                    readonly format: "int32";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The number of results to return, up to 50. Defaults to 10.";
                };
            };
            readonly required: readonly [];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "X-Places-Api-Version": {
                    readonly type: "string";
                    readonly default: "2025-06-17";
                    readonly enum: readonly ["2025-06-17"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The version of the API to use.";
                };
            };
            readonly required: readonly ["X-Places-Api-Version"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly results: {
                    readonly type: "array";
                    readonly properties: {
                        readonly traversable_again: {
                            readonly type: "boolean";
                        };
                    };
                    readonly items: {
                        readonly type: "object";
                        readonly properties: {
                            readonly fsq_place_id: {
                                readonly type: "string";
                            };
                            readonly latitude: {
                                readonly type: "object";
                                readonly additionalProperties: true;
                            };
                            readonly longitude: {
                                readonly type: "object";
                                readonly additionalProperties: true;
                            };
                            readonly categories: {
                                readonly type: "array";
                                readonly properties: {
                                    readonly traversable_again: {
                                        readonly type: "boolean";
                                    };
                                };
                                readonly items: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly fsq_category_id: {
                                            readonly type: "string";
                                        };
                                        readonly name: {
                                            readonly type: "string";
                                        };
                                        readonly short_name: {
                                            readonly type: "string";
                                        };
                                        readonly plural_name: {
                                            readonly type: "string";
                                        };
                                        readonly icon: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly id: {
                                                    readonly type: "string";
                                                };
                                                readonly created_at: {
                                                    readonly type: "string";
                                                    readonly format: "date-time";
                                                };
                                                readonly prefix: {
                                                    readonly type: "string";
                                                };
                                                readonly suffix: {
                                                    readonly type: "string";
                                                };
                                                readonly width: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly height: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly classifications: {
                                                    readonly type: "array";
                                                    readonly properties: {
                                                        readonly traversable_again: {
                                                            readonly type: "boolean";
                                                        };
                                                    };
                                                    readonly items: {
                                                        readonly type: "string";
                                                    };
                                                };
                                                readonly tip: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly id: {
                                                            readonly type: "string";
                                                        };
                                                        readonly created_at: {
                                                            readonly type: "string";
                                                            readonly format: "date-time";
                                                        };
                                                        readonly text: {
                                                            readonly type: "string";
                                                        };
                                                        readonly url: {
                                                            readonly type: "string";
                                                        };
                                                        readonly photo: {};
                                                        readonly lang: {
                                                            readonly type: "string";
                                                        };
                                                        readonly agree_count: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly disagree_count: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                    };
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                            readonly chains: {
                                readonly type: "array";
                                readonly properties: {
                                    readonly traversable_again: {
                                        readonly type: "boolean";
                                    };
                                };
                                readonly items: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly fsq_chain_id: {
                                            readonly type: "string";
                                        };
                                        readonly name: {
                                            readonly type: "string";
                                        };
                                        readonly logo: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly id: {
                                                    readonly type: "string";
                                                };
                                                readonly created_at: {
                                                    readonly type: "string";
                                                    readonly format: "date-time";
                                                };
                                                readonly prefix: {
                                                    readonly type: "string";
                                                };
                                                readonly suffix: {
                                                    readonly type: "string";
                                                };
                                                readonly width: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly height: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly classifications: {
                                                    readonly type: "array";
                                                    readonly properties: {
                                                        readonly traversable_again: {
                                                            readonly type: "boolean";
                                                        };
                                                    };
                                                    readonly items: {
                                                        readonly type: "string";
                                                    };
                                                };
                                                readonly tip: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly id: {
                                                            readonly type: "string";
                                                        };
                                                        readonly created_at: {
                                                            readonly type: "string";
                                                            readonly format: "date-time";
                                                        };
                                                        readonly text: {
                                                            readonly type: "string";
                                                        };
                                                        readonly url: {
                                                            readonly type: "string";
                                                        };
                                                        readonly photo: {};
                                                        readonly lang: {
                                                            readonly type: "string";
                                                        };
                                                        readonly agree_count: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly disagree_count: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                    };
                                                };
                                            };
                                        };
                                        readonly parent_id: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                            };
                            readonly date_closed: {
                                readonly type: "string";
                                readonly format: "date";
                            };
                            readonly date_created: {
                                readonly type: "string";
                            };
                            readonly date_refreshed: {
                                readonly type: "string";
                            };
                            readonly description: {
                                readonly type: "string";
                            };
                            readonly distance: {
                                readonly type: "integer";
                                readonly format: "int32";
                                readonly minimum: -2147483648;
                                readonly maximum: 2147483647;
                            };
                            readonly email: {
                                readonly type: "string";
                            };
                            readonly extended_location: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly dma: {
                                        readonly type: "string";
                                    };
                                    readonly census_block_id: {
                                        readonly type: "string";
                                    };
                                };
                            };
                            readonly attributes: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly restroom: {
                                        readonly type: "object";
                                        readonly additionalProperties: true;
                                    };
                                    readonly outdoor_seating: {
                                        readonly type: "object";
                                        readonly additionalProperties: true;
                                    };
                                    readonly atm: {
                                        readonly type: "object";
                                        readonly additionalProperties: true;
                                    };
                                    readonly has_parking: {
                                        readonly type: "object";
                                        readonly additionalProperties: true;
                                    };
                                    readonly wifi: {
                                        readonly type: "string";
                                    };
                                    readonly delivery: {
                                        readonly type: "object";
                                        readonly additionalProperties: true;
                                    };
                                    readonly reservations: {
                                        readonly type: "object";
                                        readonly additionalProperties: true;
                                    };
                                    readonly takes_credit_card: {
                                        readonly type: "object";
                                        readonly additionalProperties: true;
                                    };
                                };
                            };
                            readonly hours: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly display: {
                                        readonly type: "string";
                                    };
                                    readonly is_local_holiday: {
                                        readonly type: "boolean";
                                    };
                                    readonly open_now: {
                                        readonly type: "boolean";
                                    };
                                    readonly regular: {
                                        readonly type: "array";
                                        readonly properties: {
                                            readonly traversable_again: {
                                                readonly type: "boolean";
                                            };
                                        };
                                        readonly items: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly close: {
                                                    readonly type: "string";
                                                };
                                                readonly day: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly open: {
                                                    readonly type: "string";
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                            readonly hours_popular: {
                                readonly type: "array";
                                readonly properties: {
                                    readonly traversable_again: {
                                        readonly type: "boolean";
                                    };
                                };
                                readonly items: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly close: {
                                            readonly type: "string";
                                        };
                                        readonly day: {
                                            readonly type: "integer";
                                            readonly format: "int32";
                                            readonly minimum: -2147483648;
                                            readonly maximum: 2147483647;
                                        };
                                        readonly open: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                            };
                            readonly link: {
                                readonly type: "string";
                            };
                            readonly location: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly address: {
                                        readonly type: "string";
                                    };
                                    readonly locality: {
                                        readonly type: "string";
                                    };
                                    readonly region: {
                                        readonly type: "string";
                                    };
                                    readonly postcode: {
                                        readonly type: "string";
                                    };
                                    readonly admin_region: {
                                        readonly type: "string";
                                    };
                                    readonly post_town: {
                                        readonly type: "string";
                                    };
                                    readonly po_box: {
                                        readonly type: "string";
                                    };
                                    readonly country: {
                                        readonly type: "string";
                                    };
                                    readonly formatted_address: {
                                        readonly type: "string";
                                    };
                                };
                            };
                            readonly menu: {
                                readonly type: "string";
                            };
                            readonly name: {
                                readonly type: "string";
                            };
                            readonly photos: {
                                readonly type: "array";
                                readonly properties: {
                                    readonly traversable_again: {
                                        readonly type: "boolean";
                                    };
                                };
                                readonly items: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly fsq_photo_id: {
                                            readonly type: "string";
                                        };
                                        readonly created_at: {
                                            readonly type: "string";
                                            readonly format: "date-time";
                                        };
                                        readonly prefix: {
                                            readonly type: "string";
                                        };
                                        readonly suffix: {
                                            readonly type: "string";
                                        };
                                        readonly width: {
                                            readonly type: "integer";
                                            readonly format: "int32";
                                            readonly minimum: -2147483648;
                                            readonly maximum: 2147483647;
                                        };
                                        readonly height: {
                                            readonly type: "integer";
                                            readonly format: "int32";
                                            readonly minimum: -2147483648;
                                            readonly maximum: 2147483647;
                                        };
                                        readonly classifications: {
                                            readonly type: "array";
                                            readonly properties: {
                                                readonly traversable_again: {
                                                    readonly type: "boolean";
                                                };
                                            };
                                            readonly items: {
                                                readonly type: "string";
                                            };
                                        };
                                        readonly tip: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly fsq_tip_id: {
                                                    readonly type: "string";
                                                };
                                                readonly created_at: {
                                                    readonly type: "string";
                                                    readonly format: "date-time";
                                                };
                                                readonly text: {
                                                    readonly type: "string";
                                                };
                                                readonly url: {
                                                    readonly type: "string";
                                                };
                                                readonly photo: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly id: {
                                                            readonly type: "string";
                                                        };
                                                        readonly created_at: {
                                                            readonly type: "string";
                                                            readonly format: "date-time";
                                                        };
                                                        readonly prefix: {
                                                            readonly type: "string";
                                                        };
                                                        readonly suffix: {
                                                            readonly type: "string";
                                                        };
                                                        readonly width: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly height: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly classifications: {
                                                            readonly type: "array";
                                                            readonly properties: {
                                                                readonly traversable_again: {
                                                                    readonly type: "boolean";
                                                                };
                                                            };
                                                            readonly items: {
                                                                readonly type: "string";
                                                            };
                                                        };
                                                        readonly tip: {
                                                            readonly type: "object";
                                                            readonly properties: {
                                                                readonly id: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly created_at: {
                                                                    readonly type: "string";
                                                                    readonly format: "date-time";
                                                                };
                                                                readonly text: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly url: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly photo: {};
                                                                readonly lang: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly agree_count: {
                                                                    readonly type: "integer";
                                                                    readonly format: "int32";
                                                                    readonly minimum: -2147483648;
                                                                    readonly maximum: 2147483647;
                                                                };
                                                                readonly disagree_count: {
                                                                    readonly type: "integer";
                                                                    readonly format: "int32";
                                                                    readonly minimum: -2147483648;
                                                                    readonly maximum: 2147483647;
                                                                };
                                                            };
                                                        };
                                                    };
                                                };
                                                readonly lang: {
                                                    readonly type: "string";
                                                };
                                                readonly agree_count: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly disagree_count: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                            readonly popularity: {
                                readonly type: "number";
                                readonly format: "double";
                                readonly minimum: -1.7976931348623157e+308;
                                readonly maximum: 1.7976931348623157e+308;
                            };
                            readonly placemaker_url: {
                                readonly type: "string";
                            };
                            readonly price: {
                                readonly type: "integer";
                                readonly format: "int32";
                                readonly minimum: -2147483648;
                                readonly maximum: 2147483647;
                            };
                            readonly rating: {
                                readonly type: "number";
                                readonly format: "double";
                                readonly minimum: -1.7976931348623157e+308;
                                readonly maximum: 1.7976931348623157e+308;
                            };
                            readonly related_places: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly parent: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly fsq_place_id: {
                                                readonly type: "string";
                                            };
                                            readonly latitude: {
                                                readonly type: "object";
                                                readonly additionalProperties: true;
                                            };
                                            readonly longitude: {
                                                readonly type: "object";
                                                readonly additionalProperties: true;
                                            };
                                            readonly categories: {
                                                readonly type: "array";
                                                readonly properties: {
                                                    readonly traversable_again: {
                                                        readonly type: "boolean";
                                                    };
                                                };
                                                readonly items: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly fsq_category_id: {
                                                            readonly type: "string";
                                                        };
                                                        readonly name: {
                                                            readonly type: "string";
                                                        };
                                                        readonly short_name: {
                                                            readonly type: "string";
                                                        };
                                                        readonly plural_name: {
                                                            readonly type: "string";
                                                        };
                                                        readonly icon: {
                                                            readonly type: "object";
                                                            readonly properties: {
                                                                readonly id: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly created_at: {
                                                                    readonly type: "string";
                                                                    readonly format: "date-time";
                                                                };
                                                                readonly prefix: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly suffix: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly width: {
                                                                    readonly type: "integer";
                                                                    readonly format: "int32";
                                                                    readonly minimum: -2147483648;
                                                                    readonly maximum: 2147483647;
                                                                };
                                                                readonly height: {
                                                                    readonly type: "integer";
                                                                    readonly format: "int32";
                                                                    readonly minimum: -2147483648;
                                                                    readonly maximum: 2147483647;
                                                                };
                                                                readonly classifications: {
                                                                    readonly type: "array";
                                                                    readonly properties: {
                                                                        readonly traversable_again: {
                                                                            readonly type: "boolean";
                                                                        };
                                                                    };
                                                                    readonly items: {
                                                                        readonly type: "string";
                                                                    };
                                                                };
                                                                readonly tip: {
                                                                    readonly type: "object";
                                                                    readonly properties: {
                                                                        readonly id: {
                                                                            readonly type: "string";
                                                                        };
                                                                        readonly created_at: {
                                                                            readonly type: "string";
                                                                            readonly format: "date-time";
                                                                        };
                                                                        readonly text: {
                                                                            readonly type: "string";
                                                                        };
                                                                        readonly url: {
                                                                            readonly type: "string";
                                                                        };
                                                                        readonly photo: {};
                                                                        readonly lang: {
                                                                            readonly type: "string";
                                                                        };
                                                                        readonly agree_count: {
                                                                            readonly type: "integer";
                                                                            readonly format: "int32";
                                                                            readonly minimum: -2147483648;
                                                                            readonly maximum: 2147483647;
                                                                        };
                                                                        readonly disagree_count: {
                                                                            readonly type: "integer";
                                                                            readonly format: "int32";
                                                                            readonly minimum: -2147483648;
                                                                            readonly maximum: 2147483647;
                                                                        };
                                                                    };
                                                                };
                                                            };
                                                        };
                                                    };
                                                };
                                            };
                                            readonly chains: {
                                                readonly type: "array";
                                                readonly properties: {
                                                    readonly traversable_again: {
                                                        readonly type: "boolean";
                                                    };
                                                };
                                                readonly items: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly fsq_chain_id: {
                                                            readonly type: "string";
                                                        };
                                                        readonly name: {
                                                            readonly type: "string";
                                                        };
                                                        readonly logo: {
                                                            readonly type: "object";
                                                            readonly properties: {
                                                                readonly id: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly created_at: {
                                                                    readonly type: "string";
                                                                    readonly format: "date-time";
                                                                };
                                                                readonly prefix: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly suffix: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly width: {
                                                                    readonly type: "integer";
                                                                    readonly format: "int32";
                                                                    readonly minimum: -2147483648;
                                                                    readonly maximum: 2147483647;
                                                                };
                                                                readonly height: {
                                                                    readonly type: "integer";
                                                                    readonly format: "int32";
                                                                    readonly minimum: -2147483648;
                                                                    readonly maximum: 2147483647;
                                                                };
                                                                readonly classifications: {
                                                                    readonly type: "array";
                                                                    readonly properties: {
                                                                        readonly traversable_again: {
                                                                            readonly type: "boolean";
                                                                        };
                                                                    };
                                                                    readonly items: {
                                                                        readonly type: "string";
                                                                    };
                                                                };
                                                                readonly tip: {
                                                                    readonly type: "object";
                                                                    readonly properties: {
                                                                        readonly id: {
                                                                            readonly type: "string";
                                                                        };
                                                                        readonly created_at: {
                                                                            readonly type: "string";
                                                                            readonly format: "date-time";
                                                                        };
                                                                        readonly text: {
                                                                            readonly type: "string";
                                                                        };
                                                                        readonly url: {
                                                                            readonly type: "string";
                                                                        };
                                                                        readonly photo: {};
                                                                        readonly lang: {
                                                                            readonly type: "string";
                                                                        };
                                                                        readonly agree_count: {
                                                                            readonly type: "integer";
                                                                            readonly format: "int32";
                                                                            readonly minimum: -2147483648;
                                                                            readonly maximum: 2147483647;
                                                                        };
                                                                        readonly disagree_count: {
                                                                            readonly type: "integer";
                                                                            readonly format: "int32";
                                                                            readonly minimum: -2147483648;
                                                                            readonly maximum: 2147483647;
                                                                        };
                                                                    };
                                                                };
                                                            };
                                                        };
                                                        readonly parent_id: {
                                                            readonly type: "string";
                                                        };
                                                    };
                                                };
                                            };
                                            readonly date_closed: {
                                                readonly type: "string";
                                                readonly format: "date";
                                            };
                                            readonly date_created: {
                                                readonly type: "string";
                                            };
                                            readonly date_refreshed: {
                                                readonly type: "string";
                                            };
                                            readonly description: {
                                                readonly type: "string";
                                            };
                                            readonly distance: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                            readonly email: {
                                                readonly type: "string";
                                            };
                                            readonly extended_location: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly dma: {
                                                        readonly type: "string";
                                                    };
                                                    readonly census_block_id: {
                                                        readonly type: "string";
                                                    };
                                                };
                                            };
                                            readonly attributes: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly restroom: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                    readonly outdoor_seating: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                    readonly atm: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                    readonly has_parking: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                    readonly wifi: {
                                                        readonly type: "string";
                                                    };
                                                    readonly delivery: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                    readonly reservations: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                    readonly takes_credit_card: {
                                                        readonly type: "object";
                                                        readonly additionalProperties: true;
                                                    };
                                                };
                                            };
                                            readonly hours: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly display: {
                                                        readonly type: "string";
                                                    };
                                                    readonly is_local_holiday: {
                                                        readonly type: "boolean";
                                                    };
                                                    readonly open_now: {
                                                        readonly type: "boolean";
                                                    };
                                                    readonly regular: {
                                                        readonly type: "array";
                                                        readonly properties: {
                                                            readonly traversable_again: {
                                                                readonly type: "boolean";
                                                            };
                                                        };
                                                        readonly items: {
                                                            readonly type: "object";
                                                            readonly properties: {
                                                                readonly close: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly day: {
                                                                    readonly type: "integer";
                                                                    readonly format: "int32";
                                                                    readonly minimum: -2147483648;
                                                                    readonly maximum: 2147483647;
                                                                };
                                                                readonly open: {
                                                                    readonly type: "string";
                                                                };
                                                            };
                                                        };
                                                    };
                                                };
                                            };
                                            readonly hours_popular: {
                                                readonly type: "array";
                                                readonly properties: {
                                                    readonly traversable_again: {
                                                        readonly type: "boolean";
                                                    };
                                                };
                                                readonly items: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly close: {
                                                            readonly type: "string";
                                                        };
                                                        readonly day: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly open: {
                                                            readonly type: "string";
                                                        };
                                                    };
                                                };
                                            };
                                            readonly link: {
                                                readonly type: "string";
                                            };
                                            readonly location: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly address: {
                                                        readonly type: "string";
                                                    };
                                                    readonly locality: {
                                                        readonly type: "string";
                                                    };
                                                    readonly region: {
                                                        readonly type: "string";
                                                    };
                                                    readonly postcode: {
                                                        readonly type: "string";
                                                    };
                                                    readonly admin_region: {
                                                        readonly type: "string";
                                                    };
                                                    readonly post_town: {
                                                        readonly type: "string";
                                                    };
                                                    readonly po_box: {
                                                        readonly type: "string";
                                                    };
                                                    readonly country: {
                                                        readonly type: "string";
                                                    };
                                                    readonly formatted_address: {
                                                        readonly type: "string";
                                                    };
                                                };
                                            };
                                            readonly menu: {
                                                readonly type: "string";
                                            };
                                            readonly name: {
                                                readonly type: "string";
                                            };
                                            readonly photos: {
                                                readonly type: "array";
                                                readonly properties: {
                                                    readonly traversable_again: {
                                                        readonly type: "boolean";
                                                    };
                                                };
                                                readonly items: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly id: {
                                                            readonly type: "string";
                                                        };
                                                        readonly created_at: {
                                                            readonly type: "string";
                                                            readonly format: "date-time";
                                                        };
                                                        readonly prefix: {
                                                            readonly type: "string";
                                                        };
                                                        readonly suffix: {
                                                            readonly type: "string";
                                                        };
                                                        readonly width: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly height: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly tip: {
                                                            readonly type: "object";
                                                            readonly properties: {
                                                                readonly id: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly created_at: {
                                                                    readonly type: "string";
                                                                    readonly format: "date-time";
                                                                };
                                                                readonly text: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly url: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly photo: {};
                                                                readonly lang: {
                                                                    readonly type: "string";
                                                                };
                                                                readonly agree_count: {
                                                                    readonly type: "integer";
                                                                    readonly format: "int32";
                                                                    readonly minimum: -2147483648;
                                                                    readonly maximum: 2147483647;
                                                                };
                                                                readonly disagree_count: {
                                                                    readonly type: "integer";
                                                                    readonly format: "int32";
                                                                    readonly minimum: -2147483648;
                                                                    readonly maximum: 2147483647;
                                                                };
                                                            };
                                                        };
                                                    };
                                                };
                                            };
                                            readonly popularity: {
                                                readonly type: "number";
                                                readonly format: "double";
                                                readonly minimum: -1.7976931348623157e+308;
                                                readonly maximum: 1.7976931348623157e+308;
                                            };
                                            readonly placemaker_url: {
                                                readonly type: "string";
                                            };
                                            readonly price: {
                                                readonly type: "integer";
                                                readonly format: "int32";
                                                readonly minimum: -2147483648;
                                                readonly maximum: 2147483647;
                                            };
                                            readonly rating: {
                                                readonly type: "number";
                                                readonly format: "double";
                                                readonly minimum: -1.7976931348623157e+308;
                                                readonly maximum: 1.7976931348623157e+308;
                                            };
                                            readonly related_places: {};
                                            readonly social_media: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly facebook_id: {
                                                        readonly type: "string";
                                                    };
                                                    readonly instagram: {
                                                        readonly type: "string";
                                                    };
                                                    readonly twitter: {
                                                        readonly type: "string";
                                                    };
                                                };
                                            };
                                            readonly stats: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly total_photos: {
                                                        readonly type: "integer";
                                                        readonly format: "int32";
                                                        readonly minimum: -2147483648;
                                                        readonly maximum: 2147483647;
                                                    };
                                                    readonly total_ratings: {
                                                        readonly type: "integer";
                                                        readonly format: "int64";
                                                        readonly minimum: -9223372036854776000;
                                                        readonly maximum: 9223372036854776000;
                                                    };
                                                    readonly total_tips: {
                                                        readonly type: "integer";
                                                        readonly format: "int32";
                                                        readonly minimum: -2147483648;
                                                        readonly maximum: 2147483647;
                                                    };
                                                };
                                            };
                                            readonly store_id: {
                                                readonly type: "string";
                                            };
                                            readonly tastes: {
                                                readonly type: "array";
                                                readonly properties: {
                                                    readonly traversable_again: {
                                                        readonly type: "boolean";
                                                    };
                                                };
                                                readonly items: {
                                                    readonly type: "string";
                                                };
                                            };
                                            readonly tel: {
                                                readonly type: "string";
                                            };
                                            readonly tips: {
                                                readonly type: "array";
                                                readonly properties: {
                                                    readonly traversable_again: {
                                                        readonly type: "boolean";
                                                    };
                                                };
                                                readonly items: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly id: {
                                                            readonly type: "string";
                                                        };
                                                        readonly created_at: {
                                                            readonly type: "string";
                                                            readonly format: "date-time";
                                                        };
                                                        readonly text: {
                                                            readonly type: "string";
                                                        };
                                                        readonly url: {
                                                            readonly type: "string";
                                                        };
                                                        readonly photo: {};
                                                        readonly lang: {
                                                            readonly type: "string";
                                                        };
                                                        readonly agree_count: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly disagree_count: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                    };
                                                };
                                            };
                                            readonly verified: {
                                                readonly type: "boolean";
                                            };
                                            readonly website: {
                                                readonly type: "string";
                                            };
                                        };
                                    };
                                    readonly children: {
                                        readonly type: "array";
                                        readonly properties: {
                                            readonly traversable_again: {
                                                readonly type: "boolean";
                                            };
                                        };
                                        readonly items: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly fsq_place_id: {
                                                    readonly type: "string";
                                                };
                                                readonly latitude: {
                                                    readonly type: "object";
                                                    readonly additionalProperties: true;
                                                };
                                                readonly longitude: {
                                                    readonly type: "object";
                                                    readonly additionalProperties: true;
                                                };
                                                readonly categories: {
                                                    readonly type: "array";
                                                    readonly properties: {
                                                        readonly traversable_again: {
                                                            readonly type: "boolean";
                                                        };
                                                    };
                                                    readonly items: {
                                                        readonly type: "object";
                                                        readonly properties: {
                                                            readonly fsq_category_id: {
                                                                readonly type: "string";
                                                            };
                                                            readonly name: {
                                                                readonly type: "string";
                                                            };
                                                            readonly short_name: {
                                                                readonly type: "string";
                                                            };
                                                            readonly plural_name: {
                                                                readonly type: "string";
                                                            };
                                                            readonly icon: {
                                                                readonly type: "object";
                                                                readonly properties: {
                                                                    readonly id: {
                                                                        readonly type: "string";
                                                                    };
                                                                    readonly created_at: {
                                                                        readonly type: "string";
                                                                        readonly format: "date-time";
                                                                    };
                                                                    readonly prefix: {
                                                                        readonly type: "string";
                                                                    };
                                                                    readonly suffix: {
                                                                        readonly type: "string";
                                                                    };
                                                                    readonly width: {
                                                                        readonly type: "integer";
                                                                        readonly format: "int32";
                                                                        readonly minimum: -2147483648;
                                                                        readonly maximum: 2147483647;
                                                                    };
                                                                    readonly height: {
                                                                        readonly type: "integer";
                                                                        readonly format: "int32";
                                                                        readonly minimum: -2147483648;
                                                                        readonly maximum: 2147483647;
                                                                    };
                                                                    readonly classifications: {
                                                                        readonly type: "array";
                                                                        readonly properties: {
                                                                            readonly traversable_again: {
                                                                                readonly type: "boolean";
                                                                            };
                                                                        };
                                                                        readonly items: {
                                                                            readonly type: "string";
                                                                        };
                                                                    };
                                                                    readonly tip: {
                                                                        readonly type: "object";
                                                                        readonly properties: {
                                                                            readonly id: {
                                                                                readonly type: "string";
                                                                            };
                                                                            readonly created_at: {
                                                                                readonly type: "string";
                                                                                readonly format: "date-time";
                                                                            };
                                                                            readonly text: {
                                                                                readonly type: "string";
                                                                            };
                                                                            readonly url: {
                                                                                readonly type: "string";
                                                                            };
                                                                            readonly photo: {};
                                                                            readonly lang: {
                                                                                readonly type: "string";
                                                                            };
                                                                            readonly agree_count: {
                                                                                readonly type: "integer";
                                                                                readonly format: "int32";
                                                                                readonly minimum: -2147483648;
                                                                                readonly maximum: 2147483647;
                                                                            };
                                                                            readonly disagree_count: {
                                                                                readonly type: "integer";
                                                                                readonly format: "int32";
                                                                                readonly minimum: -2147483648;
                                                                                readonly maximum: 2147483647;
                                                                            };
                                                                        };
                                                                    };
                                                                };
                                                            };
                                                        };
                                                    };
                                                };
                                                readonly chains: {
                                                    readonly type: "array";
                                                    readonly properties: {
                                                        readonly traversable_again: {
                                                            readonly type: "boolean";
                                                        };
                                                    };
                                                    readonly items: {
                                                        readonly type: "object";
                                                        readonly properties: {
                                                            readonly fsq_chain_id: {
                                                                readonly type: "string";
                                                            };
                                                            readonly name: {
                                                                readonly type: "string";
                                                            };
                                                            readonly logo: {
                                                                readonly type: "object";
                                                                readonly properties: {
                                                                    readonly id: {
                                                                        readonly type: "string";
                                                                    };
                                                                    readonly created_at: {
                                                                        readonly type: "string";
                                                                        readonly format: "date-time";
                                                                    };
                                                                    readonly prefix: {
                                                                        readonly type: "string";
                                                                    };
                                                                    readonly suffix: {
                                                                        readonly type: "string";
                                                                    };
                                                                    readonly width: {
                                                                        readonly type: "integer";
                                                                        readonly format: "int32";
                                                                        readonly minimum: -2147483648;
                                                                        readonly maximum: 2147483647;
                                                                    };
                                                                    readonly height: {
                                                                        readonly type: "integer";
                                                                        readonly format: "int32";
                                                                        readonly minimum: -2147483648;
                                                                        readonly maximum: 2147483647;
                                                                    };
                                                                    readonly classifications: {
                                                                        readonly type: "array";
                                                                        readonly properties: {
                                                                            readonly traversable_again: {
                                                                                readonly type: "boolean";
                                                                            };
                                                                        };
                                                                        readonly items: {
                                                                            readonly type: "string";
                                                                        };
                                                                    };
                                                                    readonly tip: {
                                                                        readonly type: "object";
                                                                        readonly properties: {
                                                                            readonly id: {
                                                                                readonly type: "string";
                                                                            };
                                                                            readonly created_at: {
                                                                                readonly type: "string";
                                                                                readonly format: "date-time";
                                                                            };
                                                                            readonly text: {
                                                                                readonly type: "string";
                                                                            };
                                                                            readonly url: {
                                                                                readonly type: "string";
                                                                            };
                                                                            readonly photo: {};
                                                                            readonly lang: {
                                                                                readonly type: "string";
                                                                            };
                                                                            readonly agree_count: {
                                                                                readonly type: "integer";
                                                                                readonly format: "int32";
                                                                                readonly minimum: -2147483648;
                                                                                readonly maximum: 2147483647;
                                                                            };
                                                                            readonly disagree_count: {
                                                                                readonly type: "integer";
                                                                                readonly format: "int32";
                                                                                readonly minimum: -2147483648;
                                                                                readonly maximum: 2147483647;
                                                                            };
                                                                        };
                                                                    };
                                                                };
                                                            };
                                                            readonly parent_id: {
                                                                readonly type: "string";
                                                            };
                                                        };
                                                    };
                                                };
                                                readonly date_closed: {
                                                    readonly type: "string";
                                                    readonly format: "date";
                                                };
                                                readonly date_created: {
                                                    readonly type: "string";
                                                };
                                                readonly date_refreshed: {
                                                    readonly type: "string";
                                                };
                                                readonly description: {
                                                    readonly type: "string";
                                                };
                                                readonly distance: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly email: {
                                                    readonly type: "string";
                                                };
                                                readonly extended_location: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly dma: {
                                                            readonly type: "string";
                                                        };
                                                        readonly census_block_id: {
                                                            readonly type: "string";
                                                        };
                                                    };
                                                };
                                                readonly attributes: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly restroom: {
                                                            readonly type: "object";
                                                            readonly additionalProperties: true;
                                                        };
                                                        readonly outdoor_seating: {
                                                            readonly type: "object";
                                                            readonly additionalProperties: true;
                                                        };
                                                        readonly atm: {
                                                            readonly type: "object";
                                                            readonly additionalProperties: true;
                                                        };
                                                        readonly has_parking: {
                                                            readonly type: "object";
                                                            readonly additionalProperties: true;
                                                        };
                                                        readonly wifi: {
                                                            readonly type: "string";
                                                        };
                                                        readonly delivery: {
                                                            readonly type: "object";
                                                            readonly additionalProperties: true;
                                                        };
                                                        readonly reservations: {
                                                            readonly type: "object";
                                                            readonly additionalProperties: true;
                                                        };
                                                        readonly takes_credit_card: {
                                                            readonly type: "object";
                                                            readonly additionalProperties: true;
                                                        };
                                                    };
                                                };
                                                readonly hours: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly display: {
                                                            readonly type: "string";
                                                        };
                                                        readonly is_local_holiday: {
                                                            readonly type: "boolean";
                                                        };
                                                        readonly open_now: {
                                                            readonly type: "boolean";
                                                        };
                                                        readonly regular: {
                                                            readonly type: "array";
                                                            readonly properties: {
                                                                readonly traversable_again: {
                                                                    readonly type: "boolean";
                                                                };
                                                            };
                                                            readonly items: {
                                                                readonly type: "object";
                                                                readonly properties: {
                                                                    readonly close: {
                                                                        readonly type: "string";
                                                                    };
                                                                    readonly day: {
                                                                        readonly type: "integer";
                                                                        readonly format: "int32";
                                                                        readonly minimum: -2147483648;
                                                                        readonly maximum: 2147483647;
                                                                    };
                                                                    readonly open: {
                                                                        readonly type: "string";
                                                                    };
                                                                };
                                                            };
                                                        };
                                                    };
                                                };
                                                readonly hours_popular: {
                                                    readonly type: "array";
                                                    readonly properties: {
                                                        readonly traversable_again: {
                                                            readonly type: "boolean";
                                                        };
                                                    };
                                                    readonly items: {
                                                        readonly type: "object";
                                                        readonly properties: {
                                                            readonly close: {
                                                                readonly type: "string";
                                                            };
                                                            readonly day: {
                                                                readonly type: "integer";
                                                                readonly format: "int32";
                                                                readonly minimum: -2147483648;
                                                                readonly maximum: 2147483647;
                                                            };
                                                            readonly open: {
                                                                readonly type: "string";
                                                            };
                                                        };
                                                    };
                                                };
                                                readonly link: {
                                                    readonly type: "string";
                                                };
                                                readonly location: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly address: {
                                                            readonly type: "string";
                                                        };
                                                        readonly locality: {
                                                            readonly type: "string";
                                                        };
                                                        readonly region: {
                                                            readonly type: "string";
                                                        };
                                                        readonly postcode: {
                                                            readonly type: "string";
                                                        };
                                                        readonly admin_region: {
                                                            readonly type: "string";
                                                        };
                                                        readonly post_town: {
                                                            readonly type: "string";
                                                        };
                                                        readonly po_box: {
                                                            readonly type: "string";
                                                        };
                                                        readonly country: {
                                                            readonly type: "string";
                                                        };
                                                        readonly formatted_address: {
                                                            readonly type: "string";
                                                        };
                                                    };
                                                };
                                                readonly menu: {
                                                    readonly type: "string";
                                                };
                                                readonly name: {
                                                    readonly type: "string";
                                                };
                                                readonly photos: {
                                                    readonly type: "array";
                                                    readonly properties: {
                                                        readonly traversable_again: {
                                                            readonly type: "boolean";
                                                        };
                                                    };
                                                    readonly items: {
                                                        readonly type: "object";
                                                        readonly properties: {
                                                            readonly id: {
                                                                readonly type: "string";
                                                            };
                                                            readonly created_at: {
                                                                readonly type: "string";
                                                                readonly format: "date-time";
                                                            };
                                                            readonly prefix: {
                                                                readonly type: "string";
                                                            };
                                                            readonly suffix: {
                                                                readonly type: "string";
                                                            };
                                                            readonly width: {
                                                                readonly type: "integer";
                                                                readonly format: "int32";
                                                                readonly minimum: -2147483648;
                                                                readonly maximum: 2147483647;
                                                            };
                                                            readonly height: {
                                                                readonly type: "integer";
                                                                readonly format: "int32";
                                                                readonly minimum: -2147483648;
                                                                readonly maximum: 2147483647;
                                                            };
                                                            readonly tip: {
                                                                readonly type: "object";
                                                                readonly properties: {
                                                                    readonly id: {
                                                                        readonly type: "string";
                                                                    };
                                                                    readonly created_at: {
                                                                        readonly type: "string";
                                                                        readonly format: "date-time";
                                                                    };
                                                                    readonly text: {
                                                                        readonly type: "string";
                                                                    };
                                                                    readonly url: {
                                                                        readonly type: "string";
                                                                    };
                                                                    readonly photo: {};
                                                                    readonly lang: {
                                                                        readonly type: "string";
                                                                    };
                                                                    readonly agree_count: {
                                                                        readonly type: "integer";
                                                                        readonly format: "int32";
                                                                        readonly minimum: -2147483648;
                                                                        readonly maximum: 2147483647;
                                                                    };
                                                                    readonly disagree_count: {
                                                                        readonly type: "integer";
                                                                        readonly format: "int32";
                                                                        readonly minimum: -2147483648;
                                                                        readonly maximum: 2147483647;
                                                                    };
                                                                };
                                                            };
                                                        };
                                                    };
                                                };
                                                readonly popularity: {
                                                    readonly type: "number";
                                                    readonly format: "double";
                                                    readonly minimum: -1.7976931348623157e+308;
                                                    readonly maximum: 1.7976931348623157e+308;
                                                };
                                                readonly placemaker_url: {
                                                    readonly type: "string";
                                                };
                                                readonly price: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly rating: {
                                                    readonly type: "number";
                                                    readonly format: "double";
                                                    readonly minimum: -1.7976931348623157e+308;
                                                    readonly maximum: 1.7976931348623157e+308;
                                                };
                                                readonly related_places: {};
                                                readonly social_media: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly facebook_id: {
                                                            readonly type: "string";
                                                        };
                                                        readonly instagram: {
                                                            readonly type: "string";
                                                        };
                                                        readonly twitter: {
                                                            readonly type: "string";
                                                        };
                                                    };
                                                };
                                                readonly stats: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly total_photos: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly total_ratings: {
                                                            readonly type: "integer";
                                                            readonly format: "int64";
                                                            readonly minimum: -9223372036854776000;
                                                            readonly maximum: 9223372036854776000;
                                                        };
                                                        readonly total_tips: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                    };
                                                };
                                                readonly store_id: {
                                                    readonly type: "string";
                                                };
                                                readonly tastes: {
                                                    readonly type: "array";
                                                    readonly properties: {
                                                        readonly traversable_again: {
                                                            readonly type: "boolean";
                                                        };
                                                    };
                                                    readonly items: {
                                                        readonly type: "string";
                                                    };
                                                };
                                                readonly tel: {
                                                    readonly type: "string";
                                                };
                                                readonly tips: {
                                                    readonly type: "array";
                                                    readonly properties: {
                                                        readonly traversable_again: {
                                                            readonly type: "boolean";
                                                        };
                                                    };
                                                    readonly items: {
                                                        readonly type: "object";
                                                        readonly properties: {
                                                            readonly id: {
                                                                readonly type: "string";
                                                            };
                                                            readonly created_at: {
                                                                readonly type: "string";
                                                                readonly format: "date-time";
                                                            };
                                                            readonly text: {
                                                                readonly type: "string";
                                                            };
                                                            readonly url: {
                                                                readonly type: "string";
                                                            };
                                                            readonly photo: {};
                                                            readonly lang: {
                                                                readonly type: "string";
                                                            };
                                                            readonly agree_count: {
                                                                readonly type: "integer";
                                                                readonly format: "int32";
                                                                readonly minimum: -2147483648;
                                                                readonly maximum: 2147483647;
                                                            };
                                                            readonly disagree_count: {
                                                                readonly type: "integer";
                                                                readonly format: "int32";
                                                                readonly minimum: -2147483648;
                                                                readonly maximum: 2147483647;
                                                            };
                                                        };
                                                    };
                                                };
                                                readonly verified: {
                                                    readonly type: "boolean";
                                                };
                                                readonly website: {
                                                    readonly type: "string";
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                            readonly social_media: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly facebook_id: {
                                        readonly type: "string";
                                    };
                                    readonly instagram: {
                                        readonly type: "string";
                                    };
                                    readonly twitter: {
                                        readonly type: "string";
                                    };
                                };
                            };
                            readonly stats: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly total_photos: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                    readonly total_ratings: {
                                        readonly type: "integer";
                                        readonly format: "int64";
                                        readonly minimum: -9223372036854776000;
                                        readonly maximum: 9223372036854776000;
                                    };
                                    readonly total_tips: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                };
                            };
                            readonly store_id: {
                                readonly type: "string";
                            };
                            readonly tastes: {
                                readonly type: "array";
                                readonly properties: {
                                    readonly traversable_again: {
                                        readonly type: "boolean";
                                    };
                                };
                                readonly items: {
                                    readonly type: "string";
                                };
                            };
                            readonly tel: {
                                readonly type: "string";
                            };
                            readonly tips: {
                                readonly type: "array";
                                readonly properties: {
                                    readonly traversable_again: {
                                        readonly type: "boolean";
                                    };
                                };
                                readonly items: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly fsq_tip_id: {
                                            readonly type: "string";
                                        };
                                        readonly created_at: {
                                            readonly type: "string";
                                            readonly format: "date-time";
                                        };
                                        readonly text: {
                                            readonly type: "string";
                                        };
                                        readonly url: {
                                            readonly type: "string";
                                        };
                                        readonly photo: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly id: {
                                                    readonly type: "string";
                                                };
                                                readonly created_at: {
                                                    readonly type: "string";
                                                    readonly format: "date-time";
                                                };
                                                readonly prefix: {
                                                    readonly type: "string";
                                                };
                                                readonly suffix: {
                                                    readonly type: "string";
                                                };
                                                readonly width: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly height: {
                                                    readonly type: "integer";
                                                    readonly format: "int32";
                                                    readonly minimum: -2147483648;
                                                    readonly maximum: 2147483647;
                                                };
                                                readonly classifications: {
                                                    readonly type: "array";
                                                    readonly properties: {
                                                        readonly traversable_again: {
                                                            readonly type: "boolean";
                                                        };
                                                    };
                                                    readonly items: {
                                                        readonly type: "string";
                                                    };
                                                };
                                                readonly tip: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly id: {
                                                            readonly type: "string";
                                                        };
                                                        readonly created_at: {
                                                            readonly type: "string";
                                                            readonly format: "date-time";
                                                        };
                                                        readonly text: {
                                                            readonly type: "string";
                                                        };
                                                        readonly url: {
                                                            readonly type: "string";
                                                        };
                                                        readonly photo: {};
                                                        readonly lang: {
                                                            readonly type: "string";
                                                        };
                                                        readonly agree_count: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                        readonly disagree_count: {
                                                            readonly type: "integer";
                                                            readonly format: "int32";
                                                            readonly minimum: -2147483648;
                                                            readonly maximum: 2147483647;
                                                        };
                                                    };
                                                };
                                            };
                                        };
                                        readonly lang: {
                                            readonly type: "string";
                                        };
                                        readonly agree_count: {
                                            readonly type: "integer";
                                            readonly format: "int32";
                                            readonly minimum: -2147483648;
                                            readonly maximum: 2147483647;
                                        };
                                        readonly disagree_count: {
                                            readonly type: "integer";
                                            readonly format: "int32";
                                            readonly minimum: -2147483648;
                                            readonly maximum: 2147483647;
                                        };
                                    };
                                };
                            };
                            readonly verified: {
                                readonly type: "boolean";
                            };
                            readonly unresolved_flags: {
                                readonly uniqueItems: true;
                                readonly type: "array";
                                readonly properties: {
                                    readonly traversable_again: {
                                        readonly type: "boolean";
                                    };
                                };
                                readonly items: {
                                    readonly type: "string";
                                };
                            };
                            readonly veracity_rating: {
                                readonly type: "object";
                                readonly additionalProperties: true;
                            };
                            readonly website: {
                                readonly type: "string";
                            };
                        };
                    };
                };
                readonly context: {
                    readonly type: "object";
                    readonly properties: {
                        readonly geo_bounds: {
                            readonly type: "object";
                            readonly properties: {
                                readonly circle: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly center: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly latitude: {
                                                    readonly type: "number";
                                                    readonly format: "double";
                                                    readonly minimum: -1.7976931348623157e+308;
                                                    readonly maximum: 1.7976931348623157e+308;
                                                };
                                                readonly longitude: {
                                                    readonly type: "number";
                                                    readonly format: "double";
                                                    readonly minimum: -1.7976931348623157e+308;
                                                    readonly maximum: 1.7976931348623157e+308;
                                                };
                                            };
                                        };
                                        readonly radius: {
                                            readonly type: "integer";
                                            readonly format: "int32";
                                            readonly minimum: -2147483648;
                                            readonly maximum: 2147483647;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const PlaceSuggestEdit: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly fsq_place_id: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "A unique string identifier for a FSQ Place (formerly known as Venue ID). E.g., Foursquare HQ's fsq_place_id = 5a187743ccad6b307315e6fe.";
                };
            };
            readonly required: readonly ["fsq_place_id"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly dry_run: {
                    readonly type: "boolean";
                    readonly default: true;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "If true, return the expected result without actually submitting the suggestion. Useful for testing.\n**Note this defaults to *false* in all cases EXCEPT when calling through this docs page.**";
                };
                readonly latitude: {
                    readonly type: "number";
                    readonly format: "double";
                    readonly minimum: -1.7976931348623157e+308;
                    readonly maximum: 1.7976931348623157e+308;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed new value for the latitude at which the place should be located (e.g., 41.8781).";
                };
                readonly longitude: {
                    readonly type: "number";
                    readonly format: "double";
                    readonly minimum: -1.7976931348623157e+308;
                    readonly maximum: 1.7976931348623157e+308;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed new value for the longitude at which the place should be located (e.g., -87.6298).";
                };
                readonly menu: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed new value for the url where the menu of the place can be found.";
                };
                readonly facebook_url: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed new value for the url for this place's Facebook Page.";
                };
                readonly parent_id: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed new value if the place is a subvenue of a larger place (such as a coffee shop within a Target), set this attribute to the ID of the parent place. Set to \"\" to remove parent.";
                };
                readonly hours: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed new value for the hours for the venue, as a semi-colon separated list of open segments and named segments (e.g., brunch or happy hour). Open segments are formatted as day,start,end. Named segments additionally have a label, formatted as day,start,end,label. Days are formatted as integers with Monday = 1,...,Sunday = 7. Start and End are formatted as [+]HHMM format. Use 24 hour format (no colon), prefix with 0 for HH or MM less than 10. Use '+' prefix, i.e., +0230 to represent 2:30 am past midnight into the following day. To indicate that a venue is open 24/7, send this value with the hours attribute: 1,0000,2400;2,0000,2400;3,0000,2400;4,0000,2400;5,0000,2400;6,0000,2400;7,0000,2400";
                };
                readonly name: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed new value for the name of the place.";
                };
                readonly description: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed new value for the freeform description of the place, up to 300 characters.";
                };
                readonly tel: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed new value for the phone number of the place.";
                };
                readonly twitter: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed new value for the twitter handle of the place.";
                };
                readonly website: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed new value for the url of the homepage of the place.";
                };
                readonly address: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed new value for the address of the place.";
                };
                readonly locality: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed new value for the name of the locality (city) where this place is.";
                };
                readonly region: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed new value for the nearest state or province to the place.";
                };
                readonly postcode: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed new value for the zip or postal code for the place.";
                };
                readonly add_fsq_category_ids: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Add category IDs. Supports multiple Category IDs, separated by commas.\n\nFor a complete list of Foursquare Category IDs, refer to the <a href=\"https://docs.foursquare.com/data-products/docs/categories\" target=\"blank\">Category Taxonomy</a> page. [This endpoint prefers the 5-integer style id, but can accept the BSON style id]";
                };
                readonly remove_fsq_category_ids: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Remove category IDs. Supports multiple Category IDs, separated by commas.\n\nFor a complete list of Foursquare Category IDs, refer to the <a href=\"https://docs.foursquare.com/data-products/docs/categories\" target=\"blank\">Category Taxonomy</a> page. [This endpoint prefers the 5-integer style id, but can accept the BSON style id]";
                };
                readonly primary_fsq_category_id: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Change the primary category ID\n\nFor a complete list of Foursquare Category IDs, refer to the <a href=\"https://docs.foursquare.com/data-products/docs/categories\" target=\"blank\">Category Taxonomy</a> page. [This endpoint prefers the 5-integer style id, but can accept the BSON style id]";
                };
                readonly add_fsq_chain_ids: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Add chain IDs.";
                };
                readonly remove_fsq_chain_ids: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Remove Foursquare chain IDs.";
                };
                readonly primary_fsq_chain_id: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Change the primary chain ID.";
                };
                readonly unset_fields: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Fields to unset. Supports multiple fields, separated by commas. Possible values are: <ul><li>menu (default)</li><li>facebook_url</li><li>description</li><li>address</li><li>tel</li><li>twitter</li><li>website</li><li>fsq_chain_ids</li><li>hours</li></ul>";
                };
            };
            readonly required: readonly [];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "X-Places-Api-Version": {
                    readonly type: "string";
                    readonly default: "2025-06-17";
                    readonly enum: readonly ["2025-06-17"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The version of the API to use.";
                };
            };
            readonly required: readonly ["X-Places-Api-Version"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly suggested_edits: {
                    readonly type: "array";
                    readonly properties: {
                        readonly traversable_again: {
                            readonly type: "boolean";
                        };
                    };
                    readonly items: {
                        readonly type: "object";
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                            };
                            readonly fsq_place_id: {
                                readonly type: "string";
                            };
                            readonly suggested_edit_type: {
                                readonly type: "string";
                            };
                            readonly created_at: {
                                readonly type: "string";
                                readonly format: "date-time";
                            };
                            readonly resolved_time: {
                                readonly type: "string";
                                readonly format: "date-time";
                            };
                            readonly rolled_back: {
                                readonly type: "object";
                                readonly additionalProperties: true;
                            };
                            readonly status: {
                                readonly type: "string";
                            };
                            readonly created_fsq_place_id: {
                                readonly type: "string";
                            };
                            readonly matched_fsq_place_id: {
                                readonly type: "string";
                            };
                        };
                    };
                };
                readonly errors: {
                    readonly type: "array";
                    readonly properties: {
                        readonly traversable_again: {
                            readonly type: "boolean";
                        };
                    };
                    readonly items: {
                        readonly type: "string";
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const PlaceSuggestRemove: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly fsq_place_id: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "A unique string identifier for a FSQ Place (formerly known as Venue ID). E.g., Foursquare HQ's fsq_place_id = 5a187743ccad6b307315e6fe.";
                };
            };
            readonly required: readonly ["fsq_place_id"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly dry_run: {
                    readonly type: "boolean";
                    readonly default: true;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "If true, return the expected result without actually submitting the suggestion. Useful for testing.\n**Note this defaults to *false* in all cases EXCEPT when calling through this docs page.**";
                };
                readonly reason: {
                    readonly type: "string";
                    readonly enum: readonly ["CLOSED", "DOESNT_EXIST", "INAPPROPRIATE", "NOT_CLOSED", "OTHER", "PRIVATE"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Reason for removal. Possible values are:<ul><li>closed</li><li>doesnt_exist</li><li>inappropriate</li><li>not_closed</li><li>private</li></ul>";
                };
                readonly comment: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "A comment describing the removal request.";
                };
            };
            readonly required: readonly ["reason"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "X-Places-Api-Version": {
                    readonly type: "string";
                    readonly default: "2025-06-17";
                    readonly enum: readonly ["2025-06-17"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The version of the API to use.";
                };
            };
            readonly required: readonly ["X-Places-Api-Version"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly suggested_edits: {
                    readonly type: "array";
                    readonly properties: {
                        readonly traversable_again: {
                            readonly type: "boolean";
                        };
                    };
                    readonly items: {
                        readonly type: "object";
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                            };
                            readonly fsq_place_id: {
                                readonly type: "string";
                            };
                            readonly suggested_edit_type: {
                                readonly type: "string";
                            };
                            readonly created_at: {
                                readonly type: "string";
                                readonly format: "date-time";
                            };
                            readonly resolved_time: {
                                readonly type: "string";
                                readonly format: "date-time";
                            };
                            readonly rolled_back: {
                                readonly type: "object";
                                readonly additionalProperties: true;
                            };
                            readonly status: {
                                readonly type: "string";
                            };
                            readonly created_fsq_place_id: {
                                readonly type: "string";
                            };
                            readonly matched_fsq_place_id: {
                                readonly type: "string";
                            };
                        };
                    };
                };
                readonly errors: {
                    readonly type: "array";
                    readonly properties: {
                        readonly traversable_again: {
                            readonly type: "boolean";
                        };
                    };
                    readonly items: {
                        readonly type: "string";
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const PlaceSuggestStatus: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly suggested_edit_ids: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "A comma seperated list of suggested edit IDs. If specified, shows only suggested edits with these IDs. If not specified, returns all edits suggested using the calling service token.";
                };
                readonly limit: {
                    readonly maximum: 50;
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly format: "int32";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The specified number of suggested edits per page. Returns 10 suggested edits by default, up to a maximum number of 50.";
                };
            };
            readonly required: readonly [];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "X-Places-Api-Version": {
                    readonly type: "string";
                    readonly default: "2025-06-17";
                    readonly enum: readonly ["2025-06-17"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The version of the API to use.";
                };
            };
            readonly required: readonly ["X-Places-Api-Version"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly suggested_edits: {
                    readonly type: "array";
                    readonly properties: {
                        readonly traversable_again: {
                            readonly type: "boolean";
                        };
                    };
                    readonly items: {
                        readonly type: "object";
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                            };
                            readonly fsq_place_id: {
                                readonly type: "string";
                            };
                            readonly suggested_edit_type: {
                                readonly type: "string";
                            };
                            readonly created_at: {
                                readonly type: "string";
                                readonly format: "date-time";
                            };
                            readonly resolved_time: {
                                readonly type: "string";
                                readonly format: "date-time";
                            };
                            readonly rolled_back: {
                                readonly type: "object";
                                readonly additionalProperties: true;
                            };
                            readonly status: {
                                readonly type: "string";
                            };
                            readonly created_fsq_place_id: {
                                readonly type: "string";
                            };
                            readonly matched_fsq_place_id: {
                                readonly type: "string";
                            };
                        };
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const PlaceTips: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly fsq_place_id: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "A unique string identifier for a FSQ Place (formerly known as Venue ID). E.g., Foursquare HQ's fsq_place_id = 5a187743ccad6b307315e6fe";
                };
            };
            readonly required: readonly ["fsq_place_id"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly limit: {
                    readonly maximum: 50;
                    readonly minimum: 1;
                    readonly type: "integer";
                    readonly format: "int32";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The specified number of tips per page. Returns 10 tips by default, up to a maximum number of 50.";
                };
                readonly fields: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Indicate which fields to return in the response, separated by commas. Supported fields are:<ul><li> fsq_tip_id - The ID of the tip to be returned.</li><li> created_at - The timestamp indicating when the tip was created; UNIX timestamp in seconds since Epoch.</li><li> text - The text of the returned tip.</li><li> lang - The language of the returned tip.</li><li> url - The URL associated with the returned tip.</li><li> agree_count - The count of users who have agreed with the returned tip.</li><li> disagree_count - The count of users who have disagreed with the returned tip.</li><li> photo - The ID of the photo asociated with the returned tip.</li></ul>Default fields if this param is omitted are \"fsq_tip_id\", \"created_at\", and \"text\".";
                };
                readonly sort: {
                    readonly type: "string";
                    readonly enum: readonly ["POPULAR", "NEWEST"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Specifies the order in which results are listed. Possible values are:<ul><li>popular (default) - sorts results based on their popularity among Foursquare users</li><li>newest - sorts results from most recently added to least recently added</li></ul>";
                };
            };
            readonly required: readonly [];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "X-Places-Api-Version": {
                    readonly type: "string";
                    readonly default: "2025-06-17";
                    readonly enum: readonly ["2025-06-17"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The version of the API to use.";
                };
            };
            readonly required: readonly ["X-Places-Api-Version"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly fsq_tip_id: {
                        readonly type: "string";
                    };
                    readonly created_at: {
                        readonly type: "string";
                        readonly format: "date-time";
                    };
                    readonly text: {
                        readonly type: "string";
                    };
                    readonly url: {
                        readonly type: "string";
                    };
                    readonly photo: {
                        readonly type: "object";
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                            };
                            readonly created_at: {
                                readonly type: "string";
                                readonly format: "date-time";
                            };
                            readonly prefix: {
                                readonly type: "string";
                            };
                            readonly suffix: {
                                readonly type: "string";
                            };
                            readonly width: {
                                readonly type: "integer";
                                readonly format: "int32";
                                readonly minimum: -2147483648;
                                readonly maximum: 2147483647;
                            };
                            readonly height: {
                                readonly type: "integer";
                                readonly format: "int32";
                                readonly minimum: -2147483648;
                                readonly maximum: 2147483647;
                            };
                            readonly classifications: {
                                readonly type: "array";
                                readonly properties: {
                                    readonly traversable_again: {
                                        readonly type: "boolean";
                                    };
                                };
                                readonly items: {
                                    readonly type: "string";
                                };
                            };
                            readonly tip: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly id: {
                                        readonly type: "string";
                                    };
                                    readonly created_at: {
                                        readonly type: "string";
                                        readonly format: "date-time";
                                    };
                                    readonly text: {
                                        readonly type: "string";
                                    };
                                    readonly url: {
                                        readonly type: "string";
                                    };
                                    readonly photo: {};
                                    readonly lang: {
                                        readonly type: "string";
                                    };
                                    readonly agree_count: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                    readonly disagree_count: {
                                        readonly type: "integer";
                                        readonly format: "int32";
                                        readonly minimum: -2147483648;
                                        readonly maximum: 2147483647;
                                    };
                                };
                            };
                        };
                    };
                    readonly lang: {
                        readonly type: "string";
                    };
                    readonly agree_count: {
                        readonly type: "integer";
                        readonly format: "int32";
                        readonly minimum: -2147483648;
                        readonly maximum: 2147483647;
                    };
                    readonly disagree_count: {
                        readonly type: "integer";
                        readonly format: "int32";
                        readonly minimum: -2147483648;
                        readonly maximum: 2147483647;
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const PlaceTopVenueWoes: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly near: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The name of the location to search near";
                };
                readonly ne: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The north-east corner of the bounding box to search within";
                };
                readonly sw: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The south-west corner of the bounding box to search within";
                };
            };
            readonly required: readonly [];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "X-Places-Api-Version": {
                    readonly type: "string";
                    readonly default: "2025-06-17";
                    readonly enum: readonly ["2025-06-17"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The version of the API to use.";
                };
            };
            readonly required: readonly ["X-Places-Api-Version"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly venues: {
                    readonly type: "array";
                    readonly properties: {
                        readonly traversable_again: {
                            readonly type: "boolean";
                        };
                    };
                    readonly items: {
                        readonly type: "object";
                        readonly properties: {
                            readonly fsq_place_id: {
                                readonly type: "string";
                            };
                            readonly venue_name: {
                                readonly type: "string";
                            };
                            readonly location: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly address: {
                                        readonly type: "string";
                                    };
                                    readonly locality: {
                                        readonly type: "string";
                                    };
                                    readonly region: {
                                        readonly type: "string";
                                    };
                                    readonly postcode: {
                                        readonly type: "string";
                                    };
                                    readonly admin_region: {
                                        readonly type: "string";
                                    };
                                    readonly post_town: {
                                        readonly type: "string";
                                    };
                                    readonly po_box: {
                                        readonly type: "string";
                                    };
                                    readonly country: {
                                        readonly type: "string";
                                    };
                                    readonly formatted_address: {
                                        readonly type: "string";
                                    };
                                };
                            };
                            readonly woe_types: {
                                readonly uniqueItems: true;
                                readonly type: "array";
                                readonly properties: {
                                    readonly traversable_again: {
                                        readonly type: "boolean";
                                    };
                                };
                                readonly items: {
                                    readonly type: "string";
                                };
                            };
                            readonly woe_count: {
                                readonly type: "integer";
                                readonly format: "int32";
                                readonly minimum: -2147483648;
                                readonly maximum: 2147483647;
                            };
                            readonly woes: {
                                readonly type: "array";
                                readonly properties: {
                                    readonly traversable_again: {
                                        readonly type: "boolean";
                                    };
                                };
                                readonly items: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly id: {
                                            readonly type: "string";
                                        };
                                        readonly fsq_place_id: {
                                            readonly type: "string";
                                        };
                                        readonly suggested_edit_type: {
                                            readonly type: "string";
                                        };
                                        readonly created_at: {
                                            readonly type: "string";
                                            readonly format: "date-time";
                                        };
                                        readonly resolved_time: {
                                            readonly type: "string";
                                            readonly format: "date-time";
                                        };
                                        readonly rolled_back: {
                                            readonly type: "object";
                                            readonly additionalProperties: true;
                                        };
                                        readonly status: {
                                            readonly type: "string";
                                        };
                                        readonly created_fsq_place_id: {
                                            readonly type: "string";
                                        };
                                        readonly matched_fsq_place_id: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const PlacesSuggestPlace: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly name: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed value for the name of the new place.";
                };
                readonly categories: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Categories to search for. Supports multiple Category IDs, separated by commas.\n\nFor a complete list of Foursquare Category IDs, refer to the <a href=\"https://docs.foursquare.com/data-products/docs/categories\" target=\"blank\">Category Taxonomy</a> page.";
                };
                readonly address: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed value for the address of the new place.";
                };
                readonly locality: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed value for the name of the locality (city) where this new place is.";
                };
                readonly region: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed value for the nearest state or province to the new place.";
                };
                readonly postcode: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The value for the zip or postal code for the new place.";
                };
                readonly country_code: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The 2-digit country code where the place is located (e.g. US).";
                };
                readonly latitude: {
                    readonly type: "number";
                    readonly format: "double";
                    readonly minimum: -1.7976931348623157e+308;
                    readonly maximum: 1.7976931348623157e+308;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed value for the latitude at which the new place should be located (e.g., 41.8781).";
                };
                readonly longitude: {
                    readonly type: "number";
                    readonly format: "double";
                    readonly minimum: -1.7976931348623157e+308;
                    readonly maximum: 1.7976931348623157e+308;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed value for the longitude at which the new place should be located (e.g., -87.6298).";
                };
                readonly chains: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed chain ids to be assosciated with this new place";
                };
                readonly parent_id: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed value if the new place is a subvenue of a larger place (such as a coffee shop within a Target), set this attribute to the ID of the parent place.";
                };
                readonly is_private_place: {
                    readonly type: "boolean";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "If true, the new place will be marked as private.";
                };
                readonly tel: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed new value for the phone number of the place.";
                };
                readonly website: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed value for the url of the homepage of the new place.";
                };
                readonly email: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed value for the email address for this new place";
                };
                readonly facebook_url: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed value for the url for this new place's Facebook Page.";
                };
                readonly instagram: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed value for the instagram handle for this new place";
                };
                readonly twitter: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed value for the twitter handle of the new place.";
                };
                readonly hours: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The proposed value for the hours for the new venue, as a semi-colon separated list of open segments and named segments (e.g., brunch or happy hour). Open segments are formatted as day,start,end. Named segments additionally have a label, formatted as day,start,end,label. Days are formatted as integers with Monday = 1,...,Sunday = 7. Start and End are formatted as [+]HHMM format. Use 24 hour format (no colon), prefix with 0 for HH or MM less than 10. Use '+' prefix, i.e., +0230 to represent 2:30 am past midnight into the following day. To indicate that a venue is open 24/7, send this value with the hours attribute: 1,0000,2400;2,0000,2400;3,0000,2400;4,0000,2400;5,0000,2400;6,0000,2400;7,0000,2400";
                };
                readonly attributes: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Comma seperated list that represents the attributes that the new place has. Possible values are: {atm, reservation, offers_delivery, parking, outdoor_seating, restroom, credit_cards, wifi}.";
                };
                readonly dry_run: {
                    readonly type: "boolean";
                    readonly default: true;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "If true, return the expected result without actually submitting the suggestion. Useful for testing.\n**Note this defaults to *false* in all cases EXCEPT when calling through this docs page.**";
                };
            };
            readonly required: readonly ["name"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "X-Places-Api-Version": {
                    readonly type: "string";
                    readonly default: "2025-06-17";
                    readonly enum: readonly ["2025-06-17"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The version of the API to use.";
                };
            };
            readonly required: readonly ["X-Places-Api-Version"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly new_place_suggestion: {
                    readonly type: "object";
                    readonly properties: {
                        readonly id: {
                            readonly type: "string";
                        };
                        readonly created_at: {
                            readonly type: "string";
                            readonly format: "date-time";
                        };
                        readonly resolved_time: {
                            readonly type: "string";
                            readonly format: "date-time";
                        };
                        readonly status: {
                            readonly type: "string";
                        };
                    };
                };
                readonly matched_fsq_place: {
                    readonly type: "object";
                    readonly properties: {
                        readonly fsq_place_id: {
                            readonly type: "string";
                        };
                        readonly name: {
                            readonly type: "string";
                        };
                    };
                };
                readonly errors: {
                    readonly type: "array";
                    readonly properties: {
                        readonly traversable_again: {
                            readonly type: "boolean";
                        };
                    };
                    readonly items: {
                        readonly type: "string";
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const SuggestMerge: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly fsq_place_id: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "A unique string identifier for a FSQ Place (formerly known as Venue ID). E.g., Foursquare HQ's fsq_place_id = 5a187743ccad6b307315e6fe.";
                };
            };
            readonly required: readonly ["fsq_place_id"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly dry_run: {
                    readonly type: "boolean";
                    readonly default: true;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "If true, return the expected result without actually submitting the suggestion. Useful for testing.\n**Note this defaults to *false* in all cases EXCEPT when calling through this docs page.**";
                };
                readonly duplicate_fsq_place_ids: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "A list of string identifiers that represent the same place as the given fsq_place_id.";
                };
            };
            readonly required: readonly ["duplicate_fsq_place_ids"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly "X-Places-Api-Version": {
                    readonly type: "string";
                    readonly default: "2025-06-17";
                    readonly enum: readonly ["2025-06-17"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The version of the API to use.";
                };
            };
            readonly required: readonly ["X-Places-Api-Version"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly suggested_edits: {
                    readonly type: "array";
                    readonly properties: {
                        readonly traversable_again: {
                            readonly type: "boolean";
                        };
                    };
                    readonly items: {
                        readonly type: "object";
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                            };
                            readonly fsq_place_id: {
                                readonly type: "string";
                            };
                            readonly suggested_edit_type: {
                                readonly type: "string";
                            };
                            readonly created_at: {
                                readonly type: "string";
                                readonly format: "date-time";
                            };
                            readonly resolved_time: {
                                readonly type: "string";
                                readonly format: "date-time";
                            };
                            readonly rolled_back: {
                                readonly type: "object";
                                readonly additionalProperties: true;
                            };
                            readonly status: {
                                readonly type: "string";
                            };
                            readonly created_fsq_place_id: {
                                readonly type: "string";
                            };
                            readonly matched_fsq_place_id: {
                                readonly type: "string";
                            };
                        };
                    };
                };
                readonly errors: {
                    readonly type: "array";
                    readonly properties: {
                        readonly traversable_again: {
                            readonly type: "boolean";
                        };
                    };
                    readonly items: {
                        readonly type: "string";
                    };
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
export { Autocomplete, GeotaggingCandidates, GeotaggingConfirm, PlaceDetails, PlaceFlag, PlacePhotos, PlaceSearch, PlaceSuggestEdit, PlaceSuggestRemove, PlaceSuggestStatus, PlaceTips, PlaceTopVenueWoes, PlacesSuggestPlace, SuggestMerge };
