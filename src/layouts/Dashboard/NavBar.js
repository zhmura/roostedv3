/* eslint-disable react/no-multi-comp */
import React, { useEffect, useState } from 'react';
import { useLocation, matchPath } from 'react-router';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@mui/styles';
import {
  Drawer,
  Divider,
  Avatar,
  List,
  ListSubheader,
  Typography,
  Hidden,
  colors
} from '@mui/material';
import NavItem from 'src/components/NavItem';
import roostedNavConfig from './roostedNavConfig';
import partnerNavConfig from './partnerNavConfig';
import adminNavConfig from './adminNavConfig';
import newUserNavConfig from './newUserNavConfig';
import combinedNavConfig from './combinedNavConfig';
import { v4 as uuid } from 'uuid'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  mobileDrawer: {
    width: 256,
  },
  desktopDrawer: {
    width: 256,
    top: 64,
    height: 'calc(100% - 64px)'
  },
  navigation: {
    overflow: 'auto',
    padding: theme.spacing(0, 2, 2, 2),
    flexGrow: 1
  },
  profile: {
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center'
  },
  badge: {
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
  },
  badgeDot: {
    height: 9,
    minWidth: 9
  },
  onlineBadge: {
    backgroundColor: colors.green[600]
  },
  awayBadge: {
    backgroundColor: colors.orange[600]
  },
  busyBadge: {
    backgroundColor: colors.red[600]
  },
  offlineBadge: {
    backgroundColor: colors.grey[300]
  },
  avatar: {
    cursor: 'pointer',
    width: 40,
    height: 40
  },
  details: {
    marginLeft: theme.spacing(2)
  },
  moreButton: {
    marginLeft: 'auto',
    color: colors.blueGrey[200]
  }
}));

let thirtyDaysPrior = new Date();
thirtyDaysPrior.setDate(thirtyDaysPrior.getDate() - 30)
console.log(thirtyDaysPrior)

function renderNavItems({
  // eslint-disable-next-line react/prop-types
  items, subheader, key, ...rest
}) {
  return (
    <List key={key}>
      {subheader && <ListSubheader disableSticky>{subheader}</ListSubheader>}
      {/* eslint-disable-next-line react/prop-types */}
      {items.reduce(
        // eslint-disable-next-line no-use-before-define
        (acc, item) => reduceChildRoutes({ acc, item, ...rest }),
        []
      )}
    </List>
  );
}

function reduceChildRoutes({
  acc, pathname, item, depth = 0
}) {
  if (item.items) {
    const open = matchPath(pathname, {
      path: item.href,
      exact: false
    });

    acc.push(
      <NavItem
        depth={depth}
        icon={item.icon}
        key={item.href}
        label={item.label}
        open={Boolean(open)}
        title={item.title}
      >
        {renderNavItems({
          depth: depth + 1,
          pathname,
          items: item.items
        })}
      </NavItem>
    );
  } else {
    acc.push(
      <NavItem
        depth={depth}
        href={item.href}
        icon={item.icon}
        key={item.href}
        label={item.label}
        title={item.title}
      />
    );
  }

  return acc;
}

function NavBar({
  openMobile,
  onMobileClose,
  className,
  userEmail,
  globalUser,
  userSetUser,
  userNavBar,
  ...rest
}) {
  const classes = useStyles();
  const location = useLocation();

  const [navBarOptions, setNavBarOptions] = useState(roostedNavConfig)
  const [newUserRole, setNewUserRole] = useState(true)
  const [roostedRoles, setRoostedRoles] = useState(<React.Fragment/>)
  const [partnerRoles, setPartnerRoles] = useState(<React.Fragment/>)
  const [adminRoles, setAdminRoles] = useState(<React.Fragment/>)

  useEffect(() => {
    if (openMobile && onMobileClose) {
      onMobileClose();
    }

    // eslint-disable-next-line
  }, [location.pathname]);

  useEffect(() => {
    if(userNavBar === 'setup') {
      setNavBarOptions(newUserNavConfig)
    } else if(userNavBar === 'roosted' && (globalUser?.userRoostedLicenses.items.length > 0 && globalUser?.userPartnerLicenses.items.length === 0)){
      setNavBarOptions(roostedNavConfig)
    // } else if((userNavBar === 'partner' && (globalUser?.userRoostedLicenses?.items.length === 0 && globalUser?.userPartnerLicenses?.items.length > 0)) || (userNavBar === 'addedAgent' && (globalUser?.userRoostedLicenses.items.length === 0 && globalUser?.userPartnerLicenses.items.length > 0))) {
    } else if((userNavBar === 'partner')) {
      setNavBarOptions(partnerNavConfig)
    } else if(userNavBar === 'admin') {
      setNavBarOptions(adminNavConfig)
    } else if(globalUser?.userRoostedLicenses?.items.length > 0 && globalUser?.userPartnerLicenses?.items.length > 0) {
      setNavBarOptions(combinedNavConfig)
    } else {
      setNavBarOptions(newUserNavConfig)
    }

    //find all the agents roles
    const getAgentRoles = () => {
      if(globalUser?.userRoostedLicenses?.items.length > 0 && globalUser?.setupStatus === 'completed') {
        setRoostedRoles(globalUser?.userRoostedLicenses?.items.map(license => {
          if(license.licenseVerificationStatus === 'verified') {
            return <Typography variant="body2" key={uuid()}>{`${license.licenseState} Roosted Agent`}</Typography>
          } else {
            return <React.Fragment key={uuid()}/>
          }
        }))
        setNewUserRole(false)
      }
      if(globalUser?.userPartnerLicenses?.items.length > 0 && globalUser?.setupStatus === 'completed') {
        setPartnerRoles(globalUser?.userPartnerLicenses?.items.map(license => {
          if(license.licenseVerificationStatus === 'verified') {
            return <Typography variant="body2" key={uuid()}>{`${license.licenseState} Partner Agent`}</Typography>
          }
          else {
            return <React.Fragment key={uuid()}/>
          }
        }))
        setNewUserRole(false)
      }

      if(userNavBar === 'admin' && globalUser?.userType === 'admin') {
        setAdminRoles(<Typography variant="body2" key={uuid()}>{`Roosted Admin`}</Typography>)
        setNewUserRole(false)
      } else if(userNavBar === 'admin' && globalUser?.userType === 'broker') {
        setAdminRoles(<Typography variant="body2" key={uuid()}>{`Roosted Broker`}</Typography>)
        setNewUserRole(false)
      }

    }

    //only run this if there is a global user assigned
    if(!(Object.entries(globalUser).length === 0 && globalUser?.constructor === Object)) {
      getAgentRoles()
    }

    // eslint-disable-next-line
  }, [globalUser]);

  const content = (
    <div
      {...rest}
      className={clsx(classes.root, className)}
    >
      <nav className={classes.navigation}>
        {navBarOptions.map((list) => renderNavItems({
          items: list.items,
          subheader: list.subheader,
          pathname: location.pathname,
          key: list.subheader
        }))}
      </nav>
      <Divider className={classes.divider} />
      <div className={classes.profile}>
        <Avatar
          alt="Person"
          className={classes.avatar}
          src='/images/logos/owlie_transparent.png'
        />
        <div className={classes.details}>
          <Typography
            variant="h6"
            color="textPrimary"
          >
            {/* {globalUser?.userFirstName === null ? globalUser?.email : `${globalUser?.userFirstName} ${globalUser?.userLastName}`} */}
            {globalUser?.username === null ? globalUser?.email : `${globalUser?.username} ${globalUser?.userLastName}`}
          </Typography>
          
          {newUserRole ?
            <Typography variant="body2">New User</Typography> :
            <>
            {roostedRoles}
            {partnerRoles}
            {adminRoles}
            </>
          }
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Hidden lgUp>
        <Drawer
          anchor="left"
          classes={{
            paper: classes.mobileDrawer
          }}
          onClose={onMobileClose}
          open={openMobile}
          variant="temporary"
        >
          {content}
        </Drawer>
      </Hidden>
      <Hidden mdDown>
        <Drawer
          anchor="left"
          classes={{
            paper: classes.desktopDrawer
          }}
          open
          variant="persistent"
        >
          {content}
        </Drawer>
      </Hidden>
    </>
  );
}

NavBar.propTypes = {
  className: PropTypes.string,
  onMobileClose: PropTypes.func,
  openMobile: PropTypes.bool
};

const mapStateToProps = state => {
  return {
      globalUser: state.user.userGlobal,
      userNavBar: state.user.userNavBar,
  };
};

const mapDispatchToProps = dispatch => {
  return {
      userSetUser: (user) => dispatch(actions.userSetUser(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
