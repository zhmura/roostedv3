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
  LinearProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { useForm, Controller } from "react-hook-form";
import { NumberFormatBase  } from 'react-number-format';
import { estimatePayout, compareValues } from '../../utils/utilities'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

import { 
  formatPhoneNumberToString, 
  formatPhoneNumber, 
  agentShareByPlan, 
  agentPartnerShare, 
  getDefaultReferralFee,
  getRoostedEmail
 } from '../../utils/utilities'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { usersByEmail, listRoostedLicenses, listPartnerLicenses, getUser } from "../../graphql/queries"
import { createReferral, createClient, createUser, updateUser } from "../../graphql/mutations"

import * as yup from 'yup'

const useStyles = makeStyles((theme) => ({
  root: {},
  actions: {
    marginTop: theme.spacing(3),
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

function CompleteSellerReferral(
  { 
    globalUser,
    userSetUser,
    className, 
    referral,
    referralSetReferral,
    referralSetClient,
    client,
    history, 
    setErrorMessage,
    setOpen,
     ...rest }) {
  const classes = useStyles();


  const [loading, setLoading] = useState(false)
  //const [referrals, setReferrals] = useState([])
  const [agentSelection, setAgentSelection] = useState('agentSelects')
  const [roostedAgentArray, setRoostedAgentArray] = useState([])
  const [partnerAgentArray, setPartnerAgentArray] = useState([])

  const FormSchema = yup.object().shape({
    agentFirstName: agentSelection === 'priorAgent' ? null : yup.string().required(),
    agentLastName: agentSelection === 'priorAgent' ? null : yup.string().required(),
    agentEmail: agentSelection === 'priorAgent' ? null : yup.string().required().email(),
    agentPhone: agentSelection === 'priorAgent' ? null: yup.string().required().matches(/((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}/),
    // sellerStreet: yup.string().required(),
    // sellerCity: yup.string().required(),
    // sellerZip: yup.string().required().matches(/^[0-9]*$/),
  });

  const { control, handleSubmit, errors } = useForm({
    validationSchema: FormSchema
  });

  ////CHANGE USE PRIOR AGENT////
  const handleChange = event => {
    console.log(event.target.value)
    setAgentSelection(event.target.value)
  }

  const onSubmit = async (dataCollected) => {
    console.log(dataCollected)
    // Use this incase someone comes back to a referral and state has been erased

    if(referral.referralType === undefined) {
      return history.push('/referrals/create/select-type')
    }
    if(client.clientFirstName === undefined) {
      return history.push('/referrals/create/select-type')
    }
    setLoading(true)
    try {
      if(parseFloat(dataCollected.sellerReferralFee) > 100 || parseFloat(dataCollected.sellerReferralFee) < 0) {
        setErrorMessage('Referral fee must be between 0 and 100')
        setOpen(true)
        setLoading(false)
      } else if (((dataCollected.priorAgent === 'Select Agent' || dataCollected.priorAgent === 'No Prior Agents') && agentSelection === 'priorAgent')){
        setErrorMessage('You must select a prior agent.')
        setOpen(true)
        setLoading(false)
      } else if(parseFloat(dataCollected.sellerReferralFee) < 100 && parseFloat(dataCollected.sellerReferralFee) > 0) {
        setOpen(false)
        //get the current users sub 
        // const currentUser = await Auth.currentAuthenticatedUser();
        // const sub = currentUser.signInUserSession.idToken.payload.sub

        //Retrieve client data from global state
        const clientParams = {
          clientReferralEmail: client.clientEmail,
          clientFirstName: client.clientFirstName,
          clientLastName: client.clientLastName,
          clientPhone: client.clientPhone,
        }

        //create the client
        let { data } = await API.graphql(graphqlOperation(createClient, {input: clientParams}))
        //save the client's data to get the id when making the referral later
        const clientData = data.createClient
 
        const roostedAgentFetch =  await API.graphql(graphqlOperation(getUser, {id: referral.referralRoostedAgentID}))
        const roostedAgent = roostedAgentFetch.data.getUser
        console.log(roostedAgent)
        //find the primary license of the user to add to "referralReferringAgentState"
        let referralReferringState = roostedAgent.roostedAgent.stripeState

        //find the estimated put outs for each party
        const agentShare = agentShareByPlan(roostedAgent.roostedAgent.stripeProductName, roostedAgent.roostedAgent.stripeProductPeriod, roostedAgent.roostedAgent.stripeProductId)
        const roostedAgentEstimatedPayout = estimatePayout('roostedAgent', 0.03, parseFloat(dataCollected.sellerReferralFee/100), agentShare, referral.sellerPriceRange)
        const partnerAgentEstimatedPayout = estimatePayout('partnerAgent', 0.03, parseFloat(dataCollected.sellerReferralFee/100), agentShare, referral.sellerPriceRange)
        const roostedEstimatedPayout = estimatePayout('roosted', 0.03, parseFloat(dataCollected.sellerReferralFee/100), agentShare, referral.sellerPriceRange)


        let newReferral = {}

        let existingAgent = true

        if(agentSelection === 'agentSelects') {

          const trimmedUserFirstName = String(dataCollected.agentFirstName).trim();
          const trimmedUserLastName = String(dataCollected.agentLastName).trim();
          const trimmedUserEmail = String(dataCollected.agentEmail).trim();


          // referralSetReferral({
          //   referralType: referral.referralType,
          //   sellerAgentFirstName: trimmedUserFirstName,
          //   sellerAgentLastName: trimmedUserLastName,
          //   sellerAgentEmail: trimmedUserEmail,
          //   sellerAgentPhone: formatPhoneNumberToString(dataCollected.agentPhone),
          //   sellerState: referral.sellerState,
          //   sellerZip: referral.sellerZip,
          //   sellerTimeFrame: referral.sellerTimeFrame,
          //   sellerPriceRange: referral.sellerPriceRange,
          //   sellerReferralFee: dataCollected.sellerReferralFee,
          //   sellerReferralStreet: referral.sellerReferralStreet,
          //   sellerReferralUnit: referral.sellerReferralUnit,
          //   sellerReferralCity: referral.sellerReferralCity,
          //   sellerReferralState: referral.sellerReferralState,
          //   sellerReferralZip: referral.sellerReferralZip,
          // })

          let { data } = await API.graphql(graphqlOperation(usersByEmail, {email: trimmedUserEmail}))      
          
          if(data.usersByEmail.items.length === 0) {

            const newUserParams = {
              userFirstName: trimmedUserFirstName,
              userLastName: trimmedUserLastName,
              email: trimmedUserEmail,
              userPhone: formatPhoneNumberToString(dataCollected.agentPhone),
              setupStatus: 'getLicenseInfo',
              setupType: 'addedAgent',
              userType: 'user',
              navBar: 'setup',
              addedAgentComplete: false
            }

            //use this to determine sendgrid template
            existingAgent = false

            //create the new user
            const createdUser = await API.graphql(graphqlOperation(createUser, {input: newUserParams}))

            //We need to change the ownerfield to the newly created owner, since it will default to the currently logged in user.
            await API.graphql(graphqlOperation(updateUser, {input: {id: createdUser.data.createUser.id, owner: createdUser.data.createUser.id}}))

            let params = {}
            if(roostedAgent.userRoostedLicenses.items.length === 0) {
              params = {
                referralRoostedAgentID: roostedAgent.id,
                referralClientID: clientData.id,
                referralState: referral.sellerState,
                referralReferringAgentState: referralReferringState,
                referralType: 'sellerReferral',
                referralStatus: 'pending',
                referralClientStatus: 'new',
                referralEstimatedPriceRange: referral.sellerPriceRange,
                referralRoostedAgentPayoutFormatted: `${roostedAgentEstimatedPayout.lowEndPayoutFormatted} to ${roostedAgentEstimatedPayout.highEndPayoutFormatted}`,
                referralRoostedAgentPayoutLow: roostedAgentEstimatedPayout.lowEndPayout,
                referralRoostedAgentPayoutHigh: roostedAgentEstimatedPayout.highEndPayout,
                referralPartnerPayoutFormatted: `${partnerAgentEstimatedPayout.lowEndPayoutFormatted} to ${partnerAgentEstimatedPayout.highEndPayoutFormatted}`,
                referralPartnerPayoutLow: partnerAgentEstimatedPayout.lowEndPayout,
                referralPartnerPayoutHigh: partnerAgentEstimatedPayout.highEndPayout,
                referralRoostedPayoutFormatted: `${roostedEstimatedPayout.lowEndPayoutFormatted} to ${roostedEstimatedPayout.highEndPayoutFormatted}`,
                referralRoostedPayoutLow: roostedEstimatedPayout.lowEndPayout,
                referralRoostedPayoutHigh: roostedEstimatedPayout.highEndPayout,
                referralComments: client.clientComments === '' ?  null : client.clientComments,
                initialAgentSelection: 'agentSelects',
                referralTimeFrame: referral.sellerTimeFrame,
                referralFeeOffered: dataCollected.sellerReferralFee,
                referralCommission: 0.03,
                referralPartnerAgentID: createdUser.data.createUser.id,
                referralAddress: {
                  street: referral.sellerReferralStreet,
                  unit: referral.sellerReferralUnit === '' ? null : referral.sellerReferralUnit,
                  city: referral.sellerReferralCity,
                  state: referral.sellerReferralState,
                  zip: referral.sellerReferralZip
                },
                referralPartnerShareOnCreation: agentPartnerShare(),
                referralPayoutNotification: false
              }
            } else {
              params = {
                referralRoostedAgentID: roostedAgent.id,
                referralClientID: clientData.id,
                referralState: referral.sellerState,
                referralReferringAgentState: referralReferringState,
                referralType: 'sellerReferral',
                referralStatus: 'pending',
                referralClientStatus: 'new',
                referralEstimatedPriceRange: referral.sellerPriceRange,
                referralRoostedAgentPayoutFormatted: `${roostedAgentEstimatedPayout.lowEndPayoutFormatted} to ${roostedAgentEstimatedPayout.highEndPayoutFormatted}`,
                referralRoostedAgentPayoutLow: roostedAgentEstimatedPayout.lowEndPayout,
                referralRoostedAgentPayoutHigh: roostedAgentEstimatedPayout.highEndPayout,
                referralPartnerPayoutFormatted: `${partnerAgentEstimatedPayout.lowEndPayoutFormatted} to ${partnerAgentEstimatedPayout.highEndPayoutFormatted}`,
                referralPartnerPayoutLow: partnerAgentEstimatedPayout.lowEndPayout,
                referralPartnerPayoutHigh: partnerAgentEstimatedPayout.highEndPayout,
                referralRoostedPayoutFormatted: `${roostedEstimatedPayout.lowEndPayoutFormatted} to ${roostedEstimatedPayout.highEndPayoutFormatted}`,
                referralRoostedPayoutLow: roostedEstimatedPayout.lowEndPayout,
                referralRoostedPayoutHigh: roostedEstimatedPayout.highEndPayout,
                referralComments: client.clientComments === '' ?  null : client.clientComments,
                initialAgentSelection: 'agentSelects',
                referralTimeFrame: referral.sellerTimeFrame,
                referralFeeOffered: dataCollected.sellerReferralFee,
                referralCommission: 0.03,
                referralPartnerAgentID: createdUser.data.createUser.id,
                referralRoostedPlanOnCreation: roostedAgent.roostedAgent.stripeProductName,
                referralRoostedPlanPeriodOnCreation: roostedAgent.roostedAgent.stripeProductPeriod,
                referralRoostedPlanProductIdOnCreation: roostedAgent.roostedAgent.stripeProductId,
                referralAddress: {
                  street: referral.sellerReferralStreet,
                  unit: referral.sellerReferralUnit === '' ? null : referral.sellerReferralUnit,
                  city: referral.sellerReferralCity,
                  state: referral.sellerReferralState,
                  zip: referral.sellerReferralZip
                },
                referralPayoutNotification: false
              }
            }
            
    
            newReferral = await API.graphql(graphqlOperation(createReferral, {input: params}))

          } else {

            let params = {}
            if(roostedAgent.userRoostedLicenses.items.length === 0) {
              params = {
                referralRoostedAgentID: roostedAgent.id,
                referralClientID: clientData.id,
                referralState: referral.sellerState,
                referralReferringAgentState: referralReferringState,
                referralType: 'sellerReferral',
                referralStatus: 'pending',
                referralClientStatus: 'new',
                referralEstimatedPriceRange: referral.sellerPriceRange,
                referralRoostedAgentPayoutFormatted: `${roostedAgentEstimatedPayout.lowEndPayoutFormatted} to ${roostedAgentEstimatedPayout.highEndPayoutFormatted}`,
                referralRoostedAgentPayoutLow: roostedAgentEstimatedPayout.lowEndPayout,
                referralRoostedAgentPayoutHigh: roostedAgentEstimatedPayout.highEndPayout,
                referralPartnerPayoutFormatted: `${partnerAgentEstimatedPayout.lowEndPayoutFormatted} to ${partnerAgentEstimatedPayout.highEndPayoutFormatted}`,
                referralPartnerPayoutLow: partnerAgentEstimatedPayout.lowEndPayout,
                referralPartnerPayoutHigh: partnerAgentEstimatedPayout.highEndPayout,
                referralRoostedPayoutFormatted: `${roostedEstimatedPayout.lowEndPayoutFormatted} to ${roostedEstimatedPayout.highEndPayoutFormatted}`,
                referralRoostedPayoutLow: roostedEstimatedPayout.lowEndPayout,
                referralRoostedPayoutHigh: roostedEstimatedPayout.highEndPayout,
                referralComments: client.clientComments === '' ?  null : client.clientComments,
                initialAgentSelection: 'agentSelects',
                referralTimeFrame: referral.sellerTimeFrame,
                referralFeeOffered: dataCollected.sellerReferralFee,
                referralCommission: 0.03,
                referralPartnerAgentID: data.usersByEmail.items[0].id,
                referralAddress: {
                  street: referral.sellerReferralStreet,
                  unit: referral.sellerReferralUnit === '' ? null : referral.sellerReferralUnit,
                  city: referral.sellerReferralCity,
                  state: referral.sellerReferralState,
                  zip: referral.sellerReferralZip
                },
                referralPartnerShareOnCreation: roostedAgent.userRoostedLicenses.items.length === 0 ? agentPartnerShare() : null,
                referralPayoutNotification: false
              }
            } else {
              params = {
                referralRoostedAgentID: roostedAgent.id,
                referralClientID: clientData.id,
                referralState: referral.sellerState,
                referralReferringAgentState: referralReferringState,
                referralType: 'sellerReferral',
                referralStatus: 'pending',
                referralClientStatus: 'new',
                referralEstimatedPriceRange: referral.sellerPriceRange,
                referralRoostedAgentPayoutFormatted: `${roostedAgentEstimatedPayout.lowEndPayoutFormatted} to ${roostedAgentEstimatedPayout.highEndPayoutFormatted}`,
                referralRoostedAgentPayoutLow: roostedAgentEstimatedPayout.lowEndPayout,
                referralRoostedAgentPayoutHigh: roostedAgentEstimatedPayout.highEndPayout,
                referralPartnerPayoutFormatted: `${partnerAgentEstimatedPayout.lowEndPayoutFormatted} to ${partnerAgentEstimatedPayout.highEndPayoutFormatted}`,
                referralPartnerPayoutLow: partnerAgentEstimatedPayout.lowEndPayout,
                referralPartnerPayoutHigh: partnerAgentEstimatedPayout.highEndPayout,
                referralRoostedPayoutFormatted: `${roostedEstimatedPayout.lowEndPayoutFormatted} to ${roostedEstimatedPayout.highEndPayoutFormatted}`,
                referralRoostedPayoutLow: roostedEstimatedPayout.lowEndPayout,
                referralRoostedPayoutHigh: roostedEstimatedPayout.highEndPayout,
                referralComments: client.clientComments === '' ?  null : client.clientComments,
                initialAgentSelection: 'agentSelects',
                referralTimeFrame: referral.sellerTimeFrame,
                referralFeeOffered: dataCollected.sellerReferralFee,
                referralCommission: 0.03,
                referralPartnerAgentID: data.usersByEmail.items[0].id,
                referralRoostedPlanOnCreation: roostedAgent.roostedAgent.stripeProductName,
                referralRoostedPlanPeriodOnCreation: roostedAgent.roostedAgent.stripeProductPeriod,
                referralRoostedPlanProductIdOnCreation: roostedAgent.roostedAgent.stripeProductId,
                referralAddress: {
                  street: referral.sellerReferralStreet,
                  unit: referral.sellerReferralUnit === '' ? null : referral.sellerReferralUnit,
                  city: referral.sellerReferralCity,
                  state: referral.sellerReferralState,
                  zip: referral.sellerReferralZip
                },
                referralPayoutNotification: false
              }
            }
            
            newReferral = await API.graphql(graphqlOperation(createReferral, {input: params}))
          }

          ////SENDGRID EMAIL TEMPLATE/////
          //Notify agent select the referral is ready

          let fromEmail = getRoostedEmail(referral.sellerState, 'referral')

          let toEmail = trimmedUserEmail
          let toFullName = `${trimmedUserFirstName} ${trimmedUserLastName}`

          let custom = { 
            headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
            body: {
              emailData: {
                templateId: existingAgent ? 'd-02693d93fc804c95a61337384aa8deac' : 'd-dee6f2480ac3465097198c308c24ab2a',
                toEmail: toEmail,
                toFullName: toFullName,
                fromEmail: fromEmail,
                roostedAgentFirstName: roostedAgent.userFirstName,
                roostedAgentLastName: roostedAgent.userLastName,
                partnerAgentFirstName: trimmedUserFirstName,
                type: 'seller',
                referralLink: `https://app.roosted.io/referrals/details/partner/${newReferral.data.createReferral.id}/referraldata`
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
          
        } else if(agentSelection === 'priorAgent') {
          // referralSetReferral({
          //   referralType: referral.referralType,
          //   sellerAgent: dataCollected.priorAgent,
          //   sellerState: dataCollected.sellerState,
          //   sellerZip: dataCollected.sellerZip,
          //   sellerTimeFrame: dataCollected.sellerTimeFrame,
          //   sellerPriceRange: dataCollected.sellerPriceRange,
          //   sellerReferralFee: dataCollected.sellerReferralFee,
          //   sellerReferralStreet: dataCollected.sellerStreet,
          //   sellerReferralUnit: dataCollected.sellerUnit,
          //   sellerReferralCity: dataCollected.sellerCity,
          //   sellerReferralState: dataCollected.sellerState,
          //   sellerReferralZip: dataCollected.sellerZip
          // })

          let params = {}
          if(roostedAgent.userRoostedLicenses.items.length === 0) {
            params = {
              referralRoostedAgentID: roostedAgent.id,
              referralClientID: clientData.id,
              referralState: referral.sellerState,
              referralReferringAgentState: referralReferringState,
              referralType: 'sellerReferral',
              referralStatus: 'pending',
              referralClientStatus: 'new',
              referralEstimatedPriceRange: referral.sellerPriceRange,
              referralRoostedAgentPayoutFormatted: `${roostedAgentEstimatedPayout.lowEndPayoutFormatted} to ${roostedAgentEstimatedPayout.highEndPayoutFormatted}`,
              referralRoostedAgentPayoutLow: roostedAgentEstimatedPayout.lowEndPayout,
              referralRoostedAgentPayoutHigh: roostedAgentEstimatedPayout.highEndPayout,
              referralPartnerPayoutFormatted: `${partnerAgentEstimatedPayout.lowEndPayoutFormatted} to ${partnerAgentEstimatedPayout.highEndPayoutFormatted}`,
              referralPartnerPayoutLow: partnerAgentEstimatedPayout.lowEndPayout,
              referralPartnerPayoutHigh: partnerAgentEstimatedPayout.highEndPayout,
              referralRoostedPayoutFormatted: `${roostedEstimatedPayout.lowEndPayoutFormatted} to ${roostedEstimatedPayout.highEndPayoutFormatted}`,
              referralRoostedPayoutLow: roostedEstimatedPayout.lowEndPayout,
              referralRoostedPayoutHigh: roostedEstimatedPayout.highEndPayout,
              referralComments: client.clientComments === '' ?  null : client.clientComments,
              initialAgentSelection: 'priorAgent',
              referralTimeFrame: dataCollected.sellerTimeFrame,
              referralFeeOffered: dataCollected.sellerReferralFee,
              referralCommission: 0.03,
              referralPartnerAgentID: dataCollected.priorAgent,
              referralAddress: {
                street: referral.sellerReferralStreet,
                unit: referral.sellerReferralUnit === '' ? null : referral.sellerReferralUnit,
                city: referral.sellerReferralCity,
                state: referral.sellerReferralState,
                zip: referral.sellerReferralZip
              },
              referralPartnerShareOnCreation: agentPartnerShare(),
              referralPayoutNotification: false
            }
          } else {
            params = {
              referralRoostedAgentID: roostedAgent.id,
              referralClientID: clientData.id,
              referralState: referral.sellerState,
              referralReferringAgentState: referralReferringState,
              referralType: 'sellerReferral',
              referralStatus: 'pending',
              referralClientStatus: 'new',
              referralEstimatedPriceRange: referral.sellerPriceRange,
              referralRoostedAgentPayoutFormatted: `${roostedAgentEstimatedPayout.lowEndPayoutFormatted} to ${roostedAgentEstimatedPayout.highEndPayoutFormatted}`,
              referralRoostedAgentPayoutLow: roostedAgentEstimatedPayout.lowEndPayout,
              referralRoostedAgentPayoutHigh: roostedAgentEstimatedPayout.highEndPayout,
              referralPartnerPayoutFormatted: `${partnerAgentEstimatedPayout.lowEndPayoutFormatted} to ${partnerAgentEstimatedPayout.highEndPayoutFormatted}`,
              referralPartnerPayoutLow: partnerAgentEstimatedPayout.lowEndPayout,
              referralPartnerPayoutHigh: partnerAgentEstimatedPayout.highEndPayout,
              referralRoostedPayoutFormatted: `${roostedEstimatedPayout.lowEndPayoutFormatted} to ${roostedEstimatedPayout.highEndPayoutFormatted}`,
              referralRoostedPayoutLow: roostedEstimatedPayout.lowEndPayout,
              referralRoostedPayoutHigh: roostedEstimatedPayout.highEndPayout,
              referralComments: client.clientComments === '' ?  null : client.clientComments,
              initialAgentSelection: 'priorAgent',
              referralTimeFrame: dataCollected.sellerTimeFrame,
              referralFeeOffered: dataCollected.sellerReferralFee,
              referralCommission: 0.03,
              referralPartnerAgentID: dataCollected.priorAgent,
              referralRoostedPlanOnCreation: roostedAgent.roostedAgent.stripeProductName,
              referralRoostedPlanPeriodOnCreation: roostedAgent.roostedAgent.stripeProductPeriod,
              referralRoostedPlanProductIdOnCreation: roostedAgent.roostedAgent.stripeProductId,
              referralAddress: {
                street: referral.sellerReferralStreet,
                unit: referral.sellerReferralUnit === '' ? null : referral.sellerReferralUnit,
                city: referral.sellerReferralCity,
                state: referral.sellerReferralState,
                zip: referral.sellerReferralZip
              },
              referralPayoutNotification: false
            }
          }
          

          newReferral = await API.graphql(graphqlOperation(createReferral, {input: params}))

          ////SENDGRID EMAIL TEMPLATE/////
          //Notify agent select the referral is ready

          const getPriorAgent = await API.graphql(graphqlOperation(getUser, {id: dataCollected.priorAgent}))

          let fromEmail = getRoostedEmail(referral.sellerState, 'referral')

          let toEmail = getPriorAgent.data.getUser.email
          let toFullName = `${getPriorAgent.data.getUser.userFirstName} ${getPriorAgent.data.getUser.userLastName}`

          let custom = { 
            headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
            body: {
              emailData: {
                templateId: 'd-02693d93fc804c95a61337384aa8deac',
                toEmail: toEmail,
                toFullName: toFullName,
                fromEmail: fromEmail,
                roostedAgentFirstName: roostedAgent.userFirstName,
                roostedAgentLastName: roostedAgent.userLastName,
                partnerAgentFirstName: getPriorAgent.data.getUser.userFirstName,
                type: 'seller',
                referralLink: `https://app.roosted.io/referrals/details/partner/${newReferral.data.createReferral.id}/referraldata`
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

        }

        // const retreivedUser = await API.graphql(graphqlOperation(getUser, {id: roostedAgent.id}))
        // userSetUser(retreivedUser.data.getUser)



        ////SENDGRID EMAIL TEMPLATE/////
        //Notify agent that created the referral they made one

          let fromEmail = getRoostedEmail(referral.sellerState, 'referral')

          let toEmail = roostedAgent.email
          let toFullName = `${roostedAgent.userFirstName} ${roostedAgent.userLastName}`

          let custom = { 
            headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
            body: {
              emailData: {
                templateId: 'd-ff156c7b2d0f4de18bda5ff01eda9826',
                toEmail: toEmail,
                toFullName: toFullName,
                fromEmail: fromEmail,
                roostedAgentFirstName: roostedAgent.userFirstName,
                referralLink: `https://app.roosted.io/referrals/details/roosted/${newReferral.data.createReferral.id}/referraldata`
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
        //Notify roosted that a referral was created in their state

        fromEmail = getRoostedEmail(referral.sellerState, 'support')

        toEmail = getRoostedEmail(referral.sellerState, 'flock')
        toFullName = 'Roosted'

        custom = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
            emailData: {
              templateId: 'd-fb9a4fb582e04c039618a778257775dd',
              toEmail: toEmail,
              toFullName: toFullName,
              fromEmail: fromEmail,
              roostedAgentFirstName: roostedAgent.userFirstName,
              roostedAgentLastName: roostedAgent.userLastName,
              type: 'seller',
              priceRange: referral.sellerPriceRange,
              clientFirstName: client.clientFirstName,
              clientLastName: client.clientLastName,
              zip: referral.sellerReferralZip,
              state: referralReferringState,
              transactionState: referral.sellerState,
              referralLink: `https://app.roosted.io/referrals/details/broker/${newReferral.data.createReferral.id}/referraldata`
            }
          }
        }
        console.log(custom)
        const sendGridResponseRoosted = await API.post(
          'roostedRestAPI', 
          '/sendgrid/send-email',
          custom
        )
        console.log(sendGridResponseRoosted)

        ////SENDGRID EMAIL TEMPLATE/////

        setLoading(false)

        if(referral.referralType === 'sellerReferral') {
          //setReferrals({})
          referralSetClient({})
          history.push('/manage-referrals-admin') 
        } else if(referral.referralType === 'buyerAndSellerReferral') {
          history.push('/manage-referrals-admin')
        }
      }
    
    }catch(error){
      setErrorMessage("Failed to save user data. Please try again or contact support@roosted.io.")
      setOpen(true)
      setLoading(false)
      console.log(error)
    }

    try {
      if(agentSelection === 'priorAgent') {
      let getPriorAgent = await API.graphql(graphqlOperation(getUser, {id: dataCollected.priorAgent}))
        //TWILIO TEXT/////

        let textData = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
            phoneNumber: getPriorAgent.data.getUser.userPhone,
            message: `You have a Roosted referral waiting! Log into https://app.roosted.io or check your email.`
            }
          }
          console.log(textData)
          const twilioResponse = await API.post(
            'roostedRestAPI', 
            '/sendgrid/send-twilio-text',
            textData
          )
          console.log(twilioResponse)
        //TWILIO TEXT/////

      } else if (agentSelection === 'agentSelects') {
        //TWILIO TEXT/////

        let textData = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
            phoneNumber: formatPhoneNumberToString(dataCollected.agentPhone),
            message: `You have a Roosted referral waiting! Log into https://app.roosted.io or check your email.`
            }
          }
          console.log(textData)
          const twilioResponse = await API.post(
            'roostedRestAPI', 
            '/sendgrid/send-twilio-text',
            textData
          )
          console.log(twilioResponse)
        //TWILIO TEXT/////
      }


    } catch(error) {
      console.log(error)
    }


  }

  useEffect(() => {

    const getPriorAgents = async () => {
      try {
        setLoading(true)
        // const currentUser = await Auth.currentAuthenticatedUser();
        // const sub = currentUser.signInUserSession.idToken.payload.sub

        //get all the referrals created by a user
        let getPartnerAgents = await API.graphql(graphqlOperation(listPartnerLicenses, {
          limit: 900000,
          filter: {primaryLicense: { eq: true}},
        }))
  
        setPartnerAgentArray(getPartnerAgents.data.listPartnerLicenses.items.sort(compareValues('licenseUser', 'asc')))
        //END GET PARTNER AGENTS

        //GET ALL ROOSTED AGENTS SORTED BY LAST NAME
        let getAgents = await API.graphql(graphqlOperation(listRoostedLicenses, {
          limit: 900000,
          filter: {primaryLicense: { eq: true}},
        }))
  
        setRoostedAgentArray(getAgents.data.listRoostedLicenses.items.sort(compareValues('licenseUser', 'asc')))

        ///END GET ALL ROOSTED AGENTS

        setLoading(false)
      } catch(error) {
        setErrorMessage("Failed to retreive prior agents used. Please try again or contact support@roosted.io.")
        setOpen(true)
        setLoading(false)
        console.log(error)
      }

    }

    getPriorAgents()
    
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
        <Typography variant='h4' align='center' style={{color: '#1CA6FC', marginBottom: '2rem'}} gutterBottom>Seller Referral Information</Typography>
        <Grid
            container
            spacing={1}
          >
            <Grid
              item
              md={6}
              xs={12}
              align='center'
            >
              <RadioGroup aria-label="position" name="agent" value={agentSelection} onChange={handleChange} row style={{justifyContent: 'center'}}>
                
                <FormControlLabel
                  value="agentSelects"
                  control={<Radio color="primary" />}
                  label="Enter New Agent"
                  labelPlacement="top"
                />
                <FormControlLabel
                  value="priorAgent"
                  control={<Radio color="primary" />}
                  label="Select Prior Agent"
                  labelPlacement="top"
                  disabled={partnerAgentArray.length === 0}
                />
              </RadioGroup>
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller
                fullWidth
                label="Prior Agents"
                id="priorAgent"
                name="priorAgent"
                helperText={partnerAgentArray.length === 0 ? 'You have no prior referrals with agents to select from.' : ''}
                control={control}
                defaultValue={partnerAgentArray.length === 0 ? 'No Prior Agents' : 'Select Agent'}
                disabled={partnerAgentArray.length === 0 || agentSelection === 'roostedSelects' || agentSelection === 'agentSelects'}
                variant="outlined"
                margin='dense'
                as={<TextField 
                      select     
                      // eslint-disable-next-line react/jsx-sort-props
                      SelectProps={{ native: true }}>
                        <option>Select Agent</option>
                      {partnerAgentArray.map(agent => (
                        <option
                          key={agent !== null && agent !== undefined ?  agent.licenseUserID : 'Deleted'}
                          value={agent !== null && agent !== undefined ? agent.licenseUserID : 'Deleted'}
                        >
                          {agent !== null && agent !== undefined ? agent.licenseUser.userFirstName + ' ' + agent.licenseUser.userLastName : 'Deleted'}
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
                as={TextField} 
                disabled={agentSelection === 'roostedSelects' || agentSelection === 'priorAgent'}
                label="Agent First Name"
                name='agentFirstName'
                id='agentFirstName' 
                defaultValue={referral.sellerAgentFirstName === undefined ? '' : referral.sellerAgentFirstName}
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.agentFirstName !== undefined}
                control={control}
              />
              {errors.agentFirstName && <Typography variant='caption' color='error'>First name is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller 
                as={TextField} 
                disabled={agentSelection === 'roostedSelects' || agentSelection === 'priorAgent'}
                label="Agent Last Name"
                name='agentLastName'
                id='agentLastName' 
                defaultValue={referral.sellerAgentLastName === undefined ? '' : referral.sellerAgentLastName}
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.agentLastName !== undefined}
                control={control}
              />
              {errors.agentLastName && <Typography variant='caption' color='error'>Last name is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller 
                as={TextField} 
                disabled={agentSelection === 'roostedSelects' || agentSelection === 'priorAgent'}
                label="Agent Email"
                name='agentEmail'
                id='agentEmail' 
                defaultValue={referral.sellerAgentEmail === undefined ? '' : referral.sellerAgentEmail}
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.agentEmail !== undefined}
                control={control}
              />
              {errors.agentEmail && <Typography variant='caption' color='error'>Valid agent email is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller
                id='agentPhone'
                name='agentPhone'
                label='Agent Phone Number'
                fullWidth
                variant="outlined"
                margin='dense'
                disabled={agentSelection === 'roostedSelects' || agentSelection === 'priorAgent'}
                control={control}
                defaultValue={referral.sellerAgentPhone === undefined ? '' : formatPhoneNumber(referral.sellerAgentPhone)}
                error={errors.agentPhone !== undefined}
                as={<NumberFormatBase customInput={TextField} format="(###) ###-####" mask="_"/>}
              />
              {errors.agentPhone && <Typography variant='caption' color='error'>Agent phone number is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller
                id='sellerReferralFee'
                name='sellerReferralFee'
                label='What percent referral fee do you want?'
                fullWidth
                defaultValue={getDefaultReferralFee()}
                variant="outlined"
                margin='dense'
                control={control}
                error={errors.sellerReferralFee !== undefined}
                as={TextField}
                />
                {errors.sellerReferralFee && <Typography variant='caption' color='error'>Referral fee is required and must be between 0 and 100.</Typography>}
            </Grid>
          </Grid>
 
          <div className={classes.actions} align='center'>
          <Button 
            className={classes.buttons}
            color="primary"
            variant="contained"
            startIcon={<ArrowBackIosIcon/>}
            disabled={roostedAgentArray.length === 0}
            onClick={() => {
              referral.referralType = 'sellerReferral'
              history.push('/referrals/create/admin/select-sell-agent')
            }}
          >
            Back
          </Button>
          <Button
            color="primary"
            variant="contained"
            className={classes.buttons}
            endIcon={<ArrowForwardIosIcon/>}
            disabled={globalUser.userType !== 'broker' && globalUser.userType !== 'admin'}
            type='submit'
          >
            Submit Seller Referral
          </Button>
          <Typography variant='subtitle2' style={{paddingTop: '1rem'}}>Once you submit the referral the agent selected will be notified.</Typography>
        </div>
        </form>
      </CardContent>
      {loading ? <LinearProgress/> : <React.Fragment/>}
    </Card>
  );
}

CompleteSellerReferral.propTypes = {
  className: PropTypes.string
};

const mapStateToProps = state => {
  return {
      globalUser: state.user.userGlobal,
      referral: state.referral.referral,
      client: state.referral.client
  };
};

const mapDispatchToProps = dispatch => {
  return {
      userSetUser: (user) => dispatch(actions.userSetUser(user)),
      referralSetReferral: (referral) => dispatch(actions.referralSetReferral(referral)),
      referralSetClient: (client) => dispatch(actions.referralSetClient(client))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CompleteSellerReferral);