import { DistributorLedger } from '@components/admin-components'

const DistributorLedgerPage = ({ params }: { params: { distributorId: string } }) => {
  return <DistributorLedger params={params} />
}

export default DistributorLedgerPage
