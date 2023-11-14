import React, { useState, useEffect } from 'react';
import validate from 'validate.js';
import { Button, TextField, Typography } from '@mui/material';
import { Auth } from "aws-amplify"
import Snackbar from '@mui/material/Snackbar';
import { Alert } from '@mui/material';

//SAGA IMPORTS
import { connect } from 'react-redux';

const AlertFunk = React.forwardRef((props, ref) => (
  <Alert elevation={6} variant="filled" ref={ref} {...props} />
));

const schema = {
  username: {
    presence: { allowEmpty: false, message: '^Email address is required' },
    email: {message: '^Email address is not valid' }
  },
  code: {
    presence: { allowEmpty: false, message: 'is required' }
  }
};

function ConfirmSignUpForm({userHash, userEmail, globalUser, onSignIn, onSignedIn, setLoading, loading, ...rest}) {

  const [formState, setFormState] = useState(userEmail === '' ? {
    isValid: false,
    values: {},
    touched: {},
    errors: {}
  } :
  {
    isValid: false,
    values: {username: userEmail},
    touched: {},
    errors: {}
  });

  //ERROR SNACKBAR VARIABLE AND METHOD
  const [open, setOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('Unknown Error')
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const [username, setUsername] = useState(userEmail === '' ? '' : userEmail)
  const [code, setCode] = useState('')

  const handleInputChange = event => {
    event.persist();
    if(event.target.name === 'username') {
      setUsername(event.target.value)
    } else if(event.target.name === 'code') {
      setCode(event.target.value)
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

  }

  const handleSubmit = async (event) => {
    event.preventDefault();
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

  return (
    <form
      onSubmit={handleSubmit}
      style={{marginTop: '1.5rem'}}
    >
      <Snackbar open={open} onClose={handleClose} anchorOrigin={{vertical: 'top', horizontal: 'center' }}>
        <AlertFunk onClose={handleClose} severity="error">
        {errorMessage}
        </AlertFunk>
      </Snackbar>
      <div align='center'>
          <Typography variant='subtitle1' gutterBottom style={{padding: '1rem 1rem'}}>
                Check your email, we've emailed you a code.
          </Typography>
        </div>
      <div style={
        {
          margin: '-1rem',
          display: 'flex',
          flexWrap: 'wrap'
        }
      }>
        {userEmail === '' ?
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
          onChange={handleInputChange}
          value={formState.values.username || ''}
          variant="outlined"
        /> : <React.Fragment/>}
        <TextField
          style={{
            flexGrow: 1,
            margin: '0.5rem 1rem'
          }}
          error={hasError('code')}
          fullWidth
          helperText={hasError('code') ? formState.errors.code[0] : null}
          label="Code"
          name="code"
          id="code"
          key="code"
          onChange={handleInputChange}
          value={formState.values.code || ''}
          variant="outlined"
        />
      </div>
      <Button
        style={
          {
            marginTop: '1rem',
            width: '100%',
          }
        }
        color='primary'
        disabled={!formState.isValid || loading}
        size="large"
        onClick={
          () => {
                  setLoading(true)
                  const trimmedUserName = String(username).trim();
                  const lowerCaseUserName = trimmedUserName.toLowerCase();
                  Auth.confirmSignUp(lowerCaseUserName, code)
                  .then(() => {
                    // console.log(userHash)
                    if(userHash === '') {
                      onSignIn()
                    } else {
                      Auth.signIn(lowerCaseUserName, userHash)
                      .then(onSignedIn)
                      .catch(err => {
                        setLoading(false)
                        setErrorMessage(err.message)
                        setOpen(true)
                        console.log(err)
                    })
                    }
                  })
                  .catch(err => {
                    setLoading(false)
                    setErrorMessage(err.message)
                    setOpen(true)
                    console.log(err)
                })}
              }
        variant="contained"
      >
        Verify Email
      </Button>
    </form>
  );
}

const mapStateToProps = state => {
  return {
      globalUser: state.user.globalUser,
      userEmail: state.user.userEmail,
      userHash: state.user.userHash
  };
};

export default connect(mapStateToProps, null)(ConfirmSignUpForm);
