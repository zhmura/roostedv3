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
} from '@mui/material';
import { numberWithCommas } from '../../../utils/utilities'
import moment from 'moment'

import ModalEditReferralPayout from './ModalEditReferralFinancials'

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


function ReferralPayout({ className, dataCollected, setDataCollected, referral, globalUser, userSetUser, ...rest }) {
  const classes = useStyles()
  
  //PROCESS VARIABLES
  // const [loading, setLoading] = useState(false)

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
 <CardHeader classes={{title: classes.header}} title='Contract Status' className={classes.header} />
        <Divider />
        <CardContent className={classes.content}>
          <Table size='small'>
            <TableBody>
            <TableRow>
                <TableCell><b>Commission</b></TableCell>
                <TableCell>
                  {referral.referralCommission !== undefined ? `${(referral.referralCommission*100)}%` : ''}
                </TableCell>
              </TableRow>
              <TableRow selected>
                <TableCell><b>Referral Fee Requested</b></TableCell>
                <TableCell>
                  {referral.referralFeeOffered !== undefined ? `${referral.referralFeeOffered}%` : ''}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Closing Date</b></TableCell>
                <TableCell>
                  {referral.referralCloseDate !== undefined || referral.referralCloseDate !== null ? 
                  (referral.referralClientStatus !== 'underContract' && referral.referralClientStatus !== 'closed') ? 'Not Under Contract Yet' : 
                  referral.referralCloseDate === null || referral.referralCloseDate === undefined ? 'No Contract Data Entered' : 
                  moment(referral.referralCloseDate).format('MM/DD/YYYY') : 'No Contract Data Entered' }
                </TableCell>
              </TableRow>
              <TableRow selected>
                <TableCell><b>Price in Contract</b></TableCell>
                <TableCell>{referral.referralClientStatus !== undefined ? referral.referralClientStatus !== 'underContract' && referral.referralClientStatus !== 'closed' ? 'Not Under Contract Yet' : referral.referralContractValue === null || referral.referralContractValue === undefined || referral.referralContractValue === 0 ? 'No Contract Data Entered' : `$${numberWithCommas(referral.referralContractValue)}` : ''}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Roosted Company Potential Earnings based on Price Range<sup>*</sup></b></TableCell>
                <TableCell>{referral !== undefined ? 
                    referral.referralEstimatedPriceRange === 'Unknown' ? 
                    'Unknown' : referral.referralRoostedPayoutFormatted : 'Unknown'}</TableCell> 
              </TableRow>
              <TableRow selected>
              <TableCell><b>Roosted Company Earnings Based on Actual Contract Value<sup>*</sup></b></TableCell>
              <TableCell>{referral !== undefined ? 
                  (referral.referralClientStatus !== 'underContract' && referral.referralClientStatus !== 'closed') ? 'Not Under Contract Yet' :
                  (referral.referralRoostedPayoutActual=== null || referral.referralRoostedPayoutActual === undefined || referral.referralRoostedPayoutActual === 0) ? 'No Contract Data Entered' : `$${numberWithCommas(referral.referralRoostedPayoutActual)}` : '' }</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Roosted Agent Potential Earnings based on Price Range<sup>*</sup></b></TableCell>
                <TableCell>{referral !== undefined ? 
                    referral.referralEstimatedPriceRange === 'Unknown' ? 
                    'Unknown' : referral.referralRoostedAgentPayoutFormatted : 'Unknown'}</TableCell> 
              </TableRow>
              <TableRow selected>
              <TableCell><b>Roosted Agent Earnings Based on Actual Contract Value<sup>*</sup></b></TableCell>
                <TableCell>{referral !== undefined ? 
                  (referral.referralClientStatus !== 'underContract' && referral.referralClientStatus !== 'closed') ? 'Not Under Contract Yet' :
                  (referral.referralRoostedAgentPayoutActual=== null || referral.referralRoostedAgentPayoutActual === undefined || referral.referralRoostedAgentPayoutActual === 0) ? 'No Contract Data Entered' : `$${numberWithCommas(referral.referralRoostedAgentPayoutActual)}` : '' }</TableCell>
            </TableRow>
              <TableRow>
                <TableCell><b>Partner Potential Earnings based on Price Range<sup>*</sup></b></TableCell>
                <TableCell>{referral !== undefined ? 
                    referral.referralEstimatedPriceRange === 'Unknown' ? 
                    'Unknown' : referral.referralPartnerPayoutFormatted : 'Unknown'}</TableCell> 
              </TableRow>
              <TableRow selected>
              <TableCell><b>Partner Earnings Based on Actual Contract Value<sup>*</sup></b></TableCell>
                <TableCell>{referral !== undefined ? 
                  (referral.referralClientStatus !== 'underContract' && referral.referralClientStatus !== 'closed') ? 'Not Under Contract Yet' :
                  (referral.referralPartnerPayoutActual=== null || referral.referralPartnerPayoutActual === undefined || referral.referralPartnerPayoutActual === 0) ? 'No Contract Data Entered' : `$${numberWithCommas(referral.referralPartnerPayoutActual)}` : '' }</TableCell>
            </TableRow>
            </TableBody>
          </Table>
        </CardContent>
        <CardActions className={classes.actions}>
        <div style={{alignSelf: 'center'}}>
          <Button startIcon={<EditIcon/>} onClick={() => handleEditOpen()}>
            Edit Contract Details
          </Button>

        </div>
        </CardActions>
        <ModalEditReferralPayout
        referral={referral}
        onClose={handleEditClose}
        open={openEdit}
        dataCollected={dataCollected}
        setDataCollected={setDataCollected}

      />
      </Card> 
  );
}

ReferralPayout.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(ReferralPayout);
