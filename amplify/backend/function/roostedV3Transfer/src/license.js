const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const licenseSchema = new Schema({

    licenseUser: {
        type: Schema.Types.ObjectId,
        ref: 'Userv2'
    },
    licenseNumber: {
        type: String,
        default: ''
    },
    licenseState: {
        type: String,
        default: ''
    },
    licenseExpiration: {
        type: Date
    },
    primaryLicense: {
        type: Boolean,
        default: false
    },
    licenseVerificationStatus: {
        type: String, //, waitingOnAgreement, waitingOnTransfer, roostedVerifying unverified, verified, severed, archived, expired, verifiedNoPlan
        default: 'unverified'
    },
    licenseICAPath: {
        type: String, //this is the path to the signed license agreement for that state's license
        default: '' 
    },
    licensePoliciesAndProceduresPath: {
        type: String,
        default: ''
    },
    licenseType: {
        type: String, //roosted or partner or broker
    },
    zipCode: {
        type: String,
        default: ''
    },
    radius: {
        type: String,
        default: '10'
    },
    lowPrice: {
        type: String,
        default: '100,000'
    },
    highPrice: {
        type: String,
        default: '100,000'
    },
    broker: {
        type: String,
        default: ''
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
    ]
}, { timestamps: true }  
);

module.exports = mongoose.model('Licensev2', licenseSchema);