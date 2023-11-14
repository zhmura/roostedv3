/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import React, { lazy } from 'react';
// import { Navigate } from 'react-router-dom';
import { Redirect  } from 'react-router-dom';
import ErrorLayout from './layouts/Error';
import DashboardLayout from './layouts/Dashboard';
import HomeView from './views/Home';

export default [
  {
    path: '/',
    exact: true,
    component: () => <Redirect to="/home" />
  },
  {
    path: '/errors',
    component: ErrorLayout,
    routes: [
      {
        path: '/errors/error-401',
        exact: true,
        component: lazy(() => import('src/views/Error401'))
      },
      {
        path: '/errors/error-404',
        exact: true,
        component: lazy(() => import('src/views/Error404'))
      },
      {
        path: '/errors/error-500',
        exact: true,
        component: lazy(() => import('src/views/Error500'))
      },
      {
        component: () => <Redirect to="/errors/error-404" />
      }
    ]
  },
  {
    route: '*',
    component: DashboardLayout,
    routes: [
      {
        path: '/dashboard/admin/referral-metrics',
        exact: true,
        component: lazy(() => import('src/views/AdminDashboardReferrals'))
      },
      {
        path: '/dashboard/roosted/referral-metrics',
        exact: true,
        component: lazy(() => import('src/views/DashboardRoosted'))
      },
      {
        path: '/dashboard/partner/referral-metrics',
        exact: true,
        component: lazy(() => import('src/views/DashboardPartner'))
      },
      {
        path: '/manage-referrals-sent',
        exact: true,
        component: lazy(() => import('src/views/ReferralsRoostedManage'))
      },
      {
        path: '/manage-referrals-received',
        exact: true,
        component: lazy(() => import('src/views/ReferralsPartnerManage'))
      },
      {
        path: '/manage-referrals-admin',
        exact: true,
        component: lazy(() => import('src/views/AdminReferralsManage'))
      },
      {
        path: '/continuing-education',
        exact: true,
        component: lazy(() => import('src/views/ContinuingEducation'))
      },
      //License routes
      {
        path: '/license/roosted',
        exact: true,
        component: lazy(() => import('src/views/LicenseRoostedManage'))
      },
      {
        path: '/license/admin/roosted',
        exact: true,
        component: lazy(() => import('src/views/AdminLicenseManageRoosted'))
      },
      {
        path: '/license/partner',
        exact: true,
        component: lazy(() => import('src/views/LicensePartnerManage'))
      },
      {
        path: '/license/admin/partner',
        exact: true,
        component: lazy(() => import('src/views/AdminLicenseManagePartner'))
      },
      {
        path: '/license/create',
        exact: true,
        component: lazy(() => import('src/views/LicenseCreate'))
      },
      {
        path: '/license/sign-policies',
        exact: true,
        component: lazy(() => import('src/views/LicenseCreateSignPolicies'))
      },
      {
        path: '/license/sign-ica',
        exact: true,
        component: lazy(() => import('src/views/LicenseCreateSignICA'))
      },
      {
        path: '/license/transfer-license',
        exact: true,
        component: lazy(() => import('src/views/LicenseCreateTransfer'))
      },
      {
        path: '/license/partner-info',
        exact: true,
        component: lazy(() => import('src/views/LicenseCreatePartnerInfo'))
      },
      {
        path: '/license/get-payment-info',
        exact: true,
        component: lazy(() => import('src/views/LicenseCreateGetPaymentInfo'))
      },
      {
        path: '/license/edit/partner/:id',
        exact: true,
        component: lazy(() => import('src/views/LicenseEditPartner'))
      },
      {
        path: '/license/edit/roosted/:id',
        exact: true,
        component: lazy(() => import('src/views/LicenseEditRoosted'))
      },
      {
        path: '/license/edit/admin/roosted/:id',
        exact: true,
        component: lazy(() => import('src/views/AdminLicenseEditRoosted'))
      },
      {
        path: '/license/edit/admin/partner/:id',
        exact: true,
        component: lazy(() => import('src/views/AdminLicenseEditPartner'))
      },
      //Settings routes
      {
        path: '/settings/profile',
        exact: true,
        component: lazy(() => import('src/views/SettingsProfile'))
      },
      {
        path: '/settings/billing',
        exact: true,
        component: lazy(() => import('src/views/SettingsBilling'))
      },
      {
        path: '/settings/sign-ica',
        exact: true,
        component: lazy(() => import('src/views/SettingsSignICA'))
      },
      //NEW USER ROUTES
      {
        path: '/setup/select-type',
        exact: true,
        component: lazy(() => import('src/views/SetupSelectUserType'))
      },
      {
        path: '/setup/get-license-info',
        exact: true,
        component: lazy(() => import('src/views/SetupGetLicenseInfo'))
      },
      {
        path: '/setup/get-partner-info',
        exact: true,
        component: lazy(() => import('src/views/SetupGetPartnerInfo'))
      },
      {
        path: '/setup/get-payment-info',
        exact: true,
        component: lazy(() => import('src/views/SetupGetPaymentInfo'))
      },
      {
        path: '/setup/sign-policies',
        exact: true,
        component: lazy(() => import('src/views/SetupSignPolicies'))
      },
      {
        path: '/setup/sign-ica',
        exact: true,
        component: lazy(() => import('src/views/SetupSignICA'))
      },
      {
        path: '/setup/transfer-license',
        exact: true,
        component: lazy(() => import('src/views/SetupTransferLicense'))
      },
      //Referral Routes
      {
        path: '/referrals/create/select-type',
        exact: true,
        component: lazy(() => import('src/views/ReferralsCreateSelectType'))
      },
      {
        path: '/referrals/create/admin/select-type',
        exact: true,
        component: lazy(() => import('src/views/AdminReferralsCreateSelectType'))
      },
      {
        path: '/referrals/create/get-client-info',
        exact: true,
        component: lazy(() => import('src/views/ReferralsCreateGetClientInfo'))
      },
      {
        path: '/referrals/create/admin/get-client-info',
        exact: true,
        component: lazy(() => import('src/views/AdminReferralsCreateGetClientInfo'))
      },
      {
        path: '/referrals/create/buyer-referral',
        exact: true,
        component: lazy(() => import('src/views/ReferralsCreateBuyerReferral'))
      },
      {
        path: '/referrals/create/seller-referral',
        exact: true,
        component: lazy(() => import('src/views/ReferralsCreateSellerReferral'))
      },
      {
        path: '/referrals/create/select-buy-agent',
        exact: true,
        component: lazy(() => import('src/views/ReferralsSelectBuyAgent'))
      },
      {
        path: '/referrals/create/select-sell-agent',
        exact: true,
        component: lazy(() => import('src/views/ReferralsSelectSellAgent'))
      },
      {
        path: '/referrals/create/complete-buy-referral',
        exact: true,
        component: lazy(() => import('src/views/ReferralsCompleteBuyReferral'))
      },
      {
        path: '/referrals/create/complete-sell-referral',
        exact: true,
        component: lazy(() => import('src/views/ReferralsCompleteSellerReferral'))
      },
      {
        path: '/referrals/create/admin/buyer-referral',
        exact: true,
        component: lazy(() => import('src/views/AdminReferralsCreateBuyerReferral'))
      },
      {
        path: '/referrals/create/select-from-network-buy',
        exact: true,
        component: lazy(() => import('src/views/ReferralsBuyerAgentRoostedNetwork'))
      },
      {
        path: '/referrals/create/select-from-network-sell',
        exact: true,
        component: lazy(() => import('src/views/ReferralsSellerAgentRoostedNetwork'))
      },
      {
        path: '/referrals/create/admin/select-buy-agent',
        exact: true,
        component: lazy(() => import('src/views/AdminReferralsSelectBuyAgent'))
      },
      {
        path: '/referrals/create/admin/complete-buy-referral',
        exact: true,
        component: lazy(() => import('src/views/AdminReferralsCompleteBuyReferral'))
      },
      {
        path: '/referrals/create/admin/seller-referral',
        exact: true,
        component: lazy(() => import('src/views/AdminReferralsCreateSellerReferral'))
      },
      {
        path: '/referrals/create/admin/select-sell-agent',
        exact: true,
        component: lazy(() => import('src/views/AdminReferralsSelectSellAgent'))
      },
      {
        path: '/referrals/create/admin/complete-sell-referral',
        exact: true,
        component: lazy(() => import('src/views/AdminReferralsCompleteSellerReferral'))
      },
      {
        path: '/referrals/create/admin/select-from-network-buy',
        exact: true,
        component: lazy(() => import('src/views/AdminReferralsBuyerAgentRoostedNetwork'))
      },
      {
        path: '/referrals/create/admin/select-from-network-sell',
        exact: true,
        component: lazy(() => import('src/views/AdminReferralsSellerAgentRoostedNetwork'))
      },
      {
        path: '/referrals/details/roosted/:referralId/:currentTab',
        exact: true,
        component: lazy(() => import('src/views/ReferralsEditRoosted'))
      },
      {
        path: '/referrals/details/partner/:referralId/:currentTab',
        exact: true,
        component: lazy(() => import('src/views/ReferralsEditPartner'))
      },
      {
        path: '/referrals/details/broker/:referralId/:currentTab',
        exact: true,
        component: lazy(() => import('src/views/AdminReferralsEdit'))
      },
      {
        path: '/referrals/details/accept/:referralId',
        exact: true,
        component: lazy(() => import('src/views/ReferralsEditPartnerAccept'))
      },
      //USER ROUTES
      {
        path: '/users/admin',
        exact: true,
        component: lazy(() => import('src/views/AdminUserManage'))
      },
      {
        path: '/users/create/broker',
        exact: true,
        component: lazy(() => import('src/views/AdminUserCreateBroker'))
      },
      {
        path: '/users/admin/edit/:id',
        exact: true,
        component: lazy(() => import('src/views/AdminUserEdit'))
      },
      //HOME PAGE
      {
        path: '/home',
        exact: true,
        component: HomeView
      },
      {
        path: '/signup',
        exact: true,
        component: HomeView
      },
      //Sign out page
      {
        path: '/signout',
        exact: true,
        component: lazy(() => import('src/views/AuthSignOut'))
      },
      //Sign out page
      {
        path: '/business-cards',
        exact: true,
        component: lazy(() => import('src/views/BusinessCards'))
      },
      {
        component: () => <Redirect to="/errors/error-404" />
      }
    ]
  }
];
