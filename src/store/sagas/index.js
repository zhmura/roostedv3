//import { takeEvery, takeLatest, all } from "redux-saga/effects";
import { all } from "redux-saga/effects";

//import * as actionTypes from "../actions/actionTypes";

import {
   
} from './user';

export function* watchUser() {
    yield all([
       // takeEvery(actionTypes.USER_COMPLETE_ROOSTED_SIGNUP, userCompleteRoostedSignUpSaga),

    ]);
}