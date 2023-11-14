import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../utils/utilities';

const initialState = {
    userGlobal: {},
    userHash: '',
    // userNavBar: 'setup', //setup, roosted, partner, admin, broker, roostedPartner
    userNavBar: 'partner', //setup, roosted, partner, admin, broker, roostedPartner
    navbarRefresh: true,
    userEmail: ''
};

const userSetUser = (state, action) => {
    return updateObject(state, {
        userGlobal: action.payload.user})
}

const userSetHash = (state, action) => {
    return updateObject(state, {
        userHash: action.payload.hash})
}

const userSetNavBar = (state, action) => {
    return updateObject(state, {
        userNavBar: action.payload.userType})
}

const userNavbarRefresh = (state, action) => {
    return updateObject(state, {
        navbarRefresh: !action.payload.navbarRefresh})
}

const userSetEmail = (state, action) => {
    return updateObject(state, {
        userEmail: action.payload.email})
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.USER_SET_USER: return userSetUser(state, action);
        case actionTypes.USER_SET_HASH: return userSetHash(state, action);
        case actionTypes.USER_SET_NAVBAR: return userSetNavBar(state, action);
        case actionTypes.USER_NAVBAR_REFRESH: return userNavbarRefresh(state, action);
        case actionTypes.USER_SET_EMAIL: return userSetEmail(state, action);
        default: return state;
    }
};

export default reducer;