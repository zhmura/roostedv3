/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser($owner: String) {
    onCreateUser(owner: $owner) {
      id
      userFirstName
      userLastName
      email
      userPhone
      password
      setupType
      addedAgentComplete
      addedBrokerComplete
      legacyUser
      legacyUserCompleted
      setupStatus
      navBar
      userType
      brokerState
      userAddress {
        street
        unit
        city
        state
        zip
      }
      userRoostedLicenses {
        items {
          id
          licenseUserID
          licenseNumber
          licenseState
          licenseExpiration
          primaryLicense
          licenseVerificationStatus
          licenseICAPath
          licensePolicyAndProcedurePath
          licenseType
          createdAt
        }
        nextToken
      }
      userPartnerLicenses {
        items {
          id
          licenseUserID
          licenseNumber
          licenseState
          licenseExpiration
          primaryLicense
          licenseVerificationStatus
          licenseContractPath
          licenseType
          zipCode
          radius
          lowPrice
          highPrice
          broker
          createdAt
        }
        nextToken
      }
      roostedAgent {
        stripePaymentIntent
        stripeCustomerSecret
        stripeSubscriptionId
        stripeCustomerId
        stripeProductId
        stripeProductName
        stripeProductPeriod
        stripeState
        stripeCancelReason
        stripeCancelReasonOther
        stripePromoId
      }
      partnerAgent {
        partnerSource
        partnerRating
        partnerAddedAgent
      }
      userSignature
      createdAt
      activityLog {
        activity
        activityDate
      }
      userDemographics {
        birthday
        yearsInBusiness
        title
      }
      userReferralsCreated {
        items {
          id
          referralRoostedAgentID
          referralClientID
          referralState
          referralReferringAgentState
          referralType
          referralStatus
          referralClientStatus
          referralRejectedReason
          referralEstimatedPriceRange
          referralContractValue
          referralRoostedAgentPayoutFormatted
          referralRoostedAgentPayoutLow
          referralRoostedAgentPayoutHigh
          referralRoostedAgentPayoutActual
          referralPartnerPayoutFormatted
          referralPartnerPayoutLow
          referralPartnerPayoutHigh
          referralPartnerPayoutActual
          referralRoostedPayoutFormatted
          referralRoostedPayoutLow
          referralRoostedPayoutHigh
          referralRoostedPayoutActual
          referralPayoutNotification
          referralEstimatedCloseDate
          referralCloseDate
          referralComments
          initialAgentSelection
          referralTimeFrame
          referralPrequalified
          referralPrequalifiedAmount
          referralFeeOffered
          referralCommission
          referralPartnerAgentID
          referralContractPath
          referralRoostedPlanOnCreation
          referralRoostedPlanPeriodOnCreation
          referralRoostedPlanProductIdOnCreation
          referralPartnerShareOnCreation
          createdAt
        }
        nextToken
      }
      userReferralsReceived {
        items {
          id
          referralRoostedAgentID
          referralClientID
          referralState
          referralReferringAgentState
          referralType
          referralStatus
          referralClientStatus
          referralRejectedReason
          referralEstimatedPriceRange
          referralContractValue
          referralRoostedAgentPayoutFormatted
          referralRoostedAgentPayoutLow
          referralRoostedAgentPayoutHigh
          referralRoostedAgentPayoutActual
          referralPartnerPayoutFormatted
          referralPartnerPayoutLow
          referralPartnerPayoutHigh
          referralPartnerPayoutActual
          referralRoostedPayoutFormatted
          referralRoostedPayoutLow
          referralRoostedPayoutHigh
          referralRoostedPayoutActual
          referralPayoutNotification
          referralEstimatedCloseDate
          referralCloseDate
          referralComments
          initialAgentSelection
          referralTimeFrame
          referralPrequalified
          referralPrequalifiedAmount
          referralFeeOffered
          referralCommission
          referralPartnerAgentID
          referralContractPath
          referralRoostedPlanOnCreation
          referralRoostedPlanPeriodOnCreation
          referralRoostedPlanProductIdOnCreation
          referralPartnerShareOnCreation
          createdAt
        }
        nextToken
      }
      userCognitoUsername
      owner
    }
  }
`;
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser($owner: String) {
    onUpdateUser(owner: $owner) {
      id
      userFirstName
      userLastName
      email
      userPhone
      password
      setupType
      addedAgentComplete
      addedBrokerComplete
      legacyUser
      legacyUserCompleted
      setupStatus
      navBar
      userType
      brokerState
      userAddress {
        street
        unit
        city
        state
        zip
      }
      userRoostedLicenses {
        items {
          id
          licenseUserID
          licenseNumber
          licenseState
          licenseExpiration
          primaryLicense
          licenseVerificationStatus
          licenseICAPath
          licensePolicyAndProcedurePath
          licenseType
          createdAt
        }
        nextToken
      }
      userPartnerLicenses {
        items {
          id
          licenseUserID
          licenseNumber
          licenseState
          licenseExpiration
          primaryLicense
          licenseVerificationStatus
          licenseContractPath
          licenseType
          zipCode
          radius
          lowPrice
          highPrice
          broker
          createdAt
        }
        nextToken
      }
      roostedAgent {
        stripePaymentIntent
        stripeCustomerSecret
        stripeSubscriptionId
        stripeCustomerId
        stripeProductId
        stripeProductName
        stripeProductPeriod
        stripeState
        stripeCancelReason
        stripeCancelReasonOther
        stripePromoId
      }
      partnerAgent {
        partnerSource
        partnerRating
        partnerAddedAgent
      }
      userSignature
      createdAt
      activityLog {
        activity
        activityDate
      }
      userDemographics {
        birthday
        yearsInBusiness
        title
      }
      userReferralsCreated {
        items {
          id
          referralRoostedAgentID
          referralClientID
          referralState
          referralReferringAgentState
          referralType
          referralStatus
          referralClientStatus
          referralRejectedReason
          referralEstimatedPriceRange
          referralContractValue
          referralRoostedAgentPayoutFormatted
          referralRoostedAgentPayoutLow
          referralRoostedAgentPayoutHigh
          referralRoostedAgentPayoutActual
          referralPartnerPayoutFormatted
          referralPartnerPayoutLow
          referralPartnerPayoutHigh
          referralPartnerPayoutActual
          referralRoostedPayoutFormatted
          referralRoostedPayoutLow
          referralRoostedPayoutHigh
          referralRoostedPayoutActual
          referralPayoutNotification
          referralEstimatedCloseDate
          referralCloseDate
          referralComments
          initialAgentSelection
          referralTimeFrame
          referralPrequalified
          referralPrequalifiedAmount
          referralFeeOffered
          referralCommission
          referralPartnerAgentID
          referralContractPath
          referralRoostedPlanOnCreation
          referralRoostedPlanPeriodOnCreation
          referralRoostedPlanProductIdOnCreation
          referralPartnerShareOnCreation
          createdAt
        }
        nextToken
      }
      userReferralsReceived {
        items {
          id
          referralRoostedAgentID
          referralClientID
          referralState
          referralReferringAgentState
          referralType
          referralStatus
          referralClientStatus
          referralRejectedReason
          referralEstimatedPriceRange
          referralContractValue
          referralRoostedAgentPayoutFormatted
          referralRoostedAgentPayoutLow
          referralRoostedAgentPayoutHigh
          referralRoostedAgentPayoutActual
          referralPartnerPayoutFormatted
          referralPartnerPayoutLow
          referralPartnerPayoutHigh
          referralPartnerPayoutActual
          referralRoostedPayoutFormatted
          referralRoostedPayoutLow
          referralRoostedPayoutHigh
          referralRoostedPayoutActual
          referralPayoutNotification
          referralEstimatedCloseDate
          referralCloseDate
          referralComments
          initialAgentSelection
          referralTimeFrame
          referralPrequalified
          referralPrequalifiedAmount
          referralFeeOffered
          referralCommission
          referralPartnerAgentID
          referralContractPath
          referralRoostedPlanOnCreation
          referralRoostedPlanPeriodOnCreation
          referralRoostedPlanProductIdOnCreation
          referralPartnerShareOnCreation
          createdAt
        }
        nextToken
      }
      userCognitoUsername
      owner
    }
  }
`;
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser($owner: String) {
    onDeleteUser(owner: $owner) {
      id
      userFirstName
      userLastName
      email
      userPhone
      password
      setupType
      addedAgentComplete
      addedBrokerComplete
      legacyUser
      legacyUserCompleted
      setupStatus
      navBar
      userType
      brokerState
      userAddress {
        street
        unit
        city
        state
        zip
      }
      userRoostedLicenses {
        items {
          id
          licenseUserID
          licenseNumber
          licenseState
          licenseExpiration
          primaryLicense
          licenseVerificationStatus
          licenseICAPath
          licensePolicyAndProcedurePath
          licenseType
          createdAt
        }
        nextToken
      }
      userPartnerLicenses {
        items {
          id
          licenseUserID
          licenseNumber
          licenseState
          licenseExpiration
          primaryLicense
          licenseVerificationStatus
          licenseContractPath
          licenseType
          zipCode
          radius
          lowPrice
          highPrice
          broker
          createdAt
        }
        nextToken
      }
      roostedAgent {
        stripePaymentIntent
        stripeCustomerSecret
        stripeSubscriptionId
        stripeCustomerId
        stripeProductId
        stripeProductName
        stripeProductPeriod
        stripeState
        stripeCancelReason
        stripeCancelReasonOther
        stripePromoId
      }
      partnerAgent {
        partnerSource
        partnerRating
        partnerAddedAgent
      }
      userSignature
      createdAt
      activityLog {
        activity
        activityDate
      }
      userDemographics {
        birthday
        yearsInBusiness
        title
      }
      userReferralsCreated {
        items {
          id
          referralRoostedAgentID
          referralClientID
          referralState
          referralReferringAgentState
          referralType
          referralStatus
          referralClientStatus
          referralRejectedReason
          referralEstimatedPriceRange
          referralContractValue
          referralRoostedAgentPayoutFormatted
          referralRoostedAgentPayoutLow
          referralRoostedAgentPayoutHigh
          referralRoostedAgentPayoutActual
          referralPartnerPayoutFormatted
          referralPartnerPayoutLow
          referralPartnerPayoutHigh
          referralPartnerPayoutActual
          referralRoostedPayoutFormatted
          referralRoostedPayoutLow
          referralRoostedPayoutHigh
          referralRoostedPayoutActual
          referralPayoutNotification
          referralEstimatedCloseDate
          referralCloseDate
          referralComments
          initialAgentSelection
          referralTimeFrame
          referralPrequalified
          referralPrequalifiedAmount
          referralFeeOffered
          referralCommission
          referralPartnerAgentID
          referralContractPath
          referralRoostedPlanOnCreation
          referralRoostedPlanPeriodOnCreation
          referralRoostedPlanProductIdOnCreation
          referralPartnerShareOnCreation
          createdAt
        }
        nextToken
      }
      userReferralsReceived {
        items {
          id
          referralRoostedAgentID
          referralClientID
          referralState
          referralReferringAgentState
          referralType
          referralStatus
          referralClientStatus
          referralRejectedReason
          referralEstimatedPriceRange
          referralContractValue
          referralRoostedAgentPayoutFormatted
          referralRoostedAgentPayoutLow
          referralRoostedAgentPayoutHigh
          referralRoostedAgentPayoutActual
          referralPartnerPayoutFormatted
          referralPartnerPayoutLow
          referralPartnerPayoutHigh
          referralPartnerPayoutActual
          referralRoostedPayoutFormatted
          referralRoostedPayoutLow
          referralRoostedPayoutHigh
          referralRoostedPayoutActual
          referralPayoutNotification
          referralEstimatedCloseDate
          referralCloseDate
          referralComments
          initialAgentSelection
          referralTimeFrame
          referralPrequalified
          referralPrequalifiedAmount
          referralFeeOffered
          referralCommission
          referralPartnerAgentID
          referralContractPath
          referralRoostedPlanOnCreation
          referralRoostedPlanPeriodOnCreation
          referralRoostedPlanProductIdOnCreation
          referralPartnerShareOnCreation
          createdAt
        }
        nextToken
      }
      userCognitoUsername
      owner
    }
  }
`;
export const onCreateRoostedLicense = /* GraphQL */ `
  subscription OnCreateRoostedLicense($licenseUserID: String) {
    onCreateRoostedLicense(licenseUserID: $licenseUserID) {
      id
      licenseUserID
      licenseUser {
        id
        userFirstName
        userLastName
        email
        userPhone
        password
        setupType
        addedAgentComplete
        addedBrokerComplete
        legacyUser
        legacyUserCompleted
        setupStatus
        navBar
        userType
        brokerState
        userAddress {
          street
          unit
          city
          state
          zip
        }
        userRoostedLicenses {
          nextToken
        }
        userPartnerLicenses {
          nextToken
        }
        roostedAgent {
          stripePaymentIntent
          stripeCustomerSecret
          stripeSubscriptionId
          stripeCustomerId
          stripeProductId
          stripeProductName
          stripeProductPeriod
          stripeState
          stripeCancelReason
          stripeCancelReasonOther
          stripePromoId
        }
        partnerAgent {
          partnerSource
          partnerRating
          partnerAddedAgent
        }
        userSignature
        createdAt
        activityLog {
          activity
          activityDate
        }
        userDemographics {
          birthday
          yearsInBusiness
          title
        }
        userReferralsCreated {
          nextToken
        }
        userReferralsReceived {
          nextToken
        }
        userCognitoUsername
        owner
      }
      licenseNumber
      licenseState
      licenseExpiration
      primaryLicense
      licenseVerificationStatus
      licenseICAPath
      licensePolicyAndProcedurePath
      licenseType
      createdAt
      activityLog {
        activity
        activityDate
      }
    }
  }
`;
export const onUpdateRoostedLicense = /* GraphQL */ `
  subscription OnUpdateRoostedLicense($licenseUserID: String) {
    onUpdateRoostedLicense(licenseUserID: $licenseUserID) {
      id
      licenseUserID
      licenseUser {
        id
        userFirstName
        userLastName
        email
        userPhone
        password
        setupType
        addedAgentComplete
        addedBrokerComplete
        legacyUser
        legacyUserCompleted
        setupStatus
        navBar
        userType
        brokerState
        userAddress {
          street
          unit
          city
          state
          zip
        }
        userRoostedLicenses {
          nextToken
        }
        userPartnerLicenses {
          nextToken
        }
        roostedAgent {
          stripePaymentIntent
          stripeCustomerSecret
          stripeSubscriptionId
          stripeCustomerId
          stripeProductId
          stripeProductName
          stripeProductPeriod
          stripeState
          stripeCancelReason
          stripeCancelReasonOther
          stripePromoId
        }
        partnerAgent {
          partnerSource
          partnerRating
          partnerAddedAgent
        }
        userSignature
        createdAt
        activityLog {
          activity
          activityDate
        }
        userDemographics {
          birthday
          yearsInBusiness
          title
        }
        userReferralsCreated {
          nextToken
        }
        userReferralsReceived {
          nextToken
        }
        userCognitoUsername
        owner
      }
      licenseNumber
      licenseState
      licenseExpiration
      primaryLicense
      licenseVerificationStatus
      licenseICAPath
      licensePolicyAndProcedurePath
      licenseType
      createdAt
      activityLog {
        activity
        activityDate
      }
    }
  }
`;
export const onDeleteRoostedLicense = /* GraphQL */ `
  subscription OnDeleteRoostedLicense($licenseUserID: String) {
    onDeleteRoostedLicense(licenseUserID: $licenseUserID) {
      id
      licenseUserID
      licenseUser {
        id
        userFirstName
        userLastName
        email
        userPhone
        password
        setupType
        addedAgentComplete
        addedBrokerComplete
        legacyUser
        legacyUserCompleted
        setupStatus
        navBar
        userType
        brokerState
        userAddress {
          street
          unit
          city
          state
          zip
        }
        userRoostedLicenses {
          nextToken
        }
        userPartnerLicenses {
          nextToken
        }
        roostedAgent {
          stripePaymentIntent
          stripeCustomerSecret
          stripeSubscriptionId
          stripeCustomerId
          stripeProductId
          stripeProductName
          stripeProductPeriod
          stripeState
          stripeCancelReason
          stripeCancelReasonOther
          stripePromoId
        }
        partnerAgent {
          partnerSource
          partnerRating
          partnerAddedAgent
        }
        userSignature
        createdAt
        activityLog {
          activity
          activityDate
        }
        userDemographics {
          birthday
          yearsInBusiness
          title
        }
        userReferralsCreated {
          nextToken
        }
        userReferralsReceived {
          nextToken
        }
        userCognitoUsername
        owner
      }
      licenseNumber
      licenseState
      licenseExpiration
      primaryLicense
      licenseVerificationStatus
      licenseICAPath
      licensePolicyAndProcedurePath
      licenseType
      createdAt
      activityLog {
        activity
        activityDate
      }
    }
  }
`;
export const onCreatePartnerLicense = /* GraphQL */ `
  subscription OnCreatePartnerLicense($licenseUserID: String) {
    onCreatePartnerLicense(licenseUserID: $licenseUserID) {
      id
      licenseUserID
      licenseUser {
        id
        userFirstName
        userLastName
        email
        userPhone
        password
        setupType
        addedAgentComplete
        addedBrokerComplete
        legacyUser
        legacyUserCompleted
        setupStatus
        navBar
        userType
        brokerState
        userAddress {
          street
          unit
          city
          state
          zip
        }
        userRoostedLicenses {
          nextToken
        }
        userPartnerLicenses {
          nextToken
        }
        roostedAgent {
          stripePaymentIntent
          stripeCustomerSecret
          stripeSubscriptionId
          stripeCustomerId
          stripeProductId
          stripeProductName
          stripeProductPeriod
          stripeState
          stripeCancelReason
          stripeCancelReasonOther
          stripePromoId
        }
        partnerAgent {
          partnerSource
          partnerRating
          partnerAddedAgent
        }
        userSignature
        createdAt
        activityLog {
          activity
          activityDate
        }
        userDemographics {
          birthday
          yearsInBusiness
          title
        }
        userReferralsCreated {
          nextToken
        }
        userReferralsReceived {
          nextToken
        }
        userCognitoUsername
        owner
      }
      licenseNumber
      licenseState
      licenseExpiration
      primaryLicense
      licenseVerificationStatus
      licenseContractPath
      licenseType
      zipCode
      radius
      lowPrice
      highPrice
      broker
      createdAt
      activityLog {
        activity
        activityDate
      }
    }
  }
`;
export const onUpdatePartnerLicense = /* GraphQL */ `
  subscription OnUpdatePartnerLicense($licenseUserID: String) {
    onUpdatePartnerLicense(licenseUserID: $licenseUserID) {
      id
      licenseUserID
      licenseUser {
        id
        userFirstName
        userLastName
        email
        userPhone
        password
        setupType
        addedAgentComplete
        addedBrokerComplete
        legacyUser
        legacyUserCompleted
        setupStatus
        navBar
        userType
        brokerState
        userAddress {
          street
          unit
          city
          state
          zip
        }
        userRoostedLicenses {
          nextToken
        }
        userPartnerLicenses {
          nextToken
        }
        roostedAgent {
          stripePaymentIntent
          stripeCustomerSecret
          stripeSubscriptionId
          stripeCustomerId
          stripeProductId
          stripeProductName
          stripeProductPeriod
          stripeState
          stripeCancelReason
          stripeCancelReasonOther
          stripePromoId
        }
        partnerAgent {
          partnerSource
          partnerRating
          partnerAddedAgent
        }
        userSignature
        createdAt
        activityLog {
          activity
          activityDate
        }
        userDemographics {
          birthday
          yearsInBusiness
          title
        }
        userReferralsCreated {
          nextToken
        }
        userReferralsReceived {
          nextToken
        }
        userCognitoUsername
        owner
      }
      licenseNumber
      licenseState
      licenseExpiration
      primaryLicense
      licenseVerificationStatus
      licenseContractPath
      licenseType
      zipCode
      radius
      lowPrice
      highPrice
      broker
      createdAt
      activityLog {
        activity
        activityDate
      }
    }
  }
`;
export const onDeletePartnerLicense = /* GraphQL */ `
  subscription OnDeletePartnerLicense($licenseUserID: String) {
    onDeletePartnerLicense(licenseUserID: $licenseUserID) {
      id
      licenseUserID
      licenseUser {
        id
        userFirstName
        userLastName
        email
        userPhone
        password
        setupType
        addedAgentComplete
        addedBrokerComplete
        legacyUser
        legacyUserCompleted
        setupStatus
        navBar
        userType
        brokerState
        userAddress {
          street
          unit
          city
          state
          zip
        }
        userRoostedLicenses {
          nextToken
        }
        userPartnerLicenses {
          nextToken
        }
        roostedAgent {
          stripePaymentIntent
          stripeCustomerSecret
          stripeSubscriptionId
          stripeCustomerId
          stripeProductId
          stripeProductName
          stripeProductPeriod
          stripeState
          stripeCancelReason
          stripeCancelReasonOther
          stripePromoId
        }
        partnerAgent {
          partnerSource
          partnerRating
          partnerAddedAgent
        }
        userSignature
        createdAt
        activityLog {
          activity
          activityDate
        }
        userDemographics {
          birthday
          yearsInBusiness
          title
        }
        userReferralsCreated {
          nextToken
        }
        userReferralsReceived {
          nextToken
        }
        userCognitoUsername
        owner
      }
      licenseNumber
      licenseState
      licenseExpiration
      primaryLicense
      licenseVerificationStatus
      licenseContractPath
      licenseType
      zipCode
      radius
      lowPrice
      highPrice
      broker
      createdAt
      activityLog {
        activity
        activityDate
      }
    }
  }
`;
export const onCreateReferral = /* GraphQL */ `
  subscription OnCreateReferral(
    $referralRoostedAgentID: String
    $referralPartnerAgentID: String
  ) {
    onCreateReferral(
      referralRoostedAgentID: $referralRoostedAgentID
      referralPartnerAgentID: $referralPartnerAgentID
    ) {
      id
      referralRoostedAgentID
      referralRoostedAgent {
        id
        userFirstName
        userLastName
        email
        userPhone
        password
        setupType
        addedAgentComplete
        addedBrokerComplete
        legacyUser
        legacyUserCompleted
        setupStatus
        navBar
        userType
        brokerState
        userAddress {
          street
          unit
          city
          state
          zip
        }
        userRoostedLicenses {
          nextToken
        }
        userPartnerLicenses {
          nextToken
        }
        roostedAgent {
          stripePaymentIntent
          stripeCustomerSecret
          stripeSubscriptionId
          stripeCustomerId
          stripeProductId
          stripeProductName
          stripeProductPeriod
          stripeState
          stripeCancelReason
          stripeCancelReasonOther
          stripePromoId
        }
        partnerAgent {
          partnerSource
          partnerRating
          partnerAddedAgent
        }
        userSignature
        createdAt
        activityLog {
          activity
          activityDate
        }
        userDemographics {
          birthday
          yearsInBusiness
          title
        }
        userReferralsCreated {
          nextToken
        }
        userReferralsReceived {
          nextToken
        }
        userCognitoUsername
        owner
      }
      referralClientID
      referralClient {
        id
        clientReferralEmail
        clientReferral {
          nextToken
        }
        clientFirstName
        clientLastName
        clientPhone
        createdAt
      }
      referralState
      referralReferringAgentState
      referralType
      referralStatus
      referralClientStatus
      referralRejectedReason
      referralEstimatedPriceRange
      referralContractValue
      referralRoostedAgentPayoutFormatted
      referralRoostedAgentPayoutLow
      referralRoostedAgentPayoutHigh
      referralRoostedAgentPayoutActual
      referralPartnerPayoutFormatted
      referralPartnerPayoutLow
      referralPartnerPayoutHigh
      referralPartnerPayoutActual
      referralRoostedPayoutFormatted
      referralRoostedPayoutLow
      referralRoostedPayoutHigh
      referralRoostedPayoutActual
      referralPayoutNotification
      referralEstimatedCloseDate
      referralCloseDate
      referralComments
      initialAgentSelection
      referralTimeFrame
      referralAddress {
        street
        unit
        city
        state
        zip
      }
      referralPrequalified
      referralPrequalifiedAmount
      referralFeeOffered
      referralCommission
      referralPartnerAgentID
      referralPartnerAgent {
        id
        userFirstName
        userLastName
        email
        userPhone
        password
        setupType
        addedAgentComplete
        addedBrokerComplete
        legacyUser
        legacyUserCompleted
        setupStatus
        navBar
        userType
        brokerState
        userAddress {
          street
          unit
          city
          state
          zip
        }
        userRoostedLicenses {
          nextToken
        }
        userPartnerLicenses {
          nextToken
        }
        roostedAgent {
          stripePaymentIntent
          stripeCustomerSecret
          stripeSubscriptionId
          stripeCustomerId
          stripeProductId
          stripeProductName
          stripeProductPeriod
          stripeState
          stripeCancelReason
          stripeCancelReasonOther
          stripePromoId
        }
        partnerAgent {
          partnerSource
          partnerRating
          partnerAddedAgent
        }
        userSignature
        createdAt
        activityLog {
          activity
          activityDate
        }
        userDemographics {
          birthday
          yearsInBusiness
          title
        }
        userReferralsCreated {
          nextToken
        }
        userReferralsReceived {
          nextToken
        }
        userCognitoUsername
        owner
      }
      referralContractPath
      referralRoostedPlanOnCreation
      referralRoostedPlanPeriodOnCreation
      referralRoostedPlanProductIdOnCreation
      referralPartnerShareOnCreation
      createdAt
      activityLog {
        activity
        activityDate
      }
    }
  }
`;
export const onUpdateReferral = /* GraphQL */ `
  subscription OnUpdateReferral(
    $referralRoostedAgentID: String
    $referralPartnerAgentID: String
  ) {
    onUpdateReferral(
      referralRoostedAgentID: $referralRoostedAgentID
      referralPartnerAgentID: $referralPartnerAgentID
    ) {
      id
      referralRoostedAgentID
      referralRoostedAgent {
        id
        userFirstName
        userLastName
        email
        userPhone
        password
        setupType
        addedAgentComplete
        addedBrokerComplete
        legacyUser
        legacyUserCompleted
        setupStatus
        navBar
        userType
        brokerState
        userAddress {
          street
          unit
          city
          state
          zip
        }
        userRoostedLicenses {
          nextToken
        }
        userPartnerLicenses {
          nextToken
        }
        roostedAgent {
          stripePaymentIntent
          stripeCustomerSecret
          stripeSubscriptionId
          stripeCustomerId
          stripeProductId
          stripeProductName
          stripeProductPeriod
          stripeState
          stripeCancelReason
          stripeCancelReasonOther
          stripePromoId
        }
        partnerAgent {
          partnerSource
          partnerRating
          partnerAddedAgent
        }
        userSignature
        createdAt
        activityLog {
          activity
          activityDate
        }
        userDemographics {
          birthday
          yearsInBusiness
          title
        }
        userReferralsCreated {
          nextToken
        }
        userReferralsReceived {
          nextToken
        }
        userCognitoUsername
        owner
      }
      referralClientID
      referralClient {
        id
        clientReferralEmail
        clientReferral {
          nextToken
        }
        clientFirstName
        clientLastName
        clientPhone
        createdAt
      }
      referralState
      referralReferringAgentState
      referralType
      referralStatus
      referralClientStatus
      referralRejectedReason
      referralEstimatedPriceRange
      referralContractValue
      referralRoostedAgentPayoutFormatted
      referralRoostedAgentPayoutLow
      referralRoostedAgentPayoutHigh
      referralRoostedAgentPayoutActual
      referralPartnerPayoutFormatted
      referralPartnerPayoutLow
      referralPartnerPayoutHigh
      referralPartnerPayoutActual
      referralRoostedPayoutFormatted
      referralRoostedPayoutLow
      referralRoostedPayoutHigh
      referralRoostedPayoutActual
      referralPayoutNotification
      referralEstimatedCloseDate
      referralCloseDate
      referralComments
      initialAgentSelection
      referralTimeFrame
      referralAddress {
        street
        unit
        city
        state
        zip
      }
      referralPrequalified
      referralPrequalifiedAmount
      referralFeeOffered
      referralCommission
      referralPartnerAgentID
      referralPartnerAgent {
        id
        userFirstName
        userLastName
        email
        userPhone
        password
        setupType
        addedAgentComplete
        addedBrokerComplete
        legacyUser
        legacyUserCompleted
        setupStatus
        navBar
        userType
        brokerState
        userAddress {
          street
          unit
          city
          state
          zip
        }
        userRoostedLicenses {
          nextToken
        }
        userPartnerLicenses {
          nextToken
        }
        roostedAgent {
          stripePaymentIntent
          stripeCustomerSecret
          stripeSubscriptionId
          stripeCustomerId
          stripeProductId
          stripeProductName
          stripeProductPeriod
          stripeState
          stripeCancelReason
          stripeCancelReasonOther
          stripePromoId
        }
        partnerAgent {
          partnerSource
          partnerRating
          partnerAddedAgent
        }
        userSignature
        createdAt
        activityLog {
          activity
          activityDate
        }
        userDemographics {
          birthday
          yearsInBusiness
          title
        }
        userReferralsCreated {
          nextToken
        }
        userReferralsReceived {
          nextToken
        }
        userCognitoUsername
        owner
      }
      referralContractPath
      referralRoostedPlanOnCreation
      referralRoostedPlanPeriodOnCreation
      referralRoostedPlanProductIdOnCreation
      referralPartnerShareOnCreation
      createdAt
      activityLog {
        activity
        activityDate
      }
    }
  }
`;
export const onDeleteReferral = /* GraphQL */ `
  subscription OnDeleteReferral(
    $referralRoostedAgentID: String
    $referralPartnerAgentID: String
  ) {
    onDeleteReferral(
      referralRoostedAgentID: $referralRoostedAgentID
      referralPartnerAgentID: $referralPartnerAgentID
    ) {
      id
      referralRoostedAgentID
      referralRoostedAgent {
        id
        userFirstName
        userLastName
        email
        userPhone
        password
        setupType
        addedAgentComplete
        addedBrokerComplete
        legacyUser
        legacyUserCompleted
        setupStatus
        navBar
        userType
        brokerState
        userAddress {
          street
          unit
          city
          state
          zip
        }
        userRoostedLicenses {
          nextToken
        }
        userPartnerLicenses {
          nextToken
        }
        roostedAgent {
          stripePaymentIntent
          stripeCustomerSecret
          stripeSubscriptionId
          stripeCustomerId
          stripeProductId
          stripeProductName
          stripeProductPeriod
          stripeState
          stripeCancelReason
          stripeCancelReasonOther
          stripePromoId
        }
        partnerAgent {
          partnerSource
          partnerRating
          partnerAddedAgent
        }
        userSignature
        createdAt
        activityLog {
          activity
          activityDate
        }
        userDemographics {
          birthday
          yearsInBusiness
          title
        }
        userReferralsCreated {
          nextToken
        }
        userReferralsReceived {
          nextToken
        }
        userCognitoUsername
        owner
      }
      referralClientID
      referralClient {
        id
        clientReferralEmail
        clientReferral {
          nextToken
        }
        clientFirstName
        clientLastName
        clientPhone
        createdAt
      }
      referralState
      referralReferringAgentState
      referralType
      referralStatus
      referralClientStatus
      referralRejectedReason
      referralEstimatedPriceRange
      referralContractValue
      referralRoostedAgentPayoutFormatted
      referralRoostedAgentPayoutLow
      referralRoostedAgentPayoutHigh
      referralRoostedAgentPayoutActual
      referralPartnerPayoutFormatted
      referralPartnerPayoutLow
      referralPartnerPayoutHigh
      referralPartnerPayoutActual
      referralRoostedPayoutFormatted
      referralRoostedPayoutLow
      referralRoostedPayoutHigh
      referralRoostedPayoutActual
      referralPayoutNotification
      referralEstimatedCloseDate
      referralCloseDate
      referralComments
      initialAgentSelection
      referralTimeFrame
      referralAddress {
        street
        unit
        city
        state
        zip
      }
      referralPrequalified
      referralPrequalifiedAmount
      referralFeeOffered
      referralCommission
      referralPartnerAgentID
      referralPartnerAgent {
        id
        userFirstName
        userLastName
        email
        userPhone
        password
        setupType
        addedAgentComplete
        addedBrokerComplete
        legacyUser
        legacyUserCompleted
        setupStatus
        navBar
        userType
        brokerState
        userAddress {
          street
          unit
          city
          state
          zip
        }
        userRoostedLicenses {
          nextToken
        }
        userPartnerLicenses {
          nextToken
        }
        roostedAgent {
          stripePaymentIntent
          stripeCustomerSecret
          stripeSubscriptionId
          stripeCustomerId
          stripeProductId
          stripeProductName
          stripeProductPeriod
          stripeState
          stripeCancelReason
          stripeCancelReasonOther
          stripePromoId
        }
        partnerAgent {
          partnerSource
          partnerRating
          partnerAddedAgent
        }
        userSignature
        createdAt
        activityLog {
          activity
          activityDate
        }
        userDemographics {
          birthday
          yearsInBusiness
          title
        }
        userReferralsCreated {
          nextToken
        }
        userReferralsReceived {
          nextToken
        }
        userCognitoUsername
        owner
      }
      referralContractPath
      referralRoostedPlanOnCreation
      referralRoostedPlanPeriodOnCreation
      referralRoostedPlanProductIdOnCreation
      referralPartnerShareOnCreation
      createdAt
      activityLog {
        activity
        activityDate
      }
    }
  }
`;
export const onCreateClient = /* GraphQL */ `
  subscription OnCreateClient {
    onCreateClient {
      id
      clientReferralEmail
      clientReferral {
        items {
          id
          referralRoostedAgentID
          referralClientID
          referralState
          referralReferringAgentState
          referralType
          referralStatus
          referralClientStatus
          referralRejectedReason
          referralEstimatedPriceRange
          referralContractValue
          referralRoostedAgentPayoutFormatted
          referralRoostedAgentPayoutLow
          referralRoostedAgentPayoutHigh
          referralRoostedAgentPayoutActual
          referralPartnerPayoutFormatted
          referralPartnerPayoutLow
          referralPartnerPayoutHigh
          referralPartnerPayoutActual
          referralRoostedPayoutFormatted
          referralRoostedPayoutLow
          referralRoostedPayoutHigh
          referralRoostedPayoutActual
          referralPayoutNotification
          referralEstimatedCloseDate
          referralCloseDate
          referralComments
          initialAgentSelection
          referralTimeFrame
          referralPrequalified
          referralPrequalifiedAmount
          referralFeeOffered
          referralCommission
          referralPartnerAgentID
          referralContractPath
          referralRoostedPlanOnCreation
          referralRoostedPlanPeriodOnCreation
          referralRoostedPlanProductIdOnCreation
          referralPartnerShareOnCreation
          createdAt
        }
        nextToken
      }
      clientFirstName
      clientLastName
      clientPhone
      createdAt
    }
  }
`;
export const onUpdateClient = /* GraphQL */ `
  subscription OnUpdateClient {
    onUpdateClient {
      id
      clientReferralEmail
      clientReferral {
        items {
          id
          referralRoostedAgentID
          referralClientID
          referralState
          referralReferringAgentState
          referralType
          referralStatus
          referralClientStatus
          referralRejectedReason
          referralEstimatedPriceRange
          referralContractValue
          referralRoostedAgentPayoutFormatted
          referralRoostedAgentPayoutLow
          referralRoostedAgentPayoutHigh
          referralRoostedAgentPayoutActual
          referralPartnerPayoutFormatted
          referralPartnerPayoutLow
          referralPartnerPayoutHigh
          referralPartnerPayoutActual
          referralRoostedPayoutFormatted
          referralRoostedPayoutLow
          referralRoostedPayoutHigh
          referralRoostedPayoutActual
          referralPayoutNotification
          referralEstimatedCloseDate
          referralCloseDate
          referralComments
          initialAgentSelection
          referralTimeFrame
          referralPrequalified
          referralPrequalifiedAmount
          referralFeeOffered
          referralCommission
          referralPartnerAgentID
          referralContractPath
          referralRoostedPlanOnCreation
          referralRoostedPlanPeriodOnCreation
          referralRoostedPlanProductIdOnCreation
          referralPartnerShareOnCreation
          createdAt
        }
        nextToken
      }
      clientFirstName
      clientLastName
      clientPhone
      createdAt
    }
  }
`;
export const onDeleteClient = /* GraphQL */ `
  subscription OnDeleteClient {
    onDeleteClient {
      id
      clientReferralEmail
      clientReferral {
        items {
          id
          referralRoostedAgentID
          referralClientID
          referralState
          referralReferringAgentState
          referralType
          referralStatus
          referralClientStatus
          referralRejectedReason
          referralEstimatedPriceRange
          referralContractValue
          referralRoostedAgentPayoutFormatted
          referralRoostedAgentPayoutLow
          referralRoostedAgentPayoutHigh
          referralRoostedAgentPayoutActual
          referralPartnerPayoutFormatted
          referralPartnerPayoutLow
          referralPartnerPayoutHigh
          referralPartnerPayoutActual
          referralRoostedPayoutFormatted
          referralRoostedPayoutLow
          referralRoostedPayoutHigh
          referralRoostedPayoutActual
          referralPayoutNotification
          referralEstimatedCloseDate
          referralCloseDate
          referralComments
          initialAgentSelection
          referralTimeFrame
          referralPrequalified
          referralPrequalifiedAmount
          referralFeeOffered
          referralCommission
          referralPartnerAgentID
          referralContractPath
          referralRoostedPlanOnCreation
          referralRoostedPlanPeriodOnCreation
          referralRoostedPlanProductIdOnCreation
          referralPartnerShareOnCreation
          createdAt
        }
        nextToken
      }
      clientFirstName
      clientLastName
      clientPhone
      createdAt
    }
  }
`;
