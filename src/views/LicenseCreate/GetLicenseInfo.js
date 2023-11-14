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
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import queryString from 'query-string'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth } from "aws-amplify";

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
    license,
    licenseSetLicense,
    history,
    location, 
    setErrorMessage,
    setOpen,
     ...rest }) {
  const classes = useStyles();
  const { control, handleSubmit, errors } = useForm();

  const [loading, setLoading] = useState(false)
  const [licenseType, setLicenseType] = useState(queryString.parse(location.search).type)

  const onSubmit = async (dataCollected) => {

    //add to mailchimp
    //move to PPM page
    console.log(dataCollected)
    setLoading(true)
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      const sub = currentUser.signInUserSession.idToken.payload.sub

      const expDate = new Date(dataCollected.licenseExpiration)
      const expDateString = expDate.toISOString()
      const licenseParams = {
        licenseUserID: sub,
        licenseNumber: dataCollected.licenseNumber,
        licenseExpiration: expDateString,
        licenseType: licenseType === 'roosted' || licenseType === 'partnerRoosted' ? 'roosted' : 'partner',
        licenseState: dataCollected.licenseState,
        primaryLicense: false,
        licenseVerificationStatus: licenseType === 'roosted' || licenseType === 'partnerRoosted' ? 'waitingOnPolicies' : 'verified'
      }

      let licenseAlreadyExists = false
      let typeAlreadyExists = ''
      let stateAlreadyExists = ''
      //check if license already exists for partner and roosted, if it does throw a warning
      if(globalUser.userRoostedLicenses.items.length > 0) {
        for(let i = 0; i < globalUser.userRoostedLicenses.items.length; i++) {
          if(globalUser.userRoostedLicenses.items[i].licenseState === dataCollected.licenseState) {
            licenseAlreadyExists = true
            typeAlreadyExists = 'Roosted'
            stateAlreadyExists = dataCollected.licenseState
          }
        }
      }
      if(globalUser.userPartnerLicenses.items.length > 0) {
        for(let i = 0; i < globalUser.userPartnerLicenses.items.length; i++) {
          if(globalUser.userPartnerLicenses.items[i].licenseState === dataCollected.licenseState) {
            licenseAlreadyExists = true
            typeAlreadyExists = 'Partner'
            stateAlreadyExists = dataCollected.licenseState
          }
        }
      }

      if(licenseAlreadyExists) {
        setLoading(false)
        setErrorMessage(`A you already have a ${typeAlreadyExists} license registered with us in ${stateAlreadyExists}`)
        setOpen(true)
      } else {
        licenseSetLicense(licenseParams)
        setLoading(false)
        if(licenseType === 'roosted') {
          history.push('/license/sign-policies') 
        } else if(licenseType === 'partner') {
          history.push('/license/partner-info') 
        } else if(licenseType === 'partnerRoosted') {
          history.push('/license/get-payment-info') 
        }
      }

    }catch(error){
      setErrorMessage("Failed to save user data. Please try again or contact support@roosted.io.")
      setOpen(true)
      setLoading(false)
      console.log(error)
    }
  }

  useEffect(() => {
    setLicenseType(queryString.parse(location.search).type)
    if(queryString.parse(location.search).type !== 'roosted' && queryString.parse(location.search).type !== 'partnerRoosted' && queryString.parse(location.search).type !== 'partner') {
      history.push('/home')
    } 
    //must also look for incomplete sign ups and set license state and number and pass to /license/sign-ica

  // eslint-disable-next-line 
  }, [])

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      {loading ? <LinearProgress/> : <React.Fragment/>}
      <CardContent>
        <form {...rest} onSubmit={handleSubmit(onSubmit)}>
          <Typography variant='h4' align='center' style={{color: '#1CA6FC'}} gutterBottom>{` New ${licenseType === 'roosted' || licenseType === 'partnerRoosted' ? 'Roosted' : 'Partner'} License Information`}</Typography>
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
                defaultValue={license.licenseNumber === undefined ? '' : license.licenseNumber} 
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
                rules={{ required: true, pattern: /^(((0)[0-9])|((1)[0-2]))(\/)([0-2][0-9]|(3)[0-1])(\/)\d{4}$/}}
                id='licenseExpiration'
                name='licenseExpiration'
                label='License Expiration'
                fullWidth
                variant="outlined"
                defaultValue={license.licenseExpiration === undefined ? '' : license.licenseExpiration}
                margin='dense'
                control={control}
                error={errors.licenseExpiration !== undefined}
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
              {licenseType === 'roosted' || licenseType === 'partnerRoosted' ?
                <React.Fragment>
                  <Controller 
                    rules={{ required: true}}
                    as={TextField} 
                    label="License State"
                    name='licenseState'
                    id='licenseState' 
                    defaultValue={license.licenseState === undefined ? 'AZ' : license.licenseState}
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
                    defaultValue={license.licenseState === undefined ? 'AL' : license.licenseState}
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
          <Button
            color="primary"
            variant="contained"
            className={classes.buttons}
            endIcon={<ArrowForwardIosIcon/>}
            type='submit'
          >
            Next
          </Button>
        </div>
        </form>
    
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
      license: state.license.license
  };
};

const mapDispatchToProps = dispatch => {
  return {
      userSetUser: (user) => dispatch(actions.userSetUser(user)),
      licenseSetLicense: (license) => dispatch(actions.licenseSetLicense(license))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GetLicenseInfo);
