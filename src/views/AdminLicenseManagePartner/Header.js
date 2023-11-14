import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { Grid, Typography} from '@mui/material';

const useStyles = makeStyles(() => ({
  root: {}
}));

function Header({ className, history, globalUser, ...rest }) {
  const classes = useStyles();

  return (
    <div
      {...rest}
      className={clsx(classes.root, className)}
    >
      <Grid
        alignItems="flex-end"
        container
        justify="space-between"
        spacing={3}
      >
        <Grid item>
          <Typography
            component="h2"
            gutterBottom
            variant="overline"
          >
            Admin
          </Typography>
          <Typography
            component="h1"
            variant="h3"
          >
            Manage Partner Licenses
          </Typography>
        </Grid>
        {/* <Grid item>
          <Button
            color="primary"
            variant="contained"
            endIcon={<AddCircleIcon/>}
            onClick={() => {
              if(globalUser.roostedAgent !== null && globalUser.roostedAgent !== undefined) {
                history.push('/license/create?type=roosted')
              } else {
                history.push('/license/create?type=partnerRoosted')
              }
            }}>
            Add a License
          </Button>
        </Grid> */}
      </Grid>
    </div>
  );
}

Header.propTypes = {
  className: PropTypes.string
};

export default Header;
