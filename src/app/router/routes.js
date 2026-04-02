import HomePage from '../../pages/HomePage/HomePage';
import CatalogPage from '../../pages/CatalogPage/CatalogPage';
import ProductPage from '../../pages/ProductPage/ProductPage';
import CartPage from '../../pages/CartPage/CartPage';
import CheckoutPage from '../../pages/CheckoutPage/CheckoutPage';
import WishlistPage from '../../pages/WishlistPage/WishlistPage';
import AuthPage from '../../pages/AuthPage/AuthPage';
import ProfilePage from '../../pages/ProfilePage/ProfilePage';
import CookiePolicyPage from '../../pages/CookiePolicyPage/CookiePolicyPage';
import PrivacyPolicyPage from '../../pages/PrivacyPolicyPage/PrivacyPolicyPage';
import ConsentPage from '../../pages/ConsentPage/ConsentPage';
import PublicOfferPage from '../../pages/PublicOfferPage/PublicOfferPage';
import AboutPage from '../../pages/AboutPage/AboutPage';
import DeliveryPage from '../../pages/DeliveryPage/DeliveryPage';
import ContactsPage from '../../pages/ContactsPage/ContactsPage';
import WarrantyPage from '../../pages/WarrantyPage/WarrantyPage';
import LegalEntityPage from '../../pages/LegalEntityPage/LegalEntityPage';
import NotFoundPage from '../../pages/NotFoundPage/NotFoundPage';
import paths from './paths';

const routes = [
  {
    path: paths.HOME,
    component: HomePage,
    layout: 'main',
    isPrivate: false,
    showSearch: true,
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
  {
    path: paths.PRIVACY_POLICY,
    component: PrivacyPolicyPage,
    layout: 'main',
    isPrivate: false,
    showSearch: false,
  },
  {
    path: paths.CONSENT,
    component: ConsentPage,
    layout: 'main',
    isPrivate: false,
    showSearch: false,
  },
  {
    path: paths.PUBLIC_OFFER,
    component: PublicOfferPage,
    layout: 'main',
    isPrivate: false,
    showSearch: false,
  },
  {
    path: paths.ABOUT,
    component: AboutPage,
    layout: 'main',
    isPrivate: false,
    showSearch: false,
  },
  {
    path: paths.DELIVERY,
    component: DeliveryPage,
    layout: 'main',
    isPrivate: false,
    showSearch: false,
  },
  {
    path: paths.CONTACTS,
    component: ContactsPage,
    layout: 'main',
    isPrivate: false,
    showSearch: false,
  },
  {
    path: paths.WARRANTY,
    component: WarrantyPage,
    layout: 'main',
    isPrivate: false,
    showSearch: false,
  },
  {
    path: paths.LEGAL_ENTITY,
    component: LegalEntityPage,
    layout: 'main',
    isPrivate: false,
    showSearch: false,
  },
  {
    path: paths.NOT_FOUND,
    component: NotFoundPage,
    layout: 'main',
    isPrivate: false,
    showSearch: false,
  },
];

export default routes;
