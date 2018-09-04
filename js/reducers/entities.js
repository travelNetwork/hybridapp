import { denormalize, normalize } from 'normalizr';
import { createSelector } from 'reselect';
import _ from 'lodash';

import { placeSchema, reviewSchema } from '../api/reviews';
import {
  PLACES, ADD_REVIEW, UPDATE_REVIEW, CATEGORIES,
} from '../constants/reviews';
import { LOGOUT } from '../constants/auth';

const getEntities = state => state.entities;
const getUsers = state => state.entities.users;
const getReview = (state, id) => state.entities.reviews[id];
export const getReviews = state => state.entities.reviews;
export const getPlaces = state => state.entities.places;
const getPlace = (state, id) => state.entities.places[id];

export const selectFullPlace = () => createSelector(
  [getPlace, getEntities],
  (place, entities) => denormalize(place, placeSchema, entities),
);

export const selectThumbnail = () => createSelector(
  [getPlace, getUsers, getReviews],
  (place, users, reviews) => users[reviews[place.reviews[0]].created_by].picture,
);

export const selectReview = () => createSelector(
  [getReview, getEntities],
  (review, entities) => denormalize(review, reviewSchema, entities),
);

export const selectUser = userId => createSelector(
  [getUsers],
  users => users[userId],
);

function handleAddEditReview(action) {
  const { place, ...review } = action.payload.params;

  const newPlace = {
    ...place,
    reviews: [{
      ...review,
      place: place.id,
      toSync: true,
      partial: true,
    }],
  };

  const {
    entities: { places, reviews }, result,
  } = normalize(newPlace, action.payload.schema);

  return {
    places,
    reviews,
    result,
  };
}

const initialState = {
  places: {},
  reviews: {},
  categories: {},
  users: {},
};

const entitiesReducer = (state = initialState, action) => {
  switch (action.type) {
    case `${PLACES}_SUCCESS`:
      return {
        ...state,
        places: { ...state.places, ...action.payload.entities.places },
        reviews: { ...state.reviews, ...action.payload.entities.reviews },
        categories: { ...state.categories, ...action.payload.entities.categories },
        users: { ...state.users, ...action.payload.entities.users },
      };
    case `${CATEGORIES}_SUCCESS`:
      return {
        ...state,
        categories: {
          ...state.categories,
          ...action.payload.entities.categories,
        },
      };
    case `${UPDATE_REVIEW}_REQUEST`: {
      const { reviews } = handleAddEditReview(action);

      return {
        ...state,
        reviews: {
          ...state.reviews,
          ...reviews,
        },
      };
    }
    case `${ADD_REVIEW}_SUCCESS`: {
      const { entities: { places }, result } = action.payload;
      const { place, ...review } = places[result];

      const updatedReview = {};
      updatedReview[result] = {
        ...state.reviews[result],
        ...review,
        toSync: false,
        partial: false,
      };

      const updatedPlace = {};
      updatedPlace[place.id] = {
        ...state.places[place.id],
        ...place,
      };

      return {
        ...state,
        places: {
          ...state.places,
          ...updatedPlace,
        },
        reviews: {
          ...state.reviews,
          ...updatedReview,
        },
      };
    }
    case `${ADD_REVIEW}_REQUEST`: {
      const { places, reviews, result } = handleAddEditReview(action);
      const { ...placeToUpdate } = state.places[result];
      const newPlaces = {};

      newPlaces[result] = {
        ...places[result],
        reviews: _.concat(places[result].reviews, placeToUpdate.reviews || []),
      };

      return {
        ...state,
        places: {
          ...state.places,
          ...newPlaces,
        },
        reviews: {
          ...state.reviews,
          ...reviews,
        },
      };
    }
    case `${LOGOUT}_REQUEST`:
      return initialState;
    default:
      return state;
  }
};

export default entitiesReducer;
