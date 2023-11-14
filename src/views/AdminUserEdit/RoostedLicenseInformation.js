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
    backgroundColor: '#0F3164',
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
    user === undefined || user.userRoostedLicenses === undefined ? <React.Fragment/> :
    <Card
        {...rest}
        className={clsx(classes.root, className)}
        style={{marginTop: '2rem'}}
      >
        <CardHeader classes={{title: classes.header}} title={user.userRoostedLicenses.items.length !== 0 && user.roostedAgent !== undefined && user.roostedAgent.stripeProductName !== undefined ? `Roosted Licenses - ${user.roostedAgent.stripeProductName.toUpperCase()} / ${user.roostedAgent.stripeProductPeriod.toUpperCase()} ${user.roostedAgent.stripePromoId !== null && user.roostedAgent.stripePromoId !== undefined && user.roostedAgent.stripePromoId !== '' ? ` / ${user.roostedAgent.stripePromoId.toUpperCase()}` : ''}` : 'Roosted Licenses'} className={classes.header} />
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
            {user.userRoostedLicenses.items.length !== 0 ?
            user.userRoostedLicenses.items.map(license => (
              <TableRow key={license.licenseNumber}>
                <TableCell>{license.licenseState}</TableCell>
                <TableCell><Button variant='contained' size='small' color='primary' onClick={() => history.push(`/license/edit/admin/roosted/${license.id}`)}>{license.licenseNumber}l</Button></TableCell>
                <TableCell>{license.primaryLicense ? 'Yes' : 'No'}</TableCell>
                <TableCell>{moment(license.licenseExpiration).format('MM/DD/YYYY')}</TableCell>
                <TableCell>{getLicenseStatusStepsObject(license.licenseVerificationStatus)}</TableCell>
                <TableCell>{moment(license.createdAt).format('MM/DD/YYYY')}</TableCell>
              </TableRow>
            )) :
            <TableRow>
              <TableCell>
                No Roosted Licenses or Plans
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
