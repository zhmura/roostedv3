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
import {NumberFormatBase} from 'react-number-format'

import { useForm, Controller } from "react-hook-form";

import { getTimeFrames, getPriceRanges, getStatesByAgentType, agentShareByPlan, estimatePayout } from '../../../utils/utilities'

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

function ModalEditReferralDataBuyer({
  open, onClose, customer, className, dataCollected, setLoading, setDataCollected, referral, ...rest
}) {
  const classes = useStyles();

  const [cardLoading, setCardLoading] = useState(false)

  //REACT HOOK FORMS
  const { control, handleSubmit, errors } = useForm();
  const onSubmit = async (formDataCollected) => {

    //setDataCollected.setLoading(true)
    setCardLoading(true)
    console.log(formDataCollected.buyerPrequalified)
    console.log(formDataCollected.buyerPriceRange)
    try {
      //get the current users sub 
      // const currentUser = await Auth.currentAuthenticatedUser();
      // const sub = currentUser.signInUserSession.idToken.payload.sub
      setDataCollected.setOpen(false)
      const agentShare = referral.referralPartnerShareOnCreation === null || referral.referralPartnerShareOnCreation === undefined ? agentShareByPlan(referral.referralRoostedPlanOnCreation, referral.referralRoostedPlanPeriodOnCreation, referral.referralRoostedPlanProductIdOnCreation) : referral.referralPartnerShareOnCreation 
      const roostedAgentEstimatedPayout = estimatePayout('roostedAgent', referral.referralCommission, parseFloat(referral.referralFeeOffered/100), agentShare, formDataCollected.buyerPriceRange)
      const partnerAgentEstimatedPayout = estimatePayout('partnerAgent', referral.referralCommission, parseFloat(referral.referralFeeOffered/100), agentShare, formDataCollected.buyerPriceRange)
      const roostedEstimatedPayout = estimatePayout('roosted', referral.referralCommission, parseFloat(referral.referralFeeOffered/100), agentShare, formDataCollected.buyerPriceRange)
      
      const referralParams = {
        id: referral.id,
        referralState: formDataCollected.buyerState,
        referralAddress: {
          zip: formDataCollected.buyerZip
        },
        referralEstimatedPriceRange: formDataCollected.buyerPriceRange,
        referralTimeFrame: formDataCollected.buyerTimeFrame,
        referralRoostedAgentPayoutFormatted: `${roostedAgentEstimatedPayout.lowEndPayoutFormatted} to ${roostedAgentEstimatedPayout.highEndPayoutFormatted}`,
        referralRoostedAgentPayoutLow: roostedAgentEstimatedPayout.lowEndPayout,
        referralRoostedAgentPayoutHigh: roostedAgentEstimatedPayout.highEndPayout,
        referralPartnerPayoutFormatted: `${partnerAgentEstimatedPayout.lowEndPayoutFormatted} to ${partnerAgentEstimatedPayout.highEndPayoutFormatted}`,
        referralPartnerPayoutLow: partnerAgentEstimatedPayout.lowEndPayout,
        referralPartnerPayoutHigh: partnerAgentEstimatedPayout.highEndPayout,
        referralRoostedPayoutFormatted: `${roostedEstimatedPayout.lowEndPayoutFormatted} to ${roostedEstimatedPayout.highEndPayoutFormatted}`,
        referralRoostedPayoutLow: roostedEstimatedPayout.lowEndPayout,
        referralRoostedPayoutHigh: roostedEstimatedPayout.highEndPayout,
        referralPrequalified: formDataCollected.buyerPrequalified === 'Yes' ? true : false
      }

      await API.graphql(graphqlOperation(updateReferral, {input: referralParams}))

      ////SENDGRID EMAIL TEMPLATE/////

      // let fromEmail = process.env.REACT_APP_EMAIL_REFERRAL
      // if(referral.referralReferringAgentState === 'AZ') {
      //   fromEmail = process.env.REACT_APP_EMAIL_REFERRAL_AZ
      // } else if(referral.referralReferringAgentState === 'CA') {
      //   fromEmail = process.env.REACT_APP_EMAIL_REFERRAL_CA
      // }

      // let custom = { 
      //   headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
      //   body: {
      //     emailData: {
      //       templateId: 'd-4f69b7ee34c94b26be6878442deac146',
      //       toEmail: referral.referralPartnerAgent.email,
      //       toFullName: referral.referralPartnerAgent.userFirstName + ' ' + referral.referralPartnerAgent.userLastName,
      //       fromEmail: fromEmail,
      //       clientFirstName: formDataCollected.clientFirstName,
      //       clientLastName: formDataCollected.clientLastName,
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

    }catch(error){
      setDataCollected.setErrorMessage("Failed to change referral data. Please try again or contact support@roosted.io.")
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
         <CardHeader title='Edit Referral Data'/>
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
                fullWidth
                label="What state are they buying in?"
                id="buyerState"
                name="buyerState"
                control={control}
                defaultValue={referral.referralState === undefined ? 'AL' : referral.referralState}
                variant="outlined"
                margin='dense'
                as={<TextField 
                      select     
                      // eslint-disable-next-line react/jsx-sort-props
                      SelectProps={{ native: true }}>
                      {getStatesByAgentType('all').map(state => (
                        <option
                          key={state}
                          value={state}
                        >
                          {state}
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
                id='buyerZip'
                name='buyerZip'
                label='What is their desired zip code?'
                fullWidth
                defaultValue={referral.referralAddress.zip === undefined ? '' : referral.referralAddress.zip}
                variant="outlined"
                margin='dense'
                control={control}
                error={errors.buyerZip !== undefined}
                rules={{ required: true, pattern: /^[0-9]*$/}}
                as={<NumberFormatBase customInput={TextField} format="#####" mask="_"/>}
                />
                {errors.buyerZip && <Typography variant='caption' color='error'>Zip Code is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller
                fullWidth
                label="What is their time frame?"
                id="buyerTimeFrame"
                name="buyerTimeFrame"
                control={control}
                defaultValue={referral.referralTimeFrame === undefined ? 'Less Than 30 Days' : referral.referralTimeFrame}
                variant="outlined"
                margin='dense'
                as={<TextField 
                      select     
                      // eslint-disable-next-line react/jsx-sort-props
                      SelectProps={{ native: true }}>
                      {getTimeFrames().map(time => (
                        <option
                          key={time}
                          value={time}
                        >
                          {time}
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
                fullWidth
                label="What is their price range?"
                id="buyerPriceRange"
                name="buyerPriceRange"
                control={control}
                defaultValue={referral.referralEstimatedPriceRange === undefined ? 'Under $100k' : referral.referralEstimatedPriceRange}
                variant="outlined"
                margin='dense'
                as={<TextField 
                      select     
                      // eslint-disable-next-line react/jsx-sort-props
                      SelectProps={{ native: true }}>
                      {getPriceRanges().map(price => (
                        <option
                          key={price}
                          value={price}
                        >
                          {price}
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
                fullWidth
                label="Are they prequalified?"
                id="buyerPrequalified"
                name="buyerPrequalified"
                control={control}
                defaultValue={'No'}
                variant="outlined"
                margin='dense'
                as={<TextField key="buyerPrequalified"
                      select     
                      // eslint-disable-next-line react/jsx-sort-props
                      SelectProps={{ native: true }}>
                      {['No', 'Yes'].map(value => (
                        <option
                          key={value}
                          value={value}
                        >
                          {value}
                        </option>
                      ))}
                        {/* <option
                          key={'no'}
                          value={false}
                        >
                          No
                        </option>
                        <option
                          key={'yes'}
                          value={true}
                        >
                          Yes
                        </option> */}
                    </TextField>}
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

ModalEditReferralDataBuyer.propTypes = {
  className: PropTypes.string,
  customer: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool
};

ModalEditReferralDataBuyer.defaultProps = {
  open: false,
  onClose: () => {}
};

export default ModalEditReferralDataBuyer;
