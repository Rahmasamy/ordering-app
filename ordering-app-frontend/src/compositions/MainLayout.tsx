import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppState } from '@/app/providers/StateContext';
import { Bell, ClipboardList, Layers, Map, Users, BarChart, LogIn, LogOut, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/shared/store/auth.store';
import { authService } from '@/shared/api/auth.service';
import { useCart } from '@/shared/hooks/useCart';

export default function MainLayout() {
  const { cart } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { fetchCart } = useCart();

  const isCustomerView = !location.pathname.startsWith('/merchant');

  useEffect(() => {
    if (!isAuthenticated && !location.pathname.startsWith('/merchant/login')) {
      if (location.pathname.startsWith('/merchant') || location.pathname === '/orders' || location.pathname === '/checkout') {
        navigate('/merchant/login');
      }
    }
  }, [isAuthenticated, location.pathname, navigate]);

  useEffect(() => {
    if (isCustomerView && isAuthenticated) {
      fetchCart();
    }
  }, [isCustomerView, isAuthenticated, fetchCart]);
  
  const handleLogout = async () => {
    await authService.logout();
    logout();
    navigate('/merchant/login');
  };
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbfc]">
      
     

      {/* Main Mode Header */}
      {isAuthenticated && (
        <header className="bg-[#121d21] text-white border-b border-gray-150/85 sticky top-0 z-35 shadow-xs px-4 md:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            
            {/* Logo Brand */}
            <div 
              onClick={() => navigate(isCustomerView ? '/' : '/merchant')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <span className="text-[#ff6600] font-black text-xl italic tracking-tight group-hover:opacity-85">
                OrderFlow<span className="text-white font-bold not-italic text-sm ml-1">{!isCustomerView && 'Pro'}</span>
              </span>
            </div>

            {/* Center Navigation Links per model screens */}
            {isCustomerView ? (
              <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider ">
                <button 
                  onClick={() => navigate('/')} 
                  className={`transition cursor-pointer ${location.pathname === '/' ? 'text-[#ff6600] underline decoration-2 underline-offset-4' : 'text-gray-300 hover:text-[#ff6600]'}`}
                >
                  Browse
                </button>
                <button 
                  onClick={() => navigate('/orders')} 
                  className={`transition cursor-pointer ${location.pathname === '/orders' ? 'text-[#ff6600] underline decoration-2 underline-offset-4' : 'text-gray-300 hover:text-[#ff6600]'}`}
                >
                  My Orders
                </button>
                <button 
                  onClick={() => navigate('/offers')} 
                  className={`transition cursor-pointer ${location.pathname === '/offers' ? 'text-[#ff6600] underline decoration-2 underline-offset-4' : 'text-gray-300 hover:text-[#ff6600]'}`}
                >
                  Offers
                </button>
                <button 
                  onClick={() => navigate('/faq')} 
                  className={`transition cursor-pointer ${location.pathname === '/faq' ? 'text-[#ff6600] underline decoration-2 underline-offset-4' : 'text-gray-300 hover:text-[#ff6600]'}`}
                >
                  FAQ
                </button>
                <button 
                  onClick={() => navigate('/privacy')} 
                  className={`transition cursor-pointer ${location.pathname === '/privacy' ? 'text-[#ff6600] underline decoration-2 underline-offset-4' : 'text-gray-300 hover:text-[#ff6600]'}`}
                >
                  Privacy
                </button>
              </nav>
            ) : (
              <nav className="hidden md:flex items-center gap-5 text-xs font-bold uppercase tracking-wider ">
                {user?.systemRole === 'system_admin' || user?.role === 'system_admin' ? (
                  <button 
                    onClick={() => navigate('/merchant/team')} 
                    className={`transition flex items-center gap-1.5 cursor-pointer ${location.pathname === '/merchant/team' ? 'text-[#ff6600]' : 'text-gray-300 hover:text-[#ff6600]'}`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Team</span>
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => navigate('/merchant')} 
                      className={`transition flex items-center gap-1.5 cursor-pointer ${location.pathname === '/merchant' ? 'text-[#ff6600]' : 'text-gray-300 hover:text-[#ff6600]'}`}
                    >
                      <ClipboardList className="w-4 h-4" />
                      <span>Overview</span>
                    </button>
                    <button 
                      onClick={() => navigate('/merchant/orders')} 
                      className={`transition flex items-center gap-1.5 cursor-pointer ${location.pathname.startsWith('/merchant/orders') ? 'text-[#ff6600]' : 'text-gray-300 hover:text-[#ff6600]'}`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Orders</span>
                    </button>
                    <button 
                      onClick={() => navigate('/merchant/catalog')} 
                      className={`transition flex items-center gap-1.5 cursor-pointer ${location.pathname.startsWith('/merchant/catalog') || location.pathname.startsWith('/merchant/wizard') ? 'text-[#ff6600]' : 'text-gray-300 hover:text-[#ff6600]'}`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>Menu Builder</span>
                    </button>
                    <button 
                      onClick={() => navigate('/merchant/branches')} 
                      className={`transition flex items-center gap-1.5 cursor-pointer ${location.pathname === '/merchant/branches' ? 'text-[#ff6600]' : 'text-gray-300 hover:text-[#ff6600]'}`}
                    >
                      <Map className="w-4 h-4" />
                      <span>Branches</span>
                    </button>
                  </>
                )}
                {/* <button 
                  onClick={() => navigate('/merchant/analytics')} 
                  className={`transition flex items-center gap-1.5 cursor-pointer ${location.pathname === '/merchant/analytics' ? 'text-[#b3360c]' : 'hover:text-gray-900'}`}
                >
                  <BarChart className="w-4 h-4" />
                  <span>Analytics</span>
                </button> */}
                {isAuthenticated ? (
                  <button 
                    onClick={handleLogout} 
                    className="transition flex items-center gap-1.5 cursor-pointer text-gray-300 hover:text-red-500"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate('/merchant/login')} 
                    className={`transition flex items-center gap-1.5 cursor-pointer ${location.pathname === '/merchant/login' ? 'text-[#ff6600]' : 'text-gray-300 hover:text-[#ff6600]'}`}
                  >
                    <LogIn className="w-4 h-4" />
                  </button>
                )}
              </nav>
            )}

            {/* Right side items */}
            <div className="flex items-center gap-4 text-gray-300">
              {isCustomerView ? isAuthenticated ? (
                <>
                  {/* <button 
                    onClick={() => alert('Customer has 0 custom alert tokens.')}
                    className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white relative cursor-pointer"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ff6600]" />
                  </button> */}
                  
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden shadow-xs">
                      <img 
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
                        alt="Customer Profile" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="hidden lg:block text-left leading-none mr-2">
                      <span className="text-xs font-black text-white block">{user?.name || 'User'}</span>
                    </div>
                   
                    <button 
                      onClick={handleLogout}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-full transition cursor-pointer"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => navigate('/merchant/login')}
                    className="text-gray-300 hover:text-white text-[11px] font-bold px-2 cursor-pointer transition uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Login</span>
                  </button>
                 
                </div>
              ) : isAuthenticated ? (
                <>
                  {/* <button 
                    onClick={() => alert('Live notifications catalog is up to date.')}
                    className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white relative cursor-pointer"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </button> */}

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80" 
                        alt="Merchant Profile Avatar" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="hidden lg:block text-left leading-none">
                      <span className="text-xs font-black text-white block">{user?.name || 'User'}</span>
                      <span className="text-[9px] uppercase font-bold text-gray-400 font-mono tracking-widest inline-block mt-0.5">{user?.systemRole?.replace('_', ' ') || 'Admin'}</span>
                    </div>
                  </div>
                </>
              ) : (
                <button 
                  onClick={() => navigate('/merchant/login')}
                  className="bg-[#ff6600] hover:bg-[#e05300] text-white text-[11px] font-bold px-5 py-2 rounded-xl shadow-md cursor-pointer transition uppercase tracking-wider flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Canvas Segment */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <Outlet />
      </main>

      {/* Aesthetic Footer block matching mockup specs */}
      <footer className="bg-white border-t border-gray-150 py-12 px-4 md:px-8 mt-auto  text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="font-black text-gray-900 text-lg tracking-tight block mb-4">OrderFlow</span>
            <p className="leading-relaxed text-gray-400 font-medium max-w-xs">
              Redefining how you discover and enjoy delicious craft meals, one digital branch bite at a time.
            </p>
          </div>

          <div>
            <span className="font-extrabold text-xs text-gray-900 uppercase tracking-widest block mb-4">Discover</span>
            <ul className="space-y-2 font-semibold">
              <li><button onClick={() => navigate('/')} className="hover:text-gray-900">Trending Near You</button></li>
              <li><button onClick={() => navigate('/merchant/catalog')} className="hover:text-gray-900">Popular Categories</button></li>
              <li><button onClick={() => alert('Explore special custom foods.')} className="hover:text-gray-900">Dietary Preferences</button></li>
              <li><button onClick={() => alert('New restaurant menu updates.')} className="hover:text-gray-900">New Additions</button></li>
            </ul>
          </div>

          <div>
            <span className="font-extrabold text-xs text-gray-900 uppercase tracking-widest block mb-4">For Partners</span>
            <ul className="space-y-2 font-semibold">
              <li><button onClick={() => navigate('/merchant/wizard')} className="hover:text-gray-900">Add Your Restaurant</button></li>
              <li><button onClick={() => navigate('/merchant/branches')} className="hover:text-gray-900">Fleet Partnership</button></li>
              <li><button onClick={() => navigate('/merchant')} className="hover:text-gray-900">OrderFlow Pro for Biz</button></li>
            </ul>
          </div>

          <div>
            <span className="font-extrabold text-xs text-gray-900 uppercase tracking-widest block mb-4">Newsletter</span>
            <p className="mb-4 text-gray-400 font-medium">Get exclusive catalog insights and promos delivered to your inbox.</p>
            <div className="flex bg-gray-50 border border-gray-150 p-1.5 rounded-xl">
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full bg-transparent px-3 outline-none text-xs text-gray-800 placeholder-gray-400"
              />
              <button 
                type="button"
                onClick={() => alert('Subscribed to OrderFlow digest.')}
                className="bg-[#b3360c] hover:bg-[#942a08] text-white font-bold px-4 py-2 rounded-lg transition shrink-0 cursor-pointer text-[10px] uppercase tracking-wider"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-gray-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 OrderFlow Pro Technologies Inc. All rights reserved.</p>
          
          <div className="flex items-center gap-6 font-semibold">
            <button onClick={() => navigate('/privacy')} className="hover:text-gray-900 cursor-pointer">Privacy Policy</button>
            <button onClick={() => navigate('/faq')} className="hover:text-gray-900 cursor-pointer">FAQ</button>
            <button onClick={() => navigate('/offers')} className="hover:text-gray-900 cursor-pointer">Offers</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
