import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
  LinearProgress,
  Divider
} from '@mui/material';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import CreditCard from '@mui/icons-material/CreditCard'
import './stripe.css'

// import { formatPhoneNumberToString, formatPhoneNumber, getTimeFrames, getPriceRanges, agentShareByPlan } from '../../utils/utilities'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { getUser } from "../../graphql/queries"
import { updateUser } from "../../graphql/mutations"

const useStyles = makeStyles((theme) => ({
  root: {},
  actions: {
    marginTop: theme.spacing(1),
  },
  buttons: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    marginTop: theme.spacing(1)
  },
  divider: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2)
  }
}));

function ManageCC(
  { 
    globalUser,
    userSetUser,
    className, 
    history, 
    setErrorMessage,
    setOpen,
    customer,
    licenseState,
    setWarningSeverity,
     ...rest }) {
  const classes = useStyles();

  //required for stripe
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (event) => {

    setLoading(true)
    event.preventDefault()
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    setLoading(true)
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    try{

      //GET A TOKEN THEN CREATE A SUBSCRIPTION
      const token = await stripe.createToken(elements.getElement(CardElement), {
        // type: 'card',
        currency: 'usd',
        name: `${globalUser.userFirstName} ${globalUser.userLastName}`}
      )
      console.log(token.token.id)
      //CREATE SUBSCRIPTION
      let custom = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
            token: token.token.id,
            stripeState: licenseState,
            stripeCustomerId: globalUser.roostedAgent.stripeCustomerId,
            globalUser: globalUser
        }
      }
      const changeCreditCard = await API.post(
        'roostedRestAPI', 
        '/stripe/change-credit-card',
        custom 
      )
      const currentUser = await Auth.currentAuthenticatedUser();
      const sub = currentUser.signInUserSession.idToken.payload.sub

      let currentRoostedObject = globalUser.roostedAgent

      currentRoostedObject.stripeCustomerId = changeCreditCard.customer.id
      
      console.log(changeCreditCard)

      let data = {}
      if(globalUser.roostedAgent.stripeCustomerId === null || globalUser.roostedAgent.stripeCustomerId === undefined) {
        data = await API.graphql(graphqlOperation(updateUser, {input: {id: sub, roostedAgent: currentRoostedObject}}))
      } else {
        data = await API.graphql(graphqlOperation(getUser, {id: sub}))
      }
      console.log(data)
      if(globalUser.roostedAgent.stripeCustomerId === null || globalUser.roostedAgent.stripeCustomerId === undefined) {
        userSetUser(data.data.updateUser)
      } else {
        userSetUser(data.data.getUser)
      }
      setWarningSeverity('success')
      setErrorMessage('Credit card updated!')
      setOpen(true)
      console.log(changeCreditCard)
      setLoading(false)
    
    }catch(error){
      setErrorMessage("Failed to change credit card. Please try again or contact support@roosted.io.")
      setOpen(true)
      setLoading(false)
      console.log(error)
    }
  }

  const CARD_OPTIONS = {
    iconStyle: 'solid',
    style: {
      base: {
        iconColor: '#0F3164',
        color: '#0F3164',
        fontWeight: 500,
        fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
        fontSize: '16px',
        fontSmoothing: 'antialiased',
        ':-webkit-autofill': {color: '#000000'},
        '::placeholder': {color: '#1CA6FC'},
      },
      invalid: {
        iconColor: '#FF0000',
        color: '#FF0000',
      },
    },
  };

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
      style={{marginTop: '2rem', height: '100%'}}
    >
      {loading ? <LinearProgress/> : <React.Fragment/>}
      <CardHeader title='Credit Card Information'/>
      <Divider />
      <Typography variant='h4' align='center' style={{color: '#1CA6FC', marginTop: '1.5rem'}} gutterBottom>Your current payment method is:</Typography>
      <Typography variant='h5' align='center' style={{color: '#0F3164'}} gutterBottom >{`${customer.sources.data[0].brand} - ******${customer.sources.data[0].last4} - ${customer.sources.data[0].exp_month}/${customer.sources.data[0].exp_year}`}</Typography>
      <CardContent>
      <form onSubmit={handleSubmit}>
      <fieldset className="FormGroup">
        <div className="FormRow">
          <CardElement options={CARD_OPTIONS} />
        </div>

      </fieldset>

      <div align='center'>
          <Button
            endIcon={<CreditCard/>}
            disabled={!stripe || licenseState === null || (globalUser.roostedAgent === null || globalUser.roostedAgent === undefined)}
            variant='contained'
            color='primary'
            width='100%'
            type='submit'
            //onClick={() => handleSubmit()}
            style={{marginBottom: '1rem', marginLeft: '1rem', marginRight: '1rem', marginTop: '1.25rem'}}>
            {(globalUser.roostedAgent === null || globalUser.roostedAgent === undefined) || (globalUser.roostedAgent.stripeCustomerId === null || globalUser.roostedAgent.stripeCustomerId === undefined) ? 'Add A Payment Method' : 'Change Payment Method'}
          </Button>
            {(globalUser.roostedAgent === null || globalUser.roostedAgent === undefined) || (globalUser.roostedAgent.stripeCustomerId === null || globalUser.roostedAgent.stripeCustomerId === undefined) ? <Typography variant='subtitle2' style={{paddingTop: '1rem'}}>You must have at least one active license hung with Roosted before you can add a card and billing plan.</Typography> : <React.Fragment/>}
        </div>
        
    </form>
      </CardContent>
      {loading ? <LinearProgress/> : <React.Fragment/>}
    </Card>
  );
}

ManageCC.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(ManageCC);
