import React, { useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import Page from 'src/components/Page';
import Header from './Header';
import FAQ from './FAQ';

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

const useStyles = makeStyles((theme) => ({
  root: {
  }
}));

function Home(props) {
  const classes = useStyles();

  useEffect(() => {
    if(!(Object.entries(props.globalUser).length === 0 && props.globalUser.constructor === Object)) {
      if(props.globalUser.setupStatus === 'selectType') {
        props.history.push('/setup/select-type')
      }else if(props.globalUser.setupStatus === 'getLicenseInfo') {
        props.history.push('/setup/get-license-info')
      } else if(props.globalUser.setupStatus === 'getPartnerInfo') {
        props.history.push('/setup/get-partner-info')
      } else if(props.globalUser.setupStatus === 'getPaymentInfo') {
        props.history.push('/setup/get-payment-info')
      } else if(props.globalUser.setupStatus === 'signPolicies') {
        props.history.push('/setup/sign-policies')
      } else if(props.globalUser.setupStatus === 'signICA') {
        props.history.push('/setup/sign-ica')
      } else if(props.globalUser.setupStatus === 'transferLicense' || props.globalUser.setupStatus === 'waitingOnRoosted') {
        props.history.push('/setup/transfer-license')
      }
    }
  // eslint-disable-next-line
  },[])

  return (
    <Page
      className={classes.root}
      title="Home"
    >
      <Header />
      <FAQ />
    </Page>
  );
}

const mapStateToProps = state => {
  return {
      globalUser: state.user.userGlobal,
  };
};

const mapDispatchToProps = dispatch => {
  return {
      userSetUser: (user) => dispatch(actions.userSetUser(user)),
      userSetNavBar: (userType) => dispatch(actions.userSetNavBar(userType))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
