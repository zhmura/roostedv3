import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import {
  Card,
  Grid,
  CardContent,
  Button,
  Typography,
  LinearProgress,
  Divider
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { listRoostedLicenses, listPartnerLicenses } from "../../graphql/queries"
import { createReferral, createClient } from "../../graphql/mutations"

import { 
  agentShareByPlan, 
  agentPartnerShare, 
  getDefaultReferralFee,
  estimatePayout, 
  getRoostedEmail } from '../../utils/utilities'

const useStyles = makeStyles((theme) => ({
  root: {},
  actions: {
    marginTop: theme.spacing(3),
  },
  buttons: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
  divider: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2)
  }
}));


function SelectBuyAgent(
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
  const [showSubmit, setShowSubmit] = useState(false)

  const onAgentSelection = async (agentType) => {
    console.log(agentType)
    // Use this incase someone comes back to a referral and state has been erased

    if(referral.referralType === undefined) {
      return history.push('/referrals/create/select-type')
    }
    if(client.clientFirstName === undefined) {
      return history.push('/referrals/create/select-type')
    }
    setLoading(true)
    try {
      if(agentType === 'agentSelects') {
      referralSetReferral({
        referralType: referral.referralType,
        buyerState: referral.buyerState,
        buyerZip: referral.buyerZip,
        buyerTimeFrame: referral.buyerTimeFrame,
        buyerPriceRange: referral.buyerPriceRange,
        buyerPrequalified: referral.buyerPrequalified,
        referralAgentType: 'agentSelects'
      })
      history.push('/referrals/create/complete-buy-referral') 
    } else if(agentType === 'roostedNetwork') {
      referralSetReferral({
        referralType: referral.referralType,
        buyerState: referral.buyerState,
        buyerZip: referral.buyerZip,
        buyerTimeFrame: referral.buyerTimeFrame,
        buyerPriceRange: referral.buyerPriceRange,
        buyerPrequalified: referral.buyerPrequalified,
        referralAgentType: 'roostedNetwork'
      })
      history.push('/referrals/create/select-from-network-buy') 
    }
    }catch(error){
      setErrorMessage("Failed to save referral data. Please try again or contact support@roosted.io.")
      setOpen(true)
      setLoading(false)
      console.log(error)
    }
  }

  const onShowSubmit = () => {
    setShowSubmit(!showSubmit)
  }

  const onSubmitToRoosted = async () => {

    if(referral.referralType === undefined) {
      return history.push('/referrals/create/admin/select-type')
    }
    if(client.clientFirstName === undefined) {
      return history.push('/referrals/create/admin/select-type')
    }
  
    try {

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
     const roostedAgentEstimatedPayout = estimatePayout('roostedAgent', 0.03, parseFloat(getDefaultReferralFee()/100), agentShare, referral.buyerPriceRange)
     const partnerAgentEstimatedPayout = estimatePayout('partnerAgent', 0.03, parseFloat(getDefaultReferralFee()/100), agentShare, referral.buyerPriceRange)
     const roostedEstimatedPayout = estimatePayout('roosted', 0.03, parseFloat(getDefaultReferralFee()/100), agentShare, referral.buyerPriceRange)

     let newReferral = {}

     let params = {}
     if(globalUser.userRoostedLicenses.items.length === 0) {
       params = {
         referralRoostedAgentID: sub,
         referralClientID: clientData.id,
         referralState: referral.buyerState,
         referralAddress: {state: referral.buyerState, zip: referral.buyerZip},
         referralReferringAgentState: referralReferringState,
         referralType: 'buyerReferral',
         referralStatus: 'waitingForAgentAssignment',
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
         initialAgentSelection: 'roosted',
         referralTimeFrame: referral.buyerTimeFrame,
         referralPrequalified: referral.buyerPrequalified === 'Yes' ? true : false,
         referralFeeOffered: getDefaultReferralFee(globalUser.userRoostedLicenses.items.length === 0 ? 'partnerAgent' : 'roostedAgent'),
         referralCommission: 0.03,
         referralPartnerAgentID: '111-1111-111-111',
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
         referralStatus: 'waitingForAgentAssignment',
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
         initialAgentSelection: 'roosted',
         referralTimeFrame: referral.buyerTimeFrame,
         referralPrequalified: referral.buyerPrequalified === 'Yes' ? true : false,
         referralFeeOffered: getDefaultReferralFee(globalUser.userRoostedLicenses.items.length === 0 ? 'partnerAgent' : 'roostedAgent'),
         referralCommission: 0.03,
         referralPartnerAgentID: '111-1111-111-111',
         referralRoostedPlanOnCreation: globalUser.roostedAgent.stripeProductName,
         referralRoostedPlanPeriodOnCreation: globalUser.roostedAgent.stripeProductPeriod,
         referralRoostedPlanProductIdOnCreation: globalUser.roostedAgent.stripeProductId,
         referralPayoutNotification: false
       }
     }

     newReferral = await API.graphql(graphqlOperation(createReferral, {input: params}))

     ////SENDGRID EMAIL TEMPLATE/////
     //Notify broker they have to select an agent

     let fromEmail = getRoostedEmail(referral.buyerState, 'support')

     let toEmail = getRoostedEmail(referral.buyerState, 'broker')
     let toFullName = 'Roosted Broker'

     let custom = { 
       headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
       body: {
         emailData: {
           templateId: 'd-9ba61a58a7ab4fcaaf06a51818ea4c7a',
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
           referralLink: `https://app.roosted.io/referrals/details/broker/${newReferral.data.createReferral.id}/referraldata`
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

    let fromEmail2 = getRoostedEmail(referral.buyerState, 'support')
    let toEmail2 = getRoostedEmail(referral.buyerState, 'flock')
    let toFullName2 = 'Roosted'

    let custom2 = { 
      headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
      body: {
        emailData: {
          templateId: 'd-fb9a4fb582e04c039618a778257775dd',
          toEmail: toEmail2,
          toFullName: toFullName2,
          fromEmail: fromEmail2,
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
    console.log(custom2)
    const sendGridResponseRoosted = await API.post(
      'roostedRestAPI', 
      '/sendgrid/send-email',
      custom2
    )
    console.log(sendGridResponseRoosted)

    ////SENDGRID EMAIL TEMPLATE/////


     if(referral.referralType === 'buyerReferral') {
      //setReferrals({})
      referralSetClient({})
      history.push('/manage-referrals-sent') 
      } else if(referral.referralType === 'buyerAndSellerReferral') {
        history.push('/referrals/create/seller-referral')
      }
    
    }catch(error){
      setErrorMessage("Failed to save referral data. Please try again or contact support@roosted.io.")
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
        <Typography variant='h4' align='center' style={{marginBottom: '2rem'}} gutterBottom>How do you want to assign the REALTOR{<span>&#174;</span>} to send this referral to?</Typography>
        <Grid
            container
            spacing={1}
          >
            <Grid
              item
              md={4}
              xs={12}
            >
              <Button
                className={classes.buttons}
                color="primary"
                variant="contained"
     
                onClick={() => onAgentSelection('agentSelects')}
              >
                Enter Contact Info for a Specific Agent {<br/>} (and choose the referral fee)
              </Button>
            </Grid>
            <Grid
              item
              md={4}
              xs={12}
              align='center'
            >
              <Button
                className={classes.buttons}
                color="primary"
                variant="contained"
                //disabled={true}
                onClick={() => onAgentSelection('roostedNetwork')}
              >
                Select an Agent from Roosted’s network {<br/>} (35% Referral Fee)
              </Button>
            </Grid>
            <Grid
              item
              md={4}
              xs={12}
              align='center'
            >
              <Button
                className={classes.buttons}
                color="primary"
                variant="contained"
  
                onClick={() => onShowSubmit()}
              >
                Let Roosted Assign The Receiving Agent {<br/>} (35% Referral Fee)
              </Button>
            </Grid>
          </Grid>
          <Divider className={classes.divider} />
          <div className={classes.actions} align='center'>
          <Button 
            className={classes.buttons}
            color="primary"
            variant="contained"
            startIcon={<ArrowBackIosIcon/>}
            onClick={() => {
              history.push('/referrals/create/buyer-referral')
            }}
          >
            Back
          </Button>
          {showSubmit ? 
          <Button
            color="primary"
            variant="contained"
            className={classes.buttons}
            endIcon={<ArrowForwardIosIcon/>}
            onClick={() => onSubmitToRoosted()}
            type='submit'
          >
            Submit Referral
          </Button> : <React.Fragment/>}
        </div>
      </CardContent>
      {loading ? <LinearProgress/> : <React.Fragment/>}
    </Card>
  );
}

SelectBuyAgent.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(SelectBuyAgent);
