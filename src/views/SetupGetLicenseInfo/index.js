import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Container } from '@mui/material';
import Page from 'src/components/Page';
import Header from './Header';
import GetLicenseInfoForm from './GetLicenseInfo';

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
  getLicenseInfo: {
    marginTop: theme.spacing(3)
  },
}));

function GetLicenseInfo(props) {
  const classes = useStyles();

  //SNACKBAR State Variables
  const [open, setOpen] = useState(false)
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
      title="License Info"
    >
      <Container maxWidth="lg">
        <Header />
        <Snackbar open={open} onClose={handleClose} anchorOrigin={{vertical: 'top', horizontal: 'center' }}>
          <AlertFunk onClose={handleClose} severity="error">
            {errorMessage}
          </AlertFunk>
        </Snackbar>
        <GetLicenseInfoForm 
          className={classes.getLicenseInfo}
          setErrorMessage={setErrorMessage}
          setOpen={setOpen}
          history={props.history} />
      </Container>
    </Page>
  );
}

export default GetLicenseInfo;
