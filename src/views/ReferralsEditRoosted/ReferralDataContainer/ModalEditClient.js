import React, { useState } from 'react';
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
  Button
} from '@mui/material';
import {NumberFormatBase}  from 'react-number-format'

import { formatPhoneNumber, formatPhoneNumberToString, getRoostedEmail } from '../../../utils/utilities'

import { useForm, Controller } from "react-hook-form";

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { updateClient, updateReferral } from "../../../graphql/mutations"
//import { getReferral } from "../../../graphql/queries"

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

function ModalClientEdit({
  open, onClose, customer, className, dataCollected, setLoading, setDataCollected, referral, ...rest
}) {
  const classes = useStyles();

  const [cardLoading, setCardLoading] = useState(false)

  //REACT HOOK FORMS
  const { control, handleSubmit, errors } = useForm();
  const onSubmit = async (formDataCollected) => {

    setLoading(true)
    setCardLoading(true)
 
    try {
      //get the current users sub 
      // const currentUser = await Auth.currentAuthenticatedUser();
      // const sub = currentUser.signInUserSession.idToken.payload.sub
      setDataCollected.setOpen(false)
      const clientParams = {
        id: referral.referralClient.id,
        clientReferralEmail: formDataCollected.clientEmail,
        clientFirstName: formDataCollected.clientFirstName,
        clientLastName: formDataCollected.clientLastName,
        clientPhone: formatPhoneNumberToString(formDataCollected.clientPhone)
      }

      await API.graphql(graphqlOperation(updateClient, {input: clientParams}))

      if(referral.referralPartnerAgent !== null && referral.referralPartnerAgent !== undefined) {
        ////SENDGRID EMAIL TEMPLATE/////

        let fromEmail = getRoostedEmail(referral.referralReferringAgentState, 'referral') 

        let custom = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
            emailData: {
              templateId: 'd-ae098d89d83748eea75d3a4237a96b54',
              toEmail: referral.referralPartnerAgent.email,
              toFullName: referral.referralPartnerAgent.userFirstName + ' ' + referral.referralPartnerAgent.userLastName,
              fromEmail: fromEmail,
              clientFirstName: formDataCollected.clientFirstName,
              clientLastName: formDataCollected.clientLastName,
              partnerAgentFirstName: referral.referralPartnerAgent.userFirstName,
              referralLink: `https://app.roosted.io/referrals/details/partner/${referral.id}/referraldata?id=${referral.referralPartnerAgent.id}`
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
      const updatedReferral = await API.graphql(graphqlOperation(updateReferral, {input: {id: referral.id, referralComments: formDataCollected.referralComments === '' ? null : formDataCollected.referralComments}}))
      setDataCollected.setReferral(updatedReferral.data.updateReferral)
      onClose()

      setLoading(false)
      setCardLoading(false)
    }catch(error){
      setDataCollected.setErrorMessage("Failed to change client. Please try again or contact support@roosted.io.")
      setDataCollected.setOpen(true)
      setLoading(false)
      setCardLoading(false)
      console.log(error)
    }
  }
  //END REACT HOOK FORMS

  if (!open) {
    return null;
  }

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
         <CardHeader title='Edit Client Information'/>
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
            >
              <Controller 
                rules={{ required: true}}
                as={TextField} 
                label="Client First Name"
                name='clientFirstName'
                id='clientFirstName' 
                defaultValue={referral.referralClient === undefined ? '' : referral.referralClient.clientFirstName}
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.clientFirstName !== undefined}
                control={control}
              />
              {errors.clientFirstName && <Typography variant='caption' color='error'>Client first name is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller 
                rules={{ required: true}}
                as={TextField} 
                label="Client Last Name"
                name='clientLastName'
                id='clientLastName' 
                defaultValue={referral.referralClient === undefined ? '' : referral.referralClient.clientLastName}
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.clientLastName !== undefined}
                control={control}
              />
              {errors.clientLastName && <Typography variant='caption' color='error'>Client last name is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller 
                rules={{ required: true, pattern: /[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/}}
                as={TextField} 
                label="Client Email"
                name='clientEmail'
                id='clientEmail' 
                defaultValue={referral.referralClient === undefined ? '' : referral.referralClient.clientReferralEmail}
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.clientEmail !== undefined}
                control={control}
              />
              {errors.clientEmail && <Typography variant='caption' color='error'>Valid client email is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller
                id='clientPhone'
                name='clientPhone'
                label='Client Phone Number'
                fullWidth
                variant="outlined"
                margin='dense'
                control={control}
                defaultValue={referral.referralClient === undefined ? '' : formatPhoneNumber(referral.referralClient.clientPhone)}
                error={errors.clientPhone !== undefined}
                rules={{ required: true, pattern: /((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}/ }}
                as={<NumberFormatBase customInput={TextField} format="(###) ###-####" mask="_"/>}
              />
              {errors.clientPhone && <Typography variant='caption' color='error'>Client phone number is required.</Typography>}
            </Grid>
            <Grid
              item
              xs={12}
            >
              <Controller 
                rules={{ required: false}}
                as={TextField} 
                label="Comments"
                name='referralComments'
                id='referralComments' 
                defaultValue={referral.referralComments === undefined || referral.referralComments === null  || referral.referralComments === '' ? '' : referral.referralComments}
                variant='outlined'
                margin='dense'
                rows="5"
                multiline
                fullWidth
                error={errors.referralComments !== undefined}
                control={control}
              />
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

ModalClientEdit.propTypes = {
  className: PropTypes.string,
  customer: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool
};

ModalClientEdit.defaultProps = {
  open: false,
  onClose: () => {}
};

export default ModalClientEdit;
