import { ProductsComponent } from "./components/ProductsComponent"

export default function Home() {
  

  return (
    <>
      <h1>Productos</h1>
      <h2>Tortas</h2>
      <ProductsComponent categoria='tortas'/>
      <h2>Galletas</h2>
      <ProductsComponent categoria='galletas'/>
    </>
  )
}