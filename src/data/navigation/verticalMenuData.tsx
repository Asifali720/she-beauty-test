// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

const menuData: VerticalMenuDataType[] = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: 'tabler-smart-home'
  },
  {
    label: 'Ingredients',
    icon: 'fluent-leaf-three-20-regular',
    href: '/admin/ingredients/list'
  },
  {
    label: 'Raw Items',
    icon: 'fluent-mdl2-production-floor-management',
    href: '/admin/raw-items/list'
  },
  {
    label: 'Products',
    icon: 'solar-cosmetic-outline',
    href: '/admin/products/list'
  },

  {
    label: 'Orders',
    icon: 'tabler-archive',
    href: '/admin/orders/list'
  },

  {
    label: 'Sales Representatives',
    icon: 'carbon-sales-ops',
    href: '/admin/sales-representatives/list'
  },
  {
    label: 'Daily Activity',
    href: '/admin/daily-activity',
    icon: 'carbon-activity'
  },

  {
    label: 'Purchasing',
    icon: 'solar-trash-bin-minimalistic-2-linear',
    children: [
      {
        label: 'Vendors',
        icon: 'heroicons-user-group',
        href: '/admin/vendors/list'
      },
      {
        label: 'Paid Payments',
        href: '/admin/paid-payments',
        icon: 'solar-wallet-outline'
      },
      {
        label: 'Billing',
        icon: 'solar-bill-list-outline',
        href: '/admin/billing/list'
      }
    ]
  },

  {
    label: 'Distribution',
    icon: 'carbon-network-4',
    children: [
      {
        label: 'Distributors',
        icon: 'carbon-network-4',
        href: '/admin/distributors/list'
      },
      {
        label: 'Received Payments',
        href: '/admin/received-payments',
        icon: 'solar-wallet-outline'
      },

      {
        label: 'Claims',
        icon: 'tabler-file-dollar',
        href: '/admin/claims/list'
      },
      {
        label: 'Adjustments',
        href: '/admin/adjustments',
        icon: 'solar-wallet-outline'
      },
      {
        label: 'Invoices',
        icon: 'tabler-file-dollar',
        href: '/admin/invoices/list'
      }
    ]
  },
  {
    label: 'Trash',
    icon: 'solar-trash-bin-minimalistic-2-linear',
    children: [
      {
        label: 'Ingredients',
        href: '/admin/ingredients/trash-list',
        icon: 'tabler-circle'
      },
      {
        label: 'Raw Items',
        href: '/admin/raw-items/trash-list',
        icon: 'tabler-circle'
      },
      {
        label: 'Products',
        href: '/admin/products/trash-list',
        icon: 'tabler-circle'
      },
      {
        label: 'Vendors',
        href: '/admin/vendors/trash-list',
        icon: 'tabler-circle'
      },
      {
        label: 'Distributors',
        href: '/admin/distributors/trash-list',
        icon: 'tabler-circle'
      },
      {
        label: 'Sales Representatives',
        href: '/admin/sales-representatives/trash-list',
        icon: 'tabler-circle'
      }
    ]
  }
]

export default menuData
