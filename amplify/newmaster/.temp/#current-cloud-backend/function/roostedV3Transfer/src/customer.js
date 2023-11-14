const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema({
  customerFirstName: {
    type: String,
    required: true
  },
  customerLastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: false
  },
  userReferrals: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Referralsv2'
    }
  ]
},
{ timestamps: true }  
);

customerSchema.index({
  customerFirstName: 'text',
  customerLastName: 'text',
});

module.exports = mongoose.model('Customerv2', customerSchema);