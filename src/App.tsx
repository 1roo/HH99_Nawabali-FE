import { Outlet } from 'react-router-dom';
import Header from './components/header/Header';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuthStore from './store/AuthState';
import { useEffect } from 'react';
import SSEListener from './components/chat/SSEListener';

const queryClient = new QueryClient();

function App() {
  const { initializeLoginState, isLoggedIn, loading } = useAuthStore();

  useEffect(() => {
    initializeLoginState();
  }, [initializeLoginState]);

  if (loading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      {isLoggedIn && <SSEListener />}
      <Outlet />
    </QueryClientProvider>
  );
}

export default App;
