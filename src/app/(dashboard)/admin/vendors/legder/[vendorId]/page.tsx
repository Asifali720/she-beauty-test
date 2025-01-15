import { VendorLedger } from '@components/admin-components'

const Legder = ({ params }: { params: { vendorId: string } }) => {
  return <VendorLedger params={params} />
}

export default Legder
