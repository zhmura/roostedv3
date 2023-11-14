import React from 'react';
import { makeStyles } from '@mui/styles';
import Page from 'src/components/Page';
import Header from './Header';
// import FAQ from './FAQ';
import { Alert } from '@mui/material';

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

const useStyles = makeStyles((theme) => ({
  root: {
  },
  alert: {
    marginTop: theme.spacing(3),
  },
}));

function Home(props) {
  const classes = useStyles();

  return (
    <Page
      className={classes.root}
      title="Continuing Education"
    >
      <Alert
        severity='info'
        className={classes.alert}>
        You get discounts through the CE Shop for being part of Roosted!
      </Alert>
      <Header />
      {/* <FAQ /> */}
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
