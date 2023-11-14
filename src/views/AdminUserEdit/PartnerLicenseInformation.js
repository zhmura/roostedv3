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

import { getLicenseStatusStepsObject } from '../../utils/utilities'

//import { useForm, Controller } from "react-hook-form";
// import { Auth, API, graphqlOperation } from 'aws-amplify';
// import { updateReferral } from "../../../graphql/mutations"

import moment from 'moment'

const useStyles = makeStyles(theme => ({
  root: {},
  header: {
    backgroundColor: '#1CA6FC',
    color: '#FFFFFF'
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


function LicenseInformation({ className, user, history, ...rest }) {
  const classes = useStyles()
  
  console.log(user)
  return (
    user === undefined || user.userPartnerLicenses === undefined ? <React.Fragment/> :
    <Card
        {...rest}
        className={clsx(classes.root, className)}
        style={{marginTop: '2rem'}}
      >
        <CardHeader classes={{title: classes.header}} title='Partner Licenses' className={classes.header} />
        <Divider />
        <CardContent className={classes.content}>
          <Table size='small'>
            <TableBody>
            <TableRow>
                <TableCell><b>State</b></TableCell>
                <TableCell><b>License Number</b></TableCell>
                <TableCell><b>Primary License</b></TableCell>
                <TableCell><b>Expriation</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell><b>Created</b></TableCell>
            </TableRow>
            {user.userPartnerLicenses.items.length !== 0 ?
            user.userPartnerLicenses.items.map(license => (
              <TableRow key={license.licenseNumber}>
                <TableCell>{license.licenseState}</TableCell>
                <TableCell><Button variant='contained' size='small' color='primary' onClick={() => history.push(`/license/edit/admin/partner/${license.id}`)}>{license.licenseNumber}l</Button></TableCell>
                <TableCell>{license.primaryLicense ? 'Yes' : 'No'}</TableCell>
                <TableCell>{moment(license.licenseExpiration).format('MM/DD/YYYY')}</TableCell>
                <TableCell>{getLicenseStatusStepsObject(license.licenseVerificationStatus)}</TableCell>
                <TableCell>{moment(license.createdAt).format('MM/DD/YYYY')}</TableCell>
              </TableRow>
            )) :
            <TableRow>
              <TableCell>
                No Partner Licenses
              </TableCell>
            </TableRow>}
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
