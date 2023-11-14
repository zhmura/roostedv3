/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/




var express = require('express')
var bodyParser = require('body-parser')
const mongoose = require('mongoose');
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const Userv2 = require('./user')
const Licensev2 = require('./license')
const Referralv2 = require('./referral')
const Customerv2 = require('./customer')
const AWS = require('aws-sdk');
const { v4: uuid } = require('uuid');
const stripe = require("stripe")(process.env.STRIPE_KEY_AZ);

const ObjectId = mongoose.Types.ObjectId;

const region = process.env.REGION
const documentClient = new AWS.DynamoDB.DocumentClient({region});


const cognitoIdp = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});

const  MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CONNECTION_URI}-sxlc9.mongodb.net/${process.env.MONGO_DEFAULT_DB}`;


// const ObjectId = mongoose.Types.ObjectId;

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


app.post('/transfer/v2-to-v3', async (req, res) => {
  try{
    // let cursor = Userv2.find().cursor();
    // cursor.on('data', async (user) => {

      const getPlanData = (plan) => {
        if(process.env.ENV === 'master') {
          if(plan === 'plan_F2qmQoTUPZsrV3') {
            return {name: 'nest', period: 'monthly', split: '50/50', price: '$0'}
          }
          if(plan === 'plan_F2qmQoTUPZsrV3') {
            return {name: 'nest', period: 'mnnual', split: '50/50', price: '$0'}
          }
          if(plan === 'plan_F2qlwNR038pMbf') {
            return {name: 'perch', period: 'monthly', split: '70/30', price: '$9'}
          }
          if(plan === 'plan_F2qk8lfHlQkpzR') {
            return {name: 'perch', period: 'annual', split: '70/30', price: '$6'}
          }
          if(plan === 'plan_F2qkbYolGAyCqo') {
            return {name: 'flight', period: 'monthly', split: '90/10', price: '$19'}
          }
          if(plan === 'plan_F2qiZnls91uUce') {
            return {name: 'flight', period: 'annual', split: '90/10', price: '$12'}
          }
        } else {
          if(plan === 'plan_EtklP47lbVm3xc') {
            return {name: 'nest', period: 'monthly', split: '50/50', price: '$0'}
          }
          if(plan === 'plan_EtklP47lbVm3xc') {
            return {name: 'nest', period: 'mnnual', split: '50/50', price: '$0'}
          }
          if(plan === 'plan_EtkmOpygwJVzYt') {
            return {name: 'perch', period: 'monthly', split: '70/30', price: '$9'}
          }
          if(plan === 'plan_EtknVBsxr776Mg') {
            return {name: 'perch', period: 'annual', split: '70/30', price: '$6'}
          }
          if(plan === 'plan_EtkpTfdToS9YBh') {
            return {name: 'flight', period: 'monthly', split: '90/10', price: '$19'}
          }
          if(plan === 'plan_EtkpXuopujeCCv') {
            return {name: 'flight', period: 'annual', split: '90/10', price: '$12'}
          }
        }
      }


    for await (const user of Userv2.find()) {
      console.log(user)
      //create a cognito user
      // const params = {
      //   UserPoolId: process.env.userPoolId, /* required */
      //   Username: user.email, /* required */
      //   DesiredDeliveryMediums: [
      //       'EMAIL'
      //   ],
      //   ForceAliasCreation: false,
      //   MessageAction: 'SUPPRESS',
      //   TemporaryPassword: 'redBox175359GreyMoon',
      //   UserAttributes: [
      //       {
      //         Name: 'email', /* required */
      //         Value: user.email
      //       },
      //       {
      //         Name: 'email_verified',
      //         Value: 'true'
      //       }
      //   ]
      // };
      
      // let cognitoUserName = null
    
      // console.log(params)
      // const result = await cognitoIdp.adminCreateUser(params).promise()
      // console.log(result)
      // console.log('createdUser')

      let cognitoUserName = uuid()
      //result coming from above is the cognito user we can use to get the sub from
      

      //find the users license and hold it in licenses
      const license = await Licensev2.findOne({licenseUser: user.id});
      console.log(license)

      let licenseParams = {}
      if(license && (license.id !== undefined && license.licenseType === 'roosted')) {
        licenseParams = {
          TableName: process.env.ENV === 'master' ? 'RoostedLicense-hqewozhe55bppnhwrlydkxhnka-master' : 'RoostedLicense-ux4plcyf5veite3avotvsue2vq-staging',
          Item: {
            id: uuid(),
            __typename: 'RoostedLicense',
            licenseUserID: cognitoUserName,
            licenseNumber: license.licenseNumber,
            licenseState: license.licenseState,
            licenseExpiration: new Date(license.licenseExpiration).toISOString(),
            primaryLicense: true,
            licenseVerificationStatus: license.licenseVerificationStatus,
            licenseICAPath: license.licenseICAPath === '' ? null : license.licenseICAPath.slice(37),
            licensePolicyAndProcedurePath: license.licensePoliciesAndProceduresPath === '' ? null : license.licensePoliciesAndProceduresPath.slice(62),
            licenseType: 'roosted',
            createdAt: new Date(license.createdAt).toISOString()
          }
        }
      }

      if(license && (license.id !== undefined && license.licenseType === 'partner')) {
        licenseParams = {
          TableName: process.env.ENV === 'master' ? 'PartnerLicense-hqewozhe55bppnhwrlydkxhnka-master' : 'PartnerLicense-ux4plcyf5veite3avotvsue2vq-staging',
          Item: {
            id: uuid(),
            __typename: 'PartnerLicense',
            licenseUserID: cognitoUserName,
            licenseNumber: license.licenseNumber,
            licenseState: license.licenseState,
            licenseExpiration: new Date(license.licenseExpiration).toISOString(),
            primaryLicense: true,
            licenseVerificationStatus: license.licenseVerificationStatus,
            licenseType: 'partner',      
            zipCode: license.zipCode === '' || license.zipCode === undefined ? null : license.zipCode,
            radius: license.radius === '' || license.radius === undefined ? null : license.radius,
            lowPrice: license.lowPrice === '' || license.lowPrice === undefined ? null : license.lowPrice,
            highPrice: license.highPrice === '' || license.highPrice === undefined ? null : license.highPrice,
            broker: license.broker === '' || license.broker === undefined ? null : license.broker,
            createdAt: new Date(license.createdAt).toISOString()
          }
        }
      }

      if(license && license.id !== undefined) {
       await documentClient.put(licenseParams).promise()
       console.log('createdLicense')
      }



      //find any referrals
      // const referral = await Referralv2.findOne({referralReferringAgent: user.id});

      // let referralParams = {}
      
      // console.log(referral)
      // console.log(referral && referral.id !== undefined)

      // if(referral && referral.id !== undefined) {
      //   const client = await Customerv2.findOne(ObjectId(referral.referralCustomer.id));
      //   const clientParams = {
      //     TableName: 'Client-ux4plcyf5veite3avotvsue2vq-staging',
      //     Item: {
      //       id: uuid(),
      //       __typename: 'Client',
      //       clientReferralEmail: client.email,
      //       clientFirstName: client.customerFirstName,
      //       clientLastName: client.customerLastName,
      //       clientPhone: client.customerPhone,
      //       createdAt: new Date(client.createdAt).toISOString()
      //     }
      //   }

      //   const newClient = await documentClient.put(clientParams).promise()

      //   referralParams = {
      //     TableName: 'Referral-ux4plcyf5veite3avotvsue2vq-staging',
      //     Item: {
      //       id: uuid(),
      //       __typename: 'Referral',
      //       referralRoostedAgentID: cognitoUserName,
      //       referralPartnerAgentID: '111-1111-111-111',
      //       referralClientID: newClient.id,
      //       referralState: referral.referralState,
      //       referralReferringAgentState: referral.referralReferraingAgentState === undefined || referral.referralReferraingAgentState === '' ? 'AZ' : referral.referralReferraingAgentState,
      //       referralType: referral.referralType,
      //       referralStatus: referral.referralStatus,
      //       referralClientStatus: referral.referralClientStatus,
      //       referralEstimatedPriceRange: referral.referralEstimatedPriceRange,
      //       referralContractValue: referral.referralContractValue === 0 ? null : referral.referralContractValue,
      //       referralRoostedAgentPayoutFormatted: '0',
      //       referralRoostedAgentPayoutLow: 0,
      //       referralRoostedAgentPayoutHigh: 0,
      //       referralRoostedAgentPayoutActual: 0,
      //       referralPartnerPayoutFormatted: '0',
      //       referralPartnerPayoutLow: 0,
      //       referralPartnerPayoutHigh: 0,
      //       referralPartnerPayoutActual: 0,
      //       referralRoostedPayoutFormatted: '0',
      //       referralRoostedPayoutLow: 0,
      //       referralRoostedPayoutHigh: 0,
      //       referralRoostedPayoutActual: 0,
      //       referralPayoutNotification: false,
      //       referralEstimatedCloseDate: referral.referralCloseDate !== undefined ? new Date(referral.referralCloseDate).toISOString() : null,
      //       referralCloseDate: referral.referralCloseDate !== undefined ? new Date(referral.referralCloseDate).toISOString() : null,
      //       referralComments: referral.referralComments === '' || referral.Comments === undefined ? null : referral.referralComments,
      //       initialAgentSelection: referral.roostedSelectsAgent === undefined || referral.roostedSelectsAgent === null ? null : referral.roostedSelectsAgent,
      //       referralTimeFrame: referral.referralTimeFrame,
      //       referralAddress: {
      //         street: referral.referralAddress.street === undefined || referral.referralAddress.street === '' ? null : referral.referralAddress.street,
      //         unit: referral.referralAddress.unit === undefined || referral.referralAddress.unit === '' ? null : referral.referralAddress.unit,
      //         city: referral.referralAddress.city === undefined || referral.referralAddress.city === '' ? null : referral.referralAddress.city,
      //         state: referral.referralAddress.state === undefined || referral.referralAddress.state === '' ? null : referral.referralAddress.state,
      //         zip: referral.referralAddress.zip === undefined || referral.referralAddress.zip === '' ? null : referral.referralAddress.zip
      //       },
      //       referralPrequalified: referral.referralPrequalified,
      //       referralPrequalifiedAmount: '0',
      //       referralFeeOffered: parseFloat(referral.referralCommissionOffered),
      //       referralCommission: parseFloat(referral.referralTotalCommission/100),
      //       referralContractPath: referral.referralContractPath === null || referral.referralContractPath === undefined || referral.referralContractPath === '' ? null : referral.referralContractPath.slice(54),
      //       referralRoostedPlanOnCreation: 'perch',
      //       referralRoostedPlanPeriodOnCreation: 'annual',
      //       referralRoostedPlanProductIdOnCreation: 'xxxxxxxxxx',
      //       createdAt: new Date(referral.createdAt).toISOString()
      //     }
      //   }
      // }

      // if(referral && referral.id !== undefined) {
      //    await documentClient.put(referralParams).promise()
      //    console.log('createdReferral')
      // }



      //create referral if not null

      

      

      let roostedAgentParams = {}
      if((license && license.licenseType !== undefined) && (license && license.licenseType === 'roosted')) {
        let foundPlan = ''
        if(user.roostedAgent !== undefined && user.roostedAgent.stripeSubscriptionId !== '') {
          foundPlan = await stripe.subscriptions.retrieve(user.roostedAgent.stripeSubscriptionId);
        }
        roostedAgentParams = {
          stripePaymentIntent: 'completed',
          stripeCustomerSecret: null, 
          stripeSubscriptionId: user.roostedAgent !== undefined && user.roostedAgent.stripeSubscriptionId !== '' ? user.roostedAgent.stripeSubscriptionId : null,
          stripeCustomerId: user.roostedAgent !== undefined && user.roostedAgent.stripeCustomerId !== '' ? user.roostedAgent.stripeCustomerId : null,
          stripeProductId: foundPlan === '' ? 'No Plan Found' : foundPlan.plan.id,
          stripeProductName: foundPlan === '' ? 'No Plan Found' : getPlanData(foundPlan.plan.id).name,
          stripeProductPeriod: foundPlan === '' ? 'No Plan Foud' : foundPlan.interval === 'month' ? 'monthly' : 'annual',
          stripeState: 'AZ',
          stripePromoId: user.roostedAgent !== undefined && user.roostedAgent.promo !== null && user.roostedAgent.promo !== undefined ? user.roostedAgent.promo.id === '' ? null : user.roostedAgent.promo.id : null
        }
      }
     
      let partnerAgentParams = {}
      if((license && license.licenseType !== undefined) && (license && license.licenseType === 'partner')) {
        partnerAgentParams = {
          partnerSource: user.partnerAgent === undefined || user.partnerAgent.marketingSource === '' ? null : user.partnerAgent.marketingSource,
          partnerAddedAgent: false,
        }
      }

      //set user params
      let dynamoUserParams = {}

      if(Object.entries(roostedAgentParams).length === 0 && Object.entries(partnerAgentParams).length > 0) {
        dynamoUserParams = {
          TableName: process.env.ENV === 'master' ? 'User-hqewozhe55bppnhwrlydkxhnka-master' : 'User-ux4plcyf5veite3avotvsue2vq-staging',
          Item: {
            id: cognitoUserName,
            __typename: 'User',
            userFirstName: user.userFirstName,
            userLastName: user.userLastName,
            email: user.email,
            userPhone: user.userPhone,
            setupType: user.setupType,
            addedAgentComplete: true,
            legacyUser: true,
            legacyUserCompleted: false,
            setupStatus: user.setupStatus === 'completed' ? 'completed' : user.setupStatus === 'license' ? 'getLicenseInfo' : user.setupStatus === 'partnerInfo' ? 'getPartnerInfo' : user.setupStatus === 'payment' ? 'getPaymentInfo' : user.setupStatus === 'policies' ? 'signPolicies' : user.setupStatus === 'contractorAgreement' ? 'signICA' : user.setupStatus === 'transfer' ? 'transferLicense' : user.setupStatus === 'verify' ? 'waitingOnRoosted' : 'followUp' ,
            navBar: license === null ? 'setup' : license.licenseType === 'roosted' ? 'roosted' : license.licenseType === 'partner' ? 'partner' : 'setup',
            userType: 'user',
            userAddress: {
              street: user.userAddress.street === undefined || user.userAddress.street === '' ? '1234 Main St' : user.userAddress.street,
              unit: user.userAddress.unit === undefined || user.userAddress.unit === "" ? null : user.userAddress.unit,
              city: user.userAddress.city === undefined || user.userAddress.city === '' ? 'Phoenix' : user.userAddress.city,
              state: user.userAddress.state === undefined || user.userAddress.state === '' ? 'AZ' : user.userAddress.state,
              zip: user.userAddress.zip === undefined || user.userAddress.zip === '' ? '12345' : user.userAddress.zip
            },
            partnerAgent: partnerAgentParams,
            userCognitoUsername: cognitoUserName,
            createdAt: new Date(user.createdAt).toISOString(),
            owner: cognitoUserName
          }
        }
      } else if(Object.entries(roostedAgentParams).length > 0 && Object.entries(partnerAgentParams).length === 0) {
        dynamoUserParams = {
          TableName: process.env.ENV === 'master' ? 'User-hqewozhe55bppnhwrlydkxhnka-master' : 'User-ux4plcyf5veite3avotvsue2vq-staging',
          Item: {
            id: cognitoUserName,
            __typename: 'User',
            userFirstName: user.userFirstName,
            userLastName: user.userLastName,
            email: user.email,
            userPhone: user.userPhone,
            setupType: user.setupType,
            addedAgentComplete: true,
            legacyUser: true,
            legacyUserCompleted: false,
            setupStatus: user.setupStatus === 'completed' ? 'completed' : user.setupStatus === 'license' ? 'getLicenseInfo' : user.setupStatus === 'partnerInfo' ? 'getPartnerInfo' : user.setupStatus === 'payment' ? 'getPaymentInfo' : user.setupStatus === 'policies' ? 'signPolicies' : user.setupStatus === 'contractorAgreement' ? 'signICA' : user.setupStatus === 'transfer' ? 'transferLicense' : user.setupStatus === 'verify' ? 'waitingOnRoosted' : 'followUp' ,
            navBar: license === null ? 'setup' : license.licenseType === 'roosted' ? 'roosted' : license.licenseType === 'partner' ? 'partner' : 'setup',
            userType: 'user',
            userAddress: {
              street: user.userAddress.street === undefined || user.userAddress.street === '' ? '1234 Main St' : user.userAddress.street,
              unit: user.userAddress.unit === undefined || user.userAddress.unit === "" ? null : user.userAddress.unit,
              city: user.userAddress.city === undefined || user.userAddress.city === '' ? 'Phoenix' : user.userAddress.city,
              state: user.userAddress.state === undefined || user.userAddress.state === '' ? 'AZ' : user.userAddress.state,
              zip: user.userAddress.zip === undefined || user.userAddress.zip === '' ? '12345' : user.userAddress.zip
            },
            roostedAgent: roostedAgentParams,
            userCognitoUsername: cognitoUserName,
            createdAt: new Date(user.createdAt).toISOString(),
            owner: cognitoUserName
          }
        }
      } else {
        dynamoUserParams = {
          TableName: process.env.ENV === 'master' ? 'User-hqewozhe55bppnhwrlydkxhnka-master' : 'User-ux4plcyf5veite3avotvsue2vq-staging',
          Item: {
            id: cognitoUserName,
            __typename: 'User',
            userFirstName: user.userFirstName,
            userLastName: user.userLastName,
            email: user.email,
            userPhone: user.userPhone,
            setupType: user.setupType,
            addedAgentComplete: true,
            legacyUser: true,
            legacyUserCompleted: false,
            setupStatus: user.setupStatus === 'completed' ? 'completed' : user.setupStatus === 'license' ? 'getLicenseInfo' : user.setupStatus === 'partnerInfo' ? 'getPartnerInfo' : user.setupStatus === 'payment' ? 'getPaymentInfo' : user.setupStatus === 'policies' ? 'signPolicies' : user.setupStatus === 'contractorAgreement' ? 'signICA' : user.setupStatus === 'transfer' ? 'transferLicense' : user.setupStatus === 'verify' ? 'waitingOnRoosted' : 'followUp' ,
            navBar: license === null ? 'setup' : license.licenseType === 'roosted' ? 'roosted' : license.licenseType === 'partner' ? 'partner' : 'setup',
            userType: 'user',
            userAddress: {
              street: user.userAddress.street === undefined || user.userAddress.street === '' ? '1234 Main St' : user.userAddress.street,
              unit: user.userAddress.unit === undefined || user.userAddress.unit === "" ? null : user.userAddress.unit,
              city: user.userAddress.city === undefined || user.userAddress.city === '' ? 'Phoenix' : user.userAddress.city,
              state: user.userAddress.state === undefined || user.userAddress.state === '' ? 'AZ' : user.userAddress.state,
              zip: user.userAddress.zip === undefined || user.userAddress.zip === '' ? '12345' : user.userAddress.zip
            },
            roostedAgent: roostedAgentParams,
            partnerAgent: partnerAgentParams,
            userCognitoUsername: cognitoUserName,
            createdAt: new Date(user.createdAt).toISOString(),
            owner: cognitoUserName
          }
        }
      }

      await documentClient.put(dynamoUserParams).promise()

      console.log('createdDynamoUser')
    }
    res.status(200).json({message: 'Transfer Complete'})
    // cursor.on('close', () => {res.status(200).json({message: 'Transfer Complete'})})
  }catch(error) {
    console.log(error)
    res.status(400).json({message: 'Error'})
  }
});

app.post('/transfer/referrals', async (req, res) => {
  try{
    // let cursor = Userv2.find().cursor();
    // cursor.on('data', async (user) => {

    const numberWithCommas = (number) => {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const convertDollarToString = (number) => {
      const numberInput = number;
      const removeDollar = numberInput.replace("$","");
      const removeComma = removeDollar.replace(",","")
  
      return removeComma
  }

    //calculate the agents share of their plan
    const agentShareByPlan = (planName, planPeriod, planId) => {

      if(planName === 'nest' && planPeriod === 'monthly') {
          return 0.50
      }
      if(planName === 'nest' && planPeriod === 'annual') {
          return 0.50
      }
      if(planName === 'perch' && planPeriod === 'monthly') {
          return 0.70
      }
      if(planName === 'perch' && planPeriod === 'annual') {
          return 0.70
      }
      if(planName === 'flight' && planPeriod === 'monthly') {
          return 0.90
      }
      if(planName === 'flight' && planPeriod === 'annual') {
          return 0.90
      }
    }

    const getPlanData = (plan) => {
      if(process.env.ENV === 'master') {
        if(plan === 'plan_F2qmQoTUPZsrV3') {
          return {name: 'nest', period: 'monthly', split: '50/50', price: '$0'}
        }
        if(plan === 'plan_F2qmQoTUPZsrV3') {
          return {name: 'nest', period: 'mnnual', split: '50/50', price: '$0'}
        }
        if(plan === 'plan_F2qlwNR038pMbf') {
          return {name: 'perch', period: 'monthly', split: '70/30', price: '$9'}
        }
        if(plan === 'plan_F2qk8lfHlQkpzR') {
          return {name: 'perch', period: 'annual', split: '70/30', price: '$6'}
        }
        if(plan === 'plan_F2qkbYolGAyCqo') {
          return {name: 'flight', period: 'monthly', split: '90/10', price: '$19'}
        }
        if(plan === 'plan_F2qiZnls91uUce') {
          return {name: 'flight', period: 'annual', split: '90/10', price: '$12'}
        }
      } else {
        if(plan === 'plan_EtklP47lbVm3xc') {
          return {name: 'nest', period: 'monthly', split: '50/50', price: '$0'}
        }
        if(plan === 'plan_EtklP47lbVm3xc') {
          return {name: 'nest', period: 'mnnual', split: '50/50', price: '$0'}
        }
        if(plan === 'plan_EtkmOpygwJVzYt') {
          return {name: 'perch', period: 'monthly', split: '70/30', price: '$9'}
        }
        if(plan === 'plan_EtknVBsxr776Mg') {
          return {name: 'perch', period: 'annual', split: '70/30', price: '$6'}
        }
        if(plan === 'plan_EtkpTfdToS9YBh') {
          return {name: 'flight', period: 'monthly', split: '90/10', price: '$19'}
        }
        if(plan === 'plan_EtkpXuopujeCCv') {
          return {name: 'flight', period: 'annual', split: '90/10', price: '$12'}
        }
      }
    }


    //method to calculate estimated payouts based on price range 
    const estimatePayout = (partyBeingPaid, commission, referralFee, agentPlan, priceRange) => {

      let lowPrice = 0
      let highPrice = 0
      if(priceRange === 'Under $100k') {
        lowPrice = 0
        highPrice = 100000
      } else if (priceRange === '$100k - $300k') {
        lowPrice = 100000
        highPrice = 300000
      } else if (priceRange === '$300k - $600k') {
        lowPrice = 300000
        highPrice = 600000
      } else if (priceRange === '$600k - $1MM') {
        lowPrice = 600000
        highPrice = 1000000
      } else if (priceRange === '$1MM - $3MM') {
        lowPrice = 1000000
        highPrice = 3000000
      } else if (priceRange === '$3MM - $5MM+') {
        lowPrice = 3000000
        highPrice = 5000000
      }

      let lowEndPayout = 0
      let highEndPayout = 0
      let lowEndPayoutFormatted = '$0'
      let highEndPayoutFormatted = '$0'
      if(partyBeingPaid === 'roosted') {
        lowEndPayout = ((lowPrice * commission) * referralFee * (1 - agentPlan)).toFixed(0)
        lowEndPayoutFormatted = '$' + numberWithCommas(lowEndPayout)
        highEndPayout = ((highPrice * commission) * referralFee * (1 - agentPlan)).toFixed(0)
        highEndPayoutFormatted = '$' + numberWithCommas(highEndPayout)
      } else if(partyBeingPaid === 'roostedAgent') {
        lowEndPayout = ((lowPrice * commission) * referralFee * (agentPlan)).toFixed(0)
        lowEndPayoutFormatted = '$' + numberWithCommas(lowEndPayout)
        highEndPayout = ((highPrice * commission) * referralFee * (agentPlan)).toFixed(0)
        highEndPayoutFormatted = '$' + numberWithCommas(highEndPayout)
      } else if(partyBeingPaid === 'partnerAgent') {
        lowEndPayout = ((lowPrice * commission) * (1 - referralFee)).toFixed(0)
        lowEndPayoutFormatted = '$' + numberWithCommas(lowEndPayout)
        highEndPayout = ((highPrice * commission) * (1 - referralFee)).toFixed(0)
        highEndPayoutFormatted = '$' + numberWithCommas(highEndPayout)
      }

      const priceArray = {lowEndPayout: lowEndPayout, lowEndPayoutFormatted: lowEndPayoutFormatted, highEndPayout: highEndPayout, highEndPayoutFormatted: highEndPayoutFormatted}
      console.log(priceArray)
      return priceArray 
    }

    const getActualPayout = (partyBeingPaid, contractValue, commission, agentShare, referralFee) => {
      console.log(contractValue, commission, agentShare, referralFee)
      if(partyBeingPaid === 'roosted') {
        return ((contractValue * commission) * referralFee * (1 - agentShare)).toFixed(0)
      } else if(partyBeingPaid === 'roostedAgent') {
        return ((contractValue * commission) * referralFee * (agentShare)).toFixed(0)
      } else if(partyBeingPaid === 'partnerAgent') {
        return ((contractValue * commission) * (1 - referralFee)).toFixed(0)
      }
    }


    for await (const referral of Referralv2.find()) {
      console.log(referral)
    
      let newReferralId = uuid()
      //result coming from above is the cognito user we can use to get the sub from
      

     let referralParams = {}
      
       if(referral && referral.id !== undefined) {
        const client = await Customerv2.findOne(ObjectId(referral.referralCustomer.id));
        console.log(client)
        const clientParams = {
          TableName: process.env.ENV === 'master' ? 'Client-hqewozhe55bppnhwrlydkxhnka-master' : 'Client-ux4plcyf5veite3avotvsue2vq-staging',
          Item: {
            id: uuid(),
            __typename: 'Client',
            clientReferralEmail: client.email,
            clientFirstName: client.customerFirstName,
            clientLastName: client.customerLastName,
            clientPhone: client.customerPhone,
            createdAt: new Date(client.createdAt).toISOString()
          }
        }

        const newClient = await documentClient.put(clientParams).promise()

        const stripeProductName = getPlanData(referral.referralUserPlanOnCreation.id).name
        const stripeProductPeriod = getPlanData(referral.referralUserPlanOnCreation.id).period
        const stripeProductId = referral.referralPlanOnCreation


        const agentShare = agentShareByPlan(stripeProductName, stripeProductPeriod, stripeProductId)
        const roostedAgentEstimatedPayout = estimatePayout('roostedAgent', 0.03, parseFloat(referral.referralCommissionOffered/100), agentShare, referral.referralEstimatedPriceRange)
        const partnerAgentEstimatedPayout = estimatePayout('partnerAgent', 0.03, parseFloat(referral.referralCommissionOffered/100), agentShare, referral.referralEstimatedPriceRange)
        const roostedEstimatedPayout = estimatePayout('roosted', 0.03, parseFloat(referral.referralCommissionOffered/100), agentShare, referral.referralEstimatedPriceRange)
        const referralRoostedAgentPayoutActual = getActualPayout('roostedAgent', parseFloat(referral.referralContractValue), parseFloat(referral.referralTotalCommission)/100, agentShare, parseFloat(referral.referralCommissionOffered/100))
        const referralPartnerPayoutActual = getActualPayout('partnerAgent', parseFloat(referral.referralContractValue), parseFloat(referral.referralTotalCommission)/100, agentShare, parseFloat(referral.referralCommissionOffered/100))
        const referralRoostedPayoutActual = getActualPayout('roosted', parseFloat(referral.referralContractValue), parseFloat(referral.referralTotalCommission)/100, agentShare, parseFloat(referral.referralCommissionOffered/100))

        referralParams = {
          TableName: process.env.ENV === 'master' ? 'Referral-hqewozhe55bppnhwrlydkxhnka-master' : 'Referral-ux4plcyf5veite3avotvsue2vq-staging',
          Item: {
            id: newReferralId,
            __typename: 'Referral',
            referralRoostedAgentID: '111-1111-111-111',
            referralPartnerAgentID: '111-1111-111-111',
            referralClientID: newClient.id,
            referralState: referral.referralState,
            referralReferringAgentState: referral.referralReferraingAgentState === undefined || referral.referralReferraingAgentState === '' ? 'AZ' : referral.referralReferraingAgentState,
            referralType: referral.referralType,
            referralStatus: referral.referralStatus,
            referralClientStatus: referral.referralClientStatus,
            referralEstimatedPriceRange: referral.referralEstimatedPriceRange,
            referralContractValue: referral.referralContractValue === 0 ? 0 : parseFloat(referral.referralContractValue),
            referralRoostedAgentPayoutFormatted: `${roostedAgentEstimatedPayout.lowEndPayoutFormatted} to ${roostedAgentEstimatedPayout.highEndPayoutFormatted}`,
            referralRoostedAgentPayoutLow: roostedAgentEstimatedPayout.lowEndPayout,
            referralRoostedAgentPayoutHigh: roostedAgentEstimatedPayout.highEndPayout,
            referralRoostedAgentPayoutActual: referralRoostedAgentPayoutActual,
            referralPartnerPayoutFormatted: `${partnerAgentEstimatedPayout.lowEndPayoutFormatted} to ${partnerAgentEstimatedPayout.highEndPayoutFormatted}`,
            referralPartnerPayoutLow: partnerAgentEstimatedPayout.lowEndPayout,
            referralPartnerPayoutHigh: partnerAgentEstimatedPayout.highEndPayout,
            referralPartnerPayoutActual: referralPartnerPayoutActual,
            referralRoostedPayoutFormatted: `${roostedEstimatedPayout.lowEndPayoutFormatted} to ${roostedEstimatedPayout.highEndPayoutFormatted}`,
            referralRoostedPayoutLow: roostedEstimatedPayout.lowEndPayout,
            referralRoostedPayoutHigh: roostedEstimatedPayout.highEndPayout,
            referralRoostedPayoutActual: referralRoostedPayoutActual,
            referralPayoutNotification: false,
            referralEstimatedCloseDate: referral.referralCloseDate !== undefined ? new Date(referral.referralCloseDate).toISOString() : new Date().toISOString(),
            referralCloseDate: referral.referralCloseDate !== undefined ? new Date(referral.referralCloseDate).toISOString() : new Date().toISOString(),
            referralComments: referral.referralComments === '' || referral.Comments === undefined ? 'No comments.' : referral.referralComments,
            initialAgentSelection: referral.whoSelectsAgentsAgent === 'agentSelectsBuyAgent' || referral.roostedSelectsAgent === 'agentSelectsSellAgent' ? 'agentSelects' : 'roostedSelects',
            referralTimeFrame: referral.referralTimeFrame,
            referralAddress: {
              street: referral.referralAddress.street === undefined || referral.referralAddress.street === '' ? null : referral.referralAddress.street,
              unit: referral.referralAddress.unit === undefined || referral.referralAddress.unit === '' ? null : referral.referralAddress.unit,
              city: referral.referralAddress.city === undefined || referral.referralAddress.city === '' ? null : referral.referralAddress.city,
              state: referral.referralAddress.state === undefined || referral.referralAddress.state === '' ? null : referral.referralAddress.state,
              zip: referral.referralAddress.zip === undefined || referral.referralAddress.zip === '' ? null : referral.referralAddress.zip
            },
            referralPrequalified: referral.referralPrequalified === 'Yes' ? true : false,
            referralPrequalifiedAmount: '0',
            referralFeeOffered: parseFloat(referral.referralCommissionOffered),
            referralCommission: parseFloat(referral.referralTotalCommission/100),
            referralContractPath: referral.referralContractPath === null || referral.referralContractPath === undefined || referral.referralContractPath === '' ? 'TBD' : referral.referralContractPath.slice(53),
            referralRoostedPlanOnCreation: getPlanData(referral.referralUserPlanOnCreation.id).name,
            referralRoostedPlanPeriodOnCreation: getPlanData(referral.referralUserPlanOnCreation.id).period,
            referralRoostedPlanProductIdOnCreation: referral.referralUserPlanOnCreation.id,
            createdAt: new Date(referral.createdAt).toISOString()
          }
        }
      }

      if(referral && referral.id !== undefined) {
         await documentClient.put(referralParams).promise()
         console.log('createdReferral')
      }

    }
    res.status(200).json({message: 'Transfer Complete'})
    // cursor.on('close', () => {res.status(200).json({message: 'Transfer Complete'})})
  }catch(error) {
    console.log(error)
    res.status(400).json({message: 'Error'})
  }
});




mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true)

mongoose
  .connect(
    MONGODB_URI, {useNewUrlParser: true}
  )
  .then(result => {
    app.listen(3000);
  })
  .catch(err => console.log(err));
mongoose.set('useCreateIndex', true);


// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app