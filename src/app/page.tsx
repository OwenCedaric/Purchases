import { getSortedProductsData } from '@/lib/markdown';
import ProductList from './components/ProductList';

export default async function Home() {
  const allProducts = await getSortedProductsData();
  
  return (
    <ProductList initialProducts={allProducts} />
  );
}
