import HomeIcon from '@mui/icons-material/HomeOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import InputIcon from '@mui/icons-material/InputOutlined';
import SchoolIcon from '@mui/icons-material/SchoolOutlined'

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
        title: 'Continuing Education',
        href: '/continuing-education',
        icon: SchoolIcon
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
