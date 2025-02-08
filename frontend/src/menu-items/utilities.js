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
      id: 'util-shadow',
      title: 'Land Details',
      type: 'item',
      url: '/utils/land-details',
      icon: icons.IconSquarePlus,
      breadcrumbs: false
    },
    {
      id: 'resultstable',
      title: 'Inbox',
      type: 'item',
      url: '/utils/inbox',
      icon: icons.IconHistory,
      breadcrumbs: false
    },
    {
      id: 'Manage Booking',
      title: 'Add Land Details',
      icon: icons.IconBrandFeedly,
      type: 'item',
      url: '/utils/addlanddetails',
      breadcrumbs: false
    },
    
    {
      id: 'Booking History',
      title: 'Inbox',
      type: 'item',
      url: '/utils/inbox',
      icon: icons.IconHistory,
      breadcrumbs: false
    }
    
  ]
};

export default utilities;
