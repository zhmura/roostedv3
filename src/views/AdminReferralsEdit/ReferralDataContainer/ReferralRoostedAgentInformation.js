import React from 'react';
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

//import ModalEditRoostedAgent from './ModalEditRoostedAgent'

//import { useForm, Controller } from "react-hook-form";
// import { Auth, API, graphqlOperation } from 'aws-amplify';
// import { updateReferral } from "../../../graphql/mutations"

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../../store/actions/index';

//ICON IMPRORTS
import EditIcon from '@mui/icons-material/Edit';

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


function ReferralRoostedAgentInformation({ className, dataCollected, setDataCollected, referral, globalUser, userSetUser, ...rest }) {
  const classes = useStyles()
  
  //PROCESS VARIABLES
  // const [loading, setLoading] = useState(false)

  // const [openEdit, setOpenEdit] = useState(false);

  // const handleEditOpen = () => {
  //   setOpenEdit(true);
  // }

  // const handleEditClose = () => {
  //   setOpenEdit(false);
  // }

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      {dataCollected.loading ? <LinearProgress/> : <React.Fragment/>}
      <CardHeader classes={{title: classes.header}} title="Roosted Agent Information" className={classes.header} />
      <Divider />
      <CardContent className={classes.content}>
        <div className={classes.root}>
          <Table size='small'>
            <TableBody>
              <TableRow>
                <TableCell><b>Name</b></TableCell>
                <TableCell>
                  {referral.referralRoostedAgent !== undefined  && referral.referralRoostedAgent !== null ?
                    `${referral.referralRoostedAgent.userFirstName} ${referral.referralRoostedAgent.userLastName} / ${referral.referralRoostedAgent.roostedAgent.stripeProductName.toUpperCase()} - ${referral.referralRoostedAgent.roostedAgent.stripeProductPeriod.toUpperCase()} ${referral.referralRoostedAgent.roostedAgent.stripePromoId === null ? '' : ` / ${referral.referralRoostedAgent.roostedAgent.stripePromoId.toUpperCase()}`}` : ''}
                </TableCell>
              </TableRow>
              <TableRow selected>
                <TableCell><b>Email</b></TableCell>
                <TableCell>{referral.referralRoostedAgent !== undefined  && referral.referralRoostedAgent !== null ? referral.referralRoostedAgent.email : ''}
                  {/* (referral.referralStatus === 'accepted' || referral.referralStatus === 'closed' || referral.referralStatus === 'clientLost') ? client.email : 'Accept the Referral to Reveal' : ''} */}
                </TableCell>
              </TableRow>
              <TableRow >
                <TableCell><b>Phone</b></TableCell>
                <TableCell>{referral.referralRoostedAgent !== undefined  && referral.referralRoostedAgent !== null ? formatPhoneNumber(referral.referralRoostedAgent.userPhone) : ''}
                {/* type === 'partner' && (referral.referralStatus === 'accepted' || referral.referralStatus === 'closed' || referral.referralStatus === 'clientLost') ? formatPhoneNumber(client.customerPhone) : 'Accept the Referral to Reveal' : ''} */}
                </TableCell>
              </TableRow>
              <TableRow selected >
                <TableCell><b>Plan On Creation</b></TableCell>
                <TableCell>{referral.referralRoostedAgent !== undefined  && referral.referralRoostedAgent !== null ? `${referral.referralRoostedPlanOnCreation.toUpperCase()} / ${referral.referralRoostedPlanPeriodOnCreation.toUpperCase()}` : ''}
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
            
            disabled={true}
          >
            Edit Roosted Agent
          </Button>
        </div>
      </CardActions>
      {/* {dataCollected.loading ? <LinearProgress/> : <React.Fragment/>}
      {dataCollected.loading ? <React.Fragment/> : <ModalEditRoostedAgent
        referral={referral}
        onClose={handleEditClose}
        open={openEdit}
        dataCollected={dataCollected}
        setDataCollected={setDataCollected}
      />} */}
    </Card>
  );
}

ReferralRoostedAgentInformation.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(ReferralRoostedAgentInformation);
