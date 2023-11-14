import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Button
} from '@mui/material';

import { getReferralStatusStepsObject, getClientStatusStepsObject } from '../../utils/utilities'

//import { useForm, Controller } from "react-hook-form";
// import { Auth, API, graphqlOperation } from 'aws-amplify';
// import { updateReferral } from "../../../graphql/mutations"

import moment from 'moment'

const useStyles = makeStyles(theme => ({
  root: {},
  header: {
    backgroundColor: '#eaeaea',
   },
  buttons: {
    margin: '1rem'
  },
  content: {
    padding: 0
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'flex-start',

  },
}));

//new, clientContacted, agreementSigned, touring, underContract, clientLost, closed; sellers: new, clientContacted, agreementSigned, listed, reviewingOffers, underContract, clientLost, closed


function LicenseInformation({ className, history, user, ...rest }) {
  const classes = useStyles()
  
  console.log(user)
  return (
    user === undefined || user.userReferralsCreated === undefined ? <React.Fragment/> :
    <Card
        {...rest}
        className={clsx(classes.root, className)}
        style={{marginTop: '2rem'}}
      >
        <CardHeader classes={{title: classes.header}} title='Referrals' className={classes.header} />
        <Divider />
        <CardContent className={classes.content}>
          <Table size='small'>
            <TableBody>
            <TableRow>
                <TableCell><b>Referring State</b></TableCell>
                <TableCell><b>Receiving State State</b></TableCell>
                <TableCell><b>Date Created</b></TableCell>
                <TableCell><b>Link to Referral</b></TableCell>
                <TableCell><b>Referral Status</b></TableCell>
                <TableCell><b>Client Status</b></TableCell>
            </TableRow>
            {user.userReferralsCreated.items.length !== 0 ?
            user.userReferralsCreated.items.map(referral => (
              <TableRow key={referral.id}>
                <TableCell>{referral.referralReferringAgentState}</TableCell>
                <TableCell>{referral.referralState}</TableCell>
                <TableCell>{moment(referral.createdAt).format('MM/DD/YYYY')}</TableCell>
                <TableCell><Button variant='contained' size='small' color='primary' onClick={() => history.push(`/referrals/details/broker/${referral.id}/referraldata`)}>Go To Referral</Button></TableCell>
                <TableCell>{getReferralStatusStepsObject(referral.referralStatus)}</TableCell>
                <TableCell>{getClientStatusStepsObject(referral.referralClientStatus)}</TableCell>
              </TableRow>
            )) : <React.Fragment/>}
              {user.userReferralsReceived.items.length !== 0 ?
              user.userReferralsReceived.items.map(referral => (
              <TableRow key={referral.id}>
                <TableCell>{referral.referralReferringAgentState}</TableCell>
                <TableCell>{referral.referralState}</TableCell>
                <TableCell>{moment(referral.createdAt).format('MM/DD/YYYY')}</TableCell>
                <TableCell><Button variant='contained' color='primary' onClick={() => history.push(`/referrals/details/broker/${referral.id}/referraldata`)}>Go To Referral</Button></TableCell>
                <TableCell>{getReferralStatusStepsObject(referral.referralStatus)}</TableCell>
                <TableCell>{getClientStatusStepsObject(referral.referralClientStatus)}</TableCell>
              </TableRow>
            )) : <React.Fragment/>}
            </TableBody>
          </Table>
        </CardContent>
      </Card> 
  );
}

LicenseInformation.propTypes = {
  className: PropTypes.string
};

export default LicenseInformation
