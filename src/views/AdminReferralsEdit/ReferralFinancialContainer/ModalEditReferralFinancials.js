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

import { useForm, Controller } from "react-hook-form";

import { agentShareByPlan, estimatePayout, getActualPayout, convertDollarToString } from '../../../utils/utilities'

import moment from 'moment'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { API, graphqlOperation } from "aws-amplify";
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
  const { control, handleSubmit, errors } = useForm();
  const onSubmit = async (formDataCollected) => {

    //setDataCollected.setLoading(true)
    setCardLoading(true)
    try {
      //get the current users sub 
      // const currentUser = await Auth.currentAuthenticatedUser();
      // const sub = currentUser.signInUserSession.idToken.payload.sub
      setDataCollected.setOpen(false)
      console.log(formDataCollected)
      if((parseFloat(formDataCollected.commission) > 6 || parseFloat(formDataCollected.commission) < 0) || (parseFloat(formDataCollected.referralFee) > 100 || parseFloat(formDataCollected.referralFee) < 0)) {
        setDataCollected.setErrorMessage('The commission must be between 0 and 6')
        setDataCollected.setOpen(true)
        setCardLoading(false)
      } else if((parseFloat(formDataCollected.commission) <= 6 && parseFloat(formDataCollected.commission) > 0) && (parseFloat(formDataCollected.referralFee) <= 100 && parseFloat(formDataCollected.referralFee) > 0)) {
        
        //find the estimated put outs for each party
        const agentShare = referral.referralPartnerShareOnCreation === null || referral.referralPartnerShareOnCreation === undefined ? agentShareByPlan(referral.referralRoostedPlanOnCreation, referral.referralRoostedPlanPeriodOnCreation, referral.referralRoostedPlanProductIdOnCreation) : referral.referralPartnerShareOnCreation
        const roostedAgentEstimatedPayout = estimatePayout('roostedAgent', parseFloat(formDataCollected.commission)/100, parseFloat(formDataCollected.referralFee/100), agentShare, referral.referralEstimatedPriceRange) 
        const partnerAgentEstimatedPayout = estimatePayout('partnerAgent', parseFloat(formDataCollected.commission)/100, parseFloat(formDataCollected.referralFee/100), agentShare, referral.referralEstimatedPriceRange)
        const roostedEstimatedPayout = estimatePayout('roosted', parseFloat(formDataCollected.commission)/100, parseFloat(formDataCollected.referralFee/100), agentShare, referral.referralEstimatedPriceRange)
        
        let referralParams = {}
      
        const closeDate = new Date(formDataCollected.closingDate)
        const closeDateString = closeDate.toISOString()
        referralParams = {
          id: referral.id,
          referralContractValue: parseFloat(convertDollarToString(formDataCollected.contractValue.toString())),
          referralCommission: parseFloat(formDataCollected.commission/100).toFixed(3),
          referralFeeOffered: formDataCollected.referralFee,
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
          referralRoostedAgentPayoutActual: getActualPayout('roostedAgent', parseFloat(convertDollarToString(formDataCollected.contractValue.toString())), parseFloat(formDataCollected.commission)/100, agentShare, parseFloat(formDataCollected.referralFee/100)),
          referralPartnerPayoutActual: getActualPayout('partnerAgent', parseFloat(convertDollarToString(formDataCollected.contractValue.toString())), parseFloat(formDataCollected.commission)/100, agentShare, parseFloat(formDataCollected.referralFee/100)),
          referralRoostedPayoutActual: getActualPayout('roosted', parseFloat(convertDollarToString(formDataCollected.contractValue.toString())), parseFloat(formDataCollected.commission)/100, agentShare, parseFloat(formDataCollected.referralFee/100))
        }

 
       
  
        await API.graphql(graphqlOperation(updateReferral, {input: referralParams}))
  
        ////SENDGRID EMAIL TEMPLATE/////
  
        // let fromEmail = getRoostedEmail(referral.referralReferringAgentState, 'referral')
  
        // let custom = { 
        //   headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        //   body: {
        //     emailData: {
        //       templateId: 'd-d9e49bc969a44eb8ad484ba9508541ef',
        //       toEmail: referral.referralPartnerAgent.email,
        //       toFullName: referral.referralPartnerAgent.userFirstName + ' ' + referral.referralPartnerAgent.userLastName,
        //       fromEmail: fromEmail,
        //       clientFirstName: referral.referralClient.clientFirstname,
        //       clientLastName: referral.referralClient.clientFirstname,
        //       partnerAgentFirstName: referral.referralPartnerAgent.userFirstName,
        //       referralLink: `https://app.roosted.io/referrals/details/partner/${referral.id}/referraldata?id=${referral.referralPartnerAgent.id}`
        //     }
        //   }
        // }
        // console.log(custom)
        // const sendGridResponse = await API.post(
        //   'roostedRestAPI', 
        //   '/sendgrid/send-email',
        //   custom
        // )
        // console.log(sendGridResponse)
        //SENDGRID EMAIL TEMPLATE/////
        const updatedReferral = await API.graphql(graphqlOperation(getReferral, {id: referral.id}))
   
        setDataCollected.setReferral(updatedReferral.data.getReferral)
        //setDataCollected.setLoading(false)
        setCardLoading(false)
        onClose()
      }
      

    }catch(error){
      setDataCollected.setErrorMessage("Failed to change financial data. Check the values entere and please try again or contact support@roosted.io.")
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
          rules={{ required: true, min: 0, max: 6 }}
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
          id='referralFee'
          name='referralFee'
          label='Referral Fee %'
          fullWidth
          defaultValue={referral.referralFeeOffered === undefined ? 35 : (referral.referralFeeOffered)}
          variant="outlined"
          margin='dense'
          control={control}
          error={errors.referralFee !== undefined}
          rules={{ required: true, min: 0, max: 100 }}
          as={<NumberFormatBase customInput={TextField} isNumericString={true} />}
          />
          {errors.referralFee && <Typography variant='caption' color='error'>Referral fee is required and must be between 0 and 100.</Typography>}
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
          margin='dense'
          control={control}
          error={errors.closingDate}
          rules={{ required: true, pattern: /^(((0)[0-9])|((1)[0-2]))(\/)([0-2][0-9]|(3)[0-1])(\/)\d{4}$/}}
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
          error={errors.contractValue !== undefined}
          rules={{ required: true, min: 0, max: 999999999 }}
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
        disabled={cardLoading}
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
