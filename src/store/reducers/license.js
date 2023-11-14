import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../utils/utilities';

const initialState = {
    license: {},
    licenseNumber: ''
};

const licenseSetLicense = (state, action) => {
    console.log(action.payload.license)
    return updateObject(state, {  
        license: action.payload.license})
}

const licenseSetLicenseNumber = (state, action) => {
    return updateObject(state, {
        licenseNumber: action.payload.licenseNumber})
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.LICENSE_SET_LICENSE: return licenseSetLicense(state, action);
        case actionTypes.LICENSE_SET_LICENSE_NUMBER: return licenseSetLicenseNumber(state, action);
        default: return state;
    }
};

export default reducer;