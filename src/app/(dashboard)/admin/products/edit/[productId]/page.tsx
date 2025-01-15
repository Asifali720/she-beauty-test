// Component Imports
import { ProductAddAndEditCard } from '@components/admin-components'

const ProductEdit = ({ params }: { params: { productId: string } }) => {
  return <ProductAddAndEditCard params={params} />
}

export default ProductEdit
