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
  LinearProgress,
  Button
} from '@mui/material';
import { formatPhoneNumber } from '../../../utils/utilities'

import ModalEditClient from './ModalEditClient'

//ICON IMPRORTS
import EditIcon from '@mui/icons-material/Edit';

//import { useForm, Controller } from "react-hook-form";
// import { Auth, API, graphqlOperation } from 'aws-amplify';
// import { updateReferral } from "../../../graphql/mutations"

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../../store/actions/index';

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


function ReferralClientInformation({ className, dataCollected, setDataCollected, referral, globalUser, userSetUser, ...rest }) {
  const classes = useStyles()
  
  //PROCESS VARIABLES
  const [loading, setLoading] = useState(false)

  const [openEdit, setOpenEdit] = useState(false);

  const handleEditOpen = () => {
    setOpenEdit(true);
  }

  const handleEditClose = () => {
    setOpenEdit(false);
  }

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      {loading ? <LinearProgress/> : <React.Fragment/>}
      <CardHeader classes={{title: classes.header}} title="Client Information" className={classes.header} />
      <Divider />
      <CardContent className={classes.content}>
        <div className={classes.root}>
          <Table size='small'>
            <TableBody>
              <TableRow>
                <TableCell><b>Name</b></TableCell>
                <TableCell>
                  {referral.referralClient !== undefined ?
                    `${referral.referralClient.clientFirstName} ${referral.referralClient.clientLastName}` : ''}
                </TableCell>
              </TableRow>
              <TableRow selected>
                <TableCell><b>Email</b></TableCell>
                <TableCell>{referral.referralClient !== undefined  ? referral.referralClient.clientReferralEmail : ''}
                  {/* (referral.referralStatus === 'accepted' || referral.referralStatus === 'closed' || referral.referralStatus === 'clientLost') ? client.email : 'Accept the Referral to Reveal' : ''} */}
                </TableCell>
              </TableRow>
              <TableRow >
                <TableCell><b>Phone</b></TableCell>
                <TableCell>{referral.referralClient !== undefined ? formatPhoneNumber(referral.referralClient.clientPhone) : ''}
                {/* type === 'partner' && (referral.referralStatus === 'accepted' || referral.referralStatus === 'closed' || referral.referralStatus === 'clientLost') ? formatPhoneNumber(client.customerPhone) : 'Accept the Referral to Reveal' : ''} */}
                </TableCell>
              </TableRow>
              <TableRow >
                <TableCell><b>Comments</b></TableCell>
                <TableCell>{referral.referralComments !== undefined ? referral.referralComments : 'None'}
                {/* type === 'partner' && (referral.referralStatus === 'accepted' || referral.referralStatus === 'closed' || referral.referralStatus === 'clientLost') ? formatPhoneNumber(client.customerPhone) : 'Accept the Referral to Reveal' : ''} */}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardActions className={classes.actions}>
        <div style={{alignSelf: 'center'}}>
          <Button
            startIcon={<EditIcon/>} 
            onClick={handleEditOpen} 
            disabled={referral.referralClientStatus === 'clientLost'}
          >
           
            Edit Client
          </Button>
        </div>
      </CardActions>
      {loading ? <LinearProgress/> : <React.Fragment/>}
      <ModalEditClient
        referral={referral}
        onClose={handleEditClose}
        open={openEdit}
        setLoading={setLoading}
        dataCollected={dataCollected}
        setDataCollected={setDataCollected}
      />
    </Card>
  );
}

ReferralClientInformation.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(ReferralClientInformation);
