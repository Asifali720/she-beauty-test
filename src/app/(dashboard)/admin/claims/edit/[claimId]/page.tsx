// Component Imports
import { ClaimAddAndEditCard } from '@components/admin-components'

const InvoiceEdit = ({ params }: { params: { claimId: string } }) => {
  return <ClaimAddAndEditCard params={params} />
}

export default InvoiceEdit
