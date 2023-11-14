import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import {
  Modal,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Grid,
  Divider,
  Typography,
  TextField,
  LinearProgress,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import {NumberFormatBase}  from 'react-number-format'

import { formatPhoneNumber, formatPhoneNumberToString, getDefaultReferralFee, getRoostedEmail } from '../../../utils/utilities'

import { useForm, Controller } from "react-hook-form";

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { updateReferral, createUser, updateUser } from "../../../graphql/mutations"
import { listReferrals, usersByEmail, getUser } from "../../../graphql/queries"

import * as yup from 'yup'

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    boxShadow: theme.shadows[20],
    width: 700,
    maxHeight: '100%',
    overflowY: 'auto',
    maxWidth: '100%'
  },
  actions: {
    justifyContent: 'flex-end'
  }
}));

function ModalEditPartnerAgent({
  open, onClose, customer, className, dataCollected, setDataCollected, referral, ...rest
}) {
  const classes = useStyles();

  const [cardLoading, setCardLoading] = useState(false)

  const [filteredReferrals, setFilteredReferrals] = useState([])
  const [agentSelection, setAgentSelection] = useState('roostedSelects')

  ////CHANGE USE PRIOR AGENT////
  const handleChange = event => {
    console.log(event.target.value)
    setAgentSelection(event.target.value)
  }

  //REACT HOOK FORMS
  const FormSchema = yup.object().shape({
    agentFirstName: agentSelection === 'roostedSelects' || agentSelection === 'priorAgent' ? null : yup.string().required(),
    agentLastName: agentSelection === 'roostedSelects' || agentSelection === 'priorAgent' ? null : yup.string().required(),
    agentEmail: agentSelection === 'roostedSelects' || agentSelection === 'priorAgent' ? null : yup.string().required().email(),
    agentPhone: agentSelection === 'roostedSelects' || agentSelection === 'priorAgent' ? null: yup.string().required().matches(/((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}/),
  });

  const { control, handleSubmit, errors } = useForm({
    validationSchema: FormSchema
  });
  const onSubmit = async (formDataCollected) => {

    //setLoading(true)
    setCardLoading(true)
 
    try {
      //get the current users sub 
      // const currentUser = await Auth.currentAuthenticatedUser();
      // const sub = currentUser.signInUserSession.idToken.payload.sub
      setDataCollected.setOpen(false)
      if(agentSelection === 'roostedSelects') {
        console.log('roosted')
        const updatedReferral = await API.graphql(graphqlOperation(updateReferral, {input: {id: referral.id, referralClientStatus: 'new', referralStatus: 'waitingForAgentAssignment', referralPartnerAgentID: '111-1111-111-111', referralFeeOffered: getDefaultReferralFee(referral.referralPartnerShareOnCreation === null || referral.referralPartnerShareOnCreation === undefined ? 'roostedAgent' : 'partnerAgent')}}))

        ////SENDGRID EMAIL TEMPLATE/////
        //Notify broker they have to select an agent

        let fromEmail = getRoostedEmail(referral.referralReferringAgentState, 'support')
        let toEmail = getRoostedEmail(referral.referralState, 'broker')
        let toFullName = 'Roosted Broker'

        let custom = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
            emailData: {
              templateId: 'd-9ba61a58a7ab4fcaaf06a51818ea4c7a',
              toEmail: toEmail,
              toFullName: toFullName,
              fromEmail: fromEmail,
              roostedAgentFirstName: referral.referralRoostedAgent.userFirstName,
              roostedAgentLastName: referral.referralRoostedAgent.userLastName,
              type: referral.referralType === 'buyerReferral' ? 'Buyer' : 'Seller',
              priceRange: referral.referralEstimatedPriceRange,
              clientFirstName: referral.referralClient.clientFirstName,
              clientLastName: referral.referralClient.clientLastName,
              zip: referral.referralAddress.zip,
              state: referral.referralState,
              referralLink: `https://app.roosted.io/referrals/details/broker/${referral.id}/referraldata`
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
        //Notify an agent they have been removed from a referral
        let fromEmail2 = getRoostedEmail(referral.referralState, 'referral')

        let custom2 = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
            emailData: {
              templateId: 'd-22cdedd6de364b81a081ca2a9cd37129',
              toEmail: referral.referralPartnerAgent.email,
              toFullName: referral.referralPartnerAgent.userFirstName + ' ' + referral.referralPartnerAgent.userLastName,
              fromEmail: fromEmail2,
              referralType: referral.referralType === 'buyerReferral' ? 'Buyer' : 'Seller',
              roostedAgentFirstName: referral.referralRoostedAgent.userFirstName,
              roostedAgentLastName: referral.referralRoostedAgent.userLastName,
              clientFirstName: referral.referralClient.clientFirstName,
              clientLastName: referral.referralClient.clientLastName,
              partnerAgentFirstName: referral.referralPartnerAgent.userFirstName,
            }
          }
        }
        console.log(custom2)
        const sendGridResponse2 = await API.post(
          'roostedRestAPI', 
          '/sendgrid/send-email',
          custom2
        )
        console.log(sendGridResponse2)
        //SENDGRID EMAIL TEMPLATE/////
        setDataCollected.setReferral(updatedReferral.data.updateReferral)

      } else if(agentSelection === 'agentSelects') {
        console.log('agent')
        let updatedReferral = {}

        let { data } = await API.graphql(graphqlOperation(usersByEmail, {email: formDataCollected.agentEmail}))      
        
        //use this to select the right email template
        let existingAgent = false

        if(data.usersByEmail.items.length === 0) {

          const newUserParams = {
            userFirstName: formDataCollected.agentFirstName,
            userLastName: formDataCollected.agentLastName,
            email: formDataCollected.agentEmail,
            userPhone: formatPhoneNumberToString(formDataCollected.agentPhone),
            setupStatus: 'getLicenseInfo',
            setupType: 'addedAgent',
            userType: 'user',
            navBar: 'setup',
            addedAgentComplete: false,
          }

          //create the new user
          const createdUser = await API.graphql(graphqlOperation(createUser, {input: newUserParams}))

          //We need to change the ownerfield to the newly created owner, since it will default to the currently logged in user.
          await API.graphql(graphqlOperation(updateUser, {input: {id: createdUser.data.createUser.id, owner: createdUser.data.createUser.id}}))
  
          updatedReferral = await API.graphql(graphqlOperation(updateReferral, {input: {id: referral.id, referralClientStatus: 'new', referralStatus: 'pending', referralPartnerAgentID: createdUser.data.createUser.id}}))

        } else {
          existingAgent = true
  
          updatedReferral = await API.graphql(graphqlOperation(updateReferral, {input: {id: referral.id, referralClientStatus: 'new', referralStatus: 'pending', referralPartnerAgentID: data.usersByEmail.items[0].id}}))
        }

          ////SENDGRID EMAIL TEMPLATE/////
          //Notify agent select the referral is ready

          let fromEmail = getRoostedEmail(referral.referralState, 'referral')
          let toEmail = formDataCollected.agentEmail
          let toFullName = `${formDataCollected.agentFirstName} ${formDataCollected.agentLastName}`

          let custom = { 
            headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
            body: {
              emailData: {
                templateId: existingAgent ? 'd-02693d93fc804c95a61337384aa8deac' : 'd-dee6f2480ac3465097198c308c24ab2a',
                toEmail: toEmail,
                toFullName: toFullName,
                fromEmail: fromEmail,
                roostedAgentFirstName: referral.referralRoostedAgent.userFirstName,
                roostedAgentLastName: referral.referralRoostedAgent.userLastName,
                partnerAgentFirstName: formDataCollected.agentFirstName,
                type: referral.referralType === 'buyerReferral' ? 'Buyer' : 'Seller',
                referralLink: `https://app.roosted.io/referrals/details/partner/${referral.id}/referraldata`
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
        //Notify an agent they have been removed from a referral
        let fromEmail2 = getRoostedEmail(referral.referralState, 'referral')
        let custom2 = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
            emailData: {
              templateId: 'd-22cdedd6de364b81a081ca2a9cd37129',
              toEmail: referral.referralPartnerAgent.email,
              toFullName: referral.referralPartnerAgent.userFirstName + ' ' + referral.referralPartnerAgent.userLastName,
              fromEmail: fromEmail2,
              referralType: referral.referralType === 'buyerReferral' ? 'Buyer' : 'Seller',
              roostedAgentFirstName: referral.referralRoostedAgent.userFirstName,
              roostedAgentLastName: referral.referralRoostedAgent.userLastName,
              clientFirstName: referral.referralClient.clientFirstName,
              clientLastName: referral.referralClient.clientLastName,
              partnerAgentFirstName: referral.referralPartnerAgent.userFirstName,
            }
          }
        }
        console.log(custom2)
        const sendGridResponse2 = await API.post(
          'roostedRestAPI', 
          '/sendgrid/send-email',
          custom2
        )
        console.log(sendGridResponse2)
        //SENDGRID EMAIL TEMPLATE/////
          
        setDataCollected.setReferral(updatedReferral.data.updateReferral)

      } else if(agentSelection === 'priorAgent') {
        console.log('prior agent')
        const updatedReferral = await API.graphql(graphqlOperation(updateReferral, {input: {id: referral.id, referralClientStatus: 'new', referralStatus: 'pending', referralPartnerAgentID: formDataCollected.priorAgent}}))
        
        //have to get prior agent so we can get their name and email for sendgrid
        const getPriorAgent = await API.graphql(graphqlOperation(getUser, {id: formDataCollected.priorAgent}))

         ////SENDGRID EMAIL TEMPLATE/////
          //Notify agent select the referral is ready

          let fromEmail = getRoostedEmail(referral.referralState, 'referral')

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
                roostedAgentFirstName: referral.referralRoostedAgent.userFirstName,
                roostedAgentLastName: referral.referralRoostedAgent.userLastName,
                partnerAgentFirstName: getPriorAgent.data.getUser.userFirstName,
                type: referral.referralType === 'buyerReferral' ? 'Buyer' : 'Seller',
                referralLink: `https://app.roosted.io/referrals/details/partner/${referral.id}/referraldata`
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

        if(referral.referralPartnerAgent !== null && referral.referralPartnerAgent !== undefined) {
          ////SENDGRID EMAIL TEMPLATE/////
          //Notify an agent they have been removed from a referral
          let fromEmail2 = getRoostedEmail(referral.referralState, 'referral')

          let custom2 = { 
            headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
            body: {
              emailData: {
                templateId: 'd-22cdedd6de364b81a081ca2a9cd37129',
                toEmail: referral.referralPartnerAgent.email,
                toFullName: referral.referralPartnerAgent.userFirstName + ' ' + referral.referralPartnerAgent.userLastName,
                fromEmail: fromEmail2,
                referralType: referral.referralType === 'buyerReferral' ? 'Buyer' : 'Seller',
                roostedAgentFirstName: referral.referralRoostedAgent.userFirstName,
                roostedAgentLastName: referral.referralRoostedAgent.userLastName,
                clientFirstName: referral.referralClient.clientFirstName,
                clientLastName: referral.referralClient.clientLastName,
                partnerAgentFirstName: referral.referralPartnerAgent.userFirstName,
              }
            }
          }
          console.log(custom2)
          const sendGridResponse2 = await API.post(
            'roostedRestAPI', 
            '/sendgrid/send-email',
            custom2
          )
          console.log(sendGridResponse2)
          //SENDGRID EMAIL TEMPLATE/////
        }
        setDataCollected.setReferral(updatedReferral.data.updateReferral)

      }
  
      onClose()

      //setLoading(false)
      setCardLoading(false)
    }catch(error){
      setDataCollected.setErrorMessage("Failed to change partner agent. Please try again or contact support@roosted.io.")
      setDataCollected.setOpen(true)
      //setLoading(false)
      setCardLoading(false)
      console.log(error)
    }
  }
  //END REACT HOOK FORMS

  useEffect(() => {

    const getPriorAgents = async () => {
      setCardLoading(true)

      try {
        
        const currentUser = await Auth.currentAuthenticatedUser();
        const sub = currentUser.signInUserSession.idToken.payload.sub

        // get all the referrals created by a user
        let { data } = await API.graphql(graphqlOperation(listReferrals, {
          limit: 900000, 
          filter: { referralRoostedAgentID: { eq: sub}}
        }))
   
        if(data.listReferrals.items.length > 0) {
          const priorReferrals = data.listReferrals.items
          const uniqueReferrals = Array.from(new Set(priorReferrals.map(referralFound => referralFound.referralPartnerAgentID)))
          .map(partnerID => {
            return priorReferrals.find(referralFind => referralFind.referralPartnerAgentID === partnerID)
          })
          const removedRoostedSelects = uniqueReferrals.filter(referralFilter => referralFilter.referralPartnerAgentID !== '111-1111-111-111')
          setFilteredReferrals(removedRoostedSelects)
        }
        if(referral.referralPartnerAgent !== undefined) {
          if(referral.referralPartnerAgentID === '111-1111-111-111') {
            setAgentSelection('roostedSelects')
          } else {
            setAgentSelection('priorAgent')
          }
        }
    
       setCardLoading(false)
      } catch(error) {
        setDataCollected.setErrorMessage("Failed to retreive prior agents used. Please try again or contact support@roosted.io.")
        setDataCollected.setOpen(true)
        setCardLoading(false)
        console.log(error)
      }
    }

    getPriorAgents()

  // eslint-disable-next-line
  }, []
  )
  return (
    <Modal
      onClose={onClose}
      open={open}
    >
      <Card
        {...rest}
        className={clsx(classes.root, className)}
      >
        {cardLoading ? <LinearProgress/> : <React.Fragment/>}
         <CardHeader title='Edit Partner Information'/>
         <Divider/>
         <form {...rest} onSubmit={handleSubmit(onSubmit)}>
         <CardContent>
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
                      value="roostedSelects"
                      control={<Radio color="primary" />}
                      label="Roosted Selects Agent"
                      labelPlacement="top"
                    />
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
                              key={referral.referralPartnerAgent !== null && referral.referralPartnerAgent !== undefined ? referral.referralPartnerAgentID : 'Deleted'}
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
            </Grid>
          </CardContent>
          <Divider />
          <CardActions className={classes.actions}>
            <Button onClick={onClose}>
              Close
            </Button>
            <Button
              color="primary"
              variant="contained"
              type='submit'
            >
              Save
            </Button>
          </CardActions>
        </form>
        {cardLoading ? <LinearProgress/> : <React.Fragment/>}
      </Card>
    </Modal>
  );
}

ModalEditPartnerAgent.propTypes = {
  className: PropTypes.string,
  customer: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool
};

ModalEditPartnerAgent.defaultProps = {
  open: false,
  onClose: () => {}
};

export default ModalEditPartnerAgent;
