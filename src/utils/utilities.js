export const updateObject = (oldObject, updatedProperties) => {
    return {
        ...oldObject,
        ...updatedProperties
    };
};

export const formatPhoneNumberToString = (number) => {
    let areaCode = number.slice(1,4);
    let preFix = number.slice(6,9);
    let lineNumber = number.slice(10,14);
    let phone = areaCode + preFix + lineNumber;
      return phone;
}

export const formatPhoneNumber = (number) => {
    let areaCode = number.slice(0,3);
    let preFix = number.slice(3,6);
    let lineNumber = number.slice(6);
    let phone = '(' + areaCode + ') ' + preFix + '-' + lineNumber;
    
      return phone;
}

export const convertDollarToString = (number) => {
    const numberInput = number;
    const removeDollar = numberInput.replace("$","");
    const removeComma = removeDollar.replace(",","")

    return removeComma
}

export const getStatesByAgentType = (type) => {
    if(type === 'roosted') {
        return ['AZ','CA'];
    } else if(type === 'partner') {
        return ["AL", "AK", "AZ", "AR", "CA","CO","CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS",
    "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY","NC", "ND",
    "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
    } else if(type === 'all') {
        return ["AL", "AK", "AZ", "AR", "CA","CO","CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS",
        "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY","NC", "ND",
        "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
    }

}

export const numberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const getTimeFrames = () => {
    return [
        'Less Than 30 Days',
        '30 to 60 Days',
        '60 to 90 Days',
        'Greater than 90 Days',
        'Unkown'
      ]
}

export const getPriceRanges = () => {
    return [
        'Under $100k',
        '$100k - $300k',
        '$300k - $600k',
        '$600k - $1MM',
        '$1MM - $3MM',
        '$3MM - $5MM+'
      ]
}

//calculate the agents share of their plan
export const agentShareByPlan = (planName, planPeriod, planId) => {
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

//calculate the agents share of their plan
export const agentPartnerShare = () => {
    return 0.95
}

export const getPlanData = (planName, planPeriod) => {
    if(planName === 'nest' && planPeriod === 'monthly') {
        return {name: 'Nest', period: 'Monthly', split: '50/50', price: '$0'}
    }
    if(planName === 'nest' && planPeriod === 'annual') {
        return {name: 'Nest', period: 'Annual', split: '50/50', price: '$0'}
    }
    if(planName === 'perch' && planPeriod === 'monthly') {
        return {name: 'Perch', period: 'Monthly', split: '70/30', price: '$9'}
    }
    if(planName === 'perch' && planPeriod === 'annual') {
        return {name: 'Perch', period: 'Annual', split: '70/30', price: '$6'}
    }
    if(planName === 'flight' && planPeriod === 'monthly') {
        return {name: 'Flight', period: 'Monthly', split: '90/10', price: '$19'}
    }
    if(planName === 'flight' && planPeriod === 'annual') {
        return {name: 'Flight', period: 'Annual', split: '90/10', price: '$12'}
    }
}


//method to calculate estimated payouts based on price range 
export const estimatePayout = (partyBeingPaid, commission, referralFee, agentPlan, priceRange) => {
  
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

export const getActualPayout = (partyBeingPaid, contractValue, commission, agentShare, referralFee) => {
    console.log(contractValue, commission, agentShare, referralFee)
    if(partyBeingPaid === 'roosted') {
        return parseFloat(((contractValue * commission) * referralFee * (1 - agentShare)).toFixed(0))
    } else if(partyBeingPaid === 'roostedAgent') {
        return parseFloat(((contractValue * commission) * referralFee * (agentShare)).toFixed(0))
    } else if(partyBeingPaid === 'partnerAgent') {
        return parseFloat(((contractValue * commission) * (1 - referralFee)).toFixed(0))
    }

}


//buyers: new, clientContacted, agreementSigned, touring, underContract, clientLost, closed; sellers: new, clientContacted, agreementSigned, listed, reviewingOffers, underContract, clientLost, closed
export const getClientStatusStepsObject = (step) => {
    const statusObject = 
        {
            new: 'New', 
            clientContacted: 'Client Contacted', 
            agreementSignedBuyer: 'Buyer Agreement Signed', 
            agreementSignedSeller: 'Listing Agreement Signed',
            touring: 'Touring', 
            underContract: 'Under Contract', 
            clientLost: 'Client Lost',
            closed: 'Closed',
            listed: 'Home Listed',
            reviewingOffers: 'Reviewing Offers',
        }
    return statusObject[step]
  
}

export const getClientStatusStepsObjectArray = (type) => {
    let statusObjectArray = []

    if(type === 'buyerReferral') {
        statusObjectArray = [
            {name: 'New', value: 'new'},
            {name: 'Client Contacted', value: 'clientContacted'},
            {name: 'Buyer Agreement Signed', value: 'agreementSignedBuyer'},
            {name: 'Touring', value: 'touring'},
            {name: 'Under Contract', value: 'underContract'},
            {name: 'Closed', value: 'closed'},
            {name: 'Client Lost', value: 'clientLost'}
        ]
    } else if(type === 'sellerReferral') {
        statusObjectArray = [
            {name: 'New', value: 'new'},
            {name: 'Client Contacted', value: 'clientContacted'},
            {name: 'Listing Agreement Signed', value: 'agreementSignedSeller'},
            {name: 'Listed', value: 'listed'},
            {name: 'Under Contract', value: 'underContract'},
            {name: 'Closed', value: 'closed'},
            {name: 'Client Lost', value: 'clientLost'}
        ]
    } else if(type === 'clientLost') {
        statusObjectArray = [
            {name: 'New', value: 'new'},
            {name: 'Client Contacted', value: 'clientContacted'},
            {name: 'Client Lost', value: 'clientLost'}
        ]
    }
    return statusObjectArray
  
}

export const getClientStatusStepsObjectColor = (step) => {
    const statusObject = 
        {
            new: '#0F3164', 
            clientContacted: '#EF6C00', 
            agreementSignedBuyer: '#388E3C', 
            agreementSignedSeller: '#388E3C', 
            touring: '#388E3C', 
            underContract: '#1CA6FC', 
            clientLost: '#212121',
            closed: '#757575',
            listed: '#388E3C',
            reviewingOffers: '#388E3C',
        }
    return statusObject[step]
  
}

export const getClientStatusStepArray = (type) => {
    if(type === 'buyerReferral') {
        return ['New', 'Client Contacted', 'Buyer Agreement Signed', 'Touring', 'Under Contract', 'Closed']
    } else if(type === 'sellerReferral') {
        return ['New', 'Client Contacted', 'Listing Agreement Signed', 'Listed', 'Under Contract', 'Closed']
    } else if(type === 'clientLost') {
        return ['New', 'Client Contacted', 'Client Lost']
    }
}

//waitingForAgentAssignment, pending, accepted, rejected, closed, clientLost, deleted 
export const getReferralStatusStepsObject = (step) => {
    const statusObject = 
        {
            waitingForAgentAssignment: 'Waiting for Agent Assignment', 
            pending: 'Pending Acceptance by Agent', 
            accepted: 'Accepted', 
            declined: 'Declined', 
            clientLost: 'Client Lost', 
            deleted: 'Deleted', 
            closed: 'Closed'
        }
    return statusObject[step]
  
}

export const getReferralStatusStepsObjectColor = (step) => {
    const statusObject = 
        {
            waitingForAgentAssignment: '#757575',
            pending: '#EF6C00', 
            accepted: '#388E3C', 
            declined: '#C62828', 
            clientLost: '#212121', 
            deleted: '#C62828',
            closed: '#757575',
        }
    return statusObject[step]
  
}

export const getMonths = () => {
    return [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ]
}

export const getYears = () => {
    return [
        '2022', '2021', '2020', '2019'
      ]
}

//unverified, verified, waitingOnPayment, waitingOnPolicies, waitingOnICA, waitingOnTransfer, waitingOnRoosted, severed, deleted
export const getLicenseStatusStepsObject = (status) => {
    const statusObject = 
        {
            unverified: 'Unverified', 
            verified: 'Verified', 
            waitingOnPayment: 'Waiting on Agent to Pay', 
            waitingOnPolicies: 'Waiting on Policies', 
            waitingOnICA: 'Waiting on ICA', 
            waitingOnTransfer: 'Waiting on Agent to Transfer',
            waitingOnRoosted: 'Waiting on Roosted to Verify',
            waitingOnPartnerInfo: 'Waiting on Partner Info',
            severed: 'Severed',
            deleted: 'Deleted'
        }
    return statusObject[status]
  
}

export const getLicenseStatusStepsObjectColor = (status) => {
    const statusObject = 
        {
            unverified: '#C62828', 
            verified: '#388E3C', 
            waitingOnPayment: '#EF6C00', 
            waitingOnPolicies: '#EF6C00', 
            waitingOnICA: '#EF6C00', 
            waitingOnTransfer: '#EF6C00',
            waitingOnRoosted: '#757575',
            waitingOnPartnerInfo: '#EF6C00',
            severed: '#C62828',
            deleted: '#C62828'
        }
    return statusObject[status]
  
}

///Check before use this if I've changed it everywhere 
export const getDefaultReferralFee = (agentType) => {
    if('partnerAgent') {
        return 35
    } else {
        return 35
    }
}

//user the output on this on <array>.sort(<field to sort>, 'asc/desc')
export const compareValues = (key, order = 'asc') => {
    return function innerSort(a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        // property doesn't exist on either object
        return 0;
      }
      console.log("here")
      const varA = (typeof a[key].userLastName === 'string')
        ? a[key].userLastName.toUpperCase() : a[key];
      const varB = (typeof b[key].userLastName === 'string')
        ? b[key].userLastName.toUpperCase() : b[key];
  
      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return (
        (order === 'desc') ? (comparison * -1) : comparison
      );
    };
  }

//export a roosted email address for a sendgrid call
export const getRoostedEmail = (state, type) => {

    if(type === 'flock') {
        if(state === 'AZ') {
            return process.env.REACT_APP_EMAIL_FLOCK_AZ
        } else {
            return process.env.REACT_APP_EMAIL_FLOCK
        }
    } else if(type === 'support') {
        if(state === 'AZ') {
            return process.env.REACT_APP_EMAIL_SUPPORT_AZ
        } else {
            return process.env.REACT_APP_EMAIL_SUPPORT
        }
    } else if(type === 'referral') {
        if(state === 'AZ') {
            return process.env.REACT_APP_EMAIL_REFERRAL_AZ
        } else {
            return process.env.REACT_APP_EMAIL_REFERRAL
        }
    } else if(type === 'broker') {
        if(state === 'AZ') {
            return process.env.REACT_APP_EMAIL_BROKER_AZ
        } else {
            return process.env.REACT_APP_EMAIL_BROKER
        }
    } else {
        return process.env.REACT_APP_EMAIL_SUPPORT
    }
}

//export a roosted email address for a sendgrid call
export const getRoostedData = (state) => {
    let roostedData = {roostedLicenseNumber: 'Unknown', stateDRELink: 'Unknown'}
    if(state === 'AZ') {
        roostedData.roostedLicenseNumber = 'LC685364000'
        roostedData.stateDRELink = 'https://ptl.az.gov/app/dre/'
    } else {
        return roostedData
    }
    return roostedData
}

//export a w9 link for partner emails
export const getW9Link = (state) => {
    if(state === 'AZ') {
        return 'https://roostedagreements.s3-us-west-2.amazonaws.com/AZRoostedW9.pdf'
    } else {
        return 'linkNotFound'
    }
}