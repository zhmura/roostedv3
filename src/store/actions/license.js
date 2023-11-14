import * as actionTypes from './actionTypes';


//Set license to global state
export const licenseSetLicense = (license) => {
    return {
        type: actionTypes.LICENSE_SET_LICENSE,
        payload: {
            license: license,
        }
    }
}

//Set user to global state
export const licenseSetLicenseNumber = (licenseNumber) => {
    return {
        type: actionTypes.LICENSE_SET_LICENSE_NUMBER,
        payload: {
            licenseNumber: licenseNumber,
        }
    }
}
