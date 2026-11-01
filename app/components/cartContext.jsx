import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getCartDataOrCreate, addLineItem, updateLineItem, updateCartCountry, removeLineItems } from '~/lib/cartHelper';
const CartContext = createContext();

export const CartProvider = ({ children, userCountry, customerToken, email  }) => {
    const [cart, setCart] = useState(null);
    const [cartLoading, setCartLoading] = useState(true);
    const [isCartOpen, setCartOpen] = useState(false);
    const isCleaningRestrictedItems = useRef(false);

    // Handle cart refresh when customerToken or email changes (e.g., after login/register)
    useEffect(() => {
        let isCancelled = false;

        const fetchCart = async () => {
            setCartLoading(true);
            try {
                const cartData = await getCartDataOrCreate(userCountry, customerToken, email);
                if (!isCancelled) {
                    setCart(cartData);
                }
            } catch (error) {
                if (!isCancelled) {
                    console.error("Error fetching cart:", error);
                }
            } finally {
                if (!isCancelled) {
                    setCartLoading(false);
                }
            }
        };

        fetchCart();

        // Cleanup function to prevent state updates if component unmounts or dependencies change
        return () => {
            isCancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerToken, email, userCountry]);

    const getCart = useCallback(async () => {
        try {
            const cartData = await getCartDataOrCreate(userCountry, customerToken, email);
            setCart(cartData);
            return cartData;
        } catch (error) {
            console.error("Error fetching cart:", error);
        } finally {
            setCartLoading(false);
        }
    }, [userCountry, customerToken, email]);


    const addItemToCart = async (lines) => {
        try {
            const updatedCart = await addLineItem(cart.id, lines);
            const data = await getCart();
            openCart(true)
            return data;
        } catch (error) {
            console.error("Error adding item to cart:", error);
        }
    };

    const updateItemQuantity = async (lineId, quantity) => {
        try {
            const updatedCart = await updateLineItem(cart.id, lineId, quantity);
            const data = await getCart();
            return data;
        } catch (error) {
            console.error("Error updating cart item:", error);
        }
    };

    const updateCountry = async (countryCode) => {
        try {
            const updatedCart = await updateCartCountry(cart.id, countryCode);
            const data = await getCart();
            return data;
        } catch (error) {
            console.error("Error updating cart country:", error);
        }
    };

    useEffect(() => {
        const cleanupRestrictedNzItems = async () => {
            const isNzCart = userCountry === 'NZ' || cart?.buyerIdentity?.countryCode === 'NZ';
            if (!cart?.id || !isNzCart || isCleaningRestrictedItems.current) {
                return;
            }
            const restrictedLineIds = (cart?.lines?.nodes || [])
                .filter((line) => {
                    const flag = line?.merchandise?.product?.show_australia_only?.value;
                    const auOnlyAttribute = line?.attributes?.find((attr) => attr?.key === '_au_only')?.value;
                    return flag === 'true' || flag === true || auOnlyAttribute === 'true';
                })
                .map((line) => line.id);

            if (!restrictedLineIds.length) {
                return;
            }
            isCleaningRestrictedItems.current = true;
            try {
                await removeLineItems(cart.id, restrictedLineIds);
                await getCart();
            } catch (error) {
                console.error("Error removing Australia-only items for NZ cart:", error);
            } finally {
                isCleaningRestrictedItems.current = false;
            }
        };

        cleanupRestrictedNzItems();
    }, [cart, userCountry, getCart]);

    const openCart = () =>{
      setCartOpen(true)
    }
    const closeCart = () =>{
      setCartOpen(false)
    }
    return (
        <CartContext.Provider value={{ cart, openCart, isCartOpen, closeCart, cartLoading, addItemToCart, updateItemQuantity, updateCountry, getCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
