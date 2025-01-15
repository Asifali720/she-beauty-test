// Component Imports
import { InvoiceAddAndEditCard } from '@components/admin-components'

const InvoiceEdit = ({ params }: { params: { invoiceId: string } }) => {
  return <InvoiceAddAndEditCard params={params} />
}

export default InvoiceEdit
