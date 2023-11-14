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
import { NumberFormatBase }from 'react-number-format'

import { useForm, Controller } from "react-hook-form";

import { convertDollarToString } from '../../../utils/utilities'
 
//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { API, graphqlOperation } from "aws-amplify";
import { updateReferral } from "../../../graphql/mutations"

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

    const payoutParameters = {
      id: referral.id,
      referralRoostedAgentPayoutActual: parseFloat(convertDollarToString(formDataCollected.roostedAgentPayoutActual.toString())),
      referralPartnerPayoutActual: parseFloat(convertDollarToString(formDataCollected.partnerAgentPayoutActual.toString())),
      referralRoostedPayoutActual: parseFloat(convertDollarToString(formDataCollected.roostedPayoutActual.toString())),
    }

    //setDataCollected.setLoading(true)
    setCardLoading(true)
    try {
      const {data} = await API.graphql(graphqlOperation(updateReferral, {input: payoutParameters}))      
    
      setDataCollected.setReferral(data.updateReferral)

      setCardLoading(false)
      onClose()
    

    }catch(error){
      setDataCollected.setErrorMessage("Failed to change amount. Check the values entere and please try again or contact support@roosted.io.")
      setDataCollected.setOpen(true)
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
         <CardHeader title='Edit Payout Data'/>
         <Divider/>
         <form {...rest} onSubmit={handleSubmit(onSubmit)}>
         <CardContent>
    
    <Grid
        container
        spacing={1}
    >
      <Grid
        item
  
        xs={12}
      >
        <Controller
          id='roostedAgentPayoutActual'
          name='roostedAgentPayoutActual'
          label='Actual Roosted Agent Payout'
          fullWidth
          defaultValue={referral.referralRoostedAgentPayoutActual === null || referral.referralRoostedAgentPayoutActual === null ? 0 : referral.referralRoostedAgentPayoutActual}
          variant="outlined"
          margin='dense'
          control={control}
          error={errors.roostedAgentPayoutActual !== undefined}
          rules={{ required: true, min: 0, max: 999999999 }}
          as={<NumberFormatBase prefix={'$'} thousandSeparator={true} customInput={TextField}/>}
          />
          {errors.roostedAgentPayoutActual && <Typography variant='caption' color='error'>Payout amount required.</Typography>}
      </Grid>
      <Grid
        item

        xs={12}
      >
        <Controller
          id='partnerAgentPayoutActual'
          name='partnerAgentPayoutActual'
          label='Actual Partner Agent Payout'
          fullWidth
          defaultValue={referral.referralPartnerPayoutActual === null || referral.referralPartnerPayoutActual === null ? 0 : referral.referralPartnerPayoutActual}
          variant="outlined"
          margin='dense'
          control={control}
          error={errors.partnerAgentPayoutActual !== undefined}
          rules={{ required: true, min: 0, max: 999999999 }}
          as={<NumberFormatBase prefix={'$'} thousandSeparator={true} customInput={TextField}/>}
          />
          {errors.partnerAgentPayoutActual && <Typography variant='caption' color='error'>Payout amount required.</Typography>}
      </Grid>
      <Grid
        item

        xs={12}
      >
        <Controller
          id='roostedPayoutActual'
          name='roostedPayoutActual'
          label='Actual Roosted Company Payout'
          fullWidth
          defaultValue={referral.referralRoostedPayoutActual === null || referral.referralRoostedPayoutActual === null ? 0 : referral.referralRoostedPayoutActual}
          variant="outlined"
          margin='dense'
          control={control}
          error={errors.roostedPayoutActual !== undefined}
          rules={{ required: true, min: 0, max: 999999999 }}
          as={<NumberFormatBase prefix={'$'} thousandSeparator={true} customInput={TextField}/>}
          />
          {errors.roostedPayoutActual && <Typography variant='caption' color='error'>Payout amount required.</Typography>}
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
