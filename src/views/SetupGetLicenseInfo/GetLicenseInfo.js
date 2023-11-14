import React, { useState } from 'react';
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
  Divider,
  LinearProgress
} from '@mui/material';
import { useForm, Controller } from "react-hook-form";
import { NumberFormatBase  } from 'react-number-format';
import { getStatesByAgentType } from '../../utils/utilities'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import moment from 'moment'

import { formatPhoneNumberToString, formatPhoneNumber } from '../../utils/utilities'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { 
  updateUser, 
  createRoostedLicense, 
  createPartnerLicense,
  deleteRoostedLicense,
  deletePartnerLicense } from "../../graphql/mutations"

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
  }
}));

function GetLicenseInfo(
  { 
    className, 
    globalUser, 
    userSetUser,
    history, 
    setErrorMessage,
    setOpen,
     ...rest }) {
  const classes = useStyles();
  const { control, handleSubmit, errors } = useForm();

  const [loading, setLoading] = useState(false)

  const onSubmit = async (dataCollected) => {
    console.log(dataCollected)
    setLoading(true)
    try {

  

      const currentUser = await Auth.currentAuthenticatedUser();
      const sub = currentUser.signInUserSession.idToken.payload.sub

      const trimmedUserFirstName = String(dataCollected.userFirstName).trim();
      const trimmedUserLastName = String(dataCollected.userLastName).trim();

      let userParams = {}
      const expDate = new Date(dataCollected.licenseExpiration)
      const expDateString = expDate.toISOString()
      if(globalUser.setupType === 'roosted') {
        userParams = {
          id: sub,
          userFirstName: trimmedUserFirstName,
          userLastName: trimmedUserLastName,
          userPhone: formatPhoneNumberToString(dataCollected.userPhone),
          userAddress: {
            street: dataCollected.userStreet,
            unit: dataCollected.userUnit ===  '' ? null : dataCollected.userUnit,
            city: dataCollected.userCity,
            state: dataCollected.userState,
            zip: dataCollected.userZip,
          },
          setupStatus: 'getPaymentInfo'
        }

      // If setupType ever changes to anything more than roosted and then the other's being partner or addedAgent, must filter here

      } else {
        userParams = {
          id: sub,
          userFirstName: trimmedUserFirstName,
          userLastName: trimmedUserLastName,
          userPhone: formatPhoneNumberToString(dataCollected.userPhone),
          userAddress: {
            street: dataCollected.userStreet,
            unit: dataCollected.userUnit === '' ? null : dataCollected.userUnit,
            city: dataCollected.userCity,
            state: dataCollected.userState,
            zip: dataCollected.userZip,
          },
          setupStatus: 'getPartnerInfo'
        }
      }
      const licenseParams = {
        licenseUserID: sub,
        licenseNumber: dataCollected.licenseNumber,
        licenseExpiration: expDateString,
        licenseType: globalUser.setupType,
        licenseState: dataCollected.licenseState,
        primaryLicense: true,
        licenseVerificationStatus: globalUser.setupType === 'roosted' ? 'waitingOnPayment' : 'waitingOnPartnerInfo'
      }

      if(globalUser.userRoostedLicenses.items.length > 0) {
        const indexRoostedID = globalUser.userRoostedLicenses.items[0].id
        await API.graphql(graphqlOperation(deleteRoostedLicense, {input: {id: indexRoostedID}}))
      }
      if(globalUser.userPartnerLicenses.items.length > 0) {
        const indexPartnerID = globalUser.userPartnerLicenses.items[0].id
        await API.graphql(graphqlOperation(deletePartnerLicense, {input: {id: indexPartnerID}}))
      }

      if(globalUser.setupType === 'roosted') {
        await API.graphql(graphqlOperation(createRoostedLicense, {input: licenseParams}))
      } else if(globalUser.setupType === 'partner' || globalUser.setupType === 'addedAgent') {
        await API.graphql(graphqlOperation(createPartnerLicense, {input: licenseParams}))
      }


      const {data} = await API.graphql(graphqlOperation(updateUser, {input: userParams}))
      userSetUser(data.updateUser)
      setLoading(false)
      if(globalUser.setupType === 'roosted') {
        history.push('/setup/get-payment-info') 
      } else if(globalUser.setupType === 'partner' || globalUser.setupType === 'addedAgent') {
        history.push('/setup/get-partner-info') 
      }
    }catch(error){
      setErrorMessage("Failed to save user data. Please try again or contact support@roosted.io.")
      setOpen(true)
      setLoading(false)
      console.log(error)
    }

    try {

      const trimmedUserFirstName = String(dataCollected.userFirstName).trim();
      const trimmedUserLastName = String(dataCollected.userLastName).trim();
      if(globalUser.setupType === 'roosted') {
        ////MAILCHIMP UPDATE/////
        //Add to abandon cart
        let custom = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
            action: 'addToAbandonCart',
            emailData: {
              EMAIL: globalUser.email,
              FNAME: trimmedUserFirstName,
              LNAME: trimmedUserLastName,
              PHONE: formatPhoneNumber(dataCollected.userPhone),
              STATE: dataCollected.licenseState,
              BROKER: '',
              EXPIRATION: new Date(dataCollected.licenseExpiration)
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
      } 
    } catch(error) {
      console.log(error)
    }
  }

  // useEffect(() => {
  //   setLoading(true)
  //   setTimeout(function(){setLoading(false) }, 1000);

  // // eslint-disable-next-line
  // }, [])

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
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
          <Divider className={classes.divider}/>
          <Typography variant='h4' align='center' style={{color: '#1CA6FC'}} gutterBottom>License Information</Typography>
          <Grid container spacing={1}>
            <Grid
              item
              xs={12}
            >
              <Controller 
                rules={{ required: true}}
                as={TextField} 
                label="License Number"
                name='licenseNumber'
                id='licenseNumber' 
                defaultValue={
                  globalUser.userRoostedLicenses.items.length === 0 && globalUser.userPartnerLicenses.items.length === 0 ? '' :
                  globalUser.userRoostedLicenses.items.length > 0 ? globalUser.userRoostedLicenses.items[0].licenseNumber : globalUser.userPartnerLicenses.items[0].licenseNumber
                }
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.licenseNumber !== undefined}
                control={control}
              />
              {errors.licenseNumber && <Typography variant='caption' color='error'>License Number is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller
                id='licenseExpiration'
                name='licenseExpiration'
                label='License Expiration'
                fullWidth
                variant="outlined"
                defaultValue={
                  globalUser.userRoostedLicenses.items.length === 0 && globalUser.userPartnerLicenses.items.length === 0 ? '' :
                  globalUser.userRoostedLicenses.items.length > 0 ? moment(new Date(globalUser.userRoostedLicenses.items[0].licenseExpiration)).format('MM/DD/YYYY') : moment(new Date(globalUser.userPartnerLicenses.items[0].licenseExpiration)).format('MM/DD/YYYY')
                }
                margin='dense'
                control={control}
                error={errors.licenseExpiration !== undefined}
                rules={{ required: true, pattern: /^(((0)[0-9])|((1)[0-2]))(\/)([0-2][0-9]|(3)[0-1])(\/)\d{4}$/}}
                as={<NumberFormatBase customInput={TextField} format="##/##/####" mask="_"/>}
              />
              {errors.licenseExpiration && <Typography variant='caption' color='error'>Expriation Date is required (mm/dd/yyyy).</Typography>} 
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >

              {/* REPLACE WHEN THERE ARE MORE THAN 2 STATES IN ARRAY OTHERWISE REACT HOOK FORM RETURNS NULL WHEN ONE VALUE IN ARRAY */}
              {globalUser.setupType === 'roosted' ?
                <React.Fragment>
                  <Controller 
                    rules={{ required: true}}
                    as={TextField} 
                    label="License State"
                    name='licenseState'
                    id='licenseState' 
                    defaultValue={
                      globalUser.userRoostedLicenses.items.length === 0 && globalUser.userPartnerLicenses.items.length === 0 ? 'AZ' :
                      globalUser.userRoostedLicenses.items.length > 0 ? globalUser.userRoostedLicenses.items[0].licenseState : globalUser.userPartnerLicenses.items[0].licenseState
                    }
                    variant='outlined'
                    margin='dense'
                    disabled={true}
                    fullWidth
                    error={errors.licenseState !== undefined}
                    control={control}
                  />
                  {errors.licensState && <Typography variant='caption' color='error'>License state is required.</Typography>}
                </React.Fragment> :
                <>
                  <Controller
                    fullWidth
                    label="License State"
                    id="licenseState"
                    name="licenseState"
                    control={control}
                    variant="outlined"
                    margin='dense'
                    defaultValue={
                      globalUser.userRoostedLicenses.items.length === 0 && globalUser.userPartnerLicenses.items.length === 0 ? 'AZ' :
                      globalUser.userRoostedLicenses.items.length > 0 ? globalUser.userRoostedLicenses.items[0].licenseState : globalUser.userPartnerLicenses.items[0].licenseState
                    }
                    as={<TextField 
                      select     
                      // eslint-disable-next-line react/jsx-sort-props
                      SelectProps={{ native: true }}>
                      {getStatesByAgentType('partner').map(state => (
                        <option
                          key={state}
                          value={state}
                        >
                          {state}
                        </option>
                      ))}
                    </TextField>}
                  />
                </>
              }
            </Grid>
          </Grid>
          <div className={classes.actions} align='center'>
          {globalUser.setupType === 'addedAgent' ? <React.Fragment /> :
          <Button 
            className={classes.buttons}
            color="primary"
            variant="contained"
            startIcon={<ArrowBackIosIcon/>}
            onClick={() => {
              history.push('/setup/select-type')
            }}
          >
            Back
          </Button>}
          <Button
            color="primary"
            variant="contained"
            className={classes.buttons}
            endIcon={<ArrowForwardIosIcon/>}
            disabled={loading}
            type='submit'
          >
            Next
          </Button>
        </div>
        </form>
        <div align='center' style={{marginTop: '1rem'}}>
          <Typography variant='caption'>Need Support? support@roosted.io</Typography>
        </div>
    
      </CardContent>
      {loading ? <LinearProgress/> : <React.Fragment/>}
    </Card>
  );
}

GetLicenseInfo.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(GetLicenseInfo);
