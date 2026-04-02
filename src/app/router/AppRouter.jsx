import { Routes, Route, useLocation } from 'react-router-dom';
import routes from './routes';
import MainLayout from '../../shared/ui/MainLayout/MainLayout';
import NotFoundPage from '../../pages/NotFoundPage/NotFoundPage';

const AppRouter = () => {
  const location = useLocation();
  const layouts = {
    main: MainLayout,
  };

  return (
    <Routes location={location} key={location.pathname}>
      {routes.map(({ path, component: Component, layout, isPrivate, showSearch }) => {
        const Layout = layouts[layout] || MainLayout;

        return (
          <Route
            key={path}
            path={path}
            element={
              <Layout showSearch={showSearch}>
                <Component />
              </Layout>
            }
          />
        );
      })}

      {/* Страница 404 для всех несуществующих URL */}
      <Route
        path="*"
        element={
          <MainLayout showSearch={false}>
            <NotFoundPage />
          </MainLayout>
        }
      />
    </Routes>
  );
};

export default AppRouter;
