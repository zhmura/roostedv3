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
        payment_method_types: ['card'],
        description: 'Roosted.io Setup Fee'
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
    const token = req.body.token
    const stripeCustomerId = req.body.stripeCustomerId
    const paymentPeriod = req.body.paymentPeriod
    const plan = planFinder.planFinder(req.body.plan, paymentPeriod, stripeState, process.env.ENV)
    const promoCode = req.body.promoCode
    const promoCodeValid = req.body.promoCodeValid

    let percentOff = 0;
    if(promoCodeValid) {
        percentOff = promoCode.percent_off === undefined ? 0 : promoCode.percent_off;
    }

    await stripe.customers.update(stripeCustomerId, {source: token})
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

app.post('/stripe/get-prior-payments', async (req, res) => {
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
    const customerId = req.body.stripeCustomerId;
    const foundPayments = await stripe.charges.list({customer: customerId});
    const customer = await stripe.customers.retrieve(customerId)
    if(foundPayments) {
      res.status(200).json({priorPayments: foundPayments.data, customer: customer})
    } else {
      res.status(404).json('No Payments Found.')
    }
  } catch(error) {
    console.log(error);
    res.status(500).json({error: 'Failed to get prior payments from Stripe API.'})
  }
});

app.post('/stripe/change-subscription', async (req, res) => {
  const stripeState = req.body.planState;
    let stripe;
    if(stripeState === 'AZ') {
      stripe = require("stripe")(process.env.STRIPE_KEY_AZ);
    } else if(stripeState === 'CA') {
      stripe = require("stripe")(process.env.STRIPE_KEY_CA);
    } else {
      stripe = 'AZ'
    }
  try {
    const subscriptionId = req.body.stripeSubscriptionId
    const planName = req.body.planName
    const paymentPeriod = req.body.paymentPeriod
    const planState = req.body.planState
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const newSub = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
      items: [{
          id: subscription.items.data[0].id,
          plan: planFinder.planFinder(planName, paymentPeriod, planState, process.env.ENV),}]});
          if(newSub) {
            res.status(200).json({subscription: newSub})
          } else {
            console.log('Failed to change subscription in API.')
            res.status(404).json('Failed to change subscription in API.')
          }
  } catch(error) {
    console.log(error);
    res.status(500).json({error: 'Failed to get prior payments from Stripe API.'})
  }
});

app.post('/stripe/change-credit-card', async (req, res) => {
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
    const token = req.body.token
    const stripeCustomerId = req.body.stripeCustomerId

    let customer = null;
    if(stripeCustomerId === null || stripeCustomerId === undefined) {
      customer = await stripe.customers.create(
        {
          name: req.body.globalUser.userFirstName + ' ' + req.body.globalUser.userLastName,
          email: req.body.globalUser.email,
          address: {
            line1: req.body.globalUser.userAddress.street,
            city: req.body.globalUser.userAddress.city,
            state: req.body.globalUser.userAddress.state,
            postal_code: req.body.globalUser.userAddress.zip
          },
          source: token
        }
      )
    } else {
      customer = await stripe.customers.update(stripeCustomerId, {source: token})
    }
    
    res.status(200).json({result: 'Card Changed!', customer: customer})

  } catch(error) {
    console.log(error);
    res.status(500).json({error: 'Failed to charge card on server.'})
  }
});

app.post('/stripe/delete-stripe-account', async (req, res) => {
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
    const stripeCustomerId = req.body.stripeCustomerId
    await stripe.customers.del(stripeCustomerId)
    
    res.status(200).json({result: 'Customer Deleted'})

  } catch(error) {
    console.log(error);
    res.status(500).json({error: 'Failed to delete on server.'})
  }
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
