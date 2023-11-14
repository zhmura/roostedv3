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
import { getStatesByAgentType, formatPhoneNumberToString, getRoostedEmail } from '../../utils/utilities'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { createUser, createRoostedLicense } from '../../graphql/mutations'

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

function GetBrokerInfo(
  { 
    className, 
    globalUser, 
    userSetUser,
    history,
    location, 
    setErrorMessage,
    setOpen,
     ...rest }) {
  const classes = useStyles();
  const { control, handleSubmit, errors } = useForm();

  const [loading, setLoading] = useState(false)

  const onSubmit = async (formDataCollected) => {

    //add to mailchimp
    //move to PPM page
    console.log(formDataCollected)
    setLoading(true)
    try {

      const brokerParams = {
        userFirstName: formDataCollected.brokerFirstName,
        userLastName: formDataCollected.brokerLastName,
        email: formDataCollected.brokerEmail,
        userPhone: formatPhoneNumberToString(formDataCollected.brokerPhone),
        setupType: 'roosted',
        addedAgentComplete: true,
        addedBrokerComplete: false,
        cognitoUsername: formDataCollected.brokerEmail, 
        setupStatus: 'completed',
        navBar: 'admin',
        userType: 'broker',
        brokerState: formDataCollected.licenseState,
        userAddress: {
          street: formDataCollected.brokerStreet,
          unit: formDataCollected.brokerUnit === '' ? null : formDataCollected.brokerUnit,
          city: formDataCollected.brokerCity,
          state: formDataCollected.brokerState,
          zip: formDataCollected.brokerZip
        }
      }

      const createdBroker = await API.graphql(graphqlOperation(createUser, {input: brokerParams}))

      const expDate = new Date(formDataCollected.licenseExpiration)
      const expDateString = expDate.toISOString()
      const licenseParams = {
        licenseUserID: createdBroker.data.createUser.id,
        licenseNumber: formDataCollected.licenseNumber,
        licenseState: formDataCollected.licenseState,
        licenseExpiration: expDateString,
        primaryLicense: true,
        licenseVerificationStatus: 'verified',
        licenseType: 'roosted',
        activityLog: {activity: `Created by ${globalUser.email}`, activityDate: (new Date()).toISOString()}
      }

      await API.graphql(graphqlOperation(createRoostedLicense, {input: licenseParams}))

      ////SENDGRID EMAIL TEMPLATE/////
      //Notify broker they have an account

      let fromEmail = getRoostedEmail(formDataCollected.licenseState, 'support')

      let toEmail = formDataCollected.brokerEmail
      let toFullName = `${formDataCollected.brokerFirstName} ${formDataCollected.brokerLastName}`

      let custom = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
          emailData: {
            templateId: 'd-2d4d080b53634c75b21497092a7b61aa',
            toEmail: toEmail,
            toFullName: toFullName,
            fromEmail: fromEmail,
            brokerFirstName: formDataCollected.brokerFirstName,
            state: formDataCollected.licenseState
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

      history.push('/users/admin')
      setLoading(false)
    
    }catch(error){
      setErrorMessage("Failed to save user data. Please try again or contact support@roosted.io.")
      setOpen(true)
      setLoading(false)
      console.log(error)
    }
  }

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      {loading ? <LinearProgress/> : <React.Fragment/>}
      <CardContent>
        <form {...rest} onSubmit={handleSubmit(onSubmit)}>
          <Typography variant='h4' align='center' style={{color: '#1CA6FC'}} gutterBottom>{` New Broker Information`}</Typography>
          <Grid container spacing={1}>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller
                rules={{ required: true}} 
                as={TextField} 
                label="Broker First Name"
                name='brokerFirstName'
                id='brokerFirstName' 
                defaultValue={''} 
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.brokerFirstName !== undefined}
                control={control}
              />
              {errors.brokerFirstName && <Typography variant='caption' color='error'>A first name is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller 
                rules={{ required: true}}
                as={TextField} 
                label="BrokerLast Name"
                name='brokerLastName'
                id='brokerLastName' 
                defaultValue={''} 
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.brokerLastName !== undefined}
                control={control}
              />
              {errors.brokerLastName && <Typography variant='caption' color='error'>A last name is required.</Typography>}
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
                name='brokerStreet'
                id='brokerStreet' 
                defaultValue={''}
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.brokerStreet !== undefined}
                control={control}
              />
              {errors.brokerStreet && <Typography variant='caption' color='error'>Street is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller 
                as={TextField}
                label="Unit"
                name='brokerUnit'
                id='brokerUnit' 
                defaultValue={''}
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
                name='brokerCity'
                id='brokerCity' 
                defaultValue={''}
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.brokerCity !== undefined}
                control={control}
              />
              {errors.brokerCity && <Typography variant='caption' color='error'>City is required.</Typography>}
            </Grid>
             <Grid
              item
              md={6}
              xs={12}
            >
              <Controller
                fullWidth
                label="State"
                id="brokerState"
                name="brokerState"
                control={control}
                defaultValue={''}
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
                id='brokerZip'
                name='brokerZip'
                label='Zip Code'
                fullWidth
                defaultValue={''}
                variant="outlined"
                margin='dense'
                control={control}
                error={errors.brokerZip !== undefined}
                rules={{ required: true, pattern: /^[0-9]*$/}}
                as={<NumberFormatBase customInput={TextField} format="#####" mask="_"/>}
                />
                {errors.brokerZip && <Typography variant='caption' color='error'>Zip Code is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller
                id='brokerPhone'
                name='brokerPhone'
                label='Phone Number'
                fullWidth
                variant="outlined"
                margin='dense'
                control={control}
                defaultValue={''}
                error={errors.brokerPhone !== undefined}
                rules={{ required: true, pattern: /((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}/ }}
                as={<NumberFormatBase customInput={TextField} format="(###) ###-####" mask="_"/>}
              />
              {errors.brokerPhone && <Typography variant='caption' color='error'>Phone number is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller 
                rules={{ required: true, pattern: /[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/}}
                as={TextField} 
                label="Broker Roosted Email"
                name='brokerEmail'
                id='brokerEmail' 
                defaultValue={''}
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.brokerEmail !== undefined}
                control={control}
              />
              {errors.brokerEmail && <Typography variant='caption' color='error'>Valid client email is required.</Typography>}
            </Grid>
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
                defaultValue={''} 
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
                defaultValue={''}
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
                <React.Fragment>
                  <Controller 
                    rules={{ required: true}}
                    as={TextField} 
                    label="License State"
                    name='licenseState'
                    id='licenseState' 
                    defaultValue={'AZ'}
                    variant='outlined'
                    margin='dense'
                    disabled={true}
                    fullWidth
                    error={errors.licenseState !== undefined}
                    control={control}
                  />
                  {errors.licensState && <Typography variant='caption' color='error'>License state is required.</Typography>}
                </React.Fragment>
            </Grid>
          </Grid>
          <div className={classes.actions} align='center'>
          <Button
            color="primary"
            variant="contained"
            className={classes.buttons}
            endIcon={<ArrowForwardIosIcon/>}
            type='submit'
            disabled={globalUser.userType !== 'broker' && globalUser.userType !== 'admin'}
          >
            Create Broker
          </Button>
        </div>
        </form>
    
      </CardContent>
      {loading ? <LinearProgress/> : <React.Fragment/>}
    </Card>
  );
}

GetBrokerInfo.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(GetBrokerInfo);
