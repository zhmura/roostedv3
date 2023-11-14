import React, { useState, useEffect } from 'react';
import validate from 'validate.js';
import PropTypes from 'prop-types';
import { Button, TextField, Typography } from '@mui/material';
import { Auth } from "aws-amplify"
import Snackbar from '@mui/material/Snackbar';
import { Alert } from '@mui/material';

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
  },
  newPassword: {
    presence: { allowEmpty: false, message: '^ New password is required' }
  },
  code: {
    presence: { allowEmpty: false, message: '^Code is required' }
  }
};

function VerifyContactForm({classname, onSignIn, onSignedIn, setLoading, loading, ...rest}) {

  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {}
  });

  const [code, setCode] = useState('')
  const [showEnterCodeInput, setShowEnterCodeInput] = useState(false)

    //ERROR SNACKBAR VARIABLE AND METHOD
    const [open, setOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState('Unknown Error')
    const handleClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
  
      setOpen(false);
    };

  const handleInputChange = event => {
    event.persist();
    if(event.target.name === 'code') {
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
      {...rest}
      onSubmit={handleSubmit}
    >
      <Snackbar open={open} onClose={handleClose} anchorOrigin={{vertical: 'top', horizontal: 'center' }}>
        <AlertFunk onClose={handleClose} severity="error">
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
      {!showEnterCodeInput ? 
        <>
          {/* <TextField
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
            type="text"
            onChange={handleInputChange}
            value={formState.values.username || ''}
            variant="outlined"
          />  */}

          <Button
            style={
              {
                margin: '0.5rem 1rem',
                width: '100%',
              }
            }
            color='primary'
            disabled={loading}
            size="large"
            onClick={
              () => {
                setLoading(true)
                Auth.verifyCurrentUserAttribute('email')
                .then(() => { 
                  setLoading(false)
                  setShowEnterCodeInput(true)
                })
                .catch(err => {
                  setLoading(false)
                  if(err.code === 'UserNotFoundException') {
                    setErrorMessage('No user found or you are trying to reset a password associated with a social login, which must be done with that provider.')
                    setOpen(true)
                    console.log(err)
                  } else {
                    setErrorMessage(err.message)
                    setOpen(true)
                    console.log(err)
                  }
                })}}
            variant="contained"
          >
            Send Code to Email
        </Button>
        </>:
        <>
        <div align='center'>
          <Typography variant='subtitle1' style={{padding: '1rem 1rem'}}>
                Check your email, we've emailed you a code.
          </Typography>
        </div>
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
            type="text"
            onChange={handleInputChange}
            value={formState.values.code || ''}
            variant="outlined"
          />
          <Button
            style={
              {
                margin: '0.5rem 1rem',
                width: '100%',
              }
            }
            color='primary'
            disabled={hasError('code') || (formState.values.code === undefined ) || loading}
            size="large"
            onClick={
              () => {
                setLoading(true)
                Auth.verifyCurrentUserAttributeSubmit('email', code)
                .then(
                  () => {
                    console.log('Verifying Email')
                    setLoading(false)
                    onSignedIn()
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
        </>}
      </div>
    </form>
  );
}

VerifyContactForm.propTypes = {
  className: PropTypes.string
};

export default VerifyContactForm;
