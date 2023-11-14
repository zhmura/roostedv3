const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  // client_id: {
  //   type: String, //Required for Auth0. It populates this when a user is created.
  // },
  // tenant: {
  //   type: String //Required for Auth0. It populates this when a user is created.
  // },
  // connection: {
  //   type: String //Required for Auth0. It populates this when a user is created.
  // },
  userFirstName: {
    type: String,

  },
  userLastName: {
    type: String,

  },
  email: {
    type: String,

  },
  userPhone: {
    type: String,
 
  },
  password: {
    type: String,
  },
  userAuth0User: {
    type: Object
  },
  setupType: {
    type: String, //roosted or partner or addedAgent
  },
  setupStatus: {
    type: String //selectType, license, partnerInfo, payment, policies, contractorAgreement, transfer
  },
  userType: {
    type: String,
    required: true //admin, user, newUser, broker
  },
  userLegacy: {
    type: String //type before Auth0
  },
  brokerState: {
    type: String //use this to filter their dashboard.
  },
  userAddress: {
    street: {
      type: String,
      default: ''
    },
    unit: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    state: {
      type: String,
      default: ''
    },
    zip: {
      type: String,
      default: ''
    }
  },
  userLicenses: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Licensev2'
    }
  ],
  roostedAgent: {
      stripeSubscriptionId: {
        type: String,
        default: ''
      },
      stripeCustomerId: {
          type: String,
          default: ''
      },
      stripeState: {
        type:  String
      },
      stripeCancelReason: {
        type: String
      },  
      stripeCancelReasonOther: {
        type: String
      },
      promo: {
        type: Object
      },

  },
  partnerAgent: {
    marketingSource: {
      type: String,
      default: 'Not Answered'
    },
    endUserRating: {
      type: Number,
      default: 5
    },
    roostedAgentAdded: {
      type: Boolean,
      default: false
    }
  },
  activityLog: [
      {
          activity: {
              type: String,
          },
          activityDate: {
              type: Date
          }
      }
  ], //track view date on contracts, membership changes, referrals made
  userDemographics: {
      birthday: {
        type: Date
      },
      yearsInBusines: {
        type: Number
      },
  },
  userReferrals: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Referralv2'
    }
  ]
},
{ timestamps: true }  
);

userSchema.index({
  userFirstName: 'text',
  userLastName: 'text',
});

module.exports = mongoose.model('Userv2', userSchema);