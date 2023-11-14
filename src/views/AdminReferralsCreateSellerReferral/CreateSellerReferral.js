import React, { useState, useEffect } from 'react';
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
  LinearProgress,
} from '@mui/material';
import { useForm, Controller } from "react-hook-form";
import { NumberFormatBase  } from 'react-number-format';
import { getStatesByAgentType, compareValues } from '../../utils/utilities'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

import { getTimeFrames, getPriceRanges } from '../../utils/utilities'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { API, graphqlOperation } from "aws-amplify";
import { listRoostedLicenses } from "../../graphql/queries"

import * as yup from 'yup'

const useStyles = makeStyles((theme) => ({
  root: {},
  actions: {
    marginTop: theme.spacing(3),
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

function CreatesellerReferral(
  { 
    globalUser,
    userSetUser,
    className, 
    referral,
    referralSetReferral,
    referralSetClient,
    client,
    history, 
    setErrorMessage,
    setOpen,
     ...rest }) {
  const classes = useStyles();


  const [loading, setLoading] = useState(false)
  //const [referrals, setReferrals] = useState([])
  const [roostedAgentArray, setRoostedAgentArray] = useState([])

  const FormSchema = yup.object().shape({
    sellerStreet: yup.string().required(),
    sellerCity: yup.string().required(),
    sellerZip: yup.string().required().matches(/^[0-9]*$/),
  });

  const { control, handleSubmit, errors } = useForm({
    validationSchema: FormSchema
  });

 
  const onSubmit = async (dataCollected) => {
    console.log(dataCollected)
    // Use this incase someone comes back to a referral and state has been erased

    if(referral.referralType === undefined) {
      return history.push('/referrals/create/select-type')
    }
    if(client.clientFirstName === undefined) {
      return history.push('/referrals/create/select-type')
    }
    setLoading(true)
    try {
        referralSetReferral({
          referralType: referral.referralType,
          sellerState: dataCollected.sellerState,
          sellerZip: dataCollected.sellerZip,
          sellerTimeFrame: dataCollected.sellerTimeFrame,
          sellerPriceRange: dataCollected.sellerPriceRange,
          sellerReferralStreet: dataCollected.sellerStreet,
          sellerReferralUnit: dataCollected.sellerUnit,
          sellerReferralCity: dataCollected.sellerCity,
          sellerReferralState: dataCollected.sellerState,
          sellerReferralZip: dataCollected.sellerZip,
          referralRoostedAgentID: dataCollected.roostedAgents
          
         })

        history.push('/referrals/create/admin/select-sell-agent') 
   
    }catch(error){
      setErrorMessage("Failed to save user data. Please try again or contact support@roosted.io.")
      setOpen(true)
      setLoading(false)
      console.log(error)
    }

      }

  useEffect(() => {

    const getPriorAgents = async () => {
      try {
        setLoading(true)
        // const currentUser = await Auth.currentAuthenticatedUser();
        // const sub = currentUser.signInUserSession.idToken.payload.sub

        //GET ALL ROOSTED AGENTS SORTED BY LAST NAME
        let getAgents = await API.graphql(graphqlOperation(listRoostedLicenses, {
          limit: 900000,
          filter: {and: [{primaryLicense: { eq: true}}, { licenseVerificationStatus: { eq: 'verified'}}]}
        }))
  
        setRoostedAgentArray(getAgents.data.listRoostedLicenses.items.sort(compareValues('licenseUser', 'asc')))

        ///END GET ALL ROOSTED AGENTS

        setLoading(false)
      } catch(error) {
        setErrorMessage("Failed to save referral information. Please try again or contact support@roosted.io.")
        setOpen(true)
        setLoading(false)
        console.log(error)
      }

    }

    getPriorAgents()
    
  // eslint-disable-next-line
  }, [])

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      {loading ? <LinearProgress/> : <React.Fragment/>}
      <CardContent>
        <form {...rest} onSubmit={handleSubmit(onSubmit)}>
        <Typography variant='h4' align='center' style={{color: '#1CA6FC', marginBottom: '2rem'}} gutterBottom>Seller Referral Information</Typography>
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
                as={TextField} 
                label="Seller's Street"
                name='sellerStreet'
                id='sellerStreet' 
                defaultValue={referral.sellerReferralStreet === undefined ? '' : referral.sellerReferralStreet}
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.sellerStreet !== undefined}
                control={control}
              />
              {errors.sellerStreet && <Typography variant='caption' color='error'>Street is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller 
                as={TextField}
                label="Unit (optional)"
                name='sellerUnit'
                id='sellerUnit' 
                defaultValue={referral.sellerReferralUnit === undefined ? '' : referral.sellerReferralUnit}
                variant='outlined'
                margin='dense'
                fullWidth
                control={control}
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller 
                as={TextField} 
                label="City"
                name='sellerCity'
                id='sellerCity' 
                defaultValue={referral.sellerReferralCity === undefined ? '' : referral.sellerReferralCity}
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.sellerCity !== undefined}
                control={control}
              />
              {errors.sellerCity && <Typography variant='caption' color='error'>City is required.</Typography>}
            </Grid>
             <Grid
              item
              md={6}
              xs={12}
            >
              <Controller
                fullWidth
                label="State"
                id="sellerState"
                name="sellerState"
                control={control}
                defaultValue={referral.sellerReferralState === undefined ? 'AZ' : referral.sellerReferralState}
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
                id='sellerZip'
                name='sellerZip'
                label='Zip Code'
                fullWidth
                defaultValue={referral.sellerReferralZip === undefined ? '' : referral.sellerReferralZip}
                variant="outlined"
                margin='dense'
                control={control}
                error={errors.sellerZip !== undefined}
                as={<NumberFormatBase customInput={TextField} format="#####" mask="_"/>}
                />
                {errors.userZip && <Typography variant='caption' color='error'>Zip Code is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller
                fullWidth
                label="What is their time frame?"
                id="sellerTimeFrame"
                name="sellerTimeFrame"
                control={control}
                defaultValue={referral.sellerTimeFrame === undefined ? 'Less Than 30 Days' : referral.sellerTimeFrame}
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
                id="sellerPriceRange"
                name="sellerPriceRange"
                control={control}
                defaultValue={referral.sellerPriceRange === undefined ? 'Under $100k' : referral.sellerPriceRange}
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
                label="Select Referring Agent"
                id="roostedAgents"
                name="roostedAgents"
                helperText={roostedAgentArray.length === 0 ? 'You have no agents to select from.' : ''}
                control={control}
                defaultValue={roostedAgentArray.length === 0 ? 'No Roosted Agents' : roostedAgentArray[0].id}
                disabled={roostedAgentArray.length === 0}
                variant="outlined"
                margin='dense'
                as={<TextField 
                      select     
                      // eslint-disable-next-line react/jsx-sort-props
                      SelectProps={{ native: true }}>
                        <option>Select Agent</option>
                      {roostedAgentArray.map(license => (
                        <option
                          key={license.licenseUser.id}
                          value={license.licenseUser.id}
                        >
                          {license.licenseUser.userLastName + ', ' + license.licenseUser.userFirstName}
                        </option>
                      ))}
                    </TextField>}
                />
            </Grid>
          </Grid>
          
          <div className={classes.actions} align='center'>
          {referral.referralType === 'buyerAndSellerReferral' ?
          <React.Fragment/> :
          <Button 
            className={classes.buttons}
            color="primary"
            variant="contained"
            startIcon={<ArrowBackIosIcon/>}
            disabled={roostedAgentArray.length === 0}
            onClick={() => {
              referral.referralType = 'sellerReferral'
              history.push('/referrals/create/admin/get-client-info')
            }}
          >
            Back
          </Button> }
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

CreatesellerReferral.propTypes = {
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
      userSetUser: (user) => dispatch(actions.userSetUser(user)),
      referralSetReferral: (referral) => dispatch(actions.referralSetReferral(referral)),
      referralSetClient: (client) => dispatch(actions.referralSetClient(client))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatesellerReferral);
