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
  LinearProgress
} from '@mui/material';
import { useForm, Controller } from "react-hook-form";
import { NumberFormatBase  } from 'react-number-format';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

import { formatPhoneNumber, getRoostedEmail } from '../../utils/utilities'

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { 
  updateUser, 
  updatePartnerLicense } from "../../graphql/mutations"

const useStyles = makeStyles((theme) => ({
  root: {},
  formGroup: {
    marginBottom: theme.spacing(3)
  },
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
    history, 
    setErrorMessage,
    setOpen,
    navbarRefresh,
    userNavbarRefresh,
     ...rest }) {
  const classes = useStyles();
  const { control, handleSubmit, errors } = useForm();

  const [loading, setLoading] = useState(false)

  const onSubmit = async (dataCollected) => {
    console.log(dataCollected)
    setLoading(true)
    const currentUser = await Auth.currentAuthenticatedUser();
    const sub = currentUser.signInUserSession.idToken.payload.sub
    try {
      const indexPartnerID = globalUser.userPartnerLicenses.items[0].id   
      const licenseParams = {
        id: indexPartnerID,
        zipCode: dataCollected.partnerZip,
        radius: dataCollected.radius,
        lowPrice: dataCollected.lowPrice,
        highPrice: dataCollected.highPrice,
        broker: dataCollected.broker,
        licenseVerificationStatus: 'verified'
      }
      const partnerLicense = await API.graphql(graphqlOperation(updatePartnerLicense, {input: licenseParams}))
      const userParams = {
        id: sub,
        setupStatus: 'completed',
        navBar: 'partner',
        partnerAgent: {partnerSource: dataCollected.source},
        userType: 'user'
      }
      const {data} = await API.graphql(graphqlOperation(updateUser, {input: userParams}))

      ////SENDGRID EMAIL TEMPLATE/////

      let fromEmail = getRoostedEmail(partnerLicense.data.updatePartnerLicense.licenseState, 'support')

      let custom = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
          emailData: {
            templateId: 'd-4701cabca89449ba83f70e3f380ac43f',
            toEmail: globalUser.email,
            toFullName: globalUser.userFirstName + ' ' + globalUser.userLastName,
            fromEmail: fromEmail,
            partnerAgentFirstName: globalUser.userFirstName,
          }
        }
      }
      console.log(custom)
      const sendGridResponse = await API.post(
        'roostedRestAPI', 
        '/sendgrid/send-email',
        custom
      )
      console.log(sendGridResponse)
      ////SENDGRID EMAIL TEMPLATE/////

      ////SENDGRID EMAIL TEMPLATE/////
      //Notify flock of partner sign up

      fromEmail = getRoostedEmail(partnerLicense.data.updatePartnerLicense.licenseState, 'support')

      let toEmail = getRoostedEmail(partnerLicense.data.updatePartnerLicense.licenseState, 'flock')
      let toFullName = 'Roosted'

      custom = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
          emailData: {
            templateId: 'd-d3fa2c818eb54002b6af12218bdd9a60',
            toEmail: toEmail,
            toFullName: toFullName,
            fromEmail: fromEmail,
            partnerAgentFirstName: globalUser.userFirstName,
            partnerAgentLastName: globalUser.userLastName,
            partnerAgentPhone: globalUser.userPhone,
            partnerAgentEmail: globalUser.email,
            partnerAgentBroker: partnerLicense.data.updatePartnerLicense.broker,
            state: partnerLicense.data.updatePartnerLicense.licenseState
          }
        }
      }

      const sendGridResponseRoosted = await API.post(
        'roostedRestAPI', 
        '/sendgrid/send-email',
        custom
      )
      console.log(sendGridResponseRoosted)

      ////SENDGRID EMAIL TEMPLATE/////

      userSetUser(data.updateUser)
      setLoading(false)
      userNavbarRefresh(navbarRefresh)

      history.push('/home') 
    }catch(error){
      setErrorMessage("Failed to save user data. Please try again or contact support@roosted.io.")
      setOpen(true)
      setLoading(false)
      console.log(error)
    }

    try {
      ////MAILCHIMP UPDATE/////

      let custom2 = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
          action: 'partnerCompletedSignUp',
          emailData: {
            EMAIL: globalUser.email,
            FNAME: globalUser.userFirstName,
            LNAME: globalUser.userLastName,
            PHONE: formatPhoneNumber(globalUser.userPhone),
            STATE: globalUser.userPartnerLicenses.items[0].licenseState,
            BROKER: dataCollected.broker,
            EXPIRATION: new Date(globalUser.userPartnerLicenses.items[0].licenseExpiration)
          }
        }
      }
      console.log(custom2)
      const mailChimpResponse = await API.post(
        'roostedRestAPI', 
        '/mailchimp/execute-update',
        custom2
      )
      console.log(mailChimpResponse)

      ////MAILCHIMP UPDATE/////
    } catch(error) {
      console.log(error)
    }

  }

  // useEffect(() => {
  //   setLoading(true)
  //   setTimeout(function(){setLoading(false) }, 1000);

  // // eslint-disable-next-line
  // }, [])

  const radius = ['10', '20', '30', '40', '50', '60', '70'];
  const prices = ['100,000', '200,000', '300,000', '400,000', '500,000', '600,000', '700,000', '800,000', '900,000', '1,000,000+'];
  const marketingSources = ['Select a Source', 'My Broker', 'Google Ads', 'Facebook', 'Friends', 'Conference', 'Web Search'];
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
                defaultValue={globalUser.userPartnerLicenses.items.length === 0 || globalUser.userPartnerLicenses === null ? '' : globalUser.userPartnerLicenses.items[0].zipCode}
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
                defaultValue={globalUser.userPartnerLicenses.items[0].radius === null ? '10' : globalUser.userPartnerLicenses.items[0].radius}
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
                defaultValue={globalUser.userPartnerLicenses.items[0].lowPrice === null ? '100,000' : globalUser.userPartnerLicenses.items[0].lowPrice}
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
                defaultValue={globalUser.userPartnerLicenses.items[0].highPrice === null ? '100,000' : globalUser.userPartnerLicenses.items[0].highPrice}
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
                defaultValue={globalUser.userPartnerLicenses.items[0].broker === null ? '' : globalUser.userPartnerLicenses.items[0].broker}
                variant="outlined"
                margin='dense'
                error={errors.partnerZip !== undefined}
                rules={{ required: true}}
                as={TextField}
                />
                {errors.broker && <Typography variant='caption' color='error'>Broker is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller
                fullWidth
                label="Where did you hear about Roosted?"
                id="source"
                name="source"
                control={control}
                defaultValue={globalUser.partnerAgent === null ? '' : globalUser.partnerAgent.partnerSource}
                variant="outlined"
                margin='dense'
                as={<TextField 
                      select     
                      // eslint-disable-next-line react/jsx-sort-props
                      SelectProps={{ native: true }}>
                      {marketingSources.map(source => (
                        <option
                          key={source}
                          value={source}
                        >
                          {source}
                        </option>
                      ))}
                    </TextField>}
                />
            </Grid>
          </Grid>
          <div className={classes.actions} align='center'>
          <Button 
            className={classes.buttons}
            color="primary"
            variant="contained"
            startIcon={<ArrowBackIosIcon/>}
            onClick={() => {
              history.push('/setup/get-license-info')
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
            disabled={loading}
          >
            Done
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

GetPartnerInfo.propTypes = {
  className: PropTypes.string
};

const mapStateToProps = state => {
  return {
      globalUser: state.user.userGlobal,
      navbarRefresh: state.user.navbarRefresh
  };
};

const mapDispatchToProps = dispatch => {
  return {
      userSetUser: (user) => dispatch(actions.userSetUser(user)),
      userNavbarRefresh: (navbarRefresh) => dispatch(actions.userNavbarRefresh(navbarRefresh))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GetPartnerInfo);
