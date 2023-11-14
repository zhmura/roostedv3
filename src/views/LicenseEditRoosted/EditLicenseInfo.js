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
import moment from 'moment'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { getRoostedLicense, getUser } from '../../graphql/queries'
import { updateRoostedLicense } from '../../graphql/mutations'

import { getRoostedEmail } from '../../utils/utilities'

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
    location, 
    setErrorMessage,
    setOpen,
    licenseId,
     ...rest }) {
  const classes = useStyles();
  const { control, handleSubmit, errors } = useForm();

  const [loading, setLoading] = useState(false)
  const [license, setLicense] = useState({})

  const onSubmit = async (dataCollected) => {

    //add to mailchimp to monitor expiration

    setLoading(true)
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      const sub = currentUser.signInUserSession.idToken.payload.sub

      const expDate = new Date(dataCollected.licenseExpiration)
      const expDateString = expDate.toISOString()
      const licenseParams = {
        id: licenseId,
        licenseNumber: dataCollected.licenseNumber,
        licenseExpiration: expDateString,
        licenseVerificationStatus: 'waitingOnRoosted'
      }
      
      await API.graphql(graphqlOperation(updateRoostedLicense, {input: licenseParams}))

      const { data } = await API.graphql(graphqlOperation(getUser, {id: sub}))
      userSetUser(data.getUser)


      ////SENDGRID EMAIL TEMPLATE/////
      //Notify broker they have a license to verify 

      let fromEmail = getRoostedEmail(license.licenseState, 'support')
      let toEmail = getRoostedEmail(license.licenseState, 'broker')
      let toFullName = 'Roosted Broker'
  

      let custom = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
          emailData: {
            templateId: 'd-1abd068da8464c2faa88507d51b8ffd5',
            toEmail: toEmail,
            toFullName: toFullName,
            fromEmail: fromEmail,
            roostedAgentFirstName: globalUser.userFirstName,
            roostedAgentLastName: globalUser.userLastName,
            licenseNumber: dataCollected.licenseNumber,
            licenseExpiration: dataCollected.licenseExpiration,
            state: license.licenseState,
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


      setLoading(false)
      history.push('/license/roosted')

    }catch(error){
      setErrorMessage("Failed to update license. Please try again or contact support@roosted.io.")
      setOpen(true)
      setLoading(false)
      console.log(error)
    }

    try {
      ////MAILCHIMP UPDATE/////
      //Mark as payment completed and take off abandon cart

      let custom = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
          action: 'changedExpirationDate',
          emailData: {
            EMAIL: globalUser.email,
            FNAME: '',
            LNAME: '',
            PHONE: '',
            STATE: '',
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
    } catch(error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const fetchLicense = async () => {
      try {
        setLoading(true)
        setOpen(false)
        const {data} = await API.graphql(graphqlOperation(getRoostedLicense, {id: licenseId}))
        setLicense(data.getRoostedLicense)
        setLoading(false)
      }catch(error) {
        console.log(error)
        setErrorMessage('Failed to get license information. Please try again or contact support@roosted.io')
        setOpen(true)
      }
    }

    fetchLicense()

  // eslint-disable-next-line 
  }, [])


  return (
    loading ? <LinearProgress/> :
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      {loading ? <LinearProgress/> : <React.Fragment/>}
      <CardContent>
        <form {...rest} onSubmit={handleSubmit(onSubmit)}>
          <Typography variant='h4' align='center' style={{color: '#1CA6FC'}} gutterBottom>{`${license.licenseState} License Information`}</Typography>
          <Grid container spacing={1}>
            <Grid
              item
              md={6}
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
                id='licenseExpiration'
                name='licenseExpiration'
                label='License Expiration'
                fullWidth
                variant="outlined"
                defaultValue={license.licenseExpiration === undefined ? '' : moment(new Date(license.licenseExpiration)).format('MM/DD/YYYY')}
                margin='dense'
                control={control}
                error={errors.licenseExpiration !== undefined}
                rules={{ required: true, pattern: /^(((0)[0-9])|((1)[0-2]))(\/)([0-2][0-9]|(3)[0-1])(\/)\d{4}$/}}
                as={<NumberFormatBase customInput={TextField} format="##/##/####" mask="_"/>}
              />
              {errors.licenseExpiration && <Typography variant='caption' color='error'>Expriation Date is required (mm/dd/yyyy).</Typography>} 
            </Grid>
          </Grid>
          <div className={classes.actions} align='center'>
          <Button 
            className={classes.buttons}
            color="primary"
            variant="contained"
            startIcon={<ArrowBackIosIcon/>}
            onClick={() => { history.push('/license/roosted')}}
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
      userSetUser: (user) => dispatch(actions.userSetUser(user)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GetLicenseInfo);
