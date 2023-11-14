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
  getRoostedEmail } from '../../utils/utilities'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { listReferrals, usersByEmail, listRoostedLicenses, listPartnerLicenses, getUser } from "../../graphql/queries"
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


function CompleteBuyReferral(
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
  const [filteredReferrals, setFilteredReferrals] = useState([])
  const [agentSelection, setAgentSelection] = useState('agentSelects')

  const FormSchema = yup.object().shape({
    agentFirstName: agentSelection === 'priorAgent' ? null : yup.string().required(),
    agentLastName: agentSelection === 'priorAgent' ? null : yup.string().required(),
    agentEmail: agentSelection === 'priorAgent' ? null : yup.string().required().email(),
    agentPhone: agentSelection === 'priorAgent' ? null: yup.string().required().matches(/((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}/),
  });

  const { control, handleSubmit, errors } = useForm({
    validationSchema: FormSchema
  });

  ////CHANGE USE PRIOR AGENT////
  const handleChange = event => {
    console.log(event.target.value)
    setAgentSelection(event.target.value)
  }

  console.log(referral)

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
      if((parseFloat(dataCollected.buyerReferralFee) > 100 || parseFloat(dataCollected.buyerReferralFee) < 0)) {
        setErrorMessage('Referral fee must be between 0 and 100')
        setOpen(true)
        setLoading(false)
      } else if (((dataCollected.priorAgent === 'Select Agent' || dataCollected.priorAgent === 'No Prior Agents') && agentSelection === 'priorAgent')){
        setErrorMessage('You must select a prior agent.')
        setOpen(true)
        setLoading(false)
      } else if(parseFloat(dataCollected.buyerReferralFee) < 100 && parseFloat(dataCollected.buyerReferralFee) > 0) {
        setOpen(false)
        // get the current users sub 
        // const currentUser = await Auth.currentAuthenticatedUser();
        // const sub = currentUser.signInUserSession.idToken.payload.sub

        //Retrieve client data from global state
        const clientParams = {
          clientReferralEmail: client.clientEmail,
          clientFirstName: client.clientFirstName,
          clientLastName: client.clientLastName,
          clientPhone: client.clientPhone,
          
        }
        console.log(referral.referralRoostedAgentID)
        //create the client
        let { data } = await API.graphql(graphqlOperation(createClient, {input: clientParams}))
        //save the client's data to get the id when making the referral later
        const clientData = data.createClient

        //get the current users sub 
        const currentUser = await Auth.currentAuthenticatedUser();
        const sub = currentUser.signInUserSession.idToken.payload.sub

        //find the primary license of the user to add to "referralReferringAgentState"
        let licenseArray = []
        let referralReferringState = ''
        if(globalUser.userRoostedLicenses.items.length === 0) {
          licenseArray = await API.graphql(graphqlOperation(listPartnerLicenses, {
            filter: {
              primaryLicense: { eq: true}
            },
            limit: 900000
          }))

          referralReferringState = licenseArray.data.listPartnerLicenses.items[0].licenseState

        } else {
          licenseArray = await API.graphql(graphqlOperation(listRoostedLicenses, {
            filter: {
              primaryLicense: { eq: true}
            },
            limit: 900000
          }))

          referralReferringState = licenseArray.data.listRoostedLicenses.items[0].licenseState

        }

        //find the estimated put outs for each party
        const agentShare = globalUser.userRoostedLicenses.items.length === 0 ? agentPartnerShare() : agentShareByPlan(globalUser.roostedAgent.stripeProductName, globalUser.roostedAgent.stripeProductPeriod, globalUser.roostedAgent.stripeProductId)
        const roostedAgentEstimatedPayout = estimatePayout('roostedAgent', 0.03, parseFloat(dataCollected.buyerReferralFee/100), agentShare, referral.buyerPriceRange)
        const partnerAgentEstimatedPayout = estimatePayout('partnerAgent', 0.03, parseFloat(dataCollected.buyerReferralFee/100), agentShare, referral.buyerPriceRange)
        const roostedEstimatedPayout = estimatePayout('roosted', 0.03, parseFloat(dataCollected.buyerReferralFee/100), agentShare, referral.buyerPriceRange)
        
        let newReferral = {}

        let existingAgent = false

        if(agentSelection === 'agentSelects') {

          const trimmedUserFirstName = String(dataCollected.agentFirstName).trim();
          const trimmedUserLastName = String(dataCollected.agentLastName).trim();
          const trimmedUserEmail = String(dataCollected.agentEmail).trim();

          // referralSetReferral({
          //   referralType: referral.referralType,
          //   buyerAgentFirstName: trimmedUserFirstName,
          //   buyerAgentLastName: trimmedUserLastName,
          //   buyerAgentEmail: trimmedUserEmail,
          //   buyerAgentPhone: formatPhoneNumberToString(dataCollected.agentPhone),
          //   buyerState: referral.buyerState,
          //   buyerZip: referral.buyerZip,
          //   buyerTimeFrame: referral.buyerTimeFrame,
          //   buyerPriceRange: referral.buyerPriceRange,
          //   buyerPrequalified: referral.buyerPrequalified,
          //   buyerReferralFee: dataCollected.buyerReferralFee,
          //   referralRoostedAgentID: referral.roostedRoostedAgentID,
          //   referralAgentType: referral.referralAgentType
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

            //use this to select the right email template
            existingAgent = false

            //create the new user
            const createdUser = await API.graphql(graphqlOperation(createUser, {input: newUserParams}))

            //We need to change the ownerfield to the newly created owner, since it will default to the currently logged in user.
            await API.graphql(graphqlOperation(updateUser, {input: {id: createdUser.data.createUser.id, owner: createdUser.data.createUser.id}}))

            let params = {}
            if(globalUser.userRoostedLicenses.items.length === 0) {
              params = {
                referralRoostedAgentID: sub,
                referralClientID: clientData.id,
                referralState: referral.buyerState,
                referralAddress: {state: referral.buyerState, zip: referral.buyerZip},
                referralReferringAgentState: referralReferringState,
                referralType: 'buyerReferral',
                referralStatus: 'pending',
                referralClientStatus: 'new',
                referralEstimatedPriceRange: referral.buyerPriceRange,
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
                referralTimeFrame: referral.buyerTimeFrame,
                referralPrequalified: referral.buyerPrequalified,
                referralFeeOffered: dataCollected.buyerReferralFee,
                referralCommission: 0.03,
                referralPartnerAgentID: createdUser.data.createUser.id,
                referralPartnerShareOnCreation: agentPartnerShare(),
                referralPayoutNotification: false
              }
            } else {
              params = {
                referralRoostedAgentID: sub,
                referralClientID: clientData.id,
                referralState: referral.buyerState,
                referralAddress: {state: referral.buyerState, zip: referral.buyerZip},
                referralReferringAgentState: referralReferringState,
                referralType: 'buyerReferral',
                referralStatus: 'pending',
                referralClientStatus: 'new',
                referralEstimatedPriceRange: referral.buyerPriceRange,
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
                referralTimeFrame: referral.buyerTimeFrame,
                referralPrequalified: referral.buyerPrequalified,
                referralFeeOffered: dataCollected.buyerReferralFee,
                referralCommission: 0.03,
                referralPartnerAgentID: createdUser.data.createUser.id,
                referralRoostedPlanOnCreation: globalUser.roostedAgent.stripeProductName,
                referralRoostedPlanPeriodOnCreation: globalUser.roostedAgent.stripeProductPeriod,
                referralRoostedPlanProductIdOnCreation: globalUser.roostedAgent.stripeProductId,
                referralPayoutNotification: false
              }
            }
            
    
            newReferral = await API.graphql(graphqlOperation(createReferral, {input: params}))

          } else {
            let params = {}
            if(globalUser.userRoostedLicenses.items.length === 0) {
              params = {
                referralRoostedAgentID: sub,
                referralClientID: clientData.id,
                referralState: referral.buyerState,
                referralAddress: {state: referral.buyerState, zip: referral.buyerZip},
                referralReferringAgentState: referralReferringState,
                referralType: 'buyerReferral',
                referralStatus: 'pending',
                referralClientStatus: 'new',
                referralEstimatedPriceRange: referral.buyerPriceRange,
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
                referralTimeFrame: referral.buyerTimeFrame,
                referralPrequalified: referral.buyerPrequalified,
                referralFeeOffered: dataCollected.buyerReferralFee,
                referralCommission: 0.03,
                referralPartnerAgentID: data.usersByEmail.items[0].id,
                referralPartnerShareOnCreation: agentPartnerShare(),
                referralPayoutNotification: false
              }
            } else {
              params = {
                referralRoostedAgentID: sub,
                referralClientID: clientData.id,
                referralState: referral.buyerState,
                referralAddress: {state: referral.buyerState, zip: referral.buyerZip},
                referralReferringAgentState: referralReferringState,
                referralType: 'buyerReferral',
                referralStatus: 'pending',
                referralClientStatus: 'new',
                referralEstimatedPriceRange: referral.buyerPriceRange,
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
                referralTimeFrame: referral.buyerTimeFrame,
                referralPrequalified: referral.buyerPrequalified,
                referralFeeOffered: dataCollected.buyerReferralFee,
                referralCommission: 0.03,
                referralPartnerAgentID: data.usersByEmail.items[0].id,
                referralRoostedPlanOnCreation: globalUser.roostedAgent.stripeProductName,
                referralRoostedPlanPeriodOnCreation: globalUser.roostedAgent.stripeProductPeriod,
                referralRoostedPlanProductIdOnCreation: globalUser.roostedAgent.stripeProductId,
                referralPayoutNotification: false
              }
            }
    
            newReferral = await API.graphql(graphqlOperation(createReferral, {input: params}))
          }
            ////SENDGRID EMAIL TEMPLATE/////
            //Notify agent selected the referral is ready

            let fromEmail = getRoostedEmail(referral.buyerState, 'referral')

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
                  roostedAgentFirstName: globalUser.userFirstName,
                  roostedAgentLastName: globalUser.userLastName,
                  partnerAgentFirstName: trimmedUserFirstName,
                  type: 'buyer',
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
          //   buyerAgent: referral.priorAgent,
          //   buyerState: dataCollected.buyerState,
          //   buyerZip: dataCollected.buyerZip,
          //   buyerTimeFrame: dataCollected.buyerTimeFrame,
          //   buyerPriceRange: dataCollected.buyerPriceRange,
          //   buyerPrequalified: dataCollected.buyerPrequalified === 'Yes' ? true : false,
          //   buyerReferralFee: dataCollected.buyerReferralFee
          // })

          let params = {}
          if(globalUser.userRoostedLicenses.items.length === 0) {
            params = {
              referralRoostedAgentID: sub,
              referralClientID: clientData.id,
              referralState: referral.buyerState,
              referralAddress: {state: referral.buyerState, zip: referral.buyerZip},
              referralReferringAgentState: referralReferringState,
              referralType: 'buyerReferral',
              referralStatus: 'pending',
              referralClientStatus: 'new',
              referralEstimatedPriceRange: referral.buyerPriceRange,
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
              referralTimeFrame: referral.buyerTimeFrame,
              referralPrequalified: referral.buyerPrequalified,
              referralFeeOffered: dataCollected.buyerReferralFee,
              referralCommission: 0.03,
              referralPartnerAgentID: dataCollected.priorAgent,
              referralPartnerShareOnCreation: agentPartnerShare(),
              referralPayoutNotification: false
            }
          } else {
            params = {
              referralRoostedAgentID: sub,
              referralClientID: clientData.id,
              referralState: referral.buyerState,
              referralAddress: {state: referral.buyerState, zip: referral.buyerZip},
              referralReferringAgentState: referralReferringState,
              referralType: 'buyerReferral',
              referralStatus: 'pending',
              referralClientStatus: 'new',
              referralEstimatedPriceRange: referral.buyerPriceRange,
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
              referralTimeFrame: referral.buyerTimeFrame,
              referralPrequalified: referral.buyerPrequalified,
              referralFeeOffered: dataCollected.buyerReferralFee,
              referralCommission: 0.03,
              referralPartnerAgentID: dataCollected.priorAgent,
              referralRoostedPlanOnCreation: globalUser.roostedAgent.stripeProductName,
              referralRoostedPlanPeriodOnCreation: globalUser.roostedAgent.stripeProductPeriod,
              referralRoostedPlanProductIdOnCreation: globalUser.roostedAgent.stripeProductId,
              referralPayoutNotification: false
            }
          }

          newReferral = await API.graphql(graphqlOperation(createReferral, {input: params}))

          ////SENDGRID EMAIL TEMPLATE/////
          //Notify agent select the referral is ready

          const getPriorAgent = await API.graphql(graphqlOperation(getUser, {id: dataCollected.priorAgent}))

          let fromEmail = getRoostedEmail(referral.buyerState, 'referral')

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
                roostedAgentFirstName: globalUser.userFirstName,
                roostedAgentLastName: globalUser.userLastName,
                partnerAgentFirstName: getPriorAgent.data.getUser.userFirstName,
                type: 'buyer',
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

        // const retreivedUser = await API.graphql(graphqlOperation(getUser, {id: sub}))
        // userSetUser(retreivedUser.data.getUser)

     

        ////SENDGRID EMAIL TEMPLATE/////
        //Notify agent that created the referral they made one

        let fromEmail = getRoostedEmail(referral.buyerState, 'referral')

        let toEmail = globalUser.email
        let toFullName = `${globalUser.userFirstName} ${globalUser.userLastName}`

        let custom = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
            emailData: {
              templateId: 'd-ff156c7b2d0f4de18bda5ff01eda9826',
              toEmail: toEmail,
              toFullName: toFullName,
              fromEmail: fromEmail,
              roostedAgentFirstName: globalUser.userFirstName,
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

        fromEmail = getRoostedEmail(referral.buyerState, 'support')

        toEmail = getRoostedEmail(referral.buyerState, 'flock')
        toFullName = 'Roosted'

        custom = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
            emailData: {
              templateId: 'd-fb9a4fb582e04c039618a778257775dd',
              toEmail: toEmail,
              toFullName: toFullName,
              fromEmail: fromEmail,
              roostedAgentFirstName: globalUser.userFirstName,
              roostedAgentLastName: globalUser.userLastName,
              type: 'buyer',
              priceRange: referral.buyerPriceRange,
              clientFirstName: client.clientFirstName,
              clientLastName: client.clientLastName,
              zip: referral.buyerZip,
              state: referralReferringState,
              transactionState: referral.buyerState,
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

      if(referral.referralType === 'buyerReferral') {
        //setReferrals({})
        referralSetClient({})
        history.push('/manage-referrals-sent') 
      } else if(referral.referralType === 'buyerAndSellerReferral') {
        history.push('/referrals/create/seller-referral')
      }
    }
    
    }catch(error){
      setErrorMessage("Failed to create the referral. Please try again or contact support@roosted.io.")
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
        const currentUser = await Auth.currentAuthenticatedUser();
        const sub = currentUser.signInUserSession.idToken.payload.sub

        //get all the referrals created by a user
        let { data } = await API.graphql(graphqlOperation(listReferrals, {
          limit: 900000, 
          filter: { referralRoostedAgentID: { eq: sub}}
        }))
        //setReferrals(data.listReferrals.items)
        if(data.listReferrals.items.length > 0) {
          const priorReferrals = data.listReferrals.items
          const uniqueReferrals = Array.from(new Set(priorReferrals.map(referral => referral.referralPartnerAgentID)))
          .map(partnerID => {
            return priorReferrals.find(referral => referral.referralPartnerAgentID === partnerID)
          })
          //remove roosted agents from the list of agents used in the past for the prior agent dropdown
          const removedRoostedSelects = uniqueReferrals.filter(referral => referral.referralPartnerAgentID !== '111-1111-111-111')
          setFilteredReferrals(removedRoostedSelects.sort(compareValues('referralPartnerAgent', 'asc')))
        }

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
        {/* Change Title */}
        <Typography variant='h4' align='center' style={{color: '#1CA6FC', marginBottom: '2rem'}} gutterBottom>What agent do you want to send this referral to?</Typography>
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
                  disabled={filteredReferrals.length === 0}
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
                helperText={filteredReferrals.length === 0 ? 'You have no prior referrals with agents to select from.' : ''}
                control={control}
                defaultValue={filteredReferrals.length === 0 ? 'No Prior Agents' : filteredReferrals[0].referralPartnerAgentID}
                disabled={filteredReferrals.length === 0 || agentSelection === 'roostedSelects' || agentSelection === 'agentSelects'}
                variant="outlined"
                margin='dense'
                as={<TextField 
                      select     
                      // eslint-disable-next-line react/jsx-sort-props
                      SelectProps={{ native: true }}>
                        <option>Select Agent</option>
                      {filteredReferrals.map(referral => (
                        <option
                          key={referral.referralPartnerAgent !== null && referral.referralPartnerAgent !== undefined ? referral.referralPartnerAgentID : "Deleted"}
                          value={referral.referralPartnerAgent !== null && referral.referralPartnerAgent !== undefined ? referral.referralPartnerAgentID : 'Deleted'}
                        >
                          {referral.referralPartnerAgent !== null && referral.referralPartnerAgent !== undefined ? referral.referralPartnerAgent.userFirstName + ' ' + referral.referralPartnerAgent.userLastName : 'Deleted'}
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
                defaultValue={referral.buyerAgentFirstName === undefined ? '' : referral.buyerAgentFirstName}
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
                defaultValue={referral.buyerAgentLastName === undefined ? '' : referral.buyerAgentLastName}
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
                defaultValue={referral.buyerAgentEmail === undefined ? '' : referral.buyerAgentEmail}
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
                defaultValue={referral.buyerAgentPhone === undefined ? '' : formatPhoneNumber(referral.buyerAgentPhone)}
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
                id='buyerReferralFee'
                name='buyerReferralFee'
                label='What percent referral fee do you want?'
                fullWidth
                defaultValue={getDefaultReferralFee()}
                variant="outlined"
                margin='dense'
                control={control}
                error={errors.buyerReferralFee !== undefined}
                as={TextField}
                />
                {errors.buyerReferralFee && <Typography variant='caption' color='error'>Referral fee is required and must be between 0 and 100.</Typography>}
            </Grid>
          </Grid>
           
          <div className={classes.actions} align='center'>
          <Button 
            className={classes.buttons}
            color="primary"
            variant="contained"
            startIcon={<ArrowBackIosIcon/>}
            onClick={() => {
              history.push('/referrals/create/select-buy-agent')
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
            Submit Buyer Referral
          </Button>
          <Typography variant='subtitle2' style={{paddingTop: '1rem'}}>Once you submit the referral the agent selected will be notified.</Typography>
          {referral.referralType === 'buyerAndSellerReferral' ? <Typography variant='subtitle2' style={{paddingTop: '1rem'}}>Since you selected this is a buyer and seller referral you'll be taken to the seller information screen next.</Typography> : <React.Fragment/>}
        </div>
        </form>
      </CardContent>
      {loading ? <LinearProgress/> : <React.Fragment/>}
    </Card>
  );
}

CompleteBuyReferral.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(CompleteBuyReferral);
