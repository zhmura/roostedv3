import BarChartIcon from '@mui/icons-material/BarChart';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import InputIcon from '@mui/icons-material/InputOutlined';
import ListIcon from '@mui/icons-material/ListOutlined';
import SchoolIcon from '@mui/icons-material/SchoolOutlined'
import AssignmentIcon from '@mui/icons-material/AssignmentIndOutlined';
import PostAddIcon from '@mui/icons-material/PostAddOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCard'

export default [
  {
    subheader: 'Menu',
    items: [
      {
        title: 'Home',
        href: '/home',
        icon: HomeIcon
      },
      {
        title: 'Dashboards',
        href: '/dashboard',
        icon: BarChartIcon,
        items: [
          {
            title: 'Referrals Created Data',
            href: '/dashboard/roosted/referral-metrics'
          },
        ]
      },
      {
        title: 'Create A Referral',
        href: '/referrals/create/select-type',
        icon: PostAddIcon
      },
      {
        title: 'Manage Referrals Created',
        href: '/manage-referrals-sent',
        icon: ListIcon
      },
      {
        title: 'License Management',
        href: '/license',
        icon: AssignmentIcon,
        items: [
          {
            title: 'Roosted Licenses',
            href: '/license/roosted'
          },
          {
            title: 'Partner Licenses',
            href: '/license/partner'
          },
        ]
      },
      {
        title: 'Continuing Education',
        href: '/continuing-education',
        icon: SchoolIcon
      },
      {
        title: 'Order Business Cards',
        href: '/business-cards',
        icon: CreditCardIcon
      },
      {
        title: 'Account Settings',
        href: '/settings',
        icon: SettingsIcon,
        items: [
          {
            title: 'Profile',
            href: '/settings/profile'
          },
          {
            title: 'Billing',
            href: '/settings/billing'
          },
        ]
      },
      {
        title: 'Sign Out',
        href: '/signout',
        icon: InputIcon
      },
    ]
  },
];
