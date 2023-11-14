import React from 'react';
//import { makeStyles } from '@mui/styles';
import {
  Button
} from '@mui/material';
import './stripe.css'
import CreditCard from '@mui/icons-material/CreditCard'

//Amplify API Operations
import { Auth, API, graphqlOperation } from 'aws-amplify'
import { updateUser, updateRoostedLicense } from "../../graphql/mutations"

import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

import { formatPhoneNumber, getRoostedData, getRoostedEmail } from '../../utils/utilities'

// const useStyles = makeStyles((theme) => ({
//   root: {},
// }));

function CardInformation(
  { 
    className, 
    globalUser, 
    userSetUser,
    history, 
    setErrorMessage,
    setOpen,
    promoCodeValid,
    planSelected,
    paymentPeriod,
    promoCode,
    paymentIntent,
    setLoading,
    loading,
     ...rest }) {

  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    console.log('Submit')
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
      //ONLY CHARGE SETUP FEE IF PROMOCODE IS INVALID
      if(!promoCodeValid && globalUser.roostedAgent.stripePaymentIntent !== 'completed') {
        const result = await stripe.confirmCardPayment(globalUser.roostedAgent.stripeCustomerSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: globalUser.userFirstName + ' ' +  globalUser.userLastName,
            },
          }
        });
        if (result.error) {
          setErrorMessage(result.error.message)
          setOpen(true)
          setLoading(false)
          console.log(result.error);
        } else {
          // The payment has been processed!
          if (result.paymentIntent.status === 'succeeded') {
            console.log('Set up Fee Charged')
            const currentUser = await Auth.currentAuthenticatedUser();
            const sub = currentUser.signInUserSession.idToken.payload.sub
            const {data} = await API.graphql(graphqlOperation(
              updateUser, {
                input: {
                  id: sub,
                  roostedAgent: 
                  {
                    stripePaymentIntent: 'completed',
                    stripeCustomerSecret: globalUser.roostedAgent.stripeCustomerSecret,
                    stripeCustomerId: globalUser.roostedAgent.stripeCustomerId,
                    stripeState: globalUser.userRoostedLicenses.items[0].licenseState,
                  }
                }
              }
            ))
            userSetUser(data.updateUser)
          }
        }
      }
      ///END SETUP FEE CHARGE

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
            stripeState: globalUser.userRoostedLicenses.items[0].licenseState,
            stripeCustomerId: globalUser.roostedAgent.stripeCustomerId,
            plan: planSelected,
            paymentPeriod: paymentPeriod ? 'monthly' : 'annual',
            promoCode: promoCode,
            promoCodeValid: promoCodeValid,
            
        }
      }
      const subscriptionResponse = await API.post(
        'roostedRestAPI', 
        '/stripe/create-subscription',
        custom
      )

      //UPDATE LICENSE VERIFICATION
      await API.graphql(graphqlOperation(
        updateRoostedLicense, {
          input: {
            id: globalUser.userRoostedLicenses.items[0].id,
            licenseVerificationStatus: 'waitingOnPolicies'
          }
        }
      ))

      //UPDATE USER
      const currentUser = await Auth.currentAuthenticatedUser();
      const sub = currentUser.signInUserSession.idToken.payload.sub
      const {data} = await API.graphql(graphqlOperation(
        updateUser, {
          input: {
            id: sub,
            setupStatus: 'signPolicies',
            roostedAgent: 
            {
              stripePaymentIntent: 'completed',
              stripeCustomerSecret: globalUser.roostedAgent.stripeCustomerSecret,
              stripeCustomerId: globalUser.roostedAgent.stripeCustomerId,
              stripeState: globalUser.userRoostedLicenses.items[0].licenseState,
              stripeProductId: subscriptionResponse.productId, 
              stripeSubscriptionId: subscriptionResponse.subscription.id,
              stripeProductName: planSelected,
              stripeProductPeriod: paymentPeriod ? 'monthly' : 'annual',
              stripePromoId: promoCode.id
            }
          }
        }
      ))
      userSetUser(data.updateUser)

      ////SENDGRID EMAIL TEMPLATE/////
      //Notify flock of an agent sign up 

      let fromEmail = getRoostedEmail(globalUser.userRoostedLicenses.items[0].licenseState, 'support')
      let toEmail = getRoostedEmail(globalUser.userRoostedLicenses.items[0].licenseState, 'flock')
      let toFullName = 'Roosted'


      custom = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
          emailData: {
            templateId: 'd-1a04a73068a74006bd44eecac5afb5d2',
            toEmail: toEmail,
            toFullName: toFullName,
            fromEmail: fromEmail,
            roostedAgentFirstName: globalUser.userFirstName,
            roostedAgentLastName: globalUser.userLastName,
            state: globalUser.userRoostedLicenses.items[0].licenseState,
            plan: `${planSelected} / ${paymentPeriod ? 'Monthly' : 'Annual'}`,
            promoCode: promoCodeValid ? promoCode : 'None',
            roostedAgentPhone: formatPhoneNumber(globalUser.userPhone),
            roostedAgentEmail: globalUser.email
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

      ////SENDGRID EMAIL TEMPLATE/////
      //Notify agent of sign up payment completed

      fromEmail = getRoostedEmail(globalUser.userRoostedLicenses.items[0].licenseState, 'support') 
      toEmail = globalUser.email
      toFullName = `${globalUser.userFirstName} ${globalUser.userLastName}`
      let roostedData = getRoostedData(globalUser.userRoostedLicenses.items[0].licenseState)

      let custom2 = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
          emailData: {
            templateId: 'd-45ade88d04864a28afe593f3061de6a5',
            toEmail: toEmail,
            toFullName: toFullName,
            fromEmail: fromEmail,
            roostedAgentFirstName: globalUser.userFirstName,
            plan: `${planSelected}`,
            roostedLicenseNumber: roostedData.roostedLicenseNumber,
            stateDRELink: roostedData.stateDRELink
          }
        }
      }

      const sendGridResponseRoosted2 = await API.post(
        'roostedRestAPI', 
        '/sendgrid/send-email',
        custom2
      )
      console.log(sendGridResponseRoosted2)

      ////SENDGRID EMAIL TEMPLATE/////

      

      history.push('/setup/sign-policies')

    }catch(error){
      setErrorMessage("Failed to complete charge. Please try again or contact support@roosted.io.")
      setOpen(true)
      setLoading(false)
      console.log(error)
    }

    try {
      ////MAILCHIMP UPDATE/////
      //Mark as payment completed and take off abandon cart

      let custom3 = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
          action: 'paymentCompleted',
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
      console.log(custom3)
      const mailChimpResponse = await API.post(
        'roostedRestAPI', 
        '/mailchimp/execute-update',
        custom3
      )
      console.log(mailChimpResponse)

      ////MAILCHIMP UPDATE/////
    } catch(error) {
      console.log(error)
    }
  };

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
    <form onSubmit={handleSubmit}>
      <fieldset className="FormGroup">
        <div className="FormRow">
          <CardElement options={CARD_OPTIONS} />
        </div>

      </fieldset>
      <div align='center'>
          <Button
            endIcon={<CreditCard/>}
            disabled={!stripe || loading}
            variant='contained'
            color='primary'
            width='100%'
            type='submit'
            //onClick={() => handleSubmit()}
            style={{marginBottom: '1rem', marginLeft: '1rem', marginRight: '1rem', marginTop: '1rem'}}>
            Complete Payment
          </Button>
        </div>
    </form>
  );
}

export default CardInformation
