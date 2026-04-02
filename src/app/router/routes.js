import HomePage from '../../pages/HomePage/HomePage';
import CatalogPage from '../../pages/CatalogPage/CatalogPage';
import ProductPage from '../../pages/ProductPage/ProductPage';
import CartPage from '../../pages/CartPage/CartPage';
import CheckoutPage from '../../pages/CheckoutPage/CheckoutPage';
import WishlistPage from '../../pages/WishlistPage/WishlistPage';
import AuthPage from '../../pages/AuthPage/AuthPage';
import ProfilePage from '../../pages/ProfilePage/ProfilePage';
import CookiePolicyPage from '../../pages/CookiePolicyPage/CookiePolicyPage';
import paths from './paths';

const routes = [
  {
    path: paths.HOME,
    component: HomePage,
    layout: 'main',
    isPrivate: false,
    showSearch: false,
  },
  {
    path: paths.CATALOG,
    component: CatalogPage,
    layout: 'main',
    isPrivate: false,
    showSearch: true,
  },
  {
    path: '/product/:id',
    component: ProductPage,
    layout: 'main',
    isPrivate: false,
    showSearch: false,
  },
  {
    path: paths.CART,
    component: CartPage,
    layout: 'main',
    isPrivate: false,
    showSearch: false,
  },
  {
    path: paths.CHECKOUT,
    component: CheckoutPage,
    layout: 'main',
    isPrivate: false,
    showSearch: false,
  },
  {
    path: paths.WISHLIST,
    component: WishlistPage,
    layout: 'main',
    isPrivate: false,
    showSearch: false,
  },
  {
    path: paths.AUTH,
    component: AuthPage,
    layout: 'main',
    isPrivate: false,
    showSearch: false,
  },
  {
    path: paths.PROFILE,
    component: ProfilePage,
    layout: 'main',
    isPrivate: true,
    showSearch: false,
  },
  {
    path: paths.COOKIE_POLICY,
    component: CookiePolicyPage,
    layout: 'main',
    isPrivate: false,
    showSearch: false,
  },
];

export default routes;
