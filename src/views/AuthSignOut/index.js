import React from "react";
import Topbar from './Topbar'
import { Auth } from 'aws-amplify'
import { Typography, LinearProgress } from '@mui/material'

const AuthSignOut = (props) => {
  props.history.push('/home')
  Auth.signOut().then().catch(error => {console.log('Failed to sign out')})
  return (
    <>
      <Topbar/>
      <LinearProgress />
      <Typography style={{marginTop: '6rem'}} align='center'>
        Goodbye!
      </Typography>
    </>
  )
  }

export default AuthSignOut;