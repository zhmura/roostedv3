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
import LockIcon from '@mui/icons-material/Lock';

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth } from "aws-amplify";

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

function ChangePassword(
  { 
    className, 
    globalUser,
    userSetUser,
    setSeverity,
    setErrorMessage,
    currentUser,
    setOpen,
     ...rest }) {
  const classes = useStyles();
  const { control, handleSubmit, errors, watch } = useForm();

  const [loadingPassword, setLoadingPassword] = useState(false)
  const [socialLogin, setSocialLogin] = useState(false)

  const onPasswordSubmit = async (dataCollected) => {
    setOpen(false)

    // DON'T CONTINUE IF SOCIAL PROVIDER, TELL THEM TO CHANGE ON SOCIAL PROVIDER
    setLoadingPassword(true)
    try {
      await Auth.changePassword(currentUser, dataCollected.oldPassword, dataCollected.newPassword)

      setLoadingPassword(false)
      setSeverity('success')
      setErrorMessage('Password updated!')
      setOpen(true)

    }catch(error){
      setErrorMessage("Failed to save user data. Please try again or contact support@roosted.io.")
      setSeverity('error')
      setOpen(true)
      setLoadingPassword(false)
      console.log(error)
    }
  }

  useEffect(() => {

    const setSocialLoginStatus = () => {
      if(currentUser.username !== undefined) {
        const userNamePrefix = currentUser.username.slice(0,4)
        if(userNamePrefix === 'Face') {
          setSocialLogin(true)
        } else if(userNamePrefix === 'Goog') {
          setSocialLogin(true)
        }
      }
    }

    if(!(Object.entries(globalUser).length === 0 && globalUser.constructor === Object)) {
      setSocialLoginStatus()
    }
  // eslint-disable-next-line
  },[currentUser])

  return (
    <>
    <Card
      {...rest}
      className={clsx(classes.root, className)}
      style={{marginTop: '1.5rem'}}
    >
      {loadingPassword ? <LinearProgress/> : <React.Fragment/>}
      <CardContent>
        <form {...rest} onSubmit={handleSubmit(onPasswordSubmit)}>
        <Typography variant='h4' align='center' style={{color: '#1CA6FC'}} gutterBottom>Change Password</Typography>
        <div align='center' style={{marginBottom: '1.5rem'}}><Typography variant='caption' gutterBottom>Passwords must be at least 8 characters.</Typography></div>
        <Grid
            container
            spacing={1}
          >
            <Grid
              item
              md={4}
              xs={12}
            >
              <Controller 
                rules={{ required: true}}
                as={TextField} 
                label="Old Password"
                name='oldPassword'
                id='oldPassword' 
                defaultValue=''
                variant='outlined'
                margin='dense'
                type='password'
                disabled={socialLogin}
                fullWidth
                error={errors.oldPassword !== undefined}
                control={control}
              />
              {errors.oldPassword && <Typography variant='caption' color='error'>Your old password is required.</Typography>}
            </Grid>
            <Grid
              item
              md={4}
              xs={12}
            >
              <Controller
                rules={{required: {value: true, message: 'Enter a new password.'}, minLength: {value: 8, message: 'Password must be at least 8 characters.'}}}
                as={TextField} 
                label="New Password"
                name='newPassword'
                id='newPassword' 
                defaultValue=''
                variant='outlined'
                margin='dense'
                type='password'
                disabled={socialLogin}
                fullWidth
                error={errors.newPassword !== undefined}
                control={control}
              />
              {errors.newPassword && <Typography variant='caption' color='error'>{errors.newPassword.message}</Typography>}
            </Grid>
            <Grid
              item
              md={4}
              xs={12}
            >
              <Controller 
                rules={{required: {value: true, message: 'You must enter a new password.'}, 
                validate: (value) => {return value === watch('newPassword') || 'Passwords do not match'}}}
                as={TextField} 
                label="Confirm Password"
                name='confirmPassword'
                id='confirmPassword' 
                defaultValue=''
                variant='outlined'
                margin='dense'
                type='password'
                disabled={socialLogin}
                fullWidth
                error={errors.confirmPassword !== undefined}
                control={control}
              />
              {errors.confirmPassword && <Typography variant='caption' color='error'>{errors.confirmPassword.message}</Typography>}
            </Grid>
          </Grid>
          <div className={classes.actions} align='center'>
          <Button
            color="primary"
            variant="contained"
            className={classes.buttons}
            endIcon={<LockIcon/>}
            disabled={loadingPassword || socialLogin}
            type='submit'
          >
            Update Password 
          </Button>
          {socialLogin ? <Typography style={{marginTop: '1rem'}} variant='body1'>You cannot update your password here because you are using a social login provider. You must change your password with them.</Typography> : <React.Fragment/>}
        </div>
        </form>
    
      </CardContent>
      {loadingPassword ? <LinearProgress/> : <React.Fragment/>}
    </Card>
    </>
  );
}

ChangePassword.propTypes = {
  className: PropTypes.string
};

const mapStateToProps = state => {
  return {
      globalUser: state.user.userGlobal,
  };
};

const mapDispatchToProps = dispatch => {
  return {
      userSetUser: (user) => dispatch(actions.userSetUser(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword);
