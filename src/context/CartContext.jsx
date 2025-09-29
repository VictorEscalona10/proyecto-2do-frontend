import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Cargar carrito desde localStorage
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('migdalis-cart');
    return savedCart ? JSON.parse(savedCart) : { items: [] };
  } catch (error) {
    return { items: [] };
  }
};

// Guardar carrito en localStorage
const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('migdalis-cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error guardando carrito:', error);
  }
};

const cartReducer = (state, action) => {
  let newState;
  
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload.items || []
      };

    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        newState = {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      } else {
        newState = {
          ...state,
          items: [...state.items, { ...action.payload, quantity: action.payload.quantity }]
        };
      }
      break;

    case 'REMOVE_ITEM':
      newState = {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
      break;

    case 'UPDATE_QUANTITY':
      newState = {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        ).filter(item => item.quantity > 0) // Eliminar items con cantidad 0
      };
      break;

    case 'CLEAR_CART':
      newState = {
        ...state,
        items: []
      };
      break;

    default:
      return state;
  }

  // Guardar en localStorage después de cada cambio
  saveCartToStorage(newState);
  return newState;
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Cargar carrito al inicializar
  useEffect(() => {
    const savedCart = loadCartFromStorage();
    dispatch({ type: 'LOAD_CART', payload: savedCart });
  }, []);

  const addToCart = (product, quantity = 1) => {
    dispatch({ 
      type: 'ADD_ITEM', 
      payload: { 
        ...product, 
        quantity,
        // Asegurar que tenemos las propiedades necesarias
        category: product.category || 'Sin categoría'
      } 
    });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items: state.items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};