import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import {
  Card,
  Grid,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Typography,
  LinearProgress,
  Divider
} from '@mui/material';
import { useForm, Controller } from "react-hook-form";

import { getPlanData } from '../../utils/utilities'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

const useStyles = makeStyles((theme) => ({
  root: {},
  actions: {
    marginTop: theme.spacing(1),
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

function ManagePlan(
  { 
    globalUser,
    userSetUser,
    className, 
    history, 
    setErrorMessage,
    setOpen,
     ...rest }) {
  const classes = useStyles();
  const { control, handleSubmit } = useForm();

  const [loading, setLoading] = useState(false)

  const [planData, setPlanData] = useState({})
  
  const onSubmit = async (dataCollected) => {
    console.log(dataCollected)

    setLoading(true)
    try {
      //get the current users sub 
      // const currentUser = await Auth.currentAuthenticatedUser();
      // const sub = currentUser.signInUserSession.idToken.payload.sub
      setOpen(false)
      const planSelected = dataCollected.changePlan
      if(planSelected === 'nestMonthly' && globalUser.roostedAgent.stripeProductName === 'nest' && globalUser.roostedAgent.stripeProductPeriod === 'monthly') {
        setErrorMessage('You have selected the plan you are already on.')
        setOpen(true)
        setLoading(false)
      } else if(planSelected === 'nestAnnual' && globalUser.roostedAgent.stripeProductName === 'nest' && globalUser.roostedAgent.stripeProductPeriod === 'annual' ) {
        setErrorMessage('You have selected the plan you are already on.')
        setOpen(true)
        setLoading(false)
      } else if(planSelected === 'perchMonthly' && globalUser.roostedAgent.stripeProductName === 'perch' && globalUser.roostedAgent.stripeProductPeriod === 'monthly' ) {
        setErrorMessage('You have selected the plan you are already on.')
        setOpen(true)
        setLoading(false)
      } else if(planSelected === 'perchAnnual' && globalUser.roostedAgent.stripeProductName === 'perch' && globalUser.roostedAgent.stripeProductPeriod === 'annual' ) {
        setErrorMessage('You have selected the plan you are already on.')
        setOpen(true)
        setLoading(false)
      } else if(planSelected === 'flightMonthly' && globalUser.roostedAgent.stripeProductName === 'flight' && globalUser.roostedAgent.stripeProductPeriod === 'monthly' ) {
        setErrorMessage('You have selected the plan you are already on.')
        setOpen(true)
        setLoading(false)
      } else if(planSelected === 'flightAnnual' && globalUser.roostedAgent.stripeProductName === 'flight' && globalUser.roostedAgent.stripeProductPeriod === 'annual' ) {
        setErrorMessage('You have selected the plan you are already on.')
        setOpen(true)
        setLoading(false)
      } else {
        setLoading(false)
        history.push(`/settings/sign-ica?plan=${dataCollected.changePlan}&state=${globalUser.roostedAgent.stripeState}`)
      }
    }catch(error){
      setErrorMessage("Failed to change plans. Please try again or contact support@roosted.io.")
      setOpen(true)
      setLoading(false)
      console.log(error)
    }
  }

  useEffect(() => {

    setPlanData(getPlanData(globalUser.roostedAgent.stripeProductName, globalUser.roostedAgent.stripeProductPeriod))
    
  // eslint-disable-next-line
  }, [])

  const plans = [
    {name: 'Nest Plan - Monthly - 50/50 - $0 per month', value: 'nestMonthly'},
    {name: 'Nest Plan - Annual - 50/50 - $0 per year', value: 'nextAnnual'},
    {name: 'Perch Plan - Monthly - 70/30 - $12 per month', value: 'perchMonthly'},
    {name: 'Perch Plan - Annual - 70/30 - $72 per year', value: 'perchAnnual'},
    {name: 'Flight Plan - Monthly - 90/10 - $19 per month', value: 'flightMonthly'},
    {name: 'Flight Plan - Annual - 90/10 - $144 per year', value: 'flightAnnual'},
  ]

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
      style={{marginTop: '2rem', height: '100%'}}
    >
      {loading ? <LinearProgress/> : <React.Fragment/>}
      <CardHeader title='Billing Information'/>
      <Divider />
      <CardContent>
        <form {...rest} onSubmit={handleSubmit(onSubmit)}>
        <Typography variant='h4' align='center' style={{color: '#1CA6FC'}} gutterBottom>{`Current Plan:`}</Typography>
        {(globalUser.roostedAgent === null || globalUser.roostedAgent === undefined) || (globalUser.roostedAgent.stripeProductId === null || globalUser.roostedAgent.stripeProductId === undefined) ? 'No current plan' : <Typography variant='h5' align='center' style={{color: '#0F3164', marginBottom: '1.25rem'}} gutterBottom >{`${planData.name} Plan - ${planData.period} - ${planData.split}`}</Typography>}
        <Grid
            container
            spacing={0}
          >
            <Grid
              item
              xs={12}
            >
              <Controller
                fullWidth
                label="Change Plan"
                id="changePlan"
                name="changePlan"
                control={control}
                defaultValue={'nestMonthly'}
                variant="outlined"
                margin='dense'
                as={<TextField 
                      select     
                      // eslint-disable-next-line react/jsx-sort-props
                      SelectProps={{ native: true }}>
                      {plans.map(plan => (
                        <option
                          key={plan.value}
                          value={plan.value}
                        >
                          {plan.name}
                        </option>
                      ))}
                    </TextField>}
                />
            </Grid>
            
          </Grid>
          <div className={classes.actions} align='center'>
          <Button
            color="primary"
            variant="contained"
            className={classes.buttons}
            disabled={(globalUser.roostedAgent === null || globalUser.roostedAgent === undefined) || (globalUser.roostedAgent.stripeCustomerId === null || globalUser.roostedAgent.stripeCustomerId === undefined)}
            // endIcon={<ArrowForwardIosIcon/>}
            type='submit'
          >
            Switch Plan
          </Button>
          <Typography variant='subtitle2' style={{paddingTop: '1rem'}} gutterBottom >Once you select a new plan you will re-sign your Independent Contractor Agreement with the new amount.</Typography>
          <Typography variant='subtitle2' style={{paddingTop: '1rem'}}>Amounts will be pro-rated if swithcing to a lower cost plan. To delete your entire account go to Settings then Profile.</Typography>
        </div>
        </form>
      </CardContent>
      {loading ? <LinearProgress/> : <React.Fragment/>}
    </Card>
  );
}

ManagePlan.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(ManagePlan);
