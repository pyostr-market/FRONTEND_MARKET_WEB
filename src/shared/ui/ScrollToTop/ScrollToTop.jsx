import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Компонент для сброса скролла в начало при изменении пути
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
