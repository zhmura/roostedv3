import React, { useState, useEffect } from 'react';
import validate from 'validate.js';
import { Button, TextField } from '@mui/material';
import { Auth } from "aws-amplify"
import Snackbar from '@mui/material/Snackbar';
import { Alert } from '@mui/material';
import { NumberFormatBase } from 'react-number-format';
// import { NumberFormatBase as NumberFormat } from 'react-number-format';

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index'

const AlertFunk = React.forwardRef((props, ref) => (
  <Alert elevation={6} variant="filled" ref={ref} {...props} />
));

const schema = {
  username: {
    presence: { allowEmpty: false, message: '^Email address is required' },
    email: { message: '^Email address is not valid' }
  },
  password: {
    presence: { allowEmpty: false, message: 'is required' }
  },
  phone_number: {
    presence: { allowEmpty: false, message: 'is required' }
  }
};

function SignUpForm(props) {

  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {}
  });
  const [username, setUsername] = useState('')
  const [phone_number, setPhone_Number] = useState('')
  const [password, setPassword] = useState('')

  //ERROR SNACKBAR VARIABLE AND METHOD
  const [open, setOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('Unknown Error')
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  };

  const handleInputChange = event => {
    event.persist();
    if (event.target.name === 'username') {
      setUsername(event.target.value)
    } else if (event.target.name === 'phone_number') {
      setPhone_Number(event.target.value)
    } else if (event.target.name === 'password') {
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
  }

  const handlePhoneInputChange = event => {
    setPhone_Number(event.value)
    setFormState((prevFormState) => ({
      ...prevFormState,
      values: {
        ...prevFormState.values,
        phone_number: event.value
      },
      touched: {
        ...prevFormState.touched,
        phone_number: true
      }
    }));
  }

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
      style={{ marginTop: '1.5rem' }}
    >
      <Snackbar open={open} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <AlertFunk onClose={handleClose} severity="error">
          {errorMessage}
        </AlertFunk>
      </Snackbar>
      <div style={
        {
          margin: '-1rem',
          display: 'flex',
          flexWrap: 'wrap',
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
          onChange={handleInputChange}
          value={formState.values.username || ''}
          variant="outlined"
        />
        <NumberFormatBase
          style={{
            flexGrow: 1,
            margin: '0.5rem 1rem'
          }}
          id='phone_number'
          key='phone_number'
          name='phone_number'
          label='Phone Number'
          fullWidth
          variant="outlined"
          error={hasError('phone_number')}
          onValueChange={handlePhoneInputChange}
          value={formState.values.phone_number || ''}
          customInput={TextField} 
          // format="(###) ###-####" mask="_" 
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
          onChange={handleInputChange}
          type="password"
          value={formState.values.password || ''}
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
          disabled={!formState.isValid || props.loading}
          size="large"
          onClick={() => {
            props.setLoading(true)
            const trimmedUserName = String(username).trim();
            const lowerCaseUserName = trimmedUserName.toLowerCase();
            Auth.signUp({
              username: lowerCaseUserName,
              password: password,
              attributes: {
                phone_number: '+1' + phone_number // optional - E.164 number convention
              },
              validationData: [] //optional
            })
              .then(() => {
                props.userSetEmail(lowerCaseUserName)
                props.userSetHash(password)
                props.onConfirmSignUp()
              })
              .catch(err => {
                props.setLoading(false)
                if (err.message === 'PreSignUp failed with error codeFailedQueryingUser.') {
                  setErrorMessage('System failure while trying to verify user. Try again or contact support@roosted.io')
                  setOpen(true)
                  console.log(err)
                } else if (err.message === 'PreSignUp failed with error codeDifferentProvider.') {
                  setErrorMessage('You already created an account with a different login method. Try a different social login or email/password combination.')
                  setOpen(true)
                  console.log(err)
                } else {
                  props.setLoading(false)
                  setErrorMessage(err.message)
                  setOpen(true)
                  console.log(err)
                }
              })
          }}
          variant="contained"
        >
          Sign Up
        </Button>
      </div>
    </form>
  );
}

const mapStateToProps = state => {
  return {
    globalUser: state.user.user,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    //get user and set to global store
    userSetHash: (hash) => dispatch(actions.userSetHash(hash)),
    userSetEmail: (email) => dispatch(actions.userSetEmail(email))

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUpForm);
