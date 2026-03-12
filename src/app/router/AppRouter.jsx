import { Routes, Route } from 'react-router-dom';
import routes from './routes';
import MainLayout from '../../shared/ui/MainLayout/MainLayout';

const AppRouter = () => {
  const layouts = {
    main: MainLayout,
  };

  return (
    <Routes>
      {routes.map(({ path, component: Component, layout, isPrivate }) => {
        const Layout = layouts[layout] || MainLayout;

        return (
          <Route
            key={path}
            path={path}
            element={
              <Layout>
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
