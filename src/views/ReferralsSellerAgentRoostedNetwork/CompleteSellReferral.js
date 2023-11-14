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
} from '@mui/material';
import { useForm, Controller } from "react-hook-form";
import { estimatePayout, compareValues } from '../../utils/utilities'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

import { 
  agentShareByPlan, 
  agentPartnerShare, 
  getRoostedEmail,
  getDefaultReferralFee } from '../../utils/utilities'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { listPartnerLicenses, getUser, listRoostedLicenses } from "../../graphql/queries"
import { createReferral, createClient} from "../../graphql/mutations"

//IMPORT ZIP CODES -ADD
import zipcodes from 'zipcodes'

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


function CompleteSellReferral(
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
  const [partnerAgentArray, setPartnerAgentArray] = useState([])

  const { control, handleSubmit } = useForm({});

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
    if(dataCollected.roostedNetworkAgent === 'Select Agent' || dataCollected.roostedNetworkAgent === 'No Agents Found') {
      setErrorMessage('Select and agent before submitting')
      setOpen(true)
      setLoading(false)
    } else {
      setLoading(true)
      try {
          setOpen(false)
          // get the current users sub 
          const currentUser = await Auth.currentAuthenticatedUser();
          const sub = currentUser.signInUserSession.idToken.payload.sub

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
          const roostedAgentEstimatedPayout = estimatePayout('roostedAgent', 0.03, parseFloat(getDefaultReferralFee('roosted')/100), agentShare, referral.sellerPriceRange)
          const partnerAgentEstimatedPayout = estimatePayout('partnerAgent', 0.03, parseFloat(getDefaultReferralFee('partner')/100), agentShare, referral.sellerPriceRange)
          const roostedEstimatedPayout = estimatePayout('roosted', 0.03, parseFloat(getDefaultReferralFee('roosted')/100), agentShare, referral.sellerPriceRange)
          
          let newReferral = {}

          let params = {}
          if(globalUser.userRoostedLicenses.items.length === 0) {
            params = {
              referralRoostedAgentID: sub,
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
              referralTimeFrame: referral.sellerTimeFrame,
              referralFeeOffered: dataCollected.sellerReferralFee,
              referralCommission: 0.03,
              referralPartnerAgentID: dataCollected.roostedNetworkAgent,
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
              referralRoostedAgentID: sub,
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
              referralTimeFrame: referral.sellerTimeFrame,
              referralFeeOffered: dataCollected.sellerReferralFee,
              referralCommission: 0.03,
              referralPartnerAgentID: dataCollected.roostedNetworkAgent,
              referralRoostedPlanOnCreation: globalUser.roostedAgent.stripeProductName,
              referralRoostedPlanPeriodOnCreation: globalUser.roostedAgent.stripeProductPeriod,
              referralRoostedPlanProductIdOnCreation: globalUser.roostedAgent.stripeProductId,
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
          //Notify agent selected the referral is ready

          const getRoostedNetworkAgent = await API.graphql(graphqlOperation(getUser, {id: dataCollected.roostedNetworkAgent}))

          let fromEmailReferral = getRoostedEmail(referral.sellerReferralState, 'referral')

          let toEmailPartner = getRoostedNetworkAgent.data.getUser.email
          let toFullNamePartner = `${getRoostedNetworkAgent.data.getUser.userFirstName} ${getRoostedNetworkAgent.data.getUser.userLastName}`

          let customPartnerAgent = { 
            headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
            body: {
              emailData: {
                templateId: 'd-02693d93fc804c95a61337384aa8deac',
                toEmail: toEmailPartner,
                toFullName: toFullNamePartner,
                fromEmail: fromEmailReferral,
                roostedAgentFirstName: globalUser.userFirstName,
                roostedAgentLastName: globalUser.userLastName,
                partnerAgentFirstName: getRoostedNetworkAgent.data.getUser.userFirstName,
                type: 'seller',
                referralLink: `https://app.roosted.io/referrals/details/partner/${newReferral.data.createReferral.id}/referraldata`
              }
            }
          }
          console.log(customPartnerAgent)
          const sendGridResponsePartnerAgent = await API.post(
            'roostedRestAPI', 
            '/sendgrid/send-email',
            customPartnerAgent
          )
          console.log(sendGridResponsePartnerAgent)

          ////SENDGRID EMAIL TEMPLATE/////
      
          ////SENDGRID EMAIL TEMPLATE/////
          //Notify agent that created the referral they made one

          let toEmailRoostedAgent = globalUser.email
          let toFullNameRoostedAgent = `${globalUser.userFirstName} ${globalUser.userLastName}`

          let customRoostedAgent = { 
            headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
            body: {
              emailData: {
                templateId: 'd-ff156c7b2d0f4de18bda5ff01eda9826',
                toEmail: toEmailRoostedAgent,
                toFullName: toFullNameRoostedAgent,
                fromEmail: fromEmailReferral,
                roostedAgentFirstName: globalUser.userFirstName,
                referralLink: `https://app.roosted.io/referrals/details/roosted/${newReferral.data.createReferral.id}/referraldata`
              }
            }
          }
          console.log(customRoostedAgent)
          const sendGridResponseRoostedAgent = await API.post(
            'roostedRestAPI', 
            '/sendgrid/send-email',
            customRoostedAgent
          )
          console.log(sendGridResponseRoostedAgent)

          ////SENDGRID EMAIL TEMPLATE/////

          ////SENDGRID EMAIL TEMPLATE/////
          //Notify roosted that a referral was created in their state

          let fromEmailSupport = getRoostedEmail(referral.sellerReferralState, 'support')

          let toEmailFlock = getRoostedEmail(referral.sellerReferralState, 'flock')
          let toFullNameFlock = 'Roosted'

          let customFlock = { 
            headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
            body: {
              emailData: {
                templateId: 'd-fb9a4fb582e04c039618a778257775dd',
                toEmail: toEmailFlock,
                toFullName: toFullNameFlock,
                fromEmail: fromEmailSupport,
                roostedAgentFirstName: globalUser.userFirstName,
                roostedAgentLastName: globalUser.userLastName,
                type: 'seller',
                priceRange: referral.sellrPriceRange,
                clientFirstName: client.clientFirstName,
                clientLastName: client.clientLastName,
                zip: referral.sellerReferralZip,
                state: referralReferringState,
                transactionState: referral.sellerReferralState,
                referralLink: `https://app.roosted.io/referrals/details/broker/${newReferral.data.createReferral.id}/referraldata`
              }
            }
          }
          console.log(customFlock)
          const sendGridResponseRoosted = await API.post(
            'roostedRestAPI', 
            '/sendgrid/send-email',
            customFlock
          )
          console.log(sendGridResponseRoosted)

          ////SENDGRID EMAIL TEMPLATE/////

          setLoading(false)

          if(referral.referralType === 'sellerReferral') {
            //setReferrals({})
            referralSetClient({})
            history.push('/manage-referrals-sent') 
          } else if(referral.referralType === 'buyerAndSellerReferral') {
            history.push('/manage-referrals-sent')
          }
      }catch(error){
        setErrorMessage("Failed to create the referral. Please try again or contact support@roosted.io.")
        setOpen(true)
        setLoading(false)
        console.log(error)
      }

      try {
        let getRoostedNetworkAgent = await API.graphql(graphqlOperation(getUser, {id: dataCollected.roostedNetworkAgent}))
          //TWILIO TEXT/////

          let textData = { 
            headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
            body: {
              phoneNumber: getRoostedNetworkAgent.data.getUser.userPhone,
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
  
      } catch(error) {
        console.log(error)
      }

    }
  }

  useEffect(() => { // -EDIT

    const getRoostedNetworkAgents = async () => {
      try {
        setLoading(true)
        // const currentUser = await Auth.currentAuthenticatedUser();
        // const sub = currentUser.signInUserSession.idToken.payload.sub

        //GET PARTNER AGENTS
        let getPartnerAgents = await API.graphql(graphqlOperation(listPartnerLicenses, {
          limit: 900000,
          filter: {licenseState: { eq: referral.sellerReferralState}},
        }))

        if(getPartnerAgents.data.listPartnerLicenses.items.length === 0) {
          setErrorMessage('Not existing Roosted agents were found to services this state or zip code. Hit the "Back" button and select to enter your own agent or select for Roosted to find an agent.')
          setOpen(true)
          setLoading(false)
        } else {  

          let partnersByZipCode = []
          for(let i = 0; i < getPartnerAgents.data.listPartnerLicenses.items.length; i++) {
            let zipCodesByRadius = zipcodes.radius(getPartnerAgents.data.listPartnerLicenses.items[i].zipCode, getPartnerAgents.data.listPartnerLicenses.items[i].radius)
            for(let n = 0; n < zipCodesByRadius.length; n++) {
              if(zipCodesByRadius[n] === referral.sellerReferralZip) {
                partnersByZipCode.push(getPartnerAgents.data.listPartnerLicenses.items[i])
              }
            }
          } 

          if(partnersByZipCode.length === 0) {
            setErrorMessage('Not existing Roosted agents were found to services this state or zip code. Hit the "Back" button and select to enter your own agent or select for Roosted to find an agent.')
            setOpen(true)
            setLoading(false)
          } else {
            setPartnerAgentArray(partnersByZipCode.sort(compareValues('licenseUser', 'asc')))
          }
        }

        /////END GETTING PARTNER AGENTS

        setLoading(false)
      } catch(error) {
        setErrorMessage("Failed to retreive prior agents used. Please try again or contact support@roosted.io.")
        setOpen(true)
        setLoading(false)
        console.log(error)
      }
    }

    getRoostedNetworkAgents()
    
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
              md={12}
              xs={12}
            >
              <Controller
                fullWidth
                label="Partner Agents Within Zip Code Selected"
                id="roostedNetworkAgent"
                name="roostedNetworkAgent"
                helperText={partnerAgentArray.length === 0 ? 'No partner agents to select from.' : ''}
                control={control}
                defaultValue={partnerAgentArray.length === 0 ? 'No Agents Found' : 'Select Agent'}//filteredReferrals[0].referralPartnerAgentID}
                disabled={partnerAgentArray.length === 0}
                variant="outlined"
                margin='dense'
                as={<TextField 
                      select     
                      // eslint-disable-next-line react/jsx-sort-props
                      SelectProps={{ native: true }}>
                      <option>Select Agent</option>
                      {/* Not that agent is really license  */}
                      {partnerAgentArray.map(agent => (
                        <option
                          key={agent !== null && agent !== undefined ? agent.licenseUserID : 'Deleted'}
                          value={agent !== null && agent !== undefined ? agent.licenseUserID : 'Deleted'}
                        >
                          {agent !== null && agent !== undefined ? agent.licenseUser.userLastName + ', ' + agent.licenseUser.userFirstName + ' (' + agent.broker + ' ' + agent.licenseNumber + ')' : ''}
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
              referral.referralType = 'sellerReferral'
              history.push('/referrals/create/select-sell-agent')
            }}
          >
            Back
          </Button>
          <Button
            color="primary"
            variant="contained"
            className={classes.buttons}
            endIcon={<ArrowForwardIosIcon/>}
            disabled={partnerAgentArray.length === 0}
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

CompleteSellReferral.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(CompleteSellReferral);
