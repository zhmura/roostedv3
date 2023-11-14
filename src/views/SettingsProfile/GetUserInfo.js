import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import {
  Card,
  Grid,
  CardContent,
  TextField,
  Button,
  Typography,
  LinearProgress
} from '@mui/material';
import { useForm, Controller } from "react-hook-form";
import { NumberFormatBase  } from 'react-number-format';
import { getStatesByAgentType } from '../../utils/utilities'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/DeleteForever';

import WarningDialog from './WarningDialog'

//import { CognitoUserPool } from 'amazon-cognito-identity-js';  

import { formatPhoneNumberToString, formatPhoneNumber } from '../../utils/utilities'
import ChangePasswordCard from './ChangePasswordCard'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { updateUser, deleteUser, deleteRoostedLicense, deletePartnerLicense, updateReferral } from "../../graphql/mutations"
import { listReferrals } from "../../graphql/queries"

const useStyles = makeStyles((theme) => ({
  root: {},
  actions: {
    marginTop: theme.spacing(3),
  },
  buttons: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  divider: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2)
  },
  deleteButton: {
    margin: theme.spacing(2),
    backgroundColor: "#FF0000",
    color: '#FFFFFF'
  },
}));



function GetUserInfo(
  { 
    className, 
    globalUser, 
    userSetUser,
    setSeverity,
    history, 
    setErrorMessage,
    setOpen,
     ...rest }) {
  const classes = useStyles();
  const { control, handleSubmit, errors } = useForm();

  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState({})
  // const [cognitoUser, setCognitoUser] = useState(null)

  const [openDialog, setOpenDialog] = useState(false)
  
  const handleDialogClose = () => {
    setOpenDialog(false)
  }

  const handleWarningOpen = () => {
    setOpenDialog(true)
  }

  const handleDelete = async () => {
    try {
      setLoading(true)
      const roostedLicenses = globalUser.userRoostedLicenses.items
      const partnerLicenses = globalUser.userPartnerLicenses.items
      if((globalUser.roostedAgent === null || globalUser.roostedAgent === undefined) || (globalUser.roostedAgent.stripeCustomerId === null || globalUser.roostedAgent.stripeCustomerId === undefined)) {
        //delete from cognito
        //delete from dynamo
        //remove from mailchimp
        handleDialogClose()
        const currentUser = await Auth.currentAuthenticatedUser();
        console.log(currentUser)
        const sub = currentUser.signInUserSession.idToken.payload.sub

        //delete licenses
        for(let i = 0; i < roostedLicenses.length ; i++) {
          await API.graphql(graphqlOperation(deleteRoostedLicense, {input: {id: roostedLicenses[i].id}}))
        }
        for(let i = 0; i < partnerLicenses.length ; i++) {
          await API.graphql(graphqlOperation(deletePartnerLicense, {input: {id: partnerLicenses[i].id}}))
        }

        //replace roosted on referrals
        const {data} = await API.graphql(graphqlOperation(listReferrals, {
          limit: 900000,
          filter: {or: [{referralRoostedAgentID: {eq: globalUser.id}}, {referralPartnerAgentID: {eq: globalUser.id}}]}
        }))

        for(let i = 0; i < data.listReferrals.items.length ; i++) {
          if(data.listReferrals.items[i].referralPartnerAgentID === globalUser.id) {
            await API.graphql(graphqlOperation(updateReferral, {input: {id: data.listReferrals[i].id, referralPartnerAgentID: '111-1111-111-111'}}))
          }
          if(data.listReferrals.items[i].referralRoostedAgentID === globalUser.id) {
            await API.graphql(graphqlOperation(updateReferral, {input: {id: data.listReferrals[i].id, referralRoostedAgentID: '111-1111-111-111'}}))
          }
        }


        await API.graphql(graphqlOperation(deleteUser, {input: {id: sub}}))
        currentUser.deleteUser(function(err, result) {
          if (err) {
              alert(err.message || JSON.stringify(err));
              return;
          }
          console.log('call result: ' + result);
        });
        Auth.signOut()

      } else {
        //Delete a customer from stripe
        handleDialogClose()
        let custom = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
              stripeCustomerId: globalUser.roostedAgent.stripeCustomerId,
              stripeState: globalUser.roostedAgent.stripeState,

          }
        }
        const deleteCustomer = await API.post(
          'roostedRestAPI', 
          '/stripe/delete-stripe-account',
          custom 
        )
        console.log(deleteCustomer)
        const currentUser = await Auth.currentAuthenticatedUser();
        const sub = currentUser.signInUserSession.idToken.payload.sub
        for(let i = 0; i < roostedLicenses.length ; i++) {
          await API.graphql(graphqlOperation(deleteRoostedLicense, {input: {id: roostedLicenses[i].id}}))
        }
        for(let i = 0; i < partnerLicenses.length ; i++) {
          await API.graphql(graphqlOperation(deletePartnerLicense, {input: {id: partnerLicenses[i].id}}))
        }

        //replace roosted on referrals
        const {data} = await API.graphql(graphqlOperation(listReferrals, {
          limit: 900000,
          filter: {or: [{referralRoostedAgentID: {eq: globalUser.id}}, {referralPartnerAgentID: {eq: globalUser.id}}]}
        }))

        for(let i = 0; i < data.listReferrals.items.length ; i++) {
          if(data.listReferrals.items[i].referralPartnerAgentID === globalUser.id) {
            await API.graphql(graphqlOperation(updateReferral, {input: {id: data.listReferrals[i].id, referralPartnerAgentID: '111-1111-111-111'}}))
          }
          if(data.listReferrals.items[i].referralRoostedAgentID === globalUser.id) {
            await API.graphql(graphqlOperation(updateReferral, {input: {id: data.listReferrals[i].id, referralRoostedAgentID: '111-1111-111-111'}}))
          }
        }


        await API.graphql(graphqlOperation(deleteUser, {input: {id: sub}}))
        currentUser.deleteUser(function(err, result) {
          if (err) {
              alert(err.message || JSON.stringify(err));
              return;
          }
          console.log('call result: ' + result);
      });
        Auth.signOut()
      }

      setLoading(false)
    }catch(error) {
      console.log(error)
      setLoading(false)
      setErrorMessage('Failed to delete user. Contact support@roosted.io.')
      setOpen(true)
    }

    try{
      ////MAILCHIMP UPDATE/////
      //delete user in mailchimp

      let custom = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
          action: 'deleted',
          emailData: {
            EMAIL: globalUser.email,
            FNAME: '',
            LNAME: '',
            PHONE: '',
            STATE: '',
            BROKER: '',
            EXPIRATION: ''
          }
        }
      }
      console.log(custom)
      const mailChimpResponse = await API.post(
        'roostedRestAPI', 
        '/mailchimp/execute-update',
        custom
      )
      console.log(mailChimpResponse)

      ////MAILCHIMP UPDATE/////
    }catch(error) {
      console.log(error)
    }
  }

  const onSubmit = async (dataCollected) => {
    setOpen(false)
    console.log(dataCollected)
    setLoading(true)
    try {
      const sub = currentUser.signInUserSession.idToken.payload.sub

      const userParams = {
        id: sub,
        userFirstName: dataCollected.userFirstName,
        userLastName: dataCollected.userLastName,
        userPhone: formatPhoneNumberToString(dataCollected.userPhone),
        userAddress: {
          street: dataCollected.userStreet,
          unit: dataCollected.userUnit === '' ? null : dataCollected.userUnit,
          city: dataCollected.userCity,
          state: dataCollected.userState,
          zip: dataCollected.userZip,
        }
      }

      const {data} = await API.graphql(graphqlOperation(updateUser, {input: userParams}))
      userSetUser(data.updateUser)
      setLoading(false)
      setSeverity('success')
      setErrorMessage('User information updated!')
      setOpen(true)

    }catch(error){
      setErrorMessage("Failed to save user data. Please try again or contact support@roosted.io.")
      setOpen(true)
      setLoading(false)
      console.log(error)
    }
  }

  useEffect(() => {

    // const poolData = {
    //   UserPoolId: Auth._config.userPoolId,
    //   ClientId: Auth._config.userPoolWebClientId,
    //   IdentityPoolId: Auth._config.identityPoolId
    // }

    // const userPool = new CognitoUserPool(poolData)
    // const cognitoUser = userPool.getCurrentUser()
    // console.log(cognitoUser)
    // setCognitoUser(cognitoUser)

    const getCurrentUserData = async () => {
      setLoading(true)
      try {
        const user = await Auth.currentAuthenticatedUser()
        setCurrentUser(user)
        setLoading(false)
      } catch(error) {
        setLoading(true)
        setSeverity('error')
        setErrorMessage('Failed to get user data. Reload the page or contact support@roosted.io')
        setOpen(true)
      }

    }

    if(!(Object.entries(globalUser).length === 0 && globalUser.constructor === Object)) {
      getCurrentUserData()
    }
  // eslint-disable-next-line
  },[])

  return (
    <>
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <WarningDialog open={openDialog} handleClose={handleDialogClose} handleDelete={handleDelete}/>
      {loading ? <LinearProgress/> : <React.Fragment/>}
      <CardContent>
        <form {...rest} onSubmit={handleSubmit(onSubmit)}>
        <Typography variant='h4' align='center' style={{color: '#1CA6FC'}} gutterBottom>User Information</Typography>
        <Grid
            container
            spacing={1}
          >
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller
                rules={{ required: true}} 
                as={TextField} 
                label="First Name"
                name='userFirstName'
                id='userFirstName' 
                defaultValue={globalUser.userFirstName === null ? '' : globalUser.userFirstName}
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.userFirstName !== undefined}
                control={control}
              />
              {errors.userFirstName && <Typography variant='caption' color='error'>First name is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller 
                rules={{ required: true}}
                as={TextField} 
                label="Last Name"
                name='userLastName'
                id='userLastName' 
                defaultValue={globalUser.userLastName === null ? '' : globalUser.userLastName}
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.userLastName !== undefined}
                control={control}
              />
              {errors.userLastName && <Typography variant='caption' color='error'>Last name is required.</Typography>}
            </Grid>
           <Grid
              item
              md={6}
              xs={12}
            >
              <Controller 
                rules={{ required: true}}
                as={TextField} 
                label="Street"
                name='userStreet'
                id='userStreet' 
                defaultValue={globalUser.userAddress === null || globalUser.userAddress.street === null ? '' : globalUser.userAddress.street}
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.userStreet !== undefined}
                control={control}
              />
              {errors.userStreet && <Typography variant='caption' color='error'>Street is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller 
                as={TextField}
                label="Unit"
                name='userUnit'
                id='userUnit' 
                defaultValue={globalUser.userAddress === null || globalUser.userAddress.unit === null ? '' : globalUser.userAddress.unit}
                variant='outlined'
                margin='dense'
                fullWidth
                control={control}
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller 
                rules={{ required: true}}
                as={TextField} 
                label="City"
                name='userCity'
                id='userCity' 
                defaultValue={globalUser.userAddress === null || globalUser.userAddress.city === null ? '' : globalUser.userAddress.city}
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.userCity !== undefined}
                control={control}
              />
              {errors.userCity && <Typography variant='caption' color='error'>City is required.</Typography>}
            </Grid>
             <Grid
              item
              md={6}
              xs={12}
            >
              <Controller
                fullWidth
                label="State"
                id="userState"
                name="userState"
                control={control}
                defaultValue={globalUser.userAddress === null || globalUser.userAddress.state === null ? 'AZ' : globalUser.userAddress.state}
                variant="outlined"
                margin='dense'
                as={<TextField 
                      select     
                      // eslint-disable-next-line react/jsx-sort-props
                      SelectProps={{ native: true }}>
                      {getStatesByAgentType('all').map(state => (
                        <option
                          key={state}
                          value={state}
                        >
                          {state}
                        </option>
                      ))}
                    </TextField>}
                />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller
                id='userZip'
                name='userZip'
                label='Zip Code'
                fullWidth
                defaultValue={globalUser.userAddress === null || globalUser.userAddress.zip === null ? '' : globalUser.userAddress.zip}
                variant="outlined"
                margin='dense'
                control={control}
                error={errors.userZip !== undefined}
                rules={{ required: true, pattern: /^[0-9]*$/}}
                as={<NumberFormatBase customInput={TextField} format="#####" mask="_"/>}
                />
                {errors.userZip && <Typography variant='caption' color='error'>Zip Code is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller
                id='userPhone'
                name='userPhone'
                label='Phone Number'
                fullWidth
                variant="outlined"
                margin='dense'
                control={control}
                defaultValue={globalUser.userPhone === null ? '' : formatPhoneNumber(globalUser.userPhone)}
                error={errors.userPhone !== undefined}
                rules={{ required: true, pattern: /((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}/ }}
                as={<NumberFormatBase customInput={TextField} format="(###) ###-####" mask="_"/>}
              />
              {errors.userPhone && <Typography variant='caption' color='error'>Phone number is required.</Typography>}
            </Grid>
          </Grid>
          <div className={classes.actions} align='center'>
          <Button
            color="primary"
            variant="contained"
            className={classes.buttons}
            endIcon={<CloudUploadIcon/>}
            disabled={loading}
            type='submit'
          >
            Update Account Information 
          </Button>
        </div>
        </form>
    
      </CardContent>
      {loading ? <LinearProgress/> : <React.Fragment/>}
    </Card>
    <ChangePasswordCard setSeverity={setSeverity} setOpen={setOpen} setErrorMessage={setErrorMessage} currentUser={currentUser}/>
    <div align='center'>
      <Button
        variant="contained"
        className={classes.deleteButton}
        endIcon={<DeleteIcon/>}
        disabled={loading}
        type='submit'
        onClick={handleWarningOpen}
      >
        Delete Account 
      </Button>
    </div>
    </>
  );
}

GetUserInfo.propTypes = {
  className: PropTypes.string
};

const mapStateToProps = state => {
  return {
      globalUser: state.user.userGlobal,
  };
};

const mapDispatchToProps = dispatch => {
  return {
      userSetUser: (user) => dispatch(actions.userSetUser(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GetUserInfo);
