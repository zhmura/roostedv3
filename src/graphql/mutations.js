/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
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
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
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
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
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
export const createRoostedLicense = /* GraphQL */ `
  mutation CreateRoostedLicense(
    $input: CreateRoostedLicenseInput!
    $condition: ModelRoostedLicenseConditionInput
  ) {
    createRoostedLicense(input: $input, condition: $condition) {
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
export const updateRoostedLicense = /* GraphQL */ `
  mutation UpdateRoostedLicense(
    $input: UpdateRoostedLicenseInput!
    $condition: ModelRoostedLicenseConditionInput
  ) {
    updateRoostedLicense(input: $input, condition: $condition) {
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
export const deleteRoostedLicense = /* GraphQL */ `
  mutation DeleteRoostedLicense(
    $input: DeleteRoostedLicenseInput!
    $condition: ModelRoostedLicenseConditionInput
  ) {
    deleteRoostedLicense(input: $input, condition: $condition) {
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
export const createPartnerLicense = /* GraphQL */ `
  mutation CreatePartnerLicense(
    $input: CreatePartnerLicenseInput!
    $condition: ModelPartnerLicenseConditionInput
  ) {
    createPartnerLicense(input: $input, condition: $condition) {
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
export const updatePartnerLicense = /* GraphQL */ `
  mutation UpdatePartnerLicense(
    $input: UpdatePartnerLicenseInput!
    $condition: ModelPartnerLicenseConditionInput
  ) {
    updatePartnerLicense(input: $input, condition: $condition) {
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
export const deletePartnerLicense = /* GraphQL */ `
  mutation DeletePartnerLicense(
    $input: DeletePartnerLicenseInput!
    $condition: ModelPartnerLicenseConditionInput
  ) {
    deletePartnerLicense(input: $input, condition: $condition) {
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
export const createReferral = /* GraphQL */ `
  mutation CreateReferral(
    $input: CreateReferralInput!
    $condition: ModelReferralConditionInput
  ) {
    createReferral(input: $input, condition: $condition) {
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
export const updateReferral = /* GraphQL */ `
  mutation UpdateReferral(
    $input: UpdateReferralInput!
    $condition: ModelReferralConditionInput
  ) {
    updateReferral(input: $input, condition: $condition) {
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
export const deleteReferral = /* GraphQL */ `
  mutation DeleteReferral(
    $input: DeleteReferralInput!
    $condition: ModelReferralConditionInput
  ) {
    deleteReferral(input: $input, condition: $condition) {
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
export const createClient = /* GraphQL */ `
  mutation CreateClient(
    $input: CreateClientInput!
    $condition: ModelClientConditionInput
  ) {
    createClient(input: $input, condition: $condition) {
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
export const updateClient = /* GraphQL */ `
  mutation UpdateClient(
    $input: UpdateClientInput!
    $condition: ModelClientConditionInput
  ) {
    updateClient(input: $input, condition: $condition) {
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
export const deleteClient = /* GraphQL */ `
  mutation DeleteClient(
    $input: DeleteClientInput!
    $condition: ModelClientConditionInput
  ) {
    deleteClient(input: $input, condition: $condition) {
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
