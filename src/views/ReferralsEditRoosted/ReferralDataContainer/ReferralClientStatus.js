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
} from '@mui/material';
import { getClientStatusStepsObject, getClientStatusStepArray} from '../../../utils/utilities'

//import { useForm, Controller } from "react-hook-form";
import { isMobile } from 'react-device-detect'
// import { Auth, API, graphqlOperation } from 'aws-amplify';
// import { updateReferral } from "../../../graphql/mutations"

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../../store/actions/index';

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
  const [steps, setSteps] = useState([])

  const [activeStep, setActiveStep] = useState(0);
  //END MANAGE STEPS

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
      <CardHeader classes={{title: classes.header}} title="Client Status" className={classes.header} />
      <Divider />
      <CardContent>
        <div className={classes.root}>
          {/* <form {...rest} onSubmit={handleSubmit(onSubmit)}>
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
                    disabled={loading}
                  >
                    Change Client Status
                  </Button>
                </div>
              </Grid>
              
            </Grid>
            </form> */}
          <Stepper activeStep={activeStep} alternativeLabel={!isMobile} orientation={isMobile ? 'vertical' : 'horizontal'}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </div>
      </CardContent>
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
