/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
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
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;
export const getRoostedLicense = /* GraphQL */ `
  query GetRoostedLicense($id: ID!) {
    getRoostedLicense(id: $id) {
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
export const listRoostedLicenses = /* GraphQL */ `
  query ListRoostedLicenses(
    $filter: ModelRoostedLicenseFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listRoostedLicenses(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
          userSignature
          createdAt
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
      nextToken
    }
  }
`;
export const getPartnerLicense = /* GraphQL */ `
  query GetPartnerLicense($id: ID!) {
    getPartnerLicense(id: $id) {
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
export const listPartnerLicenses = /* GraphQL */ `
  query ListPartnerLicenses(
    $filter: ModelPartnerLicenseFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPartnerLicenses(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
          userSignature
          createdAt
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
      nextToken
    }
  }
`;
export const getReferral = /* GraphQL */ `
  query GetReferral($id: ID!) {
    getReferral(id: $id) {
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
export const listReferrals = /* GraphQL */ `
  query ListReferrals(
    $filter: ModelReferralFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listReferrals(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
          userSignature
          createdAt
          userCognitoUsername
          owner
        }
        referralClientID
        referralClient {
          id
          clientReferralEmail
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
          userSignature
          createdAt
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
      nextToken
    }
  }
`;
export const getClient = /* GraphQL */ `
  query GetClient($id: ID!) {
    getClient(id: $id) {
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
export const listClients = /* GraphQL */ `
  query ListClients(
    $filter: ModelClientFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listClients(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;
export const usersByEmail = /* GraphQL */ `
  query UsersByEmail(
    $email: ID
    $sortDirection: ModelSortDirection
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    usersByEmail(
      email: $email
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;
