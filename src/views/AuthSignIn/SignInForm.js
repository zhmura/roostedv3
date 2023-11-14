import React, { useState, useEffect } from 'react';
import validate from 'validate.js';
import PropTypes from 'prop-types';
import { Button, TextField, Typography } from '@mui/material';
import { Auth } from 'aws-amplify'
import Facebook from '@mui/icons-material/Facebook'
import Snackbar from '@mui/material/Snackbar';
import { Alert } from '@mui/material';
import Dialog from './Dialog'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index'

const AlertFunk = React.forwardRef((props, ref) => (
  <Alert elevation={6} variant="filled" ref={ref} {...props} />
));

const schema = {
  username: {
    presence: { allowEmpty: false, message: '^Email address is required' },
    email: {message: '^Email address is not valid' }
  },
  password: {
    presence: { allowEmpty: false, message: 'is required' }
  }
};

function SignInForm({ user, className, onSignedIn, onConfirmSignUp, onLoading, match, history, setLoading, loading, userSetUser, userSetEmail, globalUser, ...rest }) {

  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {}
  });

  const [openDialog, setOpenDialog] = useState(false)
  const [socialLoginChosen, setSocialLoginChosen] = useState('')

  const handleDialogClose = () => {
    setOpenDialog(false)
  }

  const handleContinueSocialLogin = (socialLogin) => {
    // onLoading()
    if(socialLogin === 'google') {
      Auth.federatedSignIn({provider: "Google"})
    }
    if(socialLogin === 'facebook') {
      Auth.federatedSignIn({provider: "Facebook"})
    }
  }

  //ERROR SNACKBAR VARIABLE AND METHOD
  const [open, setOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('Unknown Error')
  const [severity, setSeverity] = useState('error')
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  };

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  const handleChange = (event) => {
    event.persist();

    if(event.target.name === 'username') {
      setUsername(event.target.value)
    } else if(event.target.name === 'password') {
      setPassword(event.target.value)
    }

    setFormState((prevFormState) => ({
      ...prevFormState,
      values: {
        ...prevFormState.values,
        [event.target.name]:
          event.target.type === 'checkbox'
            ? event.target.checked
            : event.target.value
      },
      touched: {
        ...prevFormState.touched,
        [event.target.name]: true
      }
    }));
  };

  const hasError = (field) => (!!(formState.touched[field] && formState.errors[field]));

  useEffect(() => {
    const errors = validate(formState.values, schema);

    setFormState((prevFormState) => ({
      ...prevFormState,
      isValid: !errors,
      errors: errors || {}
    }));
  }, [formState.values]);

  useEffect(() => {
    const fullURL = history.location.search
    // const errorURL = fullURL === '' ? '' : fullURL.slice(0,18)
    if(fullURL.includes('Google') && fullURL.includes('?error_description')) {
      setErrorMessage('Your Google account has been linked! Hit the "Login with Google" Button to Continue.')
      setSeverity('success')
      setOpen(true)
    } else if(fullURL.includes('Facebook') && fullURL.includes('?error_description')) {
      setErrorMessage('Your Facebook account has been linked! Hit the "Login with Facebook" Button to Continue.')
      setSeverity('success')
      setOpen(true)
    } else if(fullURL.includes('?error_description')) {
      setSeverity('error')
      setErrorMessage('You already created an account with a different login method. Try a different social login or email/password combination.')
      setOpen(true)
    }
      
  // eslint-disable-next-line
  }, []);

  // setSingInUser={props.setSingInUser}
  // user={props.user}

  
    
  return (
    <form
      {...rest}
      onSubmit={handleSubmit}
    >
      <Dialog open={openDialog}  handleClose={handleDialogClose} handleContinueSocialLogin={handleContinueSocialLogin} socialLoginChosen={socialLoginChosen}/>
      <Snackbar open={open} onClose={handleClose} autoHideDuration={10000} anchorOrigin={{vertical: 'top', horizontal: 'center' }}>
        <AlertFunk onClose={handleClose} severity={severity}>
        {errorMessage}
        </AlertFunk>
      </Snackbar>
      <div style={
        {
          margin: '-1rem',
          display: 'flex',
          flexWrap: 'wrap'
        }
      }>
        <TextField
          style={{
            flexGrow: 1,
            margin: '0.5rem 1rem'
          }}
          error={hasError('username')}
          fullWidth
          helperText={hasError('username') ? formState.errors.username[0] : null}
          label="Email address"
          name="username"
          id="username"
          key="username"
          onChange={handleChange}
          value={formState.values.username || ''}
          variant="outlined"
        />
        <TextField
          style={{
            flexGrow: 1,
            margin: '0.5rem 1rem'
          }}
          error={hasError('password')}
          fullWidth
          helperText={
            hasError('password') ? formState.errors.password[0] : null
          }
          label="Password"
          name="password"
          id="password"
          key="password"
          onChange={handleChange}
          type="password"
          value={formState.values.password || ''}
          variant="outlined"
        />
      </div>
      <Button
        style={
          {
            marginTop: '1rem',
            width: '100%',
            //background: "#0F3164"
          }
        }
        color='primary'
        disabled={!formState.isValid || loading}
        size="large"
        type="submit"
        variant="contained"
        onClick={() => {
                        setSeverity('error')
                        setLoading(true)
                        const trimmedUserName = String(username).trim();
                        const lowerCaseUserName = trimmedUserName.toLowerCase();
                        userSetEmail(lowerCaseUserName)
                        console.log('lowerCaseUserName',lowerCaseUserName);
                        console.log('password',password);
                        Auth.signIn(lowerCaseUserName, password)
                        .then(() => {
                          onSignedIn('onSignedIn')
                          userSetUser(user)
                          console.log('succsses');
                        })
                        .catch(err => {
                          console.log('work promise');
                          if(err.code === 'UserNotConfirmedException') {
                            setLoading(false)
                            onConfirmSignUp()
                          } else if(err.code === 'codeFailedToGetPostAuth') {
                            setLoading(false)
                            setErrorMessage('Authentication System Error Confirming User. Please Try Again or contact support@roosted.io.')
                            setOpen(true)
                            console.log(err)
                          } else if(err.code === 'UserNotFoundException') {
                            setLoading(false)
                            setErrorMessage('No username/password account created or an account with that email already exists using a Google of Facebook login.')
                            setOpen(true)
                            console.log(err)
                          } else if(err.message === 'codeFailedToPutPostAuth') {
                            setLoading(false)
                            setErrorMessage('Authentication System Error During Initial Login. Please Try Again or contact support@roosted.io.')
                            setOpen(true)
                            console.log(err)
                          } else {
                            setLoading(false)
                            setErrorMessage(err.message)
                            setOpen(true)
                            console.log(err)
                          }
                        })
                      }
      }
      >
        Sign in1
      </Button>
      <Typography style={{marginTop: '1rem'}} align='center' variant='subtitle1'>
      or
      </Typography>

      <Button
        style={
          {
            marginTop: '1rem',
            width: '100%',
            height: '50px'
          }
        }
        color='primary'
        size="large"
        type="submit"
        variant="contained"
        disabled={loading}
        onClick={() => {
          try {
            // onLoading()
            setSocialLoginChosen('google')
            Auth.federatedSignIn({provider: "Google"})
          }
          catch(err) {
              setSeverity('error')
              setErrorMessage(err.message)
              setOpen(true)
              console.log(err)
            }
          }
        }
      >
        <div style={{marginTop: '0.25rem', marginRight: '1rem'}}>
          <img
          vertical-align='sub'
            alt="Google Logo"
            src="/images/logos/google_icon_white.png"
            height="20px"
          />
        </div>
        <div>
          Login with Google
        </div>
      </Button>
      <Button
        style={
          {
            marginTop: '1rem',
            width: '100%',
            height: '50px'
          }
        }
        color='primary'
        size="large"
        type="submit"
        variant="contained"
        disabled={loading}
        onClick={() => {
          try {
            // onLoading()
            setSocialLoginChosen('facebook')
            Auth.federatedSignIn({provider: "Facebook"})
          }
          catch(err) {
              setSeverity('error')
              setErrorMessage(err.message)
              setOpen(true)
              console.log(err)
            }
          }
        }
      >
        <Facebook style={{marginRight: '1rem'}}/>
        <div>
          Login with Facebook
        </div>
      </Button>
    </form>
  );
}

SignInForm.propTypes = {
  className: PropTypes.string
};

const mapStateToProps = state => {
  return {
      globalUser: state.user.user,
  };
};

const mapDispatchToProps = dispatch => {
  return {
      //get user and set to global store
      userSetEmail: (email) => dispatch(actions.userSetEmail(email)),
      userSetUser: (user) => dispatch(actions.userSetUser(user))
      
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignInForm);
