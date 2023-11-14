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
            Warning this is permanent. We will not be able to retreive your account again. All information and payments associated with it will be removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleClose} color="primary">
            Cancel
          </Button> 
          <Button onClick={() => props.handleDelete()} color="primary" autoFocus>
            Yes, Delete It!
          </Button> 
        </DialogActions>
      </Dialog>
    </div>
  );
}