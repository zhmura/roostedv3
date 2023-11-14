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
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { 
  createPartnerLicense
 } from "../../graphql/mutations"

 import { 
  getUser
 } from "../../graphql/queries"

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

function GetPartnerInfo(
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
    navbarRefresh,
    userNavbarRefresh,
     ...rest }) {
  const classes = useStyles();
  const { control, handleSubmit, errors } = useForm();

  const [loading, setLoading] = useState(false)

  const onSubmit = async (dataCollected) => {

    //add to mailchimp
    //move to PPM page
    console.log(dataCollected)
    setLoading(true)
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      const sub = currentUser.signInUserSession.idToken.payload.sub
 
      const licenseParams = {
        licenseUserID: sub,
        licenseNumber: license.licenseNumber,
        licenseExpiration: license.licenseExpiration,
        licenseState: license.licenseState,
        primaryLicense: false,
        licenseType: 'partner',
        zipCode: dataCollected.partnerZip,
        radius: dataCollected.radius,
        lowPrice: dataCollected.lowPrice,
        highPrice: dataCollected.highPrice,
        broker: dataCollected.broker,
        licenseVerificationStatus: 'verified'
      }
      await API.graphql(graphqlOperation(createPartnerLicense, {input: licenseParams}))
      
      const {data} = await API.graphql(graphqlOperation(getUser, {id: sub}))
      userSetUser(data.getUser)
      setLoading(false)
      userNavbarRefresh(navbarRefresh)
      history.push('/license/partner')
    }catch(error){
      setErrorMessage("Failed to save user data. Please try again or contact support@roosted.io.")
      setOpen(true)
      setLoading(false)
      console.log(error)
    }
  }

  useEffect(() => {
    if(Object.keys(license).length === 0) {
      history.push('/license/create?type=partner')
    }

  // eslint-disable-next-line 
  }, [])

  const radius = ['10', '20', '30', '40', '50', '60', '70'];
  const prices = ['100,000', '200,000', '300,000', '400,000', '500,000', '600,000', '700,000', '800,000', '900,000', '1,000,000+'];
  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      {loading ? <LinearProgress/> : <React.Fragment/>}
      <CardContent>
        <form {...rest} onSubmit={handleSubmit(onSubmit)}>
        <Typography variant='h4' align='center' style={{color: '#1CA6FC'}} gutterBottom>Information To Help Match Leads</Typography>
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
                id='partnerZip'
                name='partnerZip'
                label='Preferred Zip Code to Work'
                fullWidth
                defaultValue={''}
                variant="outlined"
                margin='dense'
                control={control}
                error={errors.partnerZip !== undefined}
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
                fullWidth
                label="Radius to Work from Preferred Zip"
                id="radius"
                name="radius"
                control={control}
                defaultValue={'10'}
                variant="outlined"
                margin='dense'
                as={<TextField 
                      select     
                      // eslint-disable-next-line react/jsx-sort-props
                      SelectProps={{ native: true }}>
                      {radius.map(radius => (
                        <option
                          key={radius}
                          value={radius}
                        >
                          {radius}
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
                fullWidth
                label="Low End Price Point to Work"
                id="lowPrice"
                name="lowPrice"
                control={control}
                defaultValue={'100,000'}
                variant="outlined"
                margin='dense'
                as={<TextField 
                      select     
                      // eslint-disable-next-line react/jsx-sort-props
                      SelectProps={{ native: true }}>
                      {prices.map(price => (
                        <option
                          key={price}
                          value={price}
                        >
                          {price}
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
                fullWidth
                label="High End Price Point to Work"
                id="highPrice"
                name="highPrice"
                control={control}
                defaultValue={'100,000'}
                variant="outlined"
                margin='dense'
                as={<TextField 
                      select     
                      // eslint-disable-next-line react/jsx-sort-props
                      SelectProps={{ native: true }}>
                      {prices.map(price => (
                        <option
                          key={price}
                          value={price}
                        >
                          {price}
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
                fullWidth
                label="Current Broker"
                id="broker"
                name="broker"
                control={control}
                defaultValue={''}
                variant="outlined"
                margin='dense'
                error={errors.broker !== undefined}
                rules={{ required: true}}
                as={TextField}
                />
                {errors.broker && <Typography variant='caption' color='error'>Broker is required.</Typography>}
            </Grid>
          </Grid>
          <div className={classes.actions} align='center'>
          <Button 
            className={classes.buttons}
            color="primary"
            variant="contained"
            startIcon={<ArrowBackIosIcon/>}
            onClick={() => {
              history.push('/license/create?type=partner')
            }}
          >
            Back
          </Button>
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

GetPartnerInfo.propTypes = {
  className: PropTypes.string
};

const mapStateToProps = state => {
  return {
      globalUser: state.user.userGlobal,
      license: state.license.license,
      navbarRefresh: state.user.navbarRefresh
  };
};

const mapDispatchToProps = dispatch => {
  return {
      userSetUser: (user) => dispatch(actions.userSetUser(user)),
      licenseSetLicense: (license) => dispatch(actions.licenseSetLicense(license)),
      userNavbarRefresh: (navbarRefresh) => dispatch(actions.userNavbarRefresh(navbarRefresh))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GetPartnerInfo);
