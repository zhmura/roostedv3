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

import moment from 'moment'

import { useForm, Controller } from "react-hook-form";

import { agentShareByPlan, estimatePayout, getActualPayout, convertDollarToString, getRoostedEmail } from '../../../utils/utilities'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { updateReferral } from "../../../graphql/mutations"
import { getReferral } from "../../../graphql/queries"


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

function ModalEditReferralPayout({
  open, onClose, customer, className, dataCollected, setLoading, setDataCollected, referral, globalUser, userSetUser, ...rest
}) {
  const classes = useStyles();

  const [cardLoading, setCardLoading] = useState(false)

  //REACT HOOK FORMS
  const { control, handleSubmit, errors } = useForm()

  const onSubmit = async (formDataCollected) => {

    //setDataCollected.setLoading(true)
    setCardLoading(true)
    try {
      //get the current users sub 
      // const currentUser = await Auth.currentAuthenticatedUser();
      // const sub = currentUser.signInUserSession.idToken.payload.sub
      setDataCollected.setOpen(false)
      if(parseFloat(formDataCollected.commission) > 6 || parseFloat(formDataCollected.comission) < 0) {
        setDataCollected.setErrorMessage('The commission must be between 0 and 6')
        setDataCollected.setOpen(true)
        setCardLoading(false)
      } else if(parseFloat(formDataCollected.commission) <= 6 && parseFloat(formDataCollected.commission) > 0) {
        
        //find the estimated put outs for each party
        const agentShare = referral.referralPartnerShareOnCreation === null || referral.referralPartnerShareOnCreation === undefined ? agentShareByPlan(referral.referralRoostedPlanOnCreation, referral.referralRoostedPlanPeriodOnCreation, referral.referralRoostedPlanProductIdOnCreation) : referral.referralPartnerShareOnCreation
        const roostedAgentEstimatedPayout = estimatePayout('roostedAgent', formDataCollected.commission/100, parseFloat(referral.referralFeeOffered/100), agentShare, referral.referralEstimatedPriceRange) 
        const partnerAgentEstimatedPayout = estimatePayout('partnerAgent', formDataCollected.commission/100, parseFloat(referral.referralFeeOffered/100), agentShare, referral.referralEstimatedPriceRange)
        const roostedEstimatedPayout = estimatePayout('roosted', formDataCollected.commission/100, parseFloat(referral.referralFeeOffered/100), agentShare, referral.referralEstimatedPriceRange)
        
        console.log(formDataCollected)

        let referralParams = {}
        if(referral.referralClientStatus === 'underContract') {
          const closeDate = new Date(formDataCollected.closingDate)
          const closeDateString = closeDate.toISOString()
          referralParams = {
            id: referral.id,
            referralContractValue: parseFloat(convertDollarToString(formDataCollected.contractValue.toString())),
            referralCommission: parseFloat(formDataCollected.commission/100).toFixed(3),
            referralCloseDate: closeDateString,
            referralEstimatedPriceRange: dataCollected.buyerPriceRange,
            referralRoostedAgentPayoutFormatted: `${roostedAgentEstimatedPayout.lowEndPayoutFormatted} to ${roostedAgentEstimatedPayout.highEndPayoutFormatted}`,
            referralRoostedAgentPayoutLow: roostedAgentEstimatedPayout.lowEndPayout,
            referralRoostedAgentPayoutHigh: roostedAgentEstimatedPayout.highEndPayout,
            referralPartnerPayoutFormatted: `${partnerAgentEstimatedPayout.lowEndPayoutFormatted} to ${partnerAgentEstimatedPayout.highEndPayoutFormatted}`,
            referralPartnerPayoutLow: partnerAgentEstimatedPayout.lowEndPayout,
            referralPartnerPayoutHigh: partnerAgentEstimatedPayout.highEndPayout,
            referralRoostedPayoutFormatted: `${roostedEstimatedPayout.lowEndPayoutFormatted} to ${roostedEstimatedPayout.highEndPayoutFormatted}`,
            referralRoostedPayoutLow: roostedEstimatedPayout.lowEndPayout,
            referralRoostedPayoutHigh: roostedEstimatedPayout.highEndPayout,
            referralRoostedAgentPayoutActual: getActualPayout('roostedAgent', parseFloat(convertDollarToString(formDataCollected.contractValue.toString())), formDataCollected.commission/100, agentShare, parseFloat(referral.referralFeeOffered/100)),
            referralPartnerPayoutActual: getActualPayout('partnerAgent', parseFloat(convertDollarToString(formDataCollected.contractValue.toString())), formDataCollected.commission/100, agentShare, parseFloat(referral.referralFeeOffered/100)),
            referralRoostedPayoutActual: getActualPayout('roosted', parseFloat(convertDollarToString(formDataCollected.contractValue.toString())), formDataCollected.commission/100, agentShare, parseFloat(referral.referralFeeOffered/100)),
          }
         } else {
          referralParams = {
            id: referral.id,
            referralCommission: parseFloat(formDataCollected.commission/100).toFixed(3),
            referralRoostedAgentPayoutFormatted: `${roostedAgentEstimatedPayout.lowEndPayoutFormatted} to ${roostedAgentEstimatedPayout.highEndPayoutFormatted}`,
            referralRoostedAgentPayoutLow: roostedAgentEstimatedPayout.lowEndPayout,
            referralRoostedAgentPayoutHigh: roostedAgentEstimatedPayout.highEndPayout,
            referralPartnerPayoutFormatted: `${partnerAgentEstimatedPayout.lowEndPayoutFormatted} to ${partnerAgentEstimatedPayout.highEndPayoutFormatted}`,
            referralPartnerPayoutLow: partnerAgentEstimatedPayout.lowEndPayout,
            referralPartnerPayoutHigh: partnerAgentEstimatedPayout.highEndPayout,
            referralRoostedPayoutFormatted: `${roostedEstimatedPayout.lowEndPayoutFormatted} to ${roostedEstimatedPayout.highEndPayoutFormatted}`,
            referralRoostedPayoutLow: roostedEstimatedPayout.lowEndPayout,
            referralRoostedPayoutHigh: roostedEstimatedPayout.highEndPayout,
          }
        }
       
  
        await API.graphql(graphqlOperation(updateReferral, {input: referralParams}))
  
        ////SENDGRID EMAIL TEMPLATE/////
  
        let fromEmail = getRoostedEmail(referral.referralReferringAgentState, 'referral')
  
        let custom = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
            emailData: {
              templateId: 'd-f9aca78a5c154147ba998c24761b655a',
              toEmail: referral.referralRoostedAgent.email,
              toFullName: referral.referralRoostedAgent.userFirstName + ' ' + referral.referralRoostedAgent.userLastName,
              fromEmail: fromEmail,
              clientFirstName: referral.referralClient.clientFirstname,
              clientLastName: referral.referralClient.clientFirstname,
              roostedAgentFirstName: referral.referralRoostedAgent.userFirstName,
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
        const updatedReferral = await API.graphql(graphqlOperation(getReferral, {id: referral.id}))
   
        setDataCollected.setReferral(updatedReferral.data.getReferral)
        //setDataCollected.setLoading(false)
        setCardLoading(false)
        onClose()
      }
      

    }catch(error){
      setDataCollected.setErrorMessage("Check the values entered and please try again or contact support@roosted.io.")
      setDataCollected.setOpen(true)
      //setDataCollected.setLoading(false)
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
         <CardHeader title='Edit Financial Data'/>
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
          id='commission'
          name='commission'
          label='Your Commission %'
          fullWidth
          defaultValue={referral.referralCommission === undefined ? 3 : (referral.referralCommission*100)}
          variant="outlined"
          margin='dense'
          control={control}
          error={errors.commission !== undefined}
          rules={{required: true}}
          as={<NumberFormatBase customInput={TextField} isNumericString={true} />}
          />
          {errors.commission && <Typography variant='caption' color='error'>Commission is required and must be less than 6%.</Typography>}
      </Grid>
      <Grid
        item
        md={6}
        xs={12}
      >
        <Controller
          id='closingDate'
          name='closingDate'
          label='Closing Date'
          fullWidth
          variant="outlined"
          defaultValue={referral.referralCloseDate === undefined ? '' : moment(referral.referralCloseDate).format('MM/DD/YYYY')}
          disabled={referral.referralClientStatus !== 'underContract'}
          margin='dense'
          control={control}
          error={errors.closingDate}
          helperText={referral.referralClientStatus !== 'underContract' ? 'You can only edit this value when you mark the referral under contract on the Referral Data tab.' : ''}
          rules={referral.referralClientStatus === 'underContract' ? { required: true, pattern: /^(((0)[0-9])|((1)[0-2]))(\/)([0-2][0-9]|(3)[0-1])(\/)\d{4}$/} : { required: false}}
          as={<NumberFormatBase customInput={TextField} format="##/##/####" mask="_"/>}
        />
        {errors.closingDate && <Typography variant='caption' color='error'>Closing Date is required (mm/dd/yyyy) once you are under contract.</Typography>} 
      </Grid>
      <Grid
        item
        md={6}
        xs={12}
      >
        <Controller
          id='contractValue'
          name='contractValue'
          label='Actual Purchase/Sales Price'
          fullWidth
          defaultValue={referral.referralContractValue === null || referral.referralContractValue === null ? '' : referral.referralContractValue}
          variant="outlined"
          margin='dense'
          control={control}
          helperText={referral.referralClientStatus !== 'underContract' ? 'You can only edit this value when you mark the referral under contract on the Referral Data tab.' : ''}
          disabled={referral.referralClientStatus !== 'underContract'}
          error={errors.contractValue !== undefined}
          rules={referral.referralClientStatus === 'underContract' ? { required: true, min: 0, max: 999999999 } : null}
          as={<NumberFormatBase prefix={'$'} customInput={TextField}/>}
          />
          {errors.contractValue && <Typography variant='caption' color='error'>Purchase/Sale Price Required.</Typography>}
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

ModalEditReferralPayout.propTypes = {
  className: PropTypes.string,
  customer: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool
};

ModalEditReferralPayout.defaultProps = {
  open: false,
  onClose: () => {}
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

export default connect(mapStateToProps, mapDispatchToProps)(ModalEditReferralPayout);
