import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  Stepper,
  StepLabel,
  Step,
  Button,
  Grid,
  TextField,
  LinearProgress
} from '@mui/material';
import { getClientStatusStepsObject, getClientStatusStepArray, getClientStatusStepsObjectArray, getRoostedEmail, getW9Link } from '../../../utils/utilities'

import { isMobile } from 'react-device-detect'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../../store/actions/index';

import { useForm, Controller } from "react-hook-form";

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { updateReferral } from "../../../graphql/mutations"

const useStyles = makeStyles(theme => ({
  root: {},
  header: {
    backgroundColor: '#0F3164',
    color: '#FFFFFF'
  },
  buttons: {
    margin: '1rem'
  }
}));

//new, clientContacted, agreementSigned, touring, underContract, clientLost, closed; sellers: new, clientContacted, agreementSigned, listed, reviewingOffers, underContract, clientLost, closed


function ReferralClientStatus({ className, dataCollected, setDataCollected, referral, globalUser, userSetUser, ...rest }) {
  const classes = useStyles()
  
  //PROCESS VARIABLES
  const [loading, setLoading] = useState(false)
  const [steps, setSteps] = useState([])

  const [activeStep, setActiveStep] = useState(0);
  //END MANAGE STEPS

  //REACT HOOK FORMS
  const { control, handleSubmit } = useForm();
  const onSubmit = async (formDataCollected) => {

      setLoading(true)
    try {
      //get the current users sub 
      // const currentUser = await Auth.currentAuthenticatedUser();
      // const sub = currentUser.signInUserSession.idToken.payload.sub
      setDataCollected.setOpen(false)
      let data = {}
      if(formDataCollected.clientStatus === 'clientLost') {
        data = await API.graphql(graphqlOperation(updateReferral, {input: {id: referral.id, referralClientStatus: formDataCollected.clientStatus, referralStatus: 'clientLost'}}))
        setSteps(getClientStatusStepArray('clientLost'))
        setActiveStep(getClientStatusStepArray('clientLost').indexOf(getClientStatusStepsObject(formDataCollected.clientStatus)))

      } else if(formDataCollected.clientStatus === 'closed') {
        data = await API.graphql(graphqlOperation(updateReferral, {input: {id: referral.id, referralClientStatus: formDataCollected.clientStatus, referralStatus: 'closed'}}))
        setActiveStep(getClientStatusStepArray(referral.referralType).indexOf(getClientStatusStepsObject(formDataCollected.clientStatus)))

      } else {
        data = await API.graphql(graphqlOperation(updateReferral, {input: {id: referral.id, referralClientStatus: formDataCollected.clientStatus, referralStatus: 'accepted'}}))
        setSteps(getClientStatusStepArray(referral.referralType))
        setActiveStep(getClientStatusStepArray(referral.referralType).indexOf(getClientStatusStepsObject(formDataCollected.clientStatus)))
      }
   
      setActiveStep(steps.indexOf(getClientStatusStepsObject(formDataCollected.clientStatus)))
      setDataCollected.setReferral(data.data.updateReferral)


      setLoading(false)
    }catch(error){
      setDataCollected.setErrorMessage("Failed to change client status. Please try again or contact support@roosted.io.")
      setDataCollected.setOpen(true)
      setLoading(false)
      console.log(error)
    }

    try {

      if(formDataCollected.clientStatus === 'underContract') {
        //SENDGRID EMAIL TEMPLATE/////

        let fromEmail = getRoostedEmail(referral.referralReferringAgentState, 'referral')

        let custom = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
            emailData: {
              templateId: 'd-aee5ab8e66b946afa11dccd915f2e4e9',
              toEmail: globalUser.email,
              toFullName: globalUser.userFirstName + ' ' + globalUser.userLastName,
              fromEmail: fromEmail,
              partnerAgentFirstName: globalUser.userFirstName,
              w9Link: getW9Link(referral.referralReferringAgentState)
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
        //SENDGRID EMAIL TEMPLATE/////
      }


      if(referral.referralRoostedAgent !== undefined && referral.referralRoostedAgent !== null && referral.referralClientStatus !== 'closed') {
        //SENDGRID EMAIL TEMPLATE/////

        let fromEmail = getRoostedEmail(referral.referralReferringAgentState, 'support')

        let custom = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
            emailData: {
              templateId: 'd-4ff732589dad47348ee9f8829206ec2b',
              toEmail: referral.referralRoostedAgent.email,
              toFullName: referral.referralRoostedAgent.userFirstName + ' ' + referral.referralRoostedAgent.userLastName,
              fromEmail: fromEmail,
              roostedAgentFirstName: referral.referralRoostedAgent.userFirstName,
              type: referral.referralType === 'buyerReferral' ? 'Buyer' : 'Seller',
              clientFirstName: referral.referralClient.clientFirstName,
              clientLastName: referral.referralClient.clientLastName,
              partnerAgentFirstName: globalUser.userFirstName,
              partnerAgentLastName: globalUser.userLastName,
              status: getClientStatusStepsObject(formDataCollected.clientStatus),
              referralLink: `https://app.roosted.io/referrals/details/roosted/${referral.id}/referraldata?id=${referral.referralRoostedAgent.id}`
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
        //SENDGRID EMAIL TEMPLATE/////

      
      } else if(referral.referralRoostedAgent !== undefined && referral.referralRoostedAgent !== null && referral.referralClientStatus === 'closed' ) {
        //SENDGRID EMAIL TEMPLATE/////

        let fromEmail = getRoostedEmail(referral.referralReferringAgentState, 'support')
 
        let custom = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
            emailData: {
              templateId: 'd-34a08129210a46f784515c44a16211b2',
              toEmail: referral.referralRoostedAgent.email,
              toFullName: referral.referralRoostedAgent.userFirstName + ' ' + referral.referralRoostedAgent.userLastName,
              fromEmail: fromEmail,
              roostedAgentFirstName: referral.referralRoostedAgent.userFirstName,
              type: referral.referralType === 'buyerReferral' ? 'Buyer' : 'Seller',
              clientFirstName: referral.referralClient.clientFirstName,
              clientLastName: referral.referralClient.clientLastName,
              roostedAgentAddress: `${referral.referralRoostedAgent.userAddress.street} ${referral.referralRoostedAgent.userAddress.unit} ${referral.referralRoostedAgent.userAddress.city}, ${referral.referralRoostedAgent.userAddress.state} ${referral.referralRoostedAgent.userAddress.zip}`
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
        //SENDGRID EMAIL TEMPLATE/////

        //TWILIO TEXT/////

       let textData = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
          phoneNumber: referral.referralRoostedAgent.userPhone,
          message: `Your referral for ${referral.referralClient.clientFirstName} ${referral.referralClient.clientLastName} is now marked closed! Check your email for next steps.`
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
    }catch(error) {
      console.log(error)
    }
  }
  //END REACT HOOK FORMS

  useEffect(() => {

 
    if(referral.referralType !== undefined) {
      setSteps(getClientStatusStepArray(referral.referralClientStatus === 'clientLost' ? 'clientLost' : referral.referralType))
      setActiveStep(getClientStatusStepArray(referral.referralClientStatus === 'clientLost' ? 'clientLost' : referral.referralType).indexOf(getClientStatusStepsObject(referral.referralClientStatus)))
    }
  // eslint-disable-next-line
  }, []
  )

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      {loading ? <LinearProgress/> : <React.Fragment/>}
      <CardHeader classes={{title: classes.header}} title="Client Status" className={classes.header} />
      <Divider />
      <CardContent>
        <div className={classes.root}>
          <form {...rest} onSubmit={handleSubmit(onSubmit)}>
          <Grid
              container
              spacing={0}
            >
              <Grid
                item
                xs={12}
                align='center'
              >
                <div >
                  <Controller
                    style={{verticalAlign: 'middle'}}
                    //label="Change Plan"
                    id="clientStatus"
                    name="clientStatus"
                    control={control}
                    defaultValue={referral.referralClientStatus}
                    variant="outlined"
                    margin='dense'
                    as={<TextField 
                          select     
                          // eslint-disable-next-line react/jsx-sort-props
                          SelectProps={{ native: true }}>
                          {getClientStatusStepsObjectArray(referral.referralType).map(step => (
                            <option
                              key={step.value}
                              value={step.value}
                            >
                              {step.name}
                            </option>
                          ))}
                        </TextField>}
                    />
                  <Button
                    color="primary"
                    variant="contained"
                    className={classes.buttons}
                    size='small'
                    // endIcon={<ArrowForwardIosIcon/>}
                    type='submit'
                    disabled={loading || referral.referralStatus !== 'accepted'}
                  >
                    Change Client Status
                  </Button>
                </div>
              </Grid>
              
            </Grid>
            </form>
          <Stepper activeStep={activeStep} alternativeLabel={!isMobile} orientation={isMobile ? 'vertical' : 'horizontal'}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </div>
      </CardContent>
      {loading ? <LinearProgress/> : <React.Fragment/>}
    </Card>
  );
}

ReferralClientStatus.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(ReferralClientStatus);
