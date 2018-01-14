import { all, fork, takeLatest, put, call, take, select } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';

import {
  FETCH_FRIENDS_SUCCESS,
  FETCH_FRIENDSINCOMING_SUCCESS,
  FETCH_FRIENDSOUTGOING_SUCCESS
} from '../constants/friends';
import { RUN_SAGAS, STOP_SAGAS } from '../constants/utils';

import { fetchFriends, fetchIncomingRequests, fetchOutgoingRequests } from '../api/friends';

export function * friendsFlow() {
  yield put(fetchFriends());
  yield put(fetchIncomingRequests());
  yield put(fetchOutgoingRequests());
}

export default function * root() {
  yield takeLatest(RUN_SAGAS, friendsFlow);
}
