import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from "@/context/ToastContext";

interface CartItem {
    _id: string;
    name: string;
    price: number;
    brand?: string;
    stock: number;
    imageUrl: string;
    size?: string;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
    updateItemQuantity: (itemId: string, newQuantity: number) => void;
    getItemQuantity: (itemId: string) => number;
    getItemStock: (itemId: string) => number;
    cartTotal: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const { showToast } = useToast();

    // Guarda el carrito en localStorage cada vez que cambie
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Manejo del cierre del navegador/pestaña
    useEffect(() => {
        const handleBeforeUnload = () => {
            sessionStorage.setItem('isClosing', 'true');
        };

        const handlePageShow = () => {
            if (sessionStorage.getItem('isClosing') === 'true') {
                sessionStorage.removeItem('isClosing');
            }
        };

        const handlePageHide = () => {
            if (sessionStorage.getItem('isClosing') === 'true') {
                localStorage.removeItem('cart');
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('pageshow', handlePageShow);
        window.addEventListener('pagehide', handlePageHide);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('pageshow', handlePageShow);
            window.removeEventListener('pagehide', handlePageHide);
        };
    }, []);

    // Añadir producto al carrito (con manejo de cantidad)
    const addToCart = (item: Omit<CartItem, 'quantity'>) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((i) => i._id === item._id);
            
            if (existingItem) {
                // Verificar stock antes de incrementar
                if (existingItem.quantity >= existingItem.stock) {
                    showToast(`Not enough stock for ${item.name}`);
                    return prevItems;
                }
                return prevItems.map((i) =>
                    i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            
            // Verificar que haya stock disponible
            if (item.stock < 1) {
                showToast(`No stock available for ${item.name}`);
                return prevItems;
            }
            // Si no existe, añadir con cantidad 1
            return [...prevItems, { ...item, quantity: 1 }];
        });
    };

    // Eliminar producto del carrito
    const removeFromCart = (itemId: string) => {
        setCartItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
    };

    // Actualizar cantidad de un producto
    const updateItemQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
            return;
        }

        setCartItems((prevItems) =>
            prevItems.map((item) => {
                if (item._id === itemId) {
                    // No permitir superar el stock
                    const finalQuantity = Math.min(newQuantity, item.stock);
                    if (newQuantity > item.stock) {
                        showToast(`Only ${item.stock} units available`);
                    }
                    return { ...item, quantity: finalQuantity };
                }
                return item;
            })
        );

    };



    const getItemStock = (itemId: string) => {
        const item = cartItems.find((i) => i._id === itemId);
        return item?.stock || 0;
    };


    // Obtener cantidad de un producto específico
    const getItemQuantity = (itemId: string) => {
        const item = cartItems.find((i) => i._id === itemId);
        return item?.quantity || 0;
    };

    // Vaciar carrito completamente
    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
    };

    // Calcular total del carrito
    const cartTotal = cartItems.reduce(
        (sum, item) => sum + item.price * (item.quantity || 1),
        0
    );

    // Contar cantidad total de items (sumando cantidades)
    const itemCount = cartItems.reduce(
        (sum, item) => sum + (item.quantity || 1),
        0
    );

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                clearCart,
                updateItemQuantity,
                getItemQuantity,
                getItemStock,
                cartTotal,
                itemCount
            }}
        >
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