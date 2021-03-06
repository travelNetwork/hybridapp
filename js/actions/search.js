import Config from 'react-native-config';
import shortid from 'shortid';

import { apiCall, apiGet } from '../libs/requests';
import { userTypes } from '../parameters';

import {
  REVIEWS_SEARCH,
  PLACES_SEARCH,
  PEOPLE_SEARCH,
} from '../constants/search';

export const COORD_REGEX = /^([-+]?[\d]{1,2}\.\d+),\s*([-+]?[\d]{1,3}\.\d+)?$/;

const gPlaceToPlace = gPlace => ({
  ...gPlace,
  address: gPlace.formatted_address,
  latitude: gPlace.geometry.location.lat,
  longitude: gPlace.geometry.location.lng,
  reviews: [{
    created_by: {
      first_name: gPlace.name,
    },
    categories: [],
    pictures: gPlace.photos,
    user_type: userTypes.google,
  }],
});

function peopleParser(people) {
  if (!people) {
    return [];
  }

  return [
    ...people.friends,
    ...people.friends_friends.map(friend => ({
      ...friend,
      type: 'friends_friends',
    })),
    ...people.others.map(other => ({
      ...other,
      type: 'other',
    })),
  ];
}

function autocompleteToPlace(autocomplete) {
  if (!autocomplete) {
    return [];
  }

  return [
    ...autocomplete.predictions.map(prediction => ({
      ...prediction,
      id: shortid.generate(),
      name: prediction.description,
    })),
  ];
}

function nearByToPlace(nearby) {
  if (!nearby) {
    return [];
  }

  return [
    ...nearby.results.map(place => ({
      ...place,
      id: shortid.generate(),
    })),
  ];
}

export function reviewsSearch(query) {
  return {
    type: REVIEWS_SEARCH,
    query,
  };
}

export function peopleSearch(query) {
  return apiCall(apiGet(PEOPLE_SEARCH, 'friends/search/', { query }, null, peopleParser));
}

export function placesSearch(query) {
  const key = `key=${Config.PLACES_API_KEY}`;
  const coord = COORD_REGEX.exec(query);
  let url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
  let params = `input=${query}`;
  let parser = autocompleteToPlace;

  if (coord && coord.length >= 3) {
    const location = `location=${coord[1]},${coord[2]}`;
    const rankby = 'rankby=distance';
    const type = 'type=point_of_interest';

    url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    params = `${location}&${rankby}&${type}`;
    parser = nearByToPlace;
  }

  return apiCall(apiGet(PLACES_SEARCH, `${url}?${key}&${params}`, {}, null, parser));
}

export function photoUrl(ref) {
  const url = 'https://maps.googleapis.com/maps/api/place/photo';
  const key = `key=${Config.PLACES_API_KEY}`;
  const maxwidth = 'maxwidth=600';
  const photoreference = `photoreference=${ref}`;

  return `${url}?${key}&${maxwidth}&${photoreference}`;
}

export function placeDetails(placeId, poiName = null) {
  const url = 'https://maps.googleapis.com/maps/api/place/details/json';
  const key = `key=${Config.PLACES_API_KEY}`;
  const placeid = `placeid=${placeId}`;

  return fetch(`${url}?${key}&${placeid}`)
    .then(response => response.json())
    .then(({ result: { photos, ...gPlace } }) => ({
      ...gPlace,
      photos: photos ? photos.slice(0, 2).map(({ photo_reference: ref }) => ({
        source: photoUrl(ref),
      })) : [],
    }))
    .then(gPlace => gPlaceToPlace({
      ...gPlace,
      name: poiName || gPlace.name,
    }));
}

export const poiToPlace = ({ name, coordinate }) => ({
  latitude: coordinate.latitude,
  longitude: coordinate.longitude,
  reviews: [{
    created_by: {
      first_name: name,
    },
    user_type: userTypes.google,
    categories: [],
    pictures: [],
  }],
});
