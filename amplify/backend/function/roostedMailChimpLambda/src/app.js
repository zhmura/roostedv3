/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/




var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const Mailchimp = require('mailchimp-api-v3')

const mailchimp = new Mailchimp(process.env.MAILCHIMP_KEY)

const md5 = require('md5');

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});


app.post('/mailchimp/execute-update', async (req, res) => {

  const action = req.body.action
  const email = req.body.emailData['EMAIL']

  try {

    if(action === 'addToAbandonCart') {
      await mailchimp.post('/lists/eb9725515c/members', 
      {email_address: email, 
      status: 'subscribed', 
      merge_fields: {
      FNAME: req.body.emailData['FNAME'],
      LNAME: req.body.emailData['LNAME'],
      PHONE: req.body.emailData['PHONE'],
      BROKER: 'Roosted',
      STATE: req.body.emailData['STATE'],
      PARTNER: 'FALSE',
      LASTACTION: 'ABANDON CART',
      LASTDATE: new Date(),
      ABANDONED: 'TRUE'
      }})
      res.status(200).json({messageSuccess: true})
    } else if(action === 'partnerCompletedSignUp') {
      await mailchimp.post('/lists/eb9725515c/members', 
      {email_address: email, 
      status: 'subscribed', 
      merge_fields: {
      FNAME: req.body.emailData['FNAME'],
      LNAME: req.body.emailData['LNAME'],
      PHONE: req.body.emailData['PHONE'],
      BROKER: req.body.emailData['BROKER'],
      STATE: req.body.emailData['STATE'],
      PARTNER: 'TRUE',
      EXPIRATION: req.body.emailData['EXPIRATION'],
      LASTDATE: new Date(),
      ABANDONED: 'FALSE'
      }})
      res.status(200).json({messageSuccess: true})
    } else if(action === 'paymentCompleted') {
      await mailchimp.put('/lists/eb9725515c/members/' + md5(email), 
      {
      status: 'subscribed', 
      merge_fields: {
        LASTACTION: 'SIGNED UP',
        LASTDATE: new Date(),
        ABANDONED: 'FALSE',
        AGREEMENT: 'WAITING ON POLICIES'
      }});
      res.status(200).json({messageSuccess: true})
    } else if(action === 'policiesSigned') {
      await mailchimp.put('/lists/eb9725515c/members/' + md5(email), 
      {
      status: 'subscribed', 
      merge_fields: {        
        LASTACTION: 'SIGNED POLICIES',
        LASTDATE: new Date(),
        AGREEMENT: 'WAITING ON ICA'
      }});
      res.status(200).json({messageSuccess: true})
    } else if(action === 'ICASigned') {
      await mailchimp.put('/lists/eb9725515c/members/' + md5(email), 
      {
      status: 'subscribed', 
      merge_fields: {
        LASTACTION: 'SIGNED ICA',
        LASTDATE: new Date(),
        AGREEMENT: 'WAITING ON TRANSFER'
      }});
      res.status(200).json({messageSuccess: true})
    } else if(action === 'transferredLicense') {
      await mailchimp.put('/lists/eb9725515c/members/' + md5(email), 
      {
      status: 'subscribed', 
      merge_fields: {
        LASTACTION: 'TRANSFERRED',
        LASTDATE: new Date(),
        AGREEMENT: 'COMPLETED'
      }});
      res.status(200).json({messageSuccess: true})
    } else if(action === 'changedExpirationDate') {
      await mailchimp.put('/lists/eb9725515c/members/' + md5(email), 
      {
      status: 'subscribed', 
      merge_fields: {
          EXPIRATION: req.body.emailData['EXPIRATION'],
      }})
      res.status(200).json({messageSuccess: true})
    } else if(action === 'deleted') {
      await mailchimp.put('/lists/eb9725515c/members/' + md5(email), 
      {
        status: 'unsubscribed', 
      })
      res.status(200).json({messageSuccess: true})
    }
    else if(action === 'severed') {
      await mailchimp.put('/lists/eb9725515c/members/' + md5(email), 
      {
      status: 'unsubscribed', 
      merge_fields: {
        LASTACTION: 'SEVERED',
        LASTDATE: new Date(),
      }});
      res.status(200).json({messageSuccess: true})
    }
  } catch(error) {
    res.status(404).json({messageSuccess: false, error: error})
    console.log(error);
  }
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
