// Component Imports
import { BillAddAndEditCard } from '@components/admin-components'

const BIllEdit = ({ params }: { params: { billId: string } }) => {
  return <BillAddAndEditCard params={params} />
}

export default BIllEdit
