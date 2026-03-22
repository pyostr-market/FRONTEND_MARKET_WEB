import { CartProvider } from '../store/cartStore';
import { WishlistProvider } from '../store/wishlistStore';

/**
 * Глобальные провайдеры приложения
 */
const AppProviders = ({ children }) => {
  return (
    <WishlistProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </WishlistProvider>
  );
};

export default AppProviders;
