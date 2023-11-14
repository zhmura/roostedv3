import React, { Suspense, useState, useEffect } from 'react';
import { renderRoutes } from 'react-router-config';
import PropTypes from 'prop-types';
import { makeStyles } from '@mui/styles';
import { LinearProgress } from '@mui/material';
import NavBar from './NavBar';
import TopBar from './TopBar';
import Spinner from '../../components/Spinner'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { getUser, usersByEmail } from "../../graphql/queries";
import { createUser} from "../../graphql/mutations";
import AuthHelper from './AuthHelper';

const useStyles = makeStyles((theme) => ({
  container: {
    minHeight: '100vh',
    display: 'flex',
    '@media all and (-ms-high-contrast:none)': {
      height: 0 // IE11 fix
    }
  },
  content: {
    paddingTop: 64,
    flexGrow: 1,
    maxWidth: '100%',
    overflowX: 'hidden',
    [theme.breakpoints.up('lg')]: {
      paddingLeft: 256
    },
    [theme.breakpoints.down('xs')]: {
      paddingTop: 56
    }
  }
}));

function Dashboard({ route, userSetUser, userSetNavBar, history, globalUser, navbarRefresh }) {
  const classes = useStyles();
  const [openNavBarMobile, setOpenNavBarMobile] = useState(false);
  const [loading, setLoading] = useState(false) 
  
  useEffect(() => {
    
    //Purpose: get the current logged in user from the dynamodb set it to a global variable
    //then set the screen the person should be on using their setup type. Set a global variable
    //that has setup or not to determine the navbar options to show.
    const userSetGlobalUser = async () => {
        try {
          setLoading(true)
          let currentUser = await Auth.currentAuthenticatedUser();
          console.log(currentUser)
          let foundUserByEmail = await API.graphql(graphqlOperation(usersByEmail, {email: currentUser.signInUserSession.idToken.payload.email})) 
          let dynamoUser = foundUserByEmail.data.usersByEmail.items[0] 
     
          //This is the most common scenario for users returning to the app and they were not added agents
          if(currentUser.signInUserSession.idToken.payload['cognito:groups'] === undefined || !currentUser.signInUserSession.idToken.payload['cognito:groups'].includes('users')) {
            //use rest API to modify
            let custom = { 
            headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
            body: {
                sub: currentUser.signInUserSession.idToken.payload.sub,
                group: 'users'
             }
            }
            const modifiedUser = await API.post(
              'roostedRestAPI', 
              '/users/add-to-group',
              custom 
            )
            console.log(modifiedUser) 
            await AuthHelper.refreshCurrentSession(currentUser.signInUserSession.refreshToken)
            currentUser = await Auth.currentAuthenticatedUser();

          } else if((dynamoUser !== null && dynamoUser !== undefined && dynamoUser.setupType === 'broker' && (currentUser.signInUserSession.idToken.payload['cognito:groups'] === undefined || !currentUser.signInUserSession.idToken.payload['cognito:groups'].includes('admins'))) ) {
            let custom = { 
              headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
              body: {
                  sub: currentUser.signInUserSession.idToken.payload.sub,
                  group: 'admins'
               }
              }
              const modifiedUser = await API.post(
                'roostedRestAPI', 
                '/users/add-to-group',
                custom 
              )
              console.log(modifiedUser) 
              await AuthHelper.refreshCurrentSession(currentUser.signInUserSession.refreshToken)  
              currentUser = await Auth.currentAuthenticatedUser();
          }

          foundUserByEmail = await API.graphql(graphqlOperation(usersByEmail, {email: currentUser.signInUserSession.idToken.payload.email})) 
          console.log(foundUserByEmail)
          dynamoUser = foundUserByEmail.data.usersByEmail.items[0]
          console.log(dynamoUser) 
   
          if(dynamoUser === null || dynamoUser === undefined || foundUserByEmail.data.usersByEmail.items.length === 0) {
            console.log('Setup - New User')
            //const currentUser = await Auth.currentAuthenticatedUser();
            const sub = currentUser.signInUserSession.idToken.payload.sub
            userSetNavBar('setup')
            let phone = null
            //if non-social login, we should have their phone number, so we can add it to the user on creation
            if(currentUser.signInUserSession.idToken.payload.phone_number !== undefined) {
              let originalPhone = currentUser.signInUserSession.idToken.payload.phone_number
              phone = originalPhone.slice(2,12)
            }

            let params = {}
            if(localStorage.getItem('setUpType') === '?=roosted') {
              params = {
                id: sub,
                email: currentUser.signInUserSession.idToken.payload.email,
                setupType: 'roosted',
                userPhone: phone,
                setupStatus: 'getLicenseInfo',
                userType: 'user',
                navBar: 'setup',
                userCognitoUsername: currentUser.username
              }
            } else if(localStorage.getItem('setUpType') === '?=partner') {
              params = {
                id: sub,
                email: currentUser.signInUserSession.idToken.payload.email,
                setupType: 'partner',
                userPhone: phone,
                setupStatus: 'getLicenseInfo',
                userType: 'user',
                navBar: 'setup',
                userCognitoUsername: currentUser.username
              }
            } else {
              params = {
                email: currentUser.signInUserSession.idToken.payload.email,
                id: sub,
                userPhone: phone,
                setupStatus: 'selectType',
                userCognitoUsername: currentUser.username
                //owner should be filled out automatically from graphql
              }
            }
            const { data } = await API.graphql(graphqlOperation(createUser, {input: params}))
            console.log(data.createUser)
            userSetUser(data.createUser)
            setLoading(false)
            if(localStorage.getItem('setUpType') === '?=roosted' || localStorage.getItem('setUpType') === '?=partner' ) {
              history.push('/setup/get-license-info')
            } else {
              history.push('/setup/select-type')
            }
          //this if for normal users that weren't a legacy user, an added agent, or a broker. If they are an admin it takes them right here.
          } else if((dynamoUser !== null && dynamoUser !== undefined && dynamoUser.setupType !== 'addedAgent' && dynamoUser.userType !== 'broker' && !dynamoUser.legacyUser) || 
                     dynamoUser.userType === 'admin' ||
                    (dynamoUser.legacyUser && dynamoUser.legacyUserCompleted)) {
            console.log('Existing User - Not Added Agent or Broker')
            //get the sub from cognito
            //const currentUser = await Auth.currentAuthenticatedUser();
            const sub = currentUser.signInUserSession.idToken.payload.sub
            console.log(sub)
            const fetchUser = await API.graphql(graphqlOperation(getUser, {id: sub})) 
            dynamoUser = fetchUser.data.getUser
            console.log(dynamoUser)
            userSetUser(dynamoUser)
            if(dynamoUser.setupStatus === 'selectType') {
              userSetNavBar('setup')
              setLoading(false)
              history.push('/setup/select-type')
            } else if(dynamoUser.setupStatus === 'getLicenseInfo') {
              userSetNavBar('setup')
              setLoading(false)
              history.push('/setup/get-license-info')
            } else if(dynamoUser.setupStatus === 'getPartnerInfo') {
              userSetNavBar('setup')
              setLoading(false)
              history.push('/setup/get-partner-info')
            } else if(dynamoUser.setupStatus === 'getPaymentInfo') {
              userSetNavBar('setup')
              setLoading(false)
              history.push('/setup/get-payment-info')
            } else if(dynamoUser.setupStatus === 'signPolicies') {
              userSetNavBar('setup')
              setLoading(false)
              history.push('/setup/sign-policies')
            } else if(dynamoUser.setupStatus === 'signICA') {
              userSetNavBar('setup')
              setLoading(false)
              history.push('/setup/sign-ica')
            } else if(dynamoUser.setupStatus === 'transferLicense' || dynamoUser.setupStatus === 'waitingOnRoosted') {
              userSetNavBar('setup')
              setLoading(false)
              history.push('/setup/transfer-license')
            } else if((dynamoUser.setupStatus === 'completed' && dynamoUser.navBar === 'partner')) {
              userSetNavBar('partner')
              setLoading(false)
            } else if(dynamoUser.setupStatus === 'completed' && dynamoUser.navBar === 'roosted') {
              userSetNavBar('roosted')
              setLoading(false)
            } else if(dynamoUser.setupStatus === 'completed' && dynamoUser.navBar === 'admin') {
              userSetNavBar('admin')
              setLoading(false)
            }

          //This is the case where we found an added partner agent **********************
          } else if(dynamoUser !== null && ((dynamoUser.setupType === 'addedAgent' && dynamoUser.legacyUserCompleted) || (dynamoUser.setupType === 'addedAgent' && (dynamoUser.legacyUser === null || dynamoUser.legacyUser === undefined || dynamoUser.legacyUser === false)))) {
            console.log('Added Agent')
            //if the user exist and we've already adjusted referrals and the dynamo table for an added agent and marked added agent completed (returning to finish setup)
            if(dynamoUser.addedAgentComplete) {
              console.log('Added Agent - Setup Completed')
              //const currentUser = await Auth.currentAuthenticatedUser();
              const sub = currentUser.signInUserSession.idToken.payload.sub
              console.log(sub)
              const fetchUser = await API.graphql(graphqlOperation(getUser, {id: sub})) 
              dynamoUser = fetchUser.data.getUser
              console.log(dynamoUser)
              userSetUser(dynamoUser)
              if(dynamoUser.setupStatus === 'completed') {
                userSetNavBar('partner')
                setLoading(false)
              } else if(dynamoUser.setupStatus === 'getPartnerInfo') {
                userSetNavBar('setup')
                setLoading(false)
                history.push('/setup/get-partner-info')
              } else if(dynamoUser.setupStatus === 'getLicenseInfo') {
                userSetNavBar('setup')
                setLoading(false)
                history.push('/setup/get-license-info')
              }

            } else {
              console.log('Added Agent - First Time')
              //If they agent has not logged in yet, this is where we swap their existing referral and licenses to a new cognito user
              //get the sub from cognito
              //const currentUser = await Auth.currentAuthenticatedUser();
              const sub = currentUser.signInUserSession.idToken.payload.sub
              const fetchUser = await API.graphql(graphqlOperation(getUser, {id: dynamoUser.id})) 
              console.log(fetchUser.data.getUser)
              //need to duplicate existing user with the sub as the id from
              const createUserParams = {
                id: sub,
                userPhone: dynamoUser.userPhone,
                setupStatus: 'getLicenseInfo',
                userCognitoUsername: currentUser.username,
                userFirstName: dynamoUser.userFirstName,
                userLastName: dynamoUser.userLastName,
                email: dynamoUser.email,
                setupType: 'addedAgent',
                userType: 'user',
                navBar: 'setup',
                addedAgentComplete: true
              }
              //owner: should be filled out automatically with graphql in the above params

              //use rest API to modify
              let custom = { 
                headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
                body: {
                    sub: sub,
                    referralId: fetchUser.data.getUser.userReferralsReceived.items.length > 0 ? fetchUser.data.getUser.userReferralsReceived.items[0].id : null,
                    currentDynamoId: dynamoUser.id
                }
              }
              const modifiedUser = await API.post(
                'roostedRestAPI', 
                '/users/modify-added-agent',
                custom 
              )
              console.log(modifiedUser) 
              console.log(createUserParams)
              const createdUser = await API.graphql(graphqlOperation(createUser, {input: createUserParams})) 
              userSetUser(createdUser.data.createUser)
              userSetNavBar('setup')
              setLoading(false)
              history.push('/setup/get-license-info')
            }
          //broker login **********************
          } else if(dynamoUser !== null && dynamoUser.userType === 'broker') {

            //if the user exist and we've already adjusted referrals and the dynamo table for an added agent
            if(dynamoUser.addedBrokerComplete) {
              console.log('Broroker - Setup Completed')
              //const currentUser = await Auth.currentAuthenticatedUser();
              const sub = currentUser.signInUserSession.idToken.payload.sub
              const fetchUser = await API.graphql(graphqlOperation(getUser, {id: sub})) 
              dynamoUser = fetchUser.data.getUser
              userSetUser(dynamoUser)
              userSetNavBar('admin')
              setLoading(false)

            } else {
              console.log('Broker - First Time')
              //get the sub from cognito
              //const currentUser = await Auth.currentAuthenticatedUser();
              const sub = currentUser.signInUserSession.idToken.payload.sub
              const fetchUser = await API.graphql(graphqlOperation(getUser, {id: dynamoUser.id})) 
              console.log(fetchUser)
              //need to duplicate existing user with the sub as the id from
              const createUserParams = {
                id: sub,
                userPhone: dynamoUser.userPhone,
                setupStatus: 'completed',
                userCognitoUsername: currentUser.username,
                userFirstName: dynamoUser.userFirstName,
                userLastName: dynamoUser.userLastName,
                email: dynamoUser.email,
                brokerState: dynamoUser.brokerState,
                setupType: 'roosted',
                userType: 'broker',
                navBar: 'admin',
                userAddress: {
                  street: dynamoUser.street,
                  unit: dynamoUser.unit === '' || dynamoUser.unit === null || dynamoUser.unit === undefined ? null : dynamoUser.unit,
                  city: dynamoUser.city,
                  state: dynamoUser.state,
                  zip: dynamoUser.zip
                },
                addedAgentComplete: true,
                addedBrokerComplete: true,
                //owner: should be filled out automatically with graphql
              }
              //use rest API to modify
              let custom = { 
                headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
                body: {
                    sub: sub,
                    licenseId: fetchUser.data.getUser.userRoostedLicenses.items.length > 0 ? fetchUser.data.getUser.userRoostedLicenses.items[0].id : null,
                    currentDynamoId: dynamoUser.id
                }
              }
              const modifiedUser = await API.post(
                'roostedRestAPI', 
                '/users/modify-added-broker',
                custom 
              )
              console.log(modifiedUser) 

              const createdUser = await API.graphql(graphqlOperation(createUser, {input: createUserParams})) 
              userSetUser(createdUser.data.createUser)
              userSetNavBar('admin')
              setLoading(false)
              }

          //this is for the first time sign in for legacy user. We assume the migration tool has created their account at this point
          } else if(dynamoUser !== null && dynamoUser.legacyUser && !dynamoUser.legacyUserCompleted) {
            console.log('Legacy User')
            //get the current dynamoDBUser using the dynamoDBId on the database
            const sub = currentUser.signInUserSession.idToken.payload.sub
            const fetchUser = await API.graphql(graphqlOperation(getUser, {id: dynamoUser.id})) 
            console.log(fetchUser.data.getUser)
            //need to duplicate existing user with the sub as the id from
            let createUserParams = {}
            if(dynamoUser.roostedAgent === null && Object.keys(dynamoUser.partnerAgent).length > 0) {
              console.log('partner')
              createUserParams ={
                id: sub,
                userFirstName: dynamoUser.userFirstName,
                userLastName: dynamoUser.userLastName,
                email: dynamoUser.email,
                userPhone: dynamoUser.userPhone,
                setupType: dynamoUser.setupType, 
                legacyUser: true,
                legacyUserCompleted: true,
                setupStatus: dynamoUser.setupStatus,
                navBar: dynamoUser.navBar,
                userType: dynamoUser.userType,
                userAddress: dynamoUser.userAddress,
                partnerAgent: dynamoUser.partnerAgent,
                createdAt: dynamoUser.createdAt,
                userCognitoUsername: currentUser.username
                //owner: should be filled out automatically with graphql
              }
            } else if(dynamoUser.partnerAgent === null && Object.keys(dynamoUser.roostedAgent).length > 0) {
              console.log('roosted')
              createUserParams ={
                id: sub,
                userFirstName: dynamoUser.userFirstName,
                userLastName: dynamoUser.userLastName,
                email: dynamoUser.email,
                userPhone: dynamoUser.userPhone,
                setupType: dynamoUser.setupType, 
                legacyUser: true,
                legacyUserCompleted: true,
                setupStatus: dynamoUser.setupStatus,
                navBar: dynamoUser.navBar,
                userType: dynamoUser.userType,
                userAddress: dynamoUser.userAddress,
                roostedAgent: dynamoUser.roostedAgent,
                createdAt: dynamoUser.createdAt,
                userCognitoUsername: currentUser.username
                //owner: should be filled out automatically with graphql
              }
            } else {
              console.log('combined')
              createUserParams ={
                id: sub,
                userFirstName: dynamoUser.userFirstName,
                userLastName: dynamoUser.userLastName,
                email: dynamoUser.email,
                userPhone: dynamoUser.userPhone,
                setupType: dynamoUser.setupType, 
                legacyUser: true,
                legacyUserCompleted: true,
                setupStatus: dynamoUser.setupStatus,
                navBar: dynamoUser.navBar,
                userType: dynamoUser.userType,
                userAddress: dynamoUser.userAddress,
                createdAt: dynamoUser.createdAt,
                userCognitoUsername: currentUser.username
                //owner: should be filled out automatically with graphql
              }
            }
            //use rest API to modify
            let custom = { 
              headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
              body: {
                  sub: sub,
                  roostedLicenses: fetchUser.data.getUser.userRoostedLicenses.items,
                  partnerLicenses: fetchUser.data.getUser.userPartnerLicenses.items,
                  referralsReceived: fetchUser.data.getUser.userReferralsReceived.items,
                  referralsCreated: fetchUser.data.getUser.userReferralsCreated.items,
                  currentDynamoId: dynamoUser.id
              }
            }
            const modifiedUser = await API.post(
              'roostedRestAPI', 
              '/users/modify-legacy-user',
              custom 
            )
            console.log(modifiedUser) 

            const createdUser = await API.graphql(graphqlOperation(createUser, {input: createUserParams})) 
            userSetUser(createdUser.data.createUser)
            userSetNavBar(dynamoUser.setupStatus === 'completed' ? dynamoUser.setupType === 'roosted' ? 'roosted' : 'partner' : 'setup')
            setLoading(false)
            if(createdUser.data.createUser.setupStatus === 'selectType') {
              userSetNavBar('setup')
              setLoading(false)
              history.push('/setup/select-type')
            } else if(createdUser.data.createUser.setupStatus === 'getLicenseInfo') {
              userSetNavBar('setup')
              setLoading(false)
              history.push('/setup/get-license-info')
            } else if(createdUser.data.createUser.setupStatus === 'getPartnerInfo') {
              userSetNavBar('setup')
              setLoading(false)
              history.push('/setup/get-partner-info')
            } else if(createdUser.data.createUser.setupStatus === 'getPaymentInfo') {
              userSetNavBar('setup')
              setLoading(false)
              history.push('/setup/get-payment-info')
            } else if(createdUser.data.createUser.setupStatus === 'signPolicies') {
              userSetNavBar('setup')
              setLoading(false)
              history.push('/setup/sign-policies')
            } else if(createdUser.data.createUser.setupStatus === 'signICA') {
              userSetNavBar('setup')
              setLoading(false)
              history.push('/setup/sign-ica')
            } else if(createdUser.data.createUser.setupStatus === 'transferLicense' || createdUser.data.createUser.setupStatus === 'waitingOnRoosted') {
              userSetNavBar('setup')
              setLoading(false)
              history.push('/setup/transfer-license')
            } else if((createdUser.data.createUser.setupStatus === 'completed' && createdUser.data.createUser.navBar === 'partner')) {
              userSetNavBar('partner')
              setLoading(false)
            } else if(createdUser.data.createUser.setupStatus === 'completed' && createdUser.data.createUser.navBar === 'roosted') {
              userSetNavBar('roosted')
              setLoading(false)
            } else if(createdUser.data.createUser.setupStatus === 'completed' && createdUser.data.createUser.navBar === 'admin') {
              userSetNavBar('admin')
              setLoading(false)
            }
          }
          
        } catch(error) {
          setLoading(false)
          console.log(error)
        }
      } 
      userSetGlobalUser();
  // eslint-disable-next-line
  },[navbarRefresh])

  return (
    <>
      {loading ? <Spinner /> :
      <>
        <TopBar onOpenNavBarMobile={() => setOpenNavBarMobile(true)} />
        <NavBar
          onMobileClose={() => setOpenNavBarMobile(false)}
          openMobile={openNavBarMobile}
          globalUser={globalUser}
          //userProp={userProp}
        />
        <div className={classes.container}>
          <div className={classes.content}>
            <Suspense fallback={<LinearProgress />}>
              {renderRoutes(route.routes)}
            </Suspense>
          </div>
        </div> 
      </>}
    </>
  );
}

Dashboard.propTypes = {
  route: PropTypes.object
};

const mapStateToProps = state => {
  return {
      globalUser: state.user.userGlobal,
      navbarRefresh: state.user.navbarRefresh,
  };
};

const mapDispatchToProps = dispatch => {
  return {
      userSetUser: (user) => dispatch(actions.userSetUser(user)),
      userSetNavBar: (userType) => dispatch(actions.userSetNavBar(userType)),
      userNavbarRefresh: (navbarRefresh) => dispatch(actions.userNavbarRefresh(navbarRefresh))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
