import * as actionTypes from './actionTypes';


//Set user to global state
export const userSetUser = (user) => {
    return {
        type: actionTypes.USER_SET_USER,
        payload: {user: user}
    }
}

//Set user hash
export const userSetHash = (hash) => {
    return {
        type: actionTypes.USER_SET_HASH,
        payload: {hash: hash}
    }
}

//Sets the variable to determine the users nav bar
export const userSetNavBar = (userType) => {
    return {
        type: actionTypes.USER_SET_NAVBAR,
        payload: {userType: userType}
    }
}

//Refereshes the navbar
export const userNavbarRefresh = (navbarRefresh) => {
    return {
        type: actionTypes.USER_NAVBAR_REFRESH,
        payload: {navbarRefresh: navbarRefresh}
    }
}

//Set email during sign up to auto fill sign up form.
export const userSetEmail = (email) => {
    return {
        type: actionTypes.USER_SET_EMAIL,
        payload: {email: email}
    }
}