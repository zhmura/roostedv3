import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function AlertDialog(props) {

  return (
    <div>
      <Dialog
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Warning!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {props.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {props.primaryLicense ?
          <React.Fragment/> :
          <Button onClick={props.handleClose} color="primary">
            Cancel
          </Button> }
          {props.primaryLicense ?
          <Button onClick={props.handleClose} color="primary">
            Ok
          </Button> :
          <Button onClick={() => props.handleConfirmDelete(props.licenseId)} color="primary" autoFocus>
            Yes, Delete It!
          </Button> }
        </DialogActions>
      </Dialog>
    </div>
  );
}