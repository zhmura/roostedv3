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
import { getStatesByAgentType, formatPhoneNumber, formatPhoneNumberToString } from '../../utils/utilities'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { API, graphqlOperation } from "aws-amplify";
import { updateUser } from '../../graphql/mutations'


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

function EditAgentInfo(
  { 
    className, 
    globalUser, 
    userSetUser,
    history,
    location, 
    setErrorMessage,
    setOpen,
    agentId,
    user,
     ...rest }) {
  const classes = useStyles();
  const { control, handleSubmit, errors } = useForm();

  const [loading, setLoading] = useState(false)

  //const [user, setUser] = useState(passedInUser)
  console.log(user)
  const onSubmit = async (formDataCollected) => {

    //add to mailchimp
    //move to PPM page
    console.log(formDataCollected)
    setLoading(true)
    try {

      const agentParams = {
        id: agentId,
        userFirstName: formDataCollected.agentFirstName,
        userLastName: formDataCollected.agentLastName,
        userPhone: formatPhoneNumberToString(formDataCollected.agentPhone),
        userAddress: {
          street: formDataCollected.agentStreet,
          unit: formDataCollected.agentUnit === '' ? null : formDataCollected.agentUnit,
          city: formDataCollected.agentCity,
          state: formDataCollected.agentState,
          zip: formDataCollected.agentZip
        }
      }

      await API.graphql(graphqlOperation(updateUser, {input: agentParams}))

     
      setLoading(false)
      history.push('/users/admin')
    }catch(error){
      setErrorMessage("Failed to save user data. Please try again or contact support@roosted.io.")
      setOpen(true)
      setLoading(false)
      console.log(error)
    }
  }

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       setLoading(true)
  //       setOpen(false)
  //       const {data} = await API.graphql(graphqlOperation(getUser, {id: agentId}))
  //       setUser(data.getUser)
  //       setLoading(false)
  //     }catch(error) {
  //       console.log(error)
  //       setErrorMessage('Failed to get user information. Please try again or contact support@roosted.io')
  //       setOpen(true)
  //     }
  //   }

  //   fetchUser()

  // // eslint-disable-next-line 
  // }, [])

  return (
    loading ? <LinearProgress/> :
    <>
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      {loading ? <LinearProgress/> : <React.Fragment/>}
      <CardContent>
        <form {...rest} onSubmit={handleSubmit(onSubmit)}>
          <Typography variant='h4' align='center' style={{color: '#1CA6FC'}} gutterBottom>{`Agent Information`}</Typography>
          <Grid container spacing={1}>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller 
                rules={{ required: true}}
                as={TextField} 
                label="First Name"
                name='agentFirstName'
                id='agentFirstName' 
                defaultValue={user.userFirstName === undefined ? '' : user.userFirstName} 
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.agentFirstName !== undefined}
                control={control}
              />
              {errors.agentFirstName && <Typography variant='caption' color='error'>A first name is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller 
                rules={{ required: true}}
                as={TextField} 
                label="Last Name"
                name='agentLastName'
                id='agentLastName' 
                defaultValue={user.userLastName === undefined ? '' : user.userLastName} 
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.agentLastName !== undefined}
                control={control}
              />
              {errors.agentLastName && <Typography variant='caption' color='error'>A last name is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller 
                rules={{ required: true}}
                as={TextField} 
                label="Street"
                name='agentStreet'
                id='agentStreet' 
                defaultValue={user.userAddress === undefined ? '' : user.userAddress.street}
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.agentStreet !== undefined}
                control={control}
              />
              {errors.agentStreet && <Typography variant='caption' color='error'>Street is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller 
                as={TextField}
                label="Unit"
                name='agentUnit'
                id='agentUnit' 
                defaultValue={user.userAddress === undefined || user.userAddress.unit === null ? '' : user.userAddress.unit}
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
                rules={{ required: true}}
                as={TextField} 
                label="City"
                name='agentCity'
                id='agentCity' 
                defaultValue={user.userAddress === undefined ? '' : user.userAddress.city}
                variant='outlined'
                margin='dense'
                fullWidth
                error={errors.agentCity !== undefined}
                control={control}
              />
              {errors.agentCity && <Typography variant='caption' color='error'>City is required.</Typography>}
            </Grid>
             <Grid
              item
              md={6}
              xs={12}
            >
              <Controller
                fullWidth
                label="State"
                id="agentState"
                name="agentState"
                control={control}
                defaultValue={user.userAddress === undefined ? 'AZ' : user.userAddress.state}
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
                id='agentZip'
                name='agentZip'
                label='Zip Code'
                fullWidth
                defaultValue={user.userAddress === undefined ? '' : user.userAddress.zip}
                variant="outlined"
                margin='dense'
                control={control}
                error={errors.agentZip !== undefined}
                rules={{ required: true, pattern: /^[0-9]*$/}}
                as={<NumberFormatBase customInput={TextField} format="#####" mask="_"/>}
                />
                {errors.agentZip && <Typography variant='caption' color='error'>Zip Code is required.</Typography>}
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <Controller
                id='agentPhone'
                name='agentPhone'
                label='Phone Number'
                fullWidth
                variant="outlined"
                margin='dense'
                control={control}
                defaultValue={user.userPhone === undefined ? '' : formatPhoneNumber(user.userPhone)}
                error={errors.agentPhone !== undefined}
                rules={{ required: true, pattern: /((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}/ }}
                as={<NumberFormatBase customInput={TextField} format="(###) ###-####" mask="_"/>}
              />
              {errors.agentPhone && <Typography variant='caption' color='error'>Phone number is required.</Typography>}
            </Grid>
          </Grid>
          <div className={classes.actions} align='center'>
          <Button
            color="primary"
            variant="contained"
            className={classes.buttons}
            endIcon={<ArrowForwardIosIcon/>}
            disabled={globalUser.userType !== 'broker' && globalUser.userType !== 'admin'}
            type='submit'
          >
            Update Agent
          </Button>
        </div>
        </form>
    
      </CardContent>
      {loading ? <LinearProgress/> : <React.Fragment/>}
    </Card>

    {/* {user.userRoostedLicenses.length > 0 ? 

    <Card
    {...rest}
    className={clsx(classes.root, className)}
    >
    {loading ? <LinearProgress/> : <React.Fragment/>}
    <CardContent>
      <form {...rest} onSubmit={handleSubmit(onSubmit)}>
        <Typography variant='h4' align='center' style={{color: '#1CA6FC'}} gutterBottom>{`Additional Information`}</Typography>
        <Grid container spacing={1}>
          <Grid
            item
            md={6}
            xs={12}
          >
            <Typography>

            </Typography>
          </Grid>
          <Grid
            item
            md={6}
            xs={12}
          >
            <Controller 
              rules={{ required: true}}
              as={TextField} 
              label="Last Name"
              name='agentLastName'
              id='agentLastName' 
              defaultValue={user.userLastName === undefined ? '' : user.userLastName} 
              variant='outlined'
              margin='dense'
              fullWidth
              error={errors.agentLastName !== undefined}
              control={control}
            />
            {errors.agentLastName && <Typography variant='caption' color='error'>A last name is required.</Typography>}
          </Grid>
          <Grid
            item
            md={6}
            xs={12}
          >
            <Controller 
              rules={{ required: true}}
              as={TextField} 
              label="Street"
              name='agentStreet'
              id='agentStreet' 
              defaultValue={user.userAddress === undefined ? '' : user.userAddress.street}
              variant='outlined'
              margin='dense'
              fullWidth
              error={errors.agentStreet !== undefined}
              control={control}
            />
            {errors.agentStreet && <Typography variant='caption' color='error'>Street is required.</Typography>}
          </Grid>
          <Grid
            item
            md={6}
            xs={12}
          >
            <Controller 
              as={TextField}
              label="Unit"
              name='agentUnit'
              id='agentUnit' 
              defaultValue={user.userAddress === undefined || user.userAddress.unit === null ? '' : user.userAddress.unit}
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
              rules={{ required: true}}
              as={TextField} 
              label="City"
              name='agentCity'
              id='agentCity' 
              defaultValue={user.userAddress === undefined ? '' : user.userAddress.city}
              variant='outlined'
              margin='dense'
              fullWidth
              error={errors.agentCity !== undefined}
              control={control}
            />
            {errors.agentCity && <Typography variant='caption' color='error'>City is required.</Typography>}
          </Grid>
          <Grid
            item
            md={6}
            xs={12}
          >
            <Controller
              fullWidth
              label="State"
              id="agentState"
              name="agentState"
              control={control}
              defaultValue={user.userAddress === undefined ? 'AZ' : user.userAddress.state}
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
              id='agentZip'
              name='agentZip'
              label='Zip Code'
              fullWidth
              defaultValue={user.userAddress === undefined ? '' : user.userAddress.zip}
              variant="outlined"
              margin='dense'
              control={control}
              error={errors.agentZip !== undefined}
              rules={{ required: true, pattern: /^[0-9]*$/}}
              as={<NumberFormatBase customInput={TextField} format="#####" mask="_"/>}
              />
              {errors.agentZip && <Typography variant='caption' color='error'>Zip Code is required.</Typography>}
          </Grid>
          <Grid
            item
            md={6}
            xs={12}
          >
            <Controller
              id='agentPhone'
              name='agentPhone'
              label='Phone Number'
              fullWidth
              variant="outlined"
              margin='dense'
              control={control}
              defaultValue={user.userPhone === undefined ? '' : formatPhoneNumber(user.userPhone)}
              error={errors.agentPhone !== undefined}
              rules={{ required: true, pattern: /((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}/ }}
              as={<NumberFormatBase customInput={TextField} format="(###) ###-####" mask="_"/>}
            />
            {errors.agentPhone && <Typography variant='caption' color='error'>Phone number is required.</Typography>}
          </Grid>
        </Grid>
        <div className={classes.actions} align='center'>
        <Button
          color="primary"
          variant="contained"
          className={classes.buttons}
          endIcon={<ArrowForwardIosIcon/>}
          disabled={globalUser.userType !== 'broker' && globalUser.userType !== 'admin'}
          type='submit'
        >
          Update Agent
        </Button>
      </div>
      </form>

    </CardContent>
    {loading ? <LinearProgress/> : <React.Fragment/>}
    </Card> : <React.Fragment/>} */}
    </>
  );
}

EditAgentInfo.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(EditAgentInfo);
