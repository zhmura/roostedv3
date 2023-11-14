const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const referralSchema = new Schema(
  {
    referralCustomer: {
        type: Schema.Types.ObjectId,
        ref: 'Customerv2'
    },
    referralState: { 
        type: String,
    },
    referralReferringAgentState: {
        type: String
    },
    referralType: {
        type: String,
        required: false, //buyerReferral or sellerReferral
    },
    referralStatus: {
        type: String,
        default: 'pending' //pending, accepted, rejected, closed, deleted, lost, assigningAgent
    },
    referralClientStatus: {
        type: String,
        default: 'notContacted' //new, notContacted, contacted, touring, listing, offerReview, underContract, lost, closed, 
    },
    referralRejectedReason: {
        type: String,
    },
    referralEstimatedPriceRange: {
        type: String,
        default: 'Unknown'
    },
    referralContractValue: {
        type: Number,
        default: 0
    },
    referralFinalPayout: { //this is how much the roosted agent made
        type: Number
    },
    referralPartnerPayout: { //this is how much the partner made
        type: Number
    },
    referralRoostedPayout: { //this is how much the company made
        type: Number
    },
    referralCloseDate: {
        type: Date,
    },
    referralComments: {
        type: String,
        default: ''
    },
    whoSelectsAgent: { //this can change over time
        type: String
    },
    roostedSelectsAgent: { //this is for record keeping based on the initial selection
        type: String
    },
    referralTimeFrame: {
        type: String,
        default: 'Less Than 30 Days'
    },
    referralAddress: {
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
            default: 'AZ'
        },
        zip: { 
            type: String,
            default: ''
        }, 
    },
    referralPrequalified: {
        type: String,
    },
    referralCommissionOffered: {
        type: Number,
        default: 35
    },
    referralTotalCommission: {
        type: Number,
        default: 3
    },
    referralAssignedAgent: {
        type: Schema.Types.ObjectId,
        ref: 'Userv2'
    },
    referralReferringAgent: {
        type: Schema.Types.ObjectId,
        ref: 'Userv2'
    },
    referralContractPath: {
        type: String,
        default: '' //path to the signed referral contract
    },
    referralUserPlanOnCreation: {
        type: Object,
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
    ], //track changes on contracts, viewing referral agreements, etc...
  }, { timestamps: true }  
);

module.exports = mongoose.model('Referralv2', referralSchema);