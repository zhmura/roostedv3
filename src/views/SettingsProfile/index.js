import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Container } from '@mui/material';
import Page from 'src/components/Page';
import Header from './Header';
import GetUserInfoForm from './GetUserInfo';

//IMPORT ALERT
import { Alert } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

const AlertFunk = React.forwardRef((props, ref) => (
  <Alert elevation={6} variant="filled" ref={ref} {...props} />
));

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  },
  getInfo: {
    marginTop: theme.spacing(3)
  },
}));

function GetUserInfo(props) {
  const classes = useStyles();

  //SNACKBAR State Variables
  const [open, setOpen] = useState(false)
  const [severity, setSeverity] = useState('error')
  const [errorMessage, setErrorMessage] = useState('Unknown Error')

  //SNACKBAR close method
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };
  return (
    <Page
      className={classes.root}
      title="Account Settings"
    >
      <Container maxWidth="lg">
        <Header />
        <Snackbar open={open} onClose={handleClose} anchorOrigin={{vertical: 'top', horizontal: 'center' }}>
          <AlertFunk onClose={handleClose} severity={severity}>
            {errorMessage}
          </AlertFunk>
        </Snackbar>
        <GetUserInfoForm 
          className={classes.getInfo}
          setErrorMessage={setErrorMessage}
          setOpen={setOpen}
          setSeverity={setSeverity}
          history={props.history} />
      </Container>
    </Page>
  );
}

export default GetUserInfo;
