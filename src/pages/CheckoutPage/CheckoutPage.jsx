import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiTruck, FiPackage, FiCreditCard, FiDollarSign, FiMessageSquare, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../../app/store/cartStore';
import useCartProducts from '../../shared/hooks/useCartProducts';
import useProfile from '../../shared/hooks/useProfile';
import Input from '../../shared/ui/Input/Input';
import Button from '../../shared/ui/Button/Button';
import paths from '../../app/router/paths';
import styles from './CheckoutPage.module.css';

// Способы доставки
const DELIVERY_METHODS = [
  { key: 'pickup', label: 'Самовывоз', icon: <FiPackage size={18} /> },
  { key: 'courier', label: 'Курьер', icon: <FiTruck size={18} /> },
  { key: 'cdek', label: 'СДЭК', icon: <FiMapPin size={18} /> },
];

// Способы оплаты
const PAYMENT_METHODS = [
  { key: 'online', label: 'Онлайн', icon: <FiCreditCard size={18} /> },
  { key: 'cash', label: 'Наличные', icon: <FiDollarSign size={18} /> },
];

/**
 * Страница оформления заказа
 */
const CheckoutPage = () => {
  const { cartItems, getTotalQuantity } = useCart();
  const { profile, loading: profileLoading } = useProfile();

  const productIds = useMemo(() => {
    return Object.keys(cartItems).map((id) => parseInt(id, 10));
  }, [cartItems]);

  const { products, loading: productsLoading } = useCartProducts(productIds);

  const [individualType, setIndividualType] = useState('individual'); // individual | company
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    company_name: '',
    tax_id: '',
    phone: '',
    email: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Заполнение формы данными из профиля
  useEffect(() => {
    if (profile) {
      const ind = profile.individual_profile || {};
      const comp = profile.company_profile || {};
      setFormData({
        first_name: ind.first_name || '',
        last_name: ind.last_name || '',
        middle_name: ind.middle_name || '',
        company_name: comp.company_name || '',
        tax_id: comp.tax_id || '',
        phone: '',
        email: '',
      });
    }
  }, [profile]);

  // Если корзина пуста — редирект
  const totalItems = getTotalQuantity();
  useEffect(() => {
    if (!productsLoading && totalItems === 0) {
      window.location.href = paths.CART;
    }
  }, [totalItems, productsLoading]);

  const totalPrice = useMemo(() => {
    return products.reduce((total, item) => {
      return total + parseFloat(item.price || 0) * (cartItems[item.id] || 1);
    }, 0);
  }, [products, cartItems]);

  const formatPrice = useCallback((price) => {
    if (!price) return '0 ₽';
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(numPrice);
  }, []);

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (individualType === 'individual') {
      if (!formData.first_name?.trim()) errors.first_name = 'Введите имя';
      if (!formData.last_name?.trim()) errors.last_name = 'Введите фамилию';
    } else {
      if (!formData.company_name?.trim()) errors.company_name = 'Введите название компании';
      if (!formData.tax_id?.trim()) errors.tax_id = 'Введите ИНН';
    }
    if (deliveryMethod !== 'pickup' && !address.trim()) {
      errors.address = 'Введите адрес доставки';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Пока кнопка не активна — заглушка
  };

  const needsAddress = deliveryMethod === 'courier' || deliveryMethod === 'cdek';

  if (productsLoading || profileLoading) {
    return (
      <div className={styles.checkoutPage}>
        <div className={styles.checkoutContainer}>
          <div className={styles.loadingState}>Загрузка...</div>
        </div>
      </div>
    );
  }

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className={styles.checkoutPage}>
      <div className={styles.checkoutContainer}>
        {/* Кнопка назад */}
        <Link to={paths.CART} className={styles.backButton}>
          <FiArrowLeft size={18} />
          <span>Назад в корзину</span>
        </Link>

        <h1 className={styles.checkoutTitle}>Оформление заказа</h1>

        <div className={styles.checkoutContent}>
          {/* Левая колонка — форма */}
          <div className={styles.checkoutForm}>
            {/* Тип лица */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Получатель</h2>
              <div className={styles.typeTabs}>
                <button
                  className={`${styles.typeTab} ${individualType === 'individual' ? styles.typeTabActive : ''}`}
                  onClick={() => setIndividualType('individual')}
                  type="button"
                >
                  Физическое лицо
                </button>
                <button
                  className={`${styles.typeTab} ${individualType === 'company' ? styles.typeTabActive : ''}`}
                  onClick={() => setIndividualType('company')}
                  type="button"
                >
                  Юридическое лицо
                </button>
              </div>

              {individualType === 'individual' ? (
                <div className={styles.formGrid}>
                  <Input
                    label="Фамилия"
                    value={formData.last_name}
                    onChange={handleInputChange('last_name')}
                    placeholder="Иванов"
                    error={!!formErrors.last_name}
                    errorText={formErrors.last_name}
                  />
                  <Input
                    label="Имя"
                    value={formData.first_name}
                    onChange={handleInputChange('first_name')}
                    placeholder="Иван"
                    error={!!formErrors.first_name}
                    errorText={formErrors.first_name}
                  />
                  <Input
                    label="Отчество"
                    value={formData.middle_name}
                    onChange={handleInputChange('middle_name')}
                    placeholder="Петрович"
                  />
                  <Input
                    label="Телефон"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    placeholder="+7 (999) 123-45-67"
                    autoComplete="tel"
                  />
                  <Input
                    label="Email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    placeholder="email@example.com"
                    autoComplete="email"
                  />
                </div>
              ) : (
                <div className={styles.formGrid}>
                  <Input
                    label="Название компании"
                    value={formData.company_name}
                    onChange={handleInputChange('company_name')}
                    placeholder="ООО «Компания»"
                    error={!!formErrors.company_name}
                    errorText={formErrors.company_name}
                  />
                  <Input
                    label="ИНН"
                    value={formData.tax_id}
                    onChange={handleInputChange('tax_id')}
                    placeholder="1234567890"
                    error={!!formErrors.tax_id}
                    errorText={formErrors.tax_id}
                  />
                  <Input
                    label="Телефон"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    placeholder="+7 (999) 123-45-67"
                    autoComplete="tel"
                  />
                  <Input
                    label="Email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    placeholder="email@example.com"
                    autoComplete="email"
                  />
                </div>
              )}
            </div>

            {/* Способ доставки */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Доставка</h2>
              <div className={styles.deliveryTabs}>
                {DELIVERY_METHODS.map((method) => (
                  <button
                    key={method.key}
                    className={`${styles.deliveryTab} ${deliveryMethod === method.key ? styles.deliveryTabActive : ''}`}
                    onClick={() => setDeliveryMethod(method.key)}
                    type="button"
                  >
                    {method.icon}
                    <span>{method.label}</span>
                  </button>
                ))}
              </div>

              {needsAddress && (
                <div className={styles.addressField}>
                  <Input
                    label={`Адрес доставки (${deliveryMethod === 'courier' ? 'для курьера' : 'до пункта СДЭК'})`}
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (formErrors.address) setFormErrors(prev => ({ ...prev, address: '' }));
                    }}
                    placeholder="г. Москва, ул. Ленина, д. 1, кв. 1"
                    error={!!formErrors.address}
                    errorText={formErrors.address}
                  />
                </div>
              )}

              {deliveryMethod === 'pickup' && (
                <div className={styles.pickupInfo}>
                  <FiPackage size={16} />
                  <span>Самовывоз из пункта выдачи: г. Москва, ул. Примерная, д. 1</span>
                </div>
              )}
            </div>

            {/* Способ оплаты */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Оплата</h2>
              <div className={styles.paymentTabs}>
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.key}
                    className={`${styles.paymentTab} ${paymentMethod === method.key ? styles.paymentTabActive : ''}`}
                    onClick={() => setPaymentMethod(method.key)}
                    type="button"
                  >
                    {method.icon}
                    <span>{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Комментарий */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <FiMessageSquare size={16} /> Комментарий к заказу
              </h2>
              <textarea
                className={styles.commentArea}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Укажите пожелания к заказу, удобное время доставки и т.д."
                rows={3}
              />
            </div>

            {/* Состав заказа — мобильная версия */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <FiShoppingBag size={16} /> Состав заказа ({totalItems} шт.)
              </h2>
              <div className={styles.orderItems}>
                {products.map((item) => {
                  // Изображение может быть строкой или объектом с image_url
                  const imageUrl = typeof item.images?.[0] === 'string'
                    ? item.images[0]
                    : item.images?.[0]?.image_url;

                  return (
                    <div key={item.id} className={styles.orderItem}>
                      <div className={styles.orderItemImage}>
                        {imageUrl ? (
                          <img src={imageUrl} alt={item.name} loading="lazy" />
                        ) : (
                          <div className={styles.orderImagePlaceholder}>📦</div>
                        )}
                      </div>
                      <div className={styles.orderItemInfo}>
                        <span className={styles.orderItemName}>{item.name}</span>
                        <span className={styles.orderItemQty}>× {cartItems[item.id] || 1}</span>
                      </div>
                      <span className={styles.orderItemPrice}>
                        {formatPrice((parseFloat(item.price || 0) * (cartItems[item.id] || 1)).toString())}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Правая колонка — итого (десктоп) */}
          <div className={styles.checkoutSummary}>
            <h2 className={styles.summaryTitle}>Итого</h2>

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Товары ({totalItems} шт.)</span>
              <span className={styles.summaryValue}>{formatPrice(totalPrice.toString())}</span>
            </div>

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Доставка</span>
              <span className={styles.summaryValueFree}>Бесплатно</span>
            </div>

            <div className={styles.summaryTotal}>
              <span className={styles.totalLabel}>К оплате:</span>
              <span className={styles.totalValue}>{formatPrice(totalPrice.toString())}</span>
            </div>

            <Button
              variant="primary"
              size="large"
              className={styles.submitButton}
              disabled
              onClick={handleSubmit}
            >
              Оформить заказ
            </Button>

            <div className={styles.summaryNote}>
              Кнопка оформления заказа будет активна после подключения платёжной системы
            </div>
          </div>
        </div>

        {/* Мобильная панель итого */}
        <div className={styles.mobileSummary}>
          <div className={styles.mobileSummaryInfo}>
            <div className={styles.mobileTotalRow}>
              <span className={styles.mobileTotalLabel}>Итого:</span>
              <span className={styles.mobileTotalValue}>{formatPrice(totalPrice.toString())}</span>
            </div>
            <span className={styles.mobileTotalItems}>{totalItems} товаров</span>
          </div>
          <Button
            variant="primary"
            size="large"
            className={styles.mobileSubmitButton}
            disabled
            onClick={handleSubmit}
          >
            Оформить заказ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
