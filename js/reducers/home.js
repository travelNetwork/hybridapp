import {
  GEOLOCATION,
  SELECTED_PLACE,
  LEVEL_CHANGE,
  REGION_CHANGE,
  NEARBY,
  NEW_PLACE,
  CURRENT_PLACES
} from '../constants/home';
import {
  PLACES_SUCCESS,
  UPDATE_REVIEW,
  ADD_REVIEW,
} from '../constants/reviews';
import { LOGOUT } from '../constants/auth';

const initialState = {
  places: [],
  currentPlaces: [],
  selectedPlace: null,
  newPlace: null,
  level: 0,
  position: null,
  region: null
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
    case PLACES_SUCCESS:
      return {
        ...state,
        places: action.payload,
        selectedPlace: action.payload.length ? action.payload[0] : null
      };
    case ADD_REVIEW:
      const newPlace = { ...place, reviews: [review] };
      return {
        ...state,
        newPlace: null,
        selectedPlace: newPlace,
        places: [newPlace, ...state.places]
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
        ...extras
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
      return {
        ...state,
        currentPlaces: action.places,
        selectedPlace: (action.places.length > 0 && !state.selectedPlace) ? action.places[0] : state.selectedPlace
      };
    case LOGOUT:
      return initialState;
    default:
      return state;
  }
}

export default HomeReducer;
