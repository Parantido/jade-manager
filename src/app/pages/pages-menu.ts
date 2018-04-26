import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'User',
    icon: 'fa fa-users',
    link: '/pages/user',
    home: true,
  },
  {
    title: 'Setting',
    icon: 'fa fa-cog',
    link: '/pages/setting',
    home: false,
  },
];
