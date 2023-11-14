import * as actionTypes from './actionTypes';


//Set parts of a buyer or seller referral to global state as a referral is built
export const referralSetReferral = (referral) => {
    return {
        type: actionTypes.REFERRAL_SET_REFERRAL,
        payload: {
            referral: referral,
        }
    }
}

//Set user to global state
export const referralSetClient = (client) => {
    return {
        type: actionTypes.REFERRAL_SET_CLIENT,
        payload: {
            client: client
        }
    }
}