type User @model 
          @key(name: "emailKey", fields: ["email"], queryField: "usersByEmail")
          @auth(rules: 
            [{allow: owner, identityClaim: "sub", operations: [create]},
            {allow: groups, groups: ["admins"], operations: [create]}])
          {
  id: ID!
  userFirstName: String
  userLastName: String
  email: ID!
  userPhone: String
  password: String
  setupType: String 
  #setupType: roosted, partner, addedAgent
  setupStatus: String
  #setupStatus: selectType, getLicenseInfo
  navBar: String
  userType: String
  #userType: user, admin, broker
  brokerState: String
  userAddress: Address
  userRoostedLicenses: [RoostedLicense] @connection(keyName: "userRoostedLicenses", fields: ["id"])
  userPartnerLicenses: [PartnerLicense] @connection(keyName: "userPartnerLicenses", fields: ["id"])
  roostedAgent: Roosted
  partnerAgent: Partner
  userSignature: String
  createdAt: String
  activityLog: ActivityLog
  userDemographics: Demographics
  userReferralsCreated: [Referral] @connection(keyName: "referralsCreated", fields: ["id"]) 
  userReferralsReceived: [Referral] @connection(keyName: "referralsReceived", fields: ["id"]) 
  owner: String
}

type Address {
  street: String
  unit: String
  city: String
  state: String
  zip: String
}


type ActivityLog {
  activity: String
  activityDate: String
}

type Demographics {
  birthday: String
  yearsInBusiness: Float
  title: String
}

type Roosted {
  stripePaymentIntent: String
  stripeCustomerSecret: String
  stripeSubscriptionId: String
  stripeCustomerId: String
  stripeProductId: String
  stripeProductName: String
  stripeProductPeriod: String
  stripeState: String
  stripeCancelReason: String
  stripeCancelReasonOther: String
  stripePromoId: String
}


type Partner {
  partnerSource: String
  partnerRating: Float
  partnerAddedAgent: Boolean
}

type RoostedLicense @model
                    @key(name: "userRoostedLicenses", fields: ["licenseUserID", "licenseType"])
                    @auth(rules: [{allow: owner, ownerField: "licenseUserID", identityClaim: "sub"}]) {
  id: ID!
  licenseUserID: ID!
  licenseUser: User @connection(fields: ["licenseUserID"])
  licenseNumber: String
  licenseState: String
  licenseExpiration: String
  primaryLicense: Boolean
  #unverified, verified, waitingOnPayment, waitingOnPolicies, waitingOnICA, waitingOnTransfer, waitingOnRoosted, severed, deleted
  licenseVerificationStatus: String
  licenseICAPath: String
  licensePolicyAndProcedurePath: String
  licenseType: String
  createdAt: String
  activityLog: ActivityLog
}

type PartnerLicense @model
                    @key(name: "userPartnerLicenses", fields: ["licenseUserID", "licenseType"])
                    @auth(rules: [
                      {allow: owner, ownerField: "licenseUserID", identityClaim: "sub"},
                      {allow: groups, groups: ["admins"]}]) {
  id: ID!
  licenseUserID: ID!
  licenseUser: User @connection(fields: ["licenseUserID"])
  licenseNumber: String
  licenseState: String
  licenseExpiration: String
  primaryLicense: Boolean
  #nunverified, verified, deleted
  licenseVerificationStatus: String
  licenseContractPath: String
  licenseType: String
  zipCode: String
  radius: String
  lowPrice: String
  highPrice: String
  broker: String
  createdAt: String
  activityLog: ActivityLog
}

type Referral  @model
               @key(name: "referralsCreated", fields: ["referralRoostedAgentID", "createdAt"])
               @key(name: "referralsReceived", fields: ["referralPartnerAgentID", "createdAt"])
               @key(name: "clientReferrals", fields: ["referralClientID"])
               @auth(rules: [
                {allow: owner, ownerField: "referralRoostedAgentID", identityClaim: "sub"}, 
                {allow: owner, ownerField: "referralPartnerAgentID", identityClaim: "sub"},
                {allow: groups, groups: ["admins"]}]) {
  id: ID!
  referralRoostedAgentID: ID!
  referralRoostedAgent: User @connection(fields: ["referralRoostedAgentID"])
  referralClientID: ID!
  referralClient: Client @connection(fields: ["referralClientID"])
  referralState: String
  referralReferringAgentState: String
  referralType: String
  #waitingForAgentAssignment, pending, accepted, rejected, closed, clientLost, deleted 
  referralStatus: String 
  #buyers: new, clientContacted, agreementSigned, touring, underContract, clientLost, closed; sellers: new, clientContacted, agreementSigned, listed, reviewingOffers, underContract, clientLost, closed
  referralClientStatus: String
  referralRejectedReason: String
  referralEstimatedPriceRange: String
  referralContractValue: String
  referralRoostedAgentPayoutFormatted: String
  referralRoostedAgentPayoutLow: Float
  referralRoostedAgentPayoutHigh: Float
  referralRoostedAgentPayoutActual: Float
  referralPartnerPayoutFormatted: String
  referralPartnerPayoutLow: Float
  referralPartnerPayoutHigh: Float
  referralPartnerPayoutActual: Float
  referralRoostedPayoutFormatted: String
  referralRoostedPayoutLow: Float
  referralRoostedPayoutHigh: Float
  referralRoostedPayoutActual: Float
  referralEstimatedCloseDate: String
  referralCloseDate: String
  referralComments: String
  initialAgentSelection: String
  referralTimeFrame: String
  referralAddress: Address
  referralPrequalified: Boolean
  referralPrequalifiedAmount: String
  referralFeeOffered: String
  referralCommission: Float
  referralPartnerAgentID: ID!
  referralPartnerAgent: User @connection(fields: ["referralPartnerAgentID"])
  referralContractPath: String
  referralRoostedPlanOnCreation: String
  referralRoostedPlanPeriodOnCreation: String
  referralRoostedPlanProductIdOnCreation: String
  createdAt: String
  activityLog: ActivityLog
}

type Client @model
            @auth(rules: [{allow: groups, groups: ["admins", "users"]}]) {
  id: ID!
  clientReferralEmail: String!
  clientReferral: [Referral] @connection(keyName: "clientReferrals", fields: ["id"])
  clientFirstName: String
  clientLastName: String
  clientPhone: String
  createdAt: String
}


//////////////

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

const planFinder = require('./planFinder');

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

console.log('Calling Payment Post')
app.post('/stripe/create-payment-intent', async (req, res) => {
  try {
    const stripeState = req.body.stripeState;
    let stripe;
    if(stripeState === 'AZ') {
      stripe = require("stripe")(process.env.STRIPE_KEY_AZ);
    } else if(stripeState === 'CA') {
      stripe = require("stripe")(process.env.STRIPE_KEY_CA);
    } else {
      stripe = 'AZ'
    }

    const customer = await stripe.customers.create(
      {
        name: req.body.globalUser.userFirstName + ' ' + req.body.globalUser.userLastName,

        
        email: req.body.globalUser.email,
        address: {
          line1: req.body.globalUser.userAddress.street,
          city: req.body.globalUser.userAddress.city,
          state: req.body.globalUser.userAddress.state,
          postal_code: req.body.globalUser.userAddress.zip
        }
      }
    )

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: req.body.amount,
        currency: 'usd',
        customer: customer.id,
        payment_method_types: ['card']
      },
    )
    res.json({success: 'payemnt intent created!', paymentIntent: paymentIntent, customer: customer})
  } catch(error) {
    console.log(error)
    res.status(500).json({failed: 'post call failed to create payment intent!', error: error})
  }
});

app.post('/stripe/check-promo-code', async (req, res) => {
  const stripeState = req.body.stripeState;
    let stripe;
    if(stripeState === 'AZ') {
      stripe = require("stripe")(process.env.STRIPE_KEY_AZ);
    } else if(stripeState === 'CA') {
      stripe = require("stripe")(process.env.STRIPE_KEY_CA);
    } else {
      stripe = 'AZ'
    }
  try {
    const promo = req.body.promoCode;
    const foundPromo = await stripe.coupons.retrieve(promo);
    if(foundPromo) {
      res.status(200).json({promoCodeValid: true, promoData: foundPromo})
    } else {
      res.status(200).json({promoCodeValid: false})
    }
  } catch(error) {
    res.status(404).json({promoCodeValid: false})
    console.log(error);
  }
});

app.post('/stripe/create-subscription', async (req, res) => {
  const stripeState = req.body.stripeState;
    let stripe;
    if(stripeState === 'AZ') {
      stripe = require("stripe")(process.env.STRIPE_KEY_AZ);
    } else if(stripeState === 'CA') {
      stripe = require("stripe")(process.env.STRIPE_KEY_CA);
    } else {
      stripe = 'AZ'
    }
  try {
    const source = req.body.source
    const stripeCustomerId = req.body.stripeCustomerId
    const paymentPeriod = req.body.paymentPeriod
    const plan = planFinder.planFinder(req.body.plan, paymentPeriod, stripeState, process.env.ENV)
    const promoCode = req.body.promoCode
    const promoCodeValid = req.body.promoCodeValid

    let percentOff = 0;
    if(promoCodeValid) {
        percentOff = promoCode.percent_off === undefined ? 0 : promoCode.percent_off;
    }

    await stripe.customers.update(stripeCustomerId, {source: source.id})
    console.log(plan)
    let subscription;
    //create subscription that will not record in stripe but will eliminate the setup fee by filtering out 0.01 off percents
    if(promoCodeValid && percentOff > 0.01) {
        subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{plan: plan}],
        billing: 'charge_automatically',
        trial_from_plan: true,
        coupon: promoCode.id
      });
    } else {
        subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{plan: plan}],
        billing: 'charge_automatically',
        trial_from_plan: true,
      });
    }

    res.status(200).json({subscription: subscription, productId: plan})

  } catch(error) {
    console.log(error);
    res.status(500).json({error: 'Failed to charge card on server.'})
  }
});


app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app

////////////////////////

exports.planFinder = (planName, paymentPeriod, planState, env) => {
    if(env === 'master') {
        if(planState === 'AZ') {
            if(planName === 'nest' && paymentPeriod === 'monthly') {
                return 'plan_F2qmQoTUPZsrV3'
            }
            if(planName === 'nest' && paymentPeriod === 'annual') {
                return 'plan_F2qmQoTUPZsrV3'
            }
            if(planName === 'perch' && paymentPeriod === 'monthly') {
                return 'plan_F2qlwNR038pMbf'
            }
            if(planName === 'perch' && paymentPeriod === 'annuall') {
                return 'plan_F2qk8lfHlQkpzR'
            }
            if(planName === 'flight' && paymentPeriod === 'monthly') {
                return 'plan_F2qkbYolGAyCqo'
            }
            if(planName === 'flight' && paymentPeriod === 'annuall') {
                return 'plan_F2qiZnls91uUce'
            }
        }
    }
    if(env === 'staging') {
        if(planState === 'AZ') {
            if(planName === 'nest' && paymentPeriod === 'monthly') {
                return 'plan_EtklP47lbVm3xc'
            }
            if(planName === 'nest' && paymentPeriod === 'annual') {
                return 'plan_EtklP47lbVm3xc'
            }
            if(planName === 'perch' && paymentPeriod === 'monthly') {
                return 'plan_EtkmOpygwJVzYt'
            }
            if(planName === 'perch' && paymentPeriod === 'annual') {
                return 'plan_EtknVBsxr776Mg'
            }
            if(planName === 'flight' && paymentPeriod === 'monthly') {
                return 'plan_EtkpTfdToS9YBh'
            }
            if(planName === 'flight' && paymentPeriod === 'annual') {
                return 'plan_EtkpXuopujeCCv'
            }
        }
    }
    
}


/////////////////

const AWS = require('aws-sdk')
const region = process.env.REGION
const documentClient = new AWS.DynamoDB.DocumentClient({region});
exports.handler = async (event, context, callback) => {
//const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18' })
//insert code to be executed by your lambda trigger
  const email = event.request.userAttributes.email
  const params = {
    TableName: process.env.ENV === 'master' ? 'User-a3blybfr3zayjgeywk3v4eawvq-master' : 'User-pqvuab3j7bg75brfivitnacut4-staging',
    IndexName: 'emailKey',
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {":email": email},
  };
  documentClient.query(params, function(err, data) {
  if (err) { 
  console.log(err);
    callback('codeFailedQueryingUser');
  }
  else {
  if(data.Items.length === 0) {
    callback(null, event);
  } else {
    callback('codeDifferentProvider');
  }
  }});
};

////////////////////////////

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

  try {
    sgMail.send({
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
            "state": req.body.emailData['state']
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
    res.status(200).json({messageSuccess: true})

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
