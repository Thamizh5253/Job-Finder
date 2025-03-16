import {
  IconTargetArrow,
  IconFileCode,
  IconTableShare,
  IconTypography,
  IconPalette,
  IconHistory,
  IconWindmill,
  IconBrandFeedly,
  IconSquarePlus,
  IconBrand4chan,
  IconEdit
} from '@tabler/icons-react';

// constant
const icons = {
  IconTypography,
  IconPalette,
  IconHistory,
  IconSquarePlus,
  IconWindmill,
  IconTargetArrow,
  IconTableShare,
  IconFileCode,
  IconBrand4chan,
  IconBrandFeedly,
  IconEdit
};

// ==============================|| UTILITIES MENU ITEMS ||============================== //

const utilities = {
  id: 'utilities',
  title: 'Utilities',
  type: 'group',
  children: [
    {
      id: 'New Job',
      title: 'New Job',
      type: 'item',
      url: '/utils/new-job',
      icon: icons.IconSquarePlus,
      breadcrumbs: false
    },
    {
      id: 'Job Data',
      title: 'Job Data',
      type: 'item',
      url: '/utils/job-data',
      icon: icons.IconHistory,
      breadcrumbs: false
    },
    {
      id: 'HR Job Data',
      title: 'HR Job Data',
      icon: icons.IconBrandFeedly,
      type: 'item',
      url: '/utils/hr-job-data',
      breadcrumbs: false
    },
    
    {
      id: 'Booking History',
      title: 'Inbox1',
      type: 'item',
      url: '/utils/inbox1',
      icon: icons.IconHistory,
      breadcrumbs: false
    }
    
  ]
};

export default utilities;
