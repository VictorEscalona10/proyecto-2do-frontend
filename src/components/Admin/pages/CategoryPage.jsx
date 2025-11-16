import { useState } from "react";

export function Category() {
  const [categories, setCategories] = useState([]);

  const getCategories = async () => {
    try {
      const request = await fetch("http://localhost:3000/category");
      const response = await request.json();
      setCategories(response);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const createCategory = async (name) => {
    try {
      const request = await fetch("http://localhost:3000/category/create", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      const response = await request.json();
      setCategories([...categories, response]);
        alert("Categoria creada con exito");
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleDelete = async (name) => {
    try {
      await fetch(`http://localhost:3000/category/delete/${name}`, {
        method: "DELETE",
        credentials: "include",
      });
      setCategories(categories.filter((category) => category.name !== name));
      alert("Categoria eliminada con exito");
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  getCategories();

  return (
    <div>
      <h1>Category</h1>
      <ul>
        {categories.map((category) => (
          <li key={category.name}>
            {category.name}
            <button onClick={() => handleDelete(category.name)}>Delete</button>
          </li>
        ))}
      </ul>

      <form action="" onSubmit={(e) => e.preventDefault()}>
        <input type="text" name="name" placeholder="Nombre de la categoria" />
        <button
          type="submit"
          onClick={(e) => {
            const name = e.target.form.name.value;
            createCategory(name);
            e.target.form.name.value = "";
          }}
        >
          Agregar categoria
        </button>
      </form>
    </div>
  );
}
