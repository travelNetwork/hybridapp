import Config from 'react-native-config'

import { apiCall } from '../requests';

import {
  NEARBY_SUCCESS,
  NEARBY_ERROR
} from '../constants/home';

export function nearbyPlaces(place) {
  const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        key = `key=${Config.PLACES_API_KEY}`,
        location = `location=${place.latitude},${place.longitude}`,
        radius = 'radius=10';

  return apiCall(NEARBY_SUCCESS, NEARBY_ERROR, 'get', `${url}?${key}&${location}&${radius}`);
}
