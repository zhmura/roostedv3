import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Button,
  colors,
} from '@mui/material';

import ModalEditReferralDataSeller from './ModalEditReferralDataSeller'
import ModalEditReferralDataBuyer from './ModalEditReferralDataBuyer'

import Label from '../../../components/Label'

//ICON IMPRORTS
import EditIcon from '@mui/icons-material/Edit';

//import { useForm, Controller } from "react-hook-form";
// import { Auth, API, graphqlOperation } from 'aws-amplify';
// import { updateReferral } from "../../../graphql/mutations"

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../../store/actions/index';

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


function ReferralData({ className, dataCollected, setDataCollected, referral, globalUser, userSetUser, ...rest }) {
  const classes = useStyles()
  
  //PROCESS VARIABLES
  // const [loading, setLoading] = useState(false)

  const [openEditBuyer, setOpenEditBuyer] = useState(false);

  const [openEditSeller, setOpenEditSeller] = useState(false);

  const handleEditOpen = (type) => {
    if(type === 'buyerReferral') {
      setOpenEditBuyer(true);
    } 
    if(type === 'sellerReferral') {
      setOpenEditSeller(true)
    }
  }

  const handleEditClose = () => {
    setOpenEditBuyer(false);
    setOpenEditSeller(false)
  }

  return (
    referral === undefined ? <React.Fragment/> : referral.referralType === 'buyerReferral' ?
    <Card
        {...rest}
        className={clsx(classes.root, className)}
      >
        <CardHeader classes={{title: classes.header}} title='Referral Data' className={classes.header} />
        <Divider />
        <CardContent className={classes.content}>
          <Table size='small'>
            <TableBody>
            <TableRow>
                <TableCell><b>Referral State</b></TableCell>
                <TableCell>
                  {referral !== undefined ? referral.referralState : ''}
                </TableCell>
              </TableRow>
              <TableRow selected>
                <TableCell><b>Zip Code Searching</b></TableCell>
                <TableCell>
                  {referral !== undefined ? referral.referralAddress.zip : ''}
                </TableCell>
              </TableRow>
              <TableRow >
                <TableCell><b>Estimated Price Range</b></TableCell>
                <TableCell>{referral !== undefined ? referral.referralEstimatedPriceRange : ''}</TableCell>
              </TableRow>
              <TableRow selected>
              <TableCell><b>Estimated Time Frame</b></TableCell>
              <TableCell>{referral !== undefined ? referral.referralTimeFrame : ''}</TableCell>
            </TableRow>
            <TableRow >
              <TableCell><b>Prequalified</b></TableCell>
              <TableCell>
                {referral.referralPrequalified === true ? <Label color={colors.green[500]}>YES</Label> : 
                referral.referralPrequalified === false ? <Label color={colors.red[500]}>NO</Label> : 
                <Label color={colors.blue[500]}>Unknown</Label> }
              </TableCell>
            </TableRow>
            <TableRow selected>
              <TableCell><b>Referral Created</b></TableCell>
              <TableCell>
                {referral !== undefined ? moment(new Date(referral.createdAt)).format('MM/DD/YYYY') : ''}
              </TableCell>
            </TableRow>
            </TableBody>
          </Table>
        </CardContent>
        <CardActions className={classes.actions}>
        <div style={{alignSelf: 'center'}}>
          <Button startIcon={<EditIcon/>} onClick={() => handleEditOpen(referral.referralType)}>
            Edit Referral Details
          </Button>
        </div>
        </CardActions>
        <ModalEditReferralDataBuyer
        referral={referral}
        onClose={handleEditClose}
        open={openEditBuyer}
        dataCollected={dataCollected}
        setDataCollected={setDataCollected}

      />
      </Card> :
      referral.referralType === 'sellerReferral' ?
      <Card
      {...rest}
      className={clsx(classes.root, className)}
      >
      <CardHeader classes={{title: classes.header}} title='Referral Data' className={classes.header} />
      <Divider />
      <Divider />
      <CardContent className={classes.content}>
        <Table size='small'>
          <TableBody>
          <TableRow>
              <TableCell><b>Referral State</b></TableCell>
              <TableCell>
                {referral !== undefined ? referral.referralState : ''}
              </TableCell>
            </TableRow>
            <TableRow selected>
              <TableCell><b>Street</b></TableCell>
              <TableCell>
                {referral !== undefined ? `${referral.referralAddress.street} ${referral.referralAddress.unit === null || referral.referralAddress.unit === undefined ? '' : referral.referralAddress.unit}` : ''}
              </TableCell>
            </TableRow>
            <TableRow >
              <TableCell><b>City, State Zip</b></TableCell>
              <TableCell>
              {referral !== undefined ? `${referral.referralAddress.city}, ${referral.referralAddress.state} ${referral.referralAddress.zip}` : ''}
              </TableCell>
            </TableRow>
            <TableRow selected>
              <TableCell><b>Estimated Price Range</b></TableCell>
              <TableCell>{referral !== undefined ? referral.referralEstimatedPriceRange : ''}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><b>Estimated Time Frame</b></TableCell>
              <TableCell>{referral !== undefined ? referral.referralTimeFrame : ''}</TableCell>
            </TableRow>
            <TableRow selected>
              <TableCell><b>Referral Created</b></TableCell>
              <TableCell>
                {referral !== undefined ? moment(new Date(referral.createdAt)).format('MM/DD/YYYY') : ''}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
      <CardActions className={classes.actions}>
        <div style={{alignSelf: 'center'}}>
          <Button startIcon={<EditIcon/>} onClick={() => handleEditOpen(referral.referralType)}>
          Edit Referral Details
        </Button>
        </div>
      </CardActions>
      <ModalEditReferralDataSeller
        referral={referral}
        onClose={handleEditClose}
        open={openEditSeller}
        dataCollected={dataCollected}
        setDataCollected={setDataCollected}
      />
    </Card> : <React.Fragment/>
  );
}

ReferralData.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(ReferralData);
