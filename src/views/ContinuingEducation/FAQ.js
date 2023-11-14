import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { v4 as uuid }  from 'uuid';
import { makeStyles } from '@mui/styles';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent
} from '@mui/material';
import ContactSupportIcon from '@mui/icons-material/ContactSupportOutlined';
import { isMobile } from 'react-device-detect'

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(6),
    height: '100vh'
  },
  list: {
    marginTop: theme.spacing(6)
  }
}));

const faqs = [
  {
    title: 'What is Roosted\'s standard referral commission',
    description:
      'If we select the agent agent for your client we have a standard referral commission of 35%. If you select the agent, you can offer any referral commission you want.'
  },
  {
    title:
      'How do I track the status of a referral?',
    description:
      'If you receive a referral from Roosted be sure to update the status as the purchase or sale of a home progresses. That will feed email updates to the agent that made the referral and update their dashboard.'
  },
  {
    title: 'What is a Partner Agent and what is a Roosted Agent?',
    description:
      'A Roosted agent is someone that hangs their license with Roosted. We are a referral only brokerage, so you can only refer people while hanging your license with us. Partner agents are those agents that sign up and provide information about the size of home and location they like to work. We then send referrals to them when a Roosted agent makes a referral and decides not to send it to someone they know.'
  }
];

function FAQ({ className, ...rest }) {
  const classes = useStyles();

  return (
    <div
      {...rest}
      className={clsx(classes.root, className)}
    >
      <Container width='100vw' align='center'>
        <Card
          style={{
            maxWidth: '100%',
            overflow: 'visible',
            display: 'flex',
            position: 'relative',
            width: isMobile ? '100%' : '80%'
          }}>
          <CardContent>
            <Typography
              align="center"
              variant="h3"
            >
              FAQs
            </Typography>
            <List
              disablePadding
              className={classes.list}
            >
              {faqs.map((faq) => (
                <ListItem
                  disableGutters
                  key={uuid()}
                >
                  <ListItemIcon>
                    <ContactSupportIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={faq.title}
                    primaryTypographyProps={{ variant: 'h5' }}
                    secondary={faq.description}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}

FAQ.propTypes = {
  className: PropTypes.string
};

export default FAQ;
