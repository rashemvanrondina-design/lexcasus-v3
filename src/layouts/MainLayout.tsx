import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Navbar />
      <div className="flex-1 pt-16">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
