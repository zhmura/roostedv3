// import { put } from "redux-saga/effects";
// import axios from "../../axios";
// import * as actions from "../actions/index";
// import axiosNoBase from 'axios';
// import runtimeEnv from '@mars/heroku-js-runtime-env';

// import moment from 'moment';

//Google Analytics Import
// import ReactGA from 'react-ga';

// const env = runtimeEnv();

//INITIALIZE REACT GA
//ReactGA.initialize(process.env.REACT_APP_GA_MEASUREMENT_ID);
//ReactGA.initialize('UA-138319245-1');

//Get user from DB
// export function* userGetUserSaga(action) {

//     const token = action.payload.token;
//     //const user = action.payload.user;

//         try {
//             yield put(actions.processStartLoading());
//             const response = yield axios.post(
//                 '/user/get-user', 
//                 {data: 'data'},
//                 {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}});
//             if(response.status === 200) {
                  
//                 yield put(actions.userSetUser(response.data.user));
//                 //handleRedirect();
//                 yield put(actions.processStopLoading());
//             } else {
        
//                 yield put(actions.processStopLoading());
//             }
//         }
//         catch(error) {
//             console.log(error);
//             yield put(actions.processStopLoading());
//         }
// }

//save user edits to profile
// export function* userSaveUserEditsSaga(action) {
//     const userData = action.payload.userData;
//     const setUserData = action.payload.setUserData;
//     const token = action.payload.token;
//         try {
//             setUserData.setSpinnerLoading(true);
//             const response = yield axios.post(
//                 '/user/edit-user', 
//                 {userData},
//                 {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}});
//             if(response.status === 200) {
//                 //console.log(response.data.user);  
//                 yield put(actions.userSetUser(response.data.user));
//                 setUserData.handleSnackbarOpen('Information Updated!', 'success');
//                 setUserData.setSpinnerLoading(false);
//             } else {
//                 console.log(response.data.message)
//                 setUserData.handleSnackbarOpen('Error Updating Information!');
//                 setUserData.setSpinnerLoading(false);
//             }
//         }
//         catch(error) {
//             console.log(error);
//             setUserData.handleSnackbarOpen('Error Updating Information!');
//             setUserData.setSpinnerLoading(false);
//         }
// }

//save new license
// export function* userSaveLicenseSaga(action) {
//     const token = action.payload.token;
//     const dataCollected = action.payload.dataCollected;
//     const licenseType = action.payload.licenseType;
//     const setDataCollected = action.payload.setDataCollected;
//     const mongoDBUser = action.payload.mongoDBUser

//         try {
//             yield put(actions.processStartLoading());
//             const response = yield axios.post(
//                 '/user/save-license', 
//                 {dataCollected: dataCollected, licenseType: licenseType, mongoDBUser},
//                 {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}});
//             if(response.status === 200) {
//                 //console.log(response.data.user);  
//                 setDataCollected.setLicense(response.data.addedLicense);
//                 setDataCollected.setRoostedLicenseNumber('');
//                 setDataCollected.setRoostedLicenseState('AL');
//                 setDataCollected.setRoostedPrimaryLicense(true);
//                 setDataCollected.setRoostedLicenseExpiration(moment(new Date()).format('YYYY-MM-DD'));
//                 setDataCollected.setPartnerLicenseNumber('');
//                 setDataCollected.setPartnerLicenseState('AL');
//                 setDataCollected.setPartnerPrimaryLicense(true);
//                 setDataCollected.setPartnerLicenseExpiration(moment(new Date()).format('YYYY-MM-DD'));
//                 setDataCollected.setPartnerZip('');
//                 setDataCollected.setPartnerRadius('10');
//                 setDataCollected.setPartnerLowPrice('100,000');
//                 setDataCollected.setPartnerHighPrice('200,000');
//                 setDataCollected.setPartnerBroker('');
//                 setDataCollected.setShowRoostedEditCard(false);
//                 setDataCollected.setShowPartnerEditCard(false);
//                 setDataCollected.setShowPartnerAddCard(false);
//                 setDataCollected.setShowRoostedAddCard(false);  
//                 setDataCollected.handleSnackbarOpen('License Added!', 'success');
//                 yield put(actions.processStopLoading());
//             } else {
//                 console.log(response.data.message)
//                 setDataCollected.handleSnackbarOpen('Error Adding License!');
//                 yield put(actions.processStopLoading());
//             }
//         }
//         catch(error) {
//             console.log(error);
//             setDataCollected.handleSnackbarOpen('Error Adding License!');
//             yield put(actions.processStopLoading());
//         }
// }

//save license edits - changed for new license
// export function* userSaveLicenseEditsSaga(action) {
//     const token = action.payload.token;
//     const dataCollected = action.payload.dataCollected;
//     const setDataCollected = action.payload.setDataCollected;
//     const licenseType = action.payload.licenseType;
//     const license = action.payload.license;
//         try {
//             yield put(actions.processStartLoading());
//             const response = yield axios.post(
//                 '/user/save-license-edits', 
//                 {dataCollected: dataCollected, license: license, licenseType: licenseType},
//                 {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}});
//             if(response.status === 200) {
//                 console.log(response.data.updatedLicense);
//                 setDataCollected.setLicense(response.data.updatedLicense)
//                 setDataCollected.setRoostedLicenseNumber('');
//                 setDataCollected.setRoostedLicenseState('AL');
//                 setDataCollected.setRoostedPrimaryLicense(true);
//                 setDataCollected.setRoostedLicenseExpiration(moment(new Date()).format('YYYY-MM-DD'));
//                 setDataCollected.setPartnerLicenseNumber('');
//                 setDataCollected.setPartnerLicenseState('AL');
//                 setDataCollected.setPartnerPrimaryLicense(true);
//                 setDataCollected.setPartnerLicenseExpiration(moment(new Date()).format('YYYY-MM-DD'));
//                 setDataCollected.setPartnerZip('');
//                 setDataCollected.setPartnerRadius('10');
//                 setDataCollected.setPartnerLowPrice('100,000');
//                 setDataCollected.setPartnerHighPrice('200,000');
//                 setDataCollected.setPartnerBroker('');
//                 setDataCollected.setShowRoostedEditCard(false);
//                 setDataCollected.setShowPartnerEditCard(false);
//                 setDataCollected.setShowPartnerAddCard(false);  
//                 setDataCollected.setShowRoostedAddCard(false);  
//                 setDataCollected.setShowPPManual(false);
//                 setDataCollected.setShowICA(false)
//                 setDataCollected.handleSnackbarOpen('License Updated!', 'success');
//                 yield put(actions.processStopLoading());
//             } else {
//                 console.log(response.data.message)
//                 setDataCollected.handleSnackbarOpen('Error Updating License!');
//                 yield put(actions.processStopLoading());
//             }
//         }
//         catch(error) {
//             console.log(error);
//             setDataCollected.handleSnackbarOpen('Error Updating License!');
//             yield put(actions.processStopLoading());
//         }
// }

//delete license - changed for new license
// export function* userDeleteLicenseSaga(action) {
//     const token = action.payload.token;
//     const dataCollected = action.payload.dataCollected;
//     const setDataCollected = action.payload.setDataCollected;
//     const licenseType = action.payload.licenseType;
//     const license = action.payload.license;
//     const handleWarningDialogClose = action.payload.handleWarningDialogClose;

//         try {
//             yield put(actions.processStartLoading());
//             const response = yield axios.post(
//                 '/user/delete-license', 
//                 {dataCollected: dataCollected, licenseType: licenseType, license: license},
//                 {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}});
//             if(response.status === 200) {
//                 setDataCollected.setLicense({});
//                 setDataCollected.setRoostedLicenseNumber('');
//                 setDataCollected.setRoostedLicenseState('AL');
//                 setDataCollected.setRoostedPrimaryLicense(true);
//                 setDataCollected.setRoostedLicenseExpiration(moment(new Date()).format('YYYY-MM-DD'));
//                 setDataCollected.setPartnerLicenseNumber('');
//                 setDataCollected.setPartnerLicenseState('AL');
//                 setDataCollected.setPartnerPrimaryLicense(true);
//                 setDataCollected.setPartnerLicenseExpiration(moment(new Date()).format('YYYY-MM-DD'));
//                 setDataCollected.setPartnerZip('');
//                 setDataCollected.setPartnerRadius('10');
//                 setDataCollected.setPartnerLowPrice('100,000');
//                 setDataCollected.setPartnerHighPrice('200,000');
//                 setDataCollected.setPartnerBroker('');
//                 setDataCollected.setShowRoostedEditCard(false);
//                 setDataCollected.setShowPartnerEditCard(false);
//                 setDataCollected.setShowPartnerAddCard(false);  
//                 setDataCollected.setShowRoostedAddCard(false);  
//                 setDataCollected.handleSnackbarOpen(`${license.licenseState} License Deleted!`, 'success');
//                 handleWarningDialogClose();
//                 yield put(actions.processStopLoading());
//             } else {
//                 console.log(response.data.message)
//                 setDataCollected.handleSnackbarOpen('Error Deleting License!');
//                 yield put(actions.processStopLoading());
//             }
//         }
//         catch(error) {
//             console.log(error);
//             setDataCollected.handleSnackbarOpen('Error Updating License!');
//             yield put(actions.processStopLoading());
//         }
// }

//change user setup step
// export function* userChangeSetupStepSaga(action) {

//     const token = action.payload.token;
//     const step = action.payload.step;
//     const dataCollected = action.payload.dataCollected;
//     const setDataCollected = action.payload.setDataCollected;
//     const mongoDBUser = action.payload.mongoDBUser;
//     const stripeToken = action.payload.stripeToken;
//     const user = action.payload.user;
//     const signature = action.payload.signature
//         try {
//             yield put(actions.processStartLoading());
//             let response;
//             if(step !== 'contractorAgreement' && step !== 'transfer') {
//                 response = yield axios.post(
//                 '/user/setup-step-change', 
//                 {step: step, dataCollected: dataCollected, mongoDBUser: mongoDBUser, stripeToken: stripeToken},
//                 {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}});
//                 if(response.status === 200) {
//                    yield put(actions.userSetUser(response.data.updatedUser));
//                 } else {
//                     setDataCollected.handleSnackbarOpen('Failed to Complete Step. Try Again', 'error');
//                 }
//             } else  {
//                 const signatureResponse = yield axios.post(
//                     '/user/save-user-signature', 
//                     {mongoDBUser: mongoDBUser, signature: signature, signatureType: 'roostedAgent'},
//                     {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}});
//                     console.log(signatureResponse.status)
//                 if(signatureResponse.status === 200) {
//                     response = yield axios.post(
//                     '/user/setup-step-change', 
//                     {step: step, dataCollected: dataCollected, mongoDBUser: mongoDBUser, stripeToken: stripeToken, signature: signature, userAuth0User: user},
//                     {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}});
//                     yield put(actions.userSetUser(response.data.updatedUser));
//                 } else {
//                     setDataCollected.handleSnackbarOpen('Failed to save signature. Please try again or contact support@roosted.io.', 'error');
//                     yield put(actions.processStopLoading());
//                 }
//             }
//             if(response.status === 200) {
//                 if(step === 'license') {
//                     setDataCollected.setStep('license');
//                     if(process.env.NODE_ENV === 'production' && env.REACT_APP_PROD === 'true') {
//                         if(mongoDBUser.setupType === 'roosted') {
//                             ReactGA.event({
//                                 category: 'User Sign Up Funnel',
//                                 action: 'Clicked to License Form',
//                                 label: 'Roosted'
//                             })
//                         } else if(mongoDBUser.setupType === 'partner') {
//                             ReactGA.event({
//                                 category: 'User Sign Up Funnel',
//                                 action: 'Clicked to License Form',
//                                 label: 'Partner'
//                             })
//                         }
//                     }
//                 } else if(step === 'partnerInfo') {
//                     setDataCollected.setStep('partnerInfo')
//                     if(process.env.NODE_ENV === 'production' && env.REACT_APP_PROD === 'true') {
//                         ReactGA.event({
//                             category: 'User Sign Up Funnel',
//                             action: 'Clicked to Partner Info Form',
//                             label: 'Partner'
//                         })
//                     }
//                 } else if(step === 'payment') {
//                     setDataCollected.setStep('payment')
//                     if(process.env.NODE_ENV === 'production' && env.REACT_APP_PROD === 'true') {
//                         ReactGA.event({
//                             category: 'User Sign Up Funnel',
//                             action: 'Clicked to Payment Info Form',
//                             label: 'Roosted'
//                         })
//                     }
//                 } else if(step === 'policies') {
//                     setDataCollected.setStep('policies')
//                     if(process.env.NODE_ENV === 'production' && env.REACT_APP_PROD === 'true') {
//                         ReactGA.event({
//                             category: 'User Sign Up Funnel',
//                             action: 'Clicked to To Policies and Procedures',
//                             label: 'Roosted'
//                         })
//                     }
//                 } else if(step === 'completed') {
//                     const auth0Body = new URLSearchParams();
//                     auth0Body.append('grant_type', 'client_credentials');
//                     auth0Body.append('client_id', env.REACT_APP_AUTH0_MACHINE_CLIENT_ID); //must be machine to machine app client ID
//                     auth0Body.append('client_secret', env.REACT_APP_AUTH0_MACHINE_CLIENT_SECRET); //must be machine to machine app client secret
//                     auth0Body.append('audience', env.REACT_APP_API_URL);
//                     const apiAccessToken = yield axiosNoBase.post(`https://${env.REACT_APP_DOMAIN}/oauth/token`, 
//                         auth0Body,
//                         {headers: {'content-type': 'application/x-www-form-urlencoded'}})
//                     const auth0Response = yield axiosNoBase.patch(`${env.REACT_APP_API_URL}users/${user.sub}`,
//                         {
//                         user_metadata: {
//                             roles: 'user'
//                         }
//                         }, 
//                         {headers: {authorization: `Bearer ${apiAccessToken.data.access_token}`}});
//                         if(auth0Response.status === 200) {
//                             yield put(actions.processSetupCompleted());
//                             //setDataCollected.setStep('completed')
//                             setDataCollected.handleRedirect();
//                             if(process.env.NODE_ENV === 'production' && env.REACT_APP_PROD === 'true') {
//                                 ReactGA.event({
//                                     category: 'User Sign Up Funnel',
//                                     action: 'Partner Completed Sign Up',
//                                     label: 'Partner'
//                                 })
//                             }
//                         } else {
//                             setDataCollected.handleSnackbarOpen('Failed to save user', 'error');
//                         }
//                 } else if(step === 'contractorAgreement') {
//                     setDataCollected.setStep('contractorAgreement');
//                     if(process.env.NODE_ENV === 'production' && env.REACT_APP_PROD === 'true') {
//                         ReactGA.event({
//                             category: 'User Sign Up Funnel',
//                             action: 'Clicked to To Contractor Agreement',
//                             label: 'Roosted'
//                         })
//                     }
//                 } else if(step === 'transfer') {
//                     setDataCollected.setStep('transfer');
//                     if(process.env.NODE_ENV === 'production' && env.REACT_APP_PROD === 'true') {
//                         ReactGA.event({
//                             category: 'User Sign Up Funnel',
//                             action: 'Clicked to To Transfer License Page',
//                             label: 'Roosted'
//                         })
//                     }
//                 } else if(step === 'verify') {
//                     setDataCollected.handleSnackbarOpen('Notification Sent! You\'ll receive an email when your account is activated', 'success')
//                     if(process.env.NODE_ENV === 'production' && env.REACT_APP_PROD === 'true') {
//                         ReactGA.event({
//                             category: 'User Sign Up Funnel',
//                             action: 'Clicked to To Request Verification',
//                             label: 'Roosted'
//                         })
//                     }
//                 }
//                 console.log(response.data.updatedUser);  

//                 yield put(actions.processStopLoading());
//             } else {
//                 console.log(response.data.message)
//                 setDataCollected.handleSnackbarOpen('Failed to save user data', 'error');
//                 yield put(actions.processStopLoading());
//             }
//         }
//         catch(error) {
//             console.log(error);
//             setDataCollected.handleSnackbarOpen('Failed to save user data. Please try again or contact support@roosted.io.', 'error');
//             yield put(actions.processStopLoading());
//         }
// }

//change user's stripe plan
// export function* userStripePlanChangeSaga(action) {

//     const token = action.payload.token;
//     const dataCollected = action.payload.dataCollected;
//     const setDataCollected = action.payload.setDataCollected;
//     const mongoDBUser = action.payload.mongoDBUser;
//     const canceled = action.payload.canceled;
//     const signature = action.payload.signature;

//         try {
//             yield put(actions.processStartLoading());

//             if(canceled === null) {
//                 if(dataCollected.resign) {
//                     const signatureResponse = yield axios.post(
//                         '/user/save-user-signature', 
//                         {mongoDBUser: mongoDBUser, signature: signature, signatureType: 'roostedAgent'},
//                         {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}});
//                     if(signatureResponse.status === 200) {
//                         const signResponse = yield axios.post(
//                         '/user/sign-agreement', 
//                         {dataCollected: dataCollected, mongoDBUser: mongoDBUser},
//                         {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}});
//                         if(signResponse.status === 200) {
//                             const response = yield axios.post(
//                                 '/user/change-stripe-plan', 
//                                 {dataCollected: dataCollected, mongoDBUser: mongoDBUser, canceled: canceled},
//                                 {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}});
//                             if(response.status === 200) {
//                                 yield put(actions.userSetUser(response.data.updatedUser));
//                                 setDataCollected.setChangePlan(false);
//                                 setDataCollected.handleSnackbarOpen('Plan Changed!', 'success');
//                                 yield put(actions.processStopLoading());
//                             } else {
//                                 setDataCollected.handleSnackbarOpen('Failed to change plan', 'error');
//                                 yield put(actions.processStopLoading());
//                             }
//                         }
//                     } else {
//                         setDataCollected.handleSnackbarOpen('Failed to save signature', 'error');
//                         yield put(actions.processStopLoading());
//                     }
//                 } else {
//                     const response = yield axios.post(
//                         '/user/change-stripe-plan', 
//                         {dataCollected: dataCollected, mongoDBUser: mongoDBUser, canceled: canceled},
//                         {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}});
//                     if(response.status === 200) {
//                         yield put(actions.userSetUser(response.data.updatedUser));
//                         setDataCollected.setChangePlan(false);
//                         setDataCollected.handleSnackbarOpen('Plan Changed! Now Add a License To Use It.', 'success');
//                         yield put(actions.processStopLoading());
//                     } else {
//                         setDataCollected.handleSnackbarOpen('Failed to change plan', 'error');
//                         yield put(actions.processStopLoading());
//                     }
//                 }
//             } else {
//                 const response = yield axios.post(
//                     '/user/change-stripe-plan', 
//                     {dataCollected: dataCollected, mongoDBUser: mongoDBUser, canceled: canceled},
//                     {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}});
//                 if(response.status === 200) {
//                     yield put(actions.userSetUser(response.data.updatedUser));
//                     setDataCollected.setChangePlan(false);
//                     setDataCollected.handleSnackbarOpen('Plan Canceled');
//                     yield put(actions.processStopLoading());
//                 }

//             }
//         }
//         catch(error) {
//             console.log(error);
//             setDataCollected.handleSnackbarOpen('Failed to Save Plan. Try Hitting Accept Again.', 'error');
//             yield put(actions.processStopLoading());
//         }
// }

//sign new agreements through the license adding part of the system
// export function* userSignAgreementSaga(action) {

//     const token = action.payload.token;
//     const dataCollected = action.payload.dataCollected;
//     const setDataCollected = action.payload.setDataCollected;
//     const mongoDBUser = action.payload.mongoDBUser;
//     const whichAgreement = action.payload.whichAgreement;
//     const signature = action.payload.signature;

//         try {
//             yield put(actions.processStartLoading());
//             const signatureResponse = yield axios.post(
//                 '/user/save-user-signature', 
//                 {mongoDBUser: mongoDBUser, signature: signature, signatureType: 'roostedAgent'},
//                 {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}});
//             if(signatureResponse.status === 200) {
//                 const signResponse = yield axios.post(
//                 '/user/sign-agreement-by-type', 
//                 {dataCollected: dataCollected, mongoDBUser: mongoDBUser, whichAgreement: whichAgreement},
//                 {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}});
//                 if(signResponse.status === 200) {
//                     if(whichAgreement === 'policiesAndProcedures') {
//                         setDataCollected.handleSnackbarOpen('Agreement Signed One More to Go!', 'success');
//                         //yield put(actions.userSetUser(signResponse.data.updatedUser));
//                         setDataCollected.setPathPPM(signResponse.data.pathPPM);
//                         yield put(actions.processStopLoading());
//                         setDataCollected.setShowPPManual(false);
//                         setDataCollected.setShowICA(true);
//                     } else if(whichAgreement === 'independentContractor') {
//                         setDataCollected.handleSnackbarOpen('License Added. We\'ll let you know when it is verified!', 'success');
//                         yield put(actions.userSetUser(signResponse.data.updatedUser));
//                         setDataCollected.setShowPPManual(false);
//                         setDataCollected.setShowICA(false);
//                         yield put(actions.processStopLoading());
//                     }
//                 } else {
//                     setDataCollected.handleSnackbarOpen('Failed to Sign Agreement', 'error');
//                     yield put(actions.processStopLoading());
//                 }
//             } else {
//                 setDataCollected.handleSnackbarOpen('Failed to Save Signature');
//                 yield put(actions.processStopLoading());
//             }
//         }
//         catch(error) {
//             console.log(error);
//             setDataCollected.handleSnackbarOpen('Failed to Add License', 'error');
//             yield put(actions.processStopLoading());
//         }
// }
