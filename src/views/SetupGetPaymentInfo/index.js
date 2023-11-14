import React, { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import { Container, Grid, Typography, TextField, Button, LinearProgress } from '@mui/material';
import Page from 'src/components/Page';
import Header from './Header';
import NestCard from './NestCard'
import PerchCard from './PerchCard'
import FlightCard from './FlightCard'
import { useForm, Controller } from "react-hook-form";
import Switch from '@mui/material/Switch';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

//IMPORT ALERT
import { Alert } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

//Amplify API Operations
import { Auth, API, graphqlOperation} from 'aws-amplify'
import { updateUser } from "../../graphql/mutations"
import { getUser } from "../../graphql/queries"

//Stripe object creation
import {loadStripe} from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js'

const AlertFunk = React.forwardRef((props, ref) => (
  <Alert elevation={6} variant="filled" ref={ref} {...props} />
));

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  },
  getPaymentInfo: {
    marginTop: theme.spacing(3)
  },
}));

function GetPaymentInfo(props) {
  const classes = useStyles()

  //initiate stripe key based on state
  let stripePromise = loadStripe(process.env.STRIPE_KEY_AZ === undefined ? process.env.REACT_APP_STRIPE_KEY_AZ : process.env.REACT_APP_STRIPE_KEY_AZ);
  if(props.globalUser.userRoostedLicenses.items[0].licenseState === 'AZ') {
    stripePromise = loadStripe(process.env.STRIPE_KEY_AZ === undefined ? process.env.REACT_APP_STRIPE_KEY_AZ : process.env.REACT_APP_STRIPE_KEY_AZ);
  } else if(props.globalUser.userRoostedLicenses.items[0].licenseState === 'CA') {
    stripePromise = loadStripe(process.env.STRIPE_KEY_CA === undefined ? process.env.REACT_APP_STRIPE_KEY_CA : process.env.REACT_APP_STRIPE_KEY_CA);
  }
  
  const { control, handleSubmit } = useForm();
  
  //Data Collected State Variables//
  const [paymentPeriod, setPaymentPeriod] = useState(true)   //true = monthly , false = annual
  const [promoCodeValid, setPromoCodeValid] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [planSelected, setPlanSelected] = useState('nest')
  const [paymentIntent, setPaymentIntent] = useState('')
  
  //Process State Variables///
  const [loading, setLoading] = useState(false)

  ////REACT HOOK SUBMIT/////
  const onSubmit = async (dataCollected) => {
    setLoading(true)
    try{
      const initialPromoCode = dataCollected.promoCodeInput.trim()
      const lowerCasePromoCode = initialPromoCode.toLowerCase()
      console.log(lowerCasePromoCode)
      let custom = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
          promoCode: lowerCasePromoCode,
          stripeState: props.globalUser.userRoostedLicenses.items[0].licenseState
        }
      }
      console.log(custom)
      const promoCodeValidResponse = await API.post(
        'roostedRestAPI', 
        '/stripe/check-promo-code',
        custom
      )
      if(promoCodeValidResponse.promoCodeValid === true) {
        setPromoCodeValid(true)
        setPromoCode(promoCodeValidResponse.promoData.id)
        setOpen(false)
        setLoading(false)
      } else {
        setPromoCodeValid(false)
        setPromoCode('')
        setErrorMessage("Promo Code Not Valid.")
        setOpen(true)
        setLoading(false)
      }
    }catch(error){
      if(!error.promoCodeValid) {
        setErrorMessage("Promo Code Invalid.")
        setPromoCodeValid(false)
        setPromoCode('')
        setOpen(true)
        setLoading(false)
        console.log(error)
      } else {
        setErrorMessage("Failed to save user data. Please try again or contact support@roosted.io.")
        setOpen(true)
        setLoading(false)
        console.log(error)
      }
    }
  }

  ////CHANGE MONTHLY ANNUAL////
  const handleChange = event => {
    setPaymentPeriod(!paymentPeriod);
  }

  /////SNACKBAR State Variables//////
  const [open, setOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('Unknown Error')

  //SNACKBAR close method
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };
  /////////////////////

  useEffect(() => {
    
    //Purpose: Create a payment intent on a lambda function to track the $25 payment.
    
    const createPaymentIntent = async () => {
      
        try {
          console.log("creating payment intent")
          let custom = { 
            headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
            body: {
              amount: 2500,
              currentcy: 'usd',
              stripeState: props.globalUser.userRoostedLicenses.items[0].licenseState,
              globalUser: props.globalUser
            }
          }
          const paymentIntentResponse = await API.post(
            'roostedRestAPI', 
            '/stripe/create-payment-intent',
            custom
          )
          console.log(paymentIntentResponse)
          setPaymentIntent(paymentIntentResponse.paymentIntent)
          const currentUser = await Auth.currentAuthenticatedUser();
          const sub = currentUser.signInUserSession.idToken.payload.sub
          const { data } = await API.graphql(graphqlOperation(
            updateUser, {
              input: {
                id: sub, 
                roostedAgent: 
                {
                  stripePaymentIntent: paymentIntentResponse.paymentIntent.id, 
                  stripeCustomerSecret: paymentIntentResponse.paymentIntent.client_secret,
                  stripeCustomerId: paymentIntentResponse.customer.id,
                  stripeState: props.globalUser.userRoostedLicenses.items[0].licenseState
                }
              }
            }
            ))
          props.userSetUser(data.updateUser)
          setLoading(false)
        } catch(error) {
          console.log(error)
          setLoading(false)
          setErrorMessage("An error occured loading this page. Please try again or contact support@roosted.io.")
          setOpen(true)
        }
      }

      const setGlobalUser = async () => {
        try {
          setLoading(true)
          const currentUser = await Auth.currentAuthenticatedUser();
          const sub = currentUser.signInUserSession.idToken.payload.sub
          const { data } = await API.graphql(graphqlOperation(getUser, {id: sub}))
          props.userSetUser(data.getUser)
          setLoading(false)
        } catch(error) {
          setLoading(false)
          console.log(error)
        }
      }

      if(props.globalUser.roostedAgent === null || props.globalUser.roostedAgent.stripeCustomerSecret === null) {
        createPaymentIntent();
      } else {
        setGlobalUser()
      }
  // eslint-disable-next-line
  },[])

  return (
    <Elements stripe={stripePromise}>
      <Page
        className={classes.root}
        title="Payment Info"
      >
        <Container maxWidth="lg">
          <Header />
          <Snackbar open={open} onClose={handleClose} anchorOrigin={{vertical: 'top', horizontal: 'center' }}>
            <AlertFunk onClose={handleClose} severity="error">
              {errorMessage}
            </AlertFunk>
          </Snackbar>
          {loading ? <LinearProgress /> : <React.Fragment/>}
          <div align='center' style={{marginTop: '1.5rem'}}>
            <Typography variant='h5'>
              Annual Plans
              <Switch
                checked={paymentPeriod}
                onChange={() => handleChange()}
                value='paymentPeriodSwitch'
                color="primary"
              />
              Monthly Plans
            </Typography>
          </div>
          <div style={{verticalAlign: 'middle', textAlign: 'center'}}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller 
              style={{verticalAlign: 'middle'}}
              rules={{ required: false}}
              as={TextField}
              label="Promo Code"
              name='promoCodeInput'
              id='promoCodeInput' 
              defaultValue=''
              variant='outlined'
              margin='dense'
              control={control}
            />
            <Button
              style={{verticalAlign: 'middle', margin: '0 1rem'}}
              variant='contained'
              color='primary'
              type='submit'>
              Apply Code
            </Button>
          </form>
          </div>
          <div className={classes.getPaymentInfo}>
            <Grid
            container
            spacing={3}
            >
              <Grid
                  item
                  lg={4}
                  lx={4}
                  md={6}
                  xs={12}
                >
                  <NestCard 
                    key='nest'
                    paymentPeriod={paymentPeriod}
                    planSelected={planSelected}
                    promoCodeValid={promoCodeValid}
                    setPlanSelected={setPlanSelected}
                    promoCode={promoCode}
                    paymentIntent={paymentIntent}
                    globalUser={props.globalUser}
                    setOpen={setOpen}
                    setErrorMessage={setErrorMessage}
                    setLoading={setLoading}
                    loading={loading}
                    userSetUser={props.userSetUser}
                    history={props.history}/>
                </Grid>
                <Grid
                  item
                  lg={4}
                  lx={4}
                  md={6}
                  xs={12}
                >
                  <PerchCard 
                    key='perch'
                    paymentPeriod={paymentPeriod}
                    planSelected={planSelected}
                    promoCodeValid={promoCodeValid}
                    setPlanSelected={setPlanSelected}
                    promoCode={promoCode}
                    paymentIntent={paymentIntent}
                    globalUser={props.globalUser}
                    setOpen={setOpen}
                    setErrorMessage={setErrorMessage}
                    setLoading={setLoading}
                    loading={loading}
                    userSetUser={props.userSetUser}
                    history={props.history}/>
                </Grid>
                <Grid
                  item
                  lg={4}
                  lx={4}
                  md={6}
                  xs={12}
                >
                  <FlightCard 
                    key='flight'
                    paymentPeriod={paymentPeriod}
                    planSelected={planSelected}
                    promoCodeValid={promoCodeValid}
                    setPlanSelected={setPlanSelected}
                    promoCode={promoCode}
                    paymentIntent={paymentIntent}
                    globalUser={props.globalUser}
                    setOpen={setOpen}
                    setErrorMessage={setErrorMessage}
                    setLoading={setLoading}
                    loading={loading}
                    userSetUser={props.userSetUser}
                    history={props.history}/>
                </Grid>
            </Grid>
          </div>
        
        </Container>
        <div style={{verticalAlign: 'middle', textAlign: 'center'}}>
          <Button
            style={{verticalAlign: 'middle', margin: '1rem 1rem'}}
            variant='contained'
            color='primary'
            disabled={loading}
            startIcon={<ArrowBackIosIcon/>}
              onClick={() => {
                props.history.push('/setup/get-license-info')
              }}>
            Back
          </Button>
        </div>
        <div style={{marginTop: '5rem'}} align='center'><Typography variant='caption'>Icons made by Freepik from www.flaticon.com</Typography></div>
      </Page>
    </Elements>
  );
}

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

export default connect(mapStateToProps, mapDispatchToProps)(GetPaymentInfo);
