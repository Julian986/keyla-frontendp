import { Trash, X } from 'lucide-react';
import './shopping.css';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';
import { useToast } from "@/context/ToastContext";

// Definimos la interfaz para los items del carrito
interface CartItem {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  brand?: string;
  size?: string;
  stock: number;
  quantity: number;
}

interface ShoppingProps {
  onClose: () => void;
}

const KeylaShoppingCart = ({ onClose }: ShoppingProps) => {
  const { 
    cartItems, 
    removeFromCart, 
    clearCart, 
    updateItemQuantity,
    cartTotal,
    itemCount
  } = useCart();
    const { showToast } = useToast();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    const item = cartItems.find(i => i._id === itemId);
    if (!item || item.stock === undefined || item.quantity === undefined) return;

    if (newQuantity > item.stock) {
      showToast(`Not enough stock. Maximum available: ${item.stock}`);
      newQuantity = item.stock;
    }

    updateItemQuantity(itemId, newQuantity);
  };

  return (
    <div className="shoppingContainer fixed z-[12000] right-0 top-0 w-96 h-full p-6 bg-gray-900 text-white">
      {/* Encabezado del carrito */}
      <div className="flex justify-center items-center mb-6">
        <h2 className="text-2xl font-bold">Shopping Cart</h2>
        <button 
          onClick={onClose} 
          className="eldeOnclose p-2 hover:bg-gray-700 rounded-full transition-colors duration-200"
          aria-label="Cerrar carrito"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Lista de productos */}
      {cartItems.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400">Your cart is empty</p>
          <button 
            onClick={onClose}
            className="botonSeguirComprando mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="eldivsito overflow-y-auto h-[calc(100vh-320px)] pr-2 custom-scrollbar">
            {cartItems.map((item:any) => (
              <div 
                key={item._id} 
                className="eldivsito2 item mb-4 p-4 hover:bg-gray-800 transition-colors duration-200 rounded-lg border border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-20 h-20 rounded-lg object-cover mr-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                      }} 
                    />
                    <div>
                      <p className="text-lg font-medium">{item.name}</p>
                      <p className="text-sm font-bold">
                      ${(item.price * (item.quantity || 1)).toLocaleString('es-AR')}
                      {(item.quantity || 1) > 1 && (
                        <span className="text-xs text-gray-400 ml-1">
                          (${item.price.toLocaleString('es-AR')} c/u)
                        </span>
                      )}
                    </p>
                      {item.brand && <p className="text-sm text-gray-400">Brand: {item.brand}</p>}
                      
                      {/* Controles de cantidad */}
                      <div className="flex items-center mt-2 gap-2">
                      <button 
                        onClick={() => handleQuantityChange(item._id, (item.quantity || 1) - 1)}
                        className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                        disabled={(item.quantity || 1) <= 1}
                      >
                        -
                      </button>
                        
                        <span className="px-3 py-1 bg-gray-800 rounded text-sm">
                          {item.quantity}
                        </span>
                        
                        <button 
                          onClick={() => handleQuantityChange(item._id, (item.quantity || 0) + 1)}
                          className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                          disabled={(item.quantity || 0) >= (item.stock ?? 0)}
                        >
                          +
                        </button>
                        
                        <span className="text-xs text-gray-400 ml-auto">
                          Stock: {item.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="elButtonDelTrash p-2 hover:bg-red-600 rounded-full transition-colors duration-200 self-start"
                    aria-label={`Eliminar ${item.name} del carrito`}
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Botón para vaciar el carrito */}
       {/*    <button
            onClick={clearCart}
            className="text-sm text-gray-400 hover:text-white mt-2 mb-4 w-full text-center"
          >
            Vaciar carrito completo
          </button> */}
        </>
      )}

      {/* Resumen y acciones */}
      <div className="mt-6 border-t border-gray-700 pt-4">
        <div className="flex justify-around items-center mb-4">
          <div>
            <p className="text-sm text-gray-400">Total ({itemCount} {itemCount === 1 ? 'product' : 'products'})</p>
          </div>
          <span className="elSpanTotal text-xl font-bold">${cartTotal.toLocaleString('es-AR')}</span>
        </div>

      <div className="containerBotonCompra">
        <Link to="/PaymentForm" className='linkFinalizarCompra'>
        <button
          className={`botonFinalizarCompra w-full py-3 rounded-lg font-medium transition-colors ${
            cartItems.length === 0 
            ? 'bg-gray-600 cursor-not-allowed opacity-50' 
            : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={cartItems.length === 0}
          >
          Checkout
        </button>
        </Link>
      </div>

      </div>
    </div>
  );
};

export default KeylaShoppingCart;