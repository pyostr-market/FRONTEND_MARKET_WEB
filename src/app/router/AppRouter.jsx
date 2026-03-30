import { Routes, Route, useLocation } from 'react-router-dom';
import routes from './routes';
import MainLayout from '../../shared/ui/MainLayout/MainLayout';

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
    </Routes>
  );
};

export default AppRouter;
