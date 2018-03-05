import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import _ from 'lodash';

import {
  GEOLOCATION,
  SELECTED_PLACE,
  LEVEL_CHANGE,
  REGION_CHANGE,
  NEARBY,
  NEW_PLACE,
  CURRENT_PLACES,
  GOOGLE_PLACE,
  SEARCHED_PLACES,
  FROM_REVIEW
} from '../constants/home';
import {
  PLACES_SUCCESS,
  UPDATE_REVIEW,
  ADD_REVIEW,
  REVIEW_LOADING,
} from '../constants/reviews';
import { LOGOUT } from '../constants/auth';

const initialState = {
  places: [],
  currentPlaces: [],
  searchedPlaces: [],
  selectedPlace: null,
  newPlace: null,
  googlePlace: null,
  level: 1,
  position: null,
  region: {
    longitudeDelta: 126.56254928559065,
    latitudeDelta: 114.96000427333595,
    longitude: 5.266113225370649,
    latitude: 20.476854784243514
  },
  reviewLoading: false,
  fromReview: false,
};

function updateReview(currentPlaces, place, updatedReview) {
  return currentPlaces.map((currentPlace) => {
    if (currentPlace.id === place.id) {
      return {
        ...place,
        reviews: currentPlace.reviews.map((review) => {
          return (review.id === updatedReview.id) ? updatedReview : review;
        })
      }
    }
    return currentPlace;
  })
}

function HomeReducer(state = initialState, action) {
  const { place, ...review } = action.review || {};

  switch (action.type) {
    case FROM_REVIEW:
      return {
        ...state,
        fromReview: action.from
      }
    case REVIEW_LOADING:
      return {
        ...state,
        reviewLoading: action.loading
      }
    case PLACES_SUCCESS:
      return {
        ...state,
        places: _.compact([state.googlePlace, ...action.payload]),
        selectedPlace: action.payload.length ? action.payload[0] : null
      };
    case ADD_REVIEW:
      let exist = false;

      const newPlaces_addreview = state.places.map((statePlace) => {
        if (statePlace.id === place.id) {
          exist = true;
          return {
            ...statePlace,
            reviews: [review, ...statePlace.reviews],
            selectedPlace: review,
          };
        }

        return statePlace;
      });

      return {
        ...state,
        newPlace: initialState.newPlace,
        searchedPlaces: initialState.searchedPlaces,
        selectedPlace: { ...place, reviews: [review] },
        places: exist ? newPlaces_addreview : [{ ...place, reviews: [review] }, ...state.places],
      };
    case UPDATE_REVIEW:
      return {
        ...state,
        places: updateReview(state.places, place, review),
        currentPlaces: updateReview(state.currentPlaces, place, review),
      };
    case NEW_PLACE:
      let extras = {};
      if (!action.place) {
        extras.nearbyPlaces = [];
      }
      return {
        ...state,
        newPlace: action.place,
        selectedPlace: action.place,
        ...extras
      };
    case GOOGLE_PLACE:
      let places = state.googlePlace ? state.places.slice(1) : state.places,
          newPlaces = _.compact([action.place, ...places]),
          currentPlaces = state.googlePlace ? state.currentPlaces.slice(1) : state.currentPlaces,
          newCurrentPlaces = _.compact([action.place, ...currentPlaces])

      if (!action.place) {
        newPlaces = _.filter(state.places, (place) => state.googlePlace.id !== place.id);
        newCurrentPlaces = _.filter(state.currentPlaces, (currentPlace) => state.googlePlace.id !== currentPlace.id);
      }

      return {
        ...state,
        newPlace: null,
        searchedPlaces: initialState.searchedPlaces,
        googlePlace: action.place,
        places: newPlaces,
        currentPlaces: newCurrentPlaces,
        selectedPlace: action.place,
      }
    case SEARCHED_PLACES:
      return {
        ...state,
        searchedPlaces: action.places || action.payload || initialState.searchedPlaces
      };
    case NEARBY:
      return { ...state, nearbyPlaces: action.places.results };
    case SELECTED_PLACE:
      return { ...state, selectedPlace: action.selectedPlace};
    case GEOLOCATION:
      return { ...state, position: action.position};
    case LEVEL_CHANGE:
      return { ...state, level: action.level};
    case REGION_CHANGE:
      return { ...state, region: action.region};
    case CURRENT_PLACES:
      let selectedPlace = action.places.length ? action.places[0] : null;

      if (state.selectedPlace && _.find(action.places, (place) => place.id === state.selectedPlace.id)) {
        selectedPlace = state.selectedPlace;
      }

      return {
        ...state,
        selectedPlace,
        currentPlaces: action.places
      };
    case LOGOUT:
      return initialState;
    default:
      return state;
  }
}

const homePersistConfig = {
  key: 'home',
  storage: storage,
  blacklist: ['position']
}

export default persistReducer(homePersistConfig, HomeReducer);
