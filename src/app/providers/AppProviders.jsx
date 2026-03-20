import { CartProvider } from '../store/cartStore';

/**
 * Глобальные провайдеры приложения
 */
const AppProviders = ({ children }) => {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
};

export default AppProviders;
