import { NavBar } from './NavBar';

export const Layout = ({ children, showNav = true }) => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto">
        {children}
      </div>
      {showNav && <NavBar />}
    </div>
  );
};
