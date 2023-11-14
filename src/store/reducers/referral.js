import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../utils/utilities';

const initialState = {
    referral: {},
    client: {},
};

const referralSetReferral = (state, action) => {
    return updateObject(state, {
        referral: action.payload.referral})
}

const referralSetClient = (state, action) => {
    return updateObject(state, {
        client: action.payload.client})
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.REFERRAL_SET_REFERRAL: return referralSetReferral(state, action);
        case actionTypes.REFERRAL_SET_CLIENT: return referralSetClient(state, action);
        default: return state;
    }
};

export default reducer;