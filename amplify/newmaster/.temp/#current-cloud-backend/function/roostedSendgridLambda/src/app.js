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

//USE THIS FOR SEND GRID INTEGRATION
const sgMail = require('@sendgrid/mail');

//SET SEND GRID API KEY
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

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


app.post('/sendgrid/send-email', async (req, res) => {


  //Email to/from data and template
  const toEmail = req.body.emailData['toEmail']
  const toFullName = req.body.emailData['toFullName']
  const fromEmail = req.body.emailData['fromEmail']
  const templateId = req.body.emailData['templateId']

  console.log(toEmail)
  console.log(fromEmail)
  console.log(toFullName)
  console.log(templateId)

  try {

    const sendEmail = await sgMail.send({
      "personalizations": [
        {
          "to": [
            {
              "email": toEmail,
              "name": toFullName
            }
          ],
          "dynamic_template_data": {
            "roostedAgentFirstName": req.body.emailData['roostedAgentFirstName'],
            "roostedAgentLastName": req.body.emailData['roostedAgentLastName'],
            "partnerAgentFirstName": req.body.emailData['partnerAgentFirstName'],
            "partnerAgentLastName": req.body.emailData['partnerAgentLastName'],
            "partnerAgentPhone": req.body.emailData['partnerAgentPhone'],
            "partnerAgentEmail": req.body.emailData['partnerAgentEmail'],
            "partnerAgentBroker": req.body.emailData['partnerAgentBroker'],
            "referralLink": req.body.emailData['referralLink'],
            "password": req.body.emailData['password'],
            "plan": req.body.emailData['plan'],
            "customerFirstName": req.body.emailData['clientFirstName'],
            "customerLastName": req.body.emailData['clientLastName'],
            "type": req.body.emailData['type'],
            "brokerStateEmail": req.body.emailData['brokerStateEmail'],
            "comments": req.body.emailData['comments'],
            "agentFirstName": req.body.emailData['agentFirstName'], //d-09e4ee61a17a4360a6372757987918ef comments edited
            "referralType": req.body.emailData['referralType'], //d-22cdedd6de364b81a081ca2a9cd37129 removed from referral
            "status": req.body.emailData['status'],
            "agreementLink": req.body.emailData['agreementLink'],
            "state": req.body.emailData['state'],
            "zip": req.body.emailData['zip'],
            "priceRange": req.body.emailData['priceRange'],
            "transactionState": req.body.emailData['transactionState'],
            "promoCode": req.body.emailData['promoCode'],
            "roostedAgentPhone": req.body.emailData['roostedAgentPhone'],
            "roostedAgentEmail": req.body.emailData['roostedAgentEmail'],
            "licenseNumber": req.body.emailData['licenseNumber'],
            "licenseExpiration": req.body.emailData['licenseExpiration'],
            "roostedAgentAddress": req.body.emailData['roostedAgentAddress'],
            "roostedAgentPayoutActual": req.body.emailData['roostedAgentPayoutActual'],
            "brokerFirstName": req.body.emailData['brokerFirstName']
          },
        }
      ],
      "from": {
        "email": fromEmail,
        "name": "Roosted"
      },
      "reply_to": {
        "email": fromEmail,
        "name": "Roosted"
      },
      "template_id": templateId
    });
    console.log(sendEmail)
    res.status(200).json({messageSuccess: true})

  } catch(error) {
    res.status(404).json({messageSuccess: false, error: error})
    console.log(error);
  }
});

app.post('/sendgrid/send-twilio-text', async (req, res) => {

  const fromNumber = process.env.TWILIO_NUMBER
  const toNumber = req.body.phoneNumber
  const message = req.body.message

  try {
    client.messages
    .create({body: message, from: '+1' + fromNumber, to: '+1' + toNumber})
    .then(successMessage =>  res.status(200).json({messageSuccess: successMessage}))
    .catch(error => {console.log(error);  res.status(404).json({messageSuccess: false, error: error})});
   

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