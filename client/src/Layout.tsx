import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';

function Layout() {
  return (
    <div className="flex flex-col min-h-screen lg:flex-row">
      <Sidebar />
      <main className="flex-1 w-full pt-[64px] lg:pt-0 lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;