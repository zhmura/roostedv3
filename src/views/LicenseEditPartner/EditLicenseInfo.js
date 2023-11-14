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
  LinearProgress
} from '@mui/material';
import { useForm, Controller } from "react-hook-form";
import { NumberFormatBase  } from 'react-number-format';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import moment from 'moment'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { getPartnerLicense, getUser } from '../../graphql/queries'
import { updatePartnerLicense, deletePartnerLicense } from '../../graphql/mutations'

const useStyles = makeStyles((theme) => ({
  root: {},
  actions: {
    marginTop: theme.spacing(3),
  },
  buttons: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    marginTop: theme.spacing(2)
  },
  deleteButton: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    marginTop: theme.spacing(2),
    backgroundColor: "#FF0000",
    color: '#FFFFFF'
  },
  divider: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2)
  }
}));

function GetLicenseInfo(
  { 
    className, 
    globalUser, 
    userSetUser,
    history,
    location, 
    setErrorMessage,
    setOpen,
    licenseId,
     ...rest }) {
  const classes = useStyles();
  const { control, handleSubmit, errors } = useForm();

  const [loading, setLoading] = useState(false)
  const [license, setLicense] = useState({})

  const handleConfirmDelete = async () => {
    try {
      setLoading(true)
      await API.graphql(graphqlOperation(deletePartnerLicense, {input: {id: licenseId}}))
      const updatedUser = await API.graphql(graphqlOperation(getUser, {id: globalUser.id}))
      userSetUser(updatedUser.data.getUser)
      history.push('/license/partner')

    }catch(error) {
      console.log(error)
      setLoading(false)
      setErrorMessage('Failed to delete license. Try again or contact support@roosted.io')
      setOpen(true)
    }
  }

  const onSubmit = async (dataCollected) => {

    //add to mailchimp to monitor expiration

    setLoading(true)
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      const sub = currentUser.signInUserSession.idToken.payload.sub

      const expDate = new Date(dataCollected.licenseExpiration)
      const expDateString = expDate.toISOString()
      const licenseParams = {
        id: licenseId,
        licenseNumber: dataCollected.licenseNumber,
        licenseExpiration: expDateString,
        zipCode: dataCollected.partnerZip,
        radius: dataCollected.radius,
        lowPrice: dataCollected.lowPrice,
        highPrice: dataCollected.highPrice,
        broker: dataCollected.broker,
      }
      
      await API.graphql(graphqlOperation(updatePartnerLicense, {input: licenseParams}))
      const { data } = await API.graphql(graphqlOperation(getUser, {id: sub}))
      
      userSetUser(data.getUser)
      setLoading(false)
      history.push('/license/partner')

    }catch(error){
      setErrorMessage("Failed to update license. Please try again or contact support@roosted.io.")
      setOpen(true)
      setLoading(false)
      console.log(error)
    }

    try {
      ////MAILCHIMP UPDATE/////
      //Mark as payment completed and take off abandon cart

      let custom = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
          action: 'changedExpirationDate',
          emailData: {
            EMAIL: globalUser.email,
            FNAME: '',
            LNAME: '',
            PHONE: '',
            STATE: '',
            BROKER: '',
            EXPIRATION: new Date(dataCollected.licenseExpiration)
          }
        }
      }
      console.log(custom)
      const mailChimpResponse = await API.post(
        'roostedRestAPI', 
        '/mailchimp/execute-update',
        custom
      )
      console.log(mailChimpResponse)

      ////MAILCHIMP UPDATE/////
    } catch(error) {
      console.log(error)
    }

  }

  useEffect(() => {
    const fetchLicense = async () => {
      try {
        setLoading(true)
        setOpen(false)
        const {data} = await API.graphql(graphqlOperation(getPartnerLicense, {id: licenseId}))
        setLicense(data.getPartnerLicense)
        setLoading(false)
      }catch(error) {
        console.log(error)
        setErrorMessage('Failed to get license information. Please try again or contact support@roosted.io')
        setOpen(true)
      }
    }

    fetchLicense()

  // eslint-disable-next-line 
  }, [])

  const radius = ['10', '20', '30', '40', '50', '60', '70'];
  const prices = ['100,000', '200,000', '300,000', '400,000', '500,000', '600,000', '700,000', '800,000', '900,000', '1,000,000+'];
  return (
    loading ? <LinearProgress/> :
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      {loading ? <LinearProgress/> : <React.Fragment/>}
      <CardContent>
        <form {...rest} onSubmit={handleSubmit(onSubmit)}>
          <Typography variant='h4' align='center' style={{color: '#1CA6FC'}} gutterBottom>{`${license.licenseState} License Information`}</Typography>
          <Grid container spacing={1}>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller 
                rules={{ required: true}}
                as={TextField} 
                label="License Number"
                name='licenseNumber'
                id='licenseNumber' 
                defaultValue={license.licenseNumber === undefined ? '' : license.licenseNumber} 
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.licenseNumber !== undefined}
                control={control}
              />
              {errors.licenseNumber && <Typography variant='caption' color='error'>License Number is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller
                id='licenseExpiration'
                name='licenseExpiration'
                label='License Expiration'
                fullWidth
                variant="outlined"
                defaultValue={license.licenseExpiration === undefined ? '' : moment(new Date(license.licenseExpiration)).format('MM/DD/YYYY')}
                margin='dense'
                control={control}
                error={errors.licenseExpiration !== undefined}
                rules={{ required: true, pattern: /^(((0)[0-9])|((1)[0-2]))(\/)([0-2][0-9]|(3)[0-1])(\/)\d{4}$/}}
                as={<NumberFormatBase customInput={TextField} format="##/##/####" mask="_"/>}
              />
              {errors.licenseExpiration && <Typography variant='caption' color='error'>Expriation Date is required (mm/dd/yyyy).</Typography>} 
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller
                id='partnerZip'
                name='partnerZip'
                label='Preferred Zip Code to Work'
                fullWidth
                defaultValue={globalUser.userPartnerLicenses.items.length === 0 || globalUser.userPartnerLicenses === null ? '' : globalUser.userPartnerLicenses.items[0].zipCode}
                variant="outlined"
                margin='dense'
                control={control}
                error={errors.partnerZip !== undefined}
                rules={{ required: true, pattern: /^[0-9]*$/}}
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
                label="Radius to Work from Preferred Zip"
                id="radius"
                name="radius"
                control={control}
                defaultValue={globalUser.userPartnerLicenses.items[0].radius === null ? '10' : globalUser.userPartnerLicenses.items[0].radius}
                variant="outlined"
                margin='dense'
                as={<TextField 
                      select     
                      // eslint-disable-next-line react/jsx-sort-props
                      SelectProps={{ native: true }}>
                      {radius.map(radius => (
                        <option
                          key={radius}
                          value={radius}
                        >
                          {radius}
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
                label="Low End Price Point to Work"
                id="lowPrice"
                name="lowPrice"
                control={control}
                defaultValue={globalUser.userPartnerLicenses.items[0].lowPrice === null ? '100,000' : globalUser.userPartnerLicenses.items[0].lowPrice}
                variant="outlined"
                margin='dense'
                as={<TextField 
                      select     
                      // eslint-disable-next-line react/jsx-sort-props
                      SelectProps={{ native: true }}>
                      {prices.map(price => (
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
                label="High End Price Point to Work"
                id="highPrice"
                name="highPrice"
                control={control}
                defaultValue={globalUser.userPartnerLicenses.items[0].highPrice === null ? '100,000' : globalUser.userPartnerLicenses.items[0].highPrice}
                variant="outlined"
                margin='dense'
                as={<TextField 
                      select     
                      // eslint-disable-next-line react/jsx-sort-props
                      SelectProps={{ native: true }}>
                      {prices.map(price => (
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
                label="Current Broker"
                id="broker"
                name="broker"
                control={control}
                defaultValue={globalUser.userPartnerLicenses.items[0].broker === null ? '' : globalUser.userPartnerLicenses.items[0].broker}
                variant="outlined"
                margin='dense'
                error={errors.broker !== undefined}
                rules={{ required: true}}
                as={TextField}
                />
                {errors.broker && <Typography variant='caption' color='error'>Broker is required.</Typography>}
            </Grid>
          </Grid>
          <div className={classes.actions} align='center'>
          <Button 
            className={classes.buttons}
            color="primary"
            variant="contained"
            startIcon={<ArrowBackIosIcon/>}
            onClick={() => { history.push('/license/partner')}}
          >
            Back
          </Button>

          <Button
            color="primary"
            variant="contained"
            className={classes.buttons}
            endIcon={<ArrowForwardIosIcon/>}
            type='submit'
          >
            Next
          </Button>

          <Button 
            className={classes.deleteButton}
            color="primary"
            variant="contained"
            endIcon={<DeleteIcon/>}
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </div>
        </form>
    
      </CardContent>
      {loading ? <LinearProgress/> : <React.Fragment/>}
  </Card> 
  );
}

GetLicenseInfo.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(GetLicenseInfo);
