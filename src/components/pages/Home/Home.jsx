import { ProductsComponent } from "../ProductsComponent/ProductsComponent.jsx";

export default function Home() {
  

  return (
    <>
      <h1 className="productos">Productos</h1>
      
      <h2 className="categoria">Tortas</h2>
      <ProductsComponent categoria='tortas'/>
      <h2 className="categoria">Galletas</h2>
      <ProductsComponent categoria='galletas'/>
    </>
  )
}