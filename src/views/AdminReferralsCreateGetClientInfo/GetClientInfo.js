import React, { useState } from 'react';
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
  LinearProgress
} from '@mui/material';
import { useForm, Controller } from "react-hook-form";
import { NumberFormatBase  } from 'react-number-format';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

import { formatPhoneNumberToString, formatPhoneNumber } from '../../utils/utilities'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

const useStyles = makeStyles((theme) => ({
  root: {},
  actions: {
    marginTop: theme.spacing(3),
  },
  buttons: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  divider: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2)
  }
}));

function GetClientInfo(
  { 
    className, 
    referral,
    referralSetReferral,
    client,
    referralSetClient,
    history, 
    setErrorMessage,
    setOpen,
    globalUser,
     ...rest }) {
  const classes = useStyles();
  const { control, handleSubmit, errors } = useForm();

  const [loading, setLoading] = useState(false)
  //const [referral, setreferral] = useState(referral)

  const onSubmit = async (dataCollected) => {

    setLoading(true)
    try {
      //Use this incase someone comes back to a referral and state has been erased
      if(referral.referralType === undefined) {
        return history.push('/referrals/create/admin/select-type')
      }
      console.log(dataCollected.clientPhone)
      referralSetClient({
        clientFirstName: dataCollected.clientFirstName,
        clientLastName: dataCollected.clientLastName,
        clientPhone: formatPhoneNumberToString(dataCollected.clientPhone),
        clientEmail: dataCollected.clientEmail,
        clientComments: dataCollected.clientComments
      })
      setLoading(false)
      if(referral.referralType === 'buyerReferral' || referral.referralType === 'buyerAndSellerReferral') {
        history.push('/referrals/create/admin/buyer-referral') 
      } else if(referral.referralType === 'sellerReferral') {
        history.push('/referrals/create/admin/seller-referral')
      }
    
    }catch(error){
      setErrorMessage("Failed to save user data. Please try again or contact support@roosted.io.")
      setOpen(true)
      setLoading(false)
      console.log(error)
    }
  }
  // useEffect(() => {
  //   setLoading(true)
  //   setTimeout(function(){setLoading(false) }, 1000);

  // // eslint-disable-next-line
  // }, [])

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      {loading ? <LinearProgress/> : <React.Fragment/>}
      <CardContent>
        <form {...rest} onSubmit={handleSubmit(onSubmit)}>
        <Typography variant='h4' align='center' style={{color: '#1CA6FC'}} gutterBottom>Client Information</Typography>
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
                defaultValue={client.clientFirstName === undefined ? '' : client.clientFirstName}
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
                defaultValue={client.clientLastName === undefined ? '' : client.clientLastName}
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
                defaultValue={client.clientEmail === undefined ? '' : client.clientEmail}
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
                defaultValue={client.clientPhone === undefined ? '' : formatPhoneNumber(client.clientPhone)}
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
                name='clientComments'
                id='clientComments' 
                defaultValue={client.clientComments === undefined ? '' : client.clientComments}
                variant='outlined'
                margin='dense'
                rows="5"
                multiline
                fullWidth
                error={errors.clientComments !== undefined}
                control={control}
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
              history.push('/referrals/create/admin/select-type')
            }}
          >
            Back
          </Button>
          <Button
            color="primary"
            variant="contained"
            className={classes.buttons}
            endIcon={<ArrowForwardIosIcon/>}
            disabled={globalUser.userType !== 'broker' && globalUser.userType !== 'admin'}
            type='submit'
          >
            Next
          </Button>
        </div>
        </form>
      </CardContent>
      {loading ? <LinearProgress/> : <React.Fragment/>}
    </Card>
  );
}

GetClientInfo.propTypes = {
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
      referralSetReferral: (referral) => dispatch(actions.referralSetReferral(referral)),
      referralSetClient: (client) => dispatch(actions.referralSetClient(client))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GetClientInfo);
