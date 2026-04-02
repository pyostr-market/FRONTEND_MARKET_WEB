import { BrowserRouter } from 'react-router-dom';
import AppProviders from './app/providers/AppProviders';
import AppRouter from './app/router/AppRouter';
import ScrollToTop from './shared/ui/ScrollToTop/ScrollToTop';

const App = () => {

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </BrowserRouter>
  );
};

export default App;
