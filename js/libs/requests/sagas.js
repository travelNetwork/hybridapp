import { NetInfo } from 'react-native';
import {
  take, all, call, fork, put, takeEvery, select, cancelled,
} from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';

import Api from './api';
import { REQUEST, API_CALL } from './constants';
import { connectionChange, fetchOfflineMode, apiCall } from './actions';

function* handleConnectivityChange(hasInternetAccess) {
  yield put(connectionChange(hasInternetAccess));
  const actionQueue = yield select(state => state.network.actionQueue);

  if (hasInternetAccess && actionQueue.length > 0) {
    // eslint-disable-next-line
    for (const action of actionQueue) {
      yield put(apiCall(action));
    }
  }
}

function createNetInfoConnectionChangeChannel() {
  return eventChannel((emit) => {
    NetInfo.isConnected.addEventListener('connectionChange', emit);
    return () => {
      NetInfo.isConnected.removeEventListener('connectionChange', emit);
    };
  });
}

function* initialNetInfo() {
  const channel = yield call(() => eventChannel((emit) => {
    NetInfo.getConnectionInfo().then(({ type }) => {
      emit((type !== 'none' && type !== 'unknown'));
    });
    return () => {};
  }));

  const isConnected = yield take(channel);
  yield fork(handleConnectivityChange, isConnected);
}

function* netInfoChangeSaga() {
  yield fork(initialNetInfo);

  const chan = yield call(createNetInfoConnectionChangeChannel);
  try {
    while (true) {
      const isConnected = yield take(chan);
      yield fork(handleConnectivityChange, isConnected);
    }
  } finally {
    if (yield cancelled()) {
      chan.close();
    }
  }
}

const requestApi = () => function* _requestApi(action) {
  const {
    method, path, params, data, schema, parser,
  } = action.payload;
  const { options } = action.payload;
  const { success, failure } = action.meta;

  try {
    const response = yield call(Api[method], path, {
      params, data, options, schema, parser,
    });
    yield put({ type: success, payload: response });
  } catch (error) {
    yield put({ type: failure, payload: error, error: true });
  }
};

function* apiGeneric(action) {
  const isConnected = yield select(state => state.network.isConnected);
  const apiAction = apiCall(action);

  if (isConnected) {
    yield put(apiAction);
    return;
  }
  yield put(fetchOfflineMode(apiAction));
}

const watchApiCall = api => function* _watchApiCall() {
  const requestRegex = new RegExp(REQUEST);
  const apiRegex = new RegExp(API_CALL);
  yield takeEvery(action => requestRegex.test(action.type), apiGeneric);
  yield takeEvery(action => apiRegex.test(action.type), requestApi(api));
};

export default function* requestsSaga() {
  yield all([
    fork(watchApiCall()),
    fork(netInfoChangeSaga),
  ]);
}
