import {
  GET_GEOLOCATION,
  SET_GEOLOCATION,
  REGION_CHANGE,
  PLACE_SELECT,
  FILTERS_CHANGE,
  G_PLACE,
} from '../constants/home';

export function getGeolocation() {
  return {
    type: GET_GEOLOCATION,
  };
}
export function setGeolocation(coords) {
  return {
    type: SET_GEOLOCATION,
    coords,
  };
}

export function regionChanged(region) {
  return {
    type: REGION_CHANGE,
    region,
  };
}

export function filtersChange(filters) {
  return {
    type: FILTERS_CHANGE,
    ...filters,
  };
}

export function placeSelect(place) {
  return {
    type: PLACE_SELECT,
    place,
  };
}

export function gPlace(place) {
  return {
    type: G_PLACE,
    place,
  };
}
