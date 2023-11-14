import BarChartIcon from '@mui/icons-material/BarChart';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import InputIcon from '@mui/icons-material/InputOutlined';
import ListIcon from '@mui/icons-material/ListOutlined';
import AssignmentIcon from '@mui/icons-material/AssignmentIndOutlined';
import PostAddIcon from '@mui/icons-material/PostAddOutlined';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

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
            title: 'Roosted Data',
            href: '/dashboard/admin/referral-metrics'
          },
        ]
      },
      {
        title: 'Create A Referral',
        href: '/referrals/create/admin/select-type',
        icon: PostAddIcon
      },
      {
        title: 'Manage Referrals',
        href: '/manage-referrals-admin',
        icon: ListIcon
      },
      {
        title: 'License Management',
        href: '/license',
        icon: AssignmentIcon,
        items: [
          {
            title: 'Roosted Licenses',
            href: '/license/admin/roosted'
          },
          {
            title: 'Partner Licenses',
            href: '/license/admin/partner'
          },
        ]
      },
      {
        title: 'User Management',
        href: '/users/admin',
        icon: SupervisorAccountIcon,
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
