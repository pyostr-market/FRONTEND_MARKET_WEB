import HomePage from '../../pages/HomePage/HomePage';
import CatalogPage from '../../pages/CatalogPage/CatalogPage';
import CartPage from '../../pages/CartPage/CartPage';
import CheckoutPage from '../../pages/CheckoutPage/CheckoutPage';
import WishlistPage from '../../pages/WishlistPage/WishlistPage';
import paths from './paths';

const routes = [
  {
    path: paths.HOME,
    component: HomePage,
    layout: 'main',
    isPrivate: false,
  },
  {
    path: paths.CATALOG,
    component: CatalogPage,
    layout: 'main',
    isPrivate: false,
  },
  {
    path: paths.CART,
    component: CartPage,
    layout: 'main',
    isPrivate: false,
  },
  {
    path: paths.CHECKOUT,
    component: CheckoutPage,
    layout: 'main',
    isPrivate: false,
  },
  {
    path: paths.WISHLIST,
    component: WishlistPage,
    layout: 'main',
    isPrivate: false,
  },
];

export default routes;
