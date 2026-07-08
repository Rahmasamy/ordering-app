import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/app/providers/StateContext';
import { Mail, Lock, ShieldAlert, ArrowRight, UserPlus, LogIn, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { authService } from '@/shared/api/auth.service';
import { useAuthStore } from '@/shared/store/auth.store';

export default function MerchantLogin() {
  const navigate = useNavigate();
  const { addActivityLog } = useAppState();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [primaryCountry, setPrimaryCountry] = useState('US');
  const [accountType, setAccountType] = useState<'user' | 'restaurant'>('restaurant');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      if (isRegister) {
        const response = await authService.register({
          email,
          password,
          name,
          phone,
          role : accountType === 'restaurant' ? 'restaurant_user' : 'customer',
          ...(accountType === 'restaurant' ? {
            restaurant: {
              name: restaurantName,
              primaryCountry
            }
          } : {})
        });
        setAuth(response.user);
        
        const msg = accountType === 'restaurant' ? 'Restaurant account registered successfully!' : 'Customer account registered successfully!';
        setSuccessMsg(msg);
        addActivityLog('Merchant Registration', `SaaS session initiated for ${response.user.email}`, 'status', msg);
        
        setTimeout(() => {
          navigate(response.user.systemRole === 'customer' ? '/' : '/merchant');
        }, 1500);
      } else {
        const response = await authService.login({ email, password });
        setAuth(response.user);
        
        setSuccessMsg('Login successful! Redirecting...');
        addActivityLog('Merchant Authenticate', `SaaS session initiated for ${response.user.email}`, 'status', `Login successful.`);
        
        setTimeout(() => {
          navigate(response.user.systemRole === 'customer' ? '/' : '/merchant');
        }, 1000);
      }
    } catch (err: any) {
      const failedType = isRegister ? (accountType === 'restaurant' ? 'Restaurant registration' : 'Customer registration') : 'Login';
      setErrorMsg(err.response?.data?.message || err.message || `${failedType} failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="merchant-login-container" className="min-h-screen grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-white rounded-3xl border border-gray-150 shadow-2xl mx-2 my-4">
      
      {/* Left Column: Visual graphics & 3D food tech concepts */}
      <div className="lg:col-span-6 bg-[#121d21] text-white p-12 flex flex-col justify-between relative overflow-hidden min-h-[480px]">
        {/* Floating circles backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-orange-600/10 blur-3xl" />
        
        {/* Release Pill Tag */}
        <div className="relative z-10 self-start bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-orange-400 fill-current animate-pulse" />
          <span className="text-[10px] font-black uppercase font-mono tracking-widest text-orange-200">V2.4 RELEASE</span>
        </div>

        {/* Floating 3D Food tech platform simulator */}
        <div className="relative z-10 my-8 flex items-center justify-center">
          <div className="relative w-64 h-64 bg-gradient-to-tr from-orange-600 to-red-500 rounded-[40px] shadow-2xl flex items-center justify-center p-8 border border-white/15 hover:scale-105 transition-transform duration-500">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
            <div className="text-center space-y-4">
              <span className="text-5xl block animate-bounce">🍣</span>
              <span className="text-xs uppercase font-mono font-black tracking-widest bg-black/40 px-3 py-1 rounded-full text-orange-200 border border-white/5">OrderFlow OS</span>
              <div className="flex justify-center gap-1.5 mt-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Headline and Text block */}
        <div className="relative z-10 space-y-3.5">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-none">The future of food tech.</h2>
          <p className="text-gray-300 text-xs md:text-sm leading-relaxed max-w-md">
            OrderFlow Pro scales your restaurant operation with kinetic precision, real-time telemetry, and high-growth SaaS utility across multiple branch systems.
          </p>
        </div>
      </div>

      {/* Right Column: Sign In Form fields */}
      <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-between bg-white min-h-[500px]">
        
        {/* Header Red Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#b3360c] text-white flex items-center justify-center font-bold text-sm">
            🍳
          </div>
          <span className="text-gray-900 font-black text-lg tracking-tight italic">OrderFlow <span className="text-[#b3360c] not-italic text-xs font-bold font-sans">Pro</span></span>
        </div>

        {/* Center Auth form content */}
        <div className="max-w-md w-full mx-auto my-8 space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-gray-950 tracking-tight">
              {isRegister ? 'Create your Account' : 'Welcome back'}
            </h1>
            <p className="text-gray-400 text-xs font-medium">
              {isRegister ? 'Get started by creating a multi-branch business portal.' : 'Manage your branches with surgical precision.'}
            </p>
          </div>

         
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isRegister && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black font-mono tracking-wider text-gray-400 uppercase">Full Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="John Doe" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-xs outline-none focus:border-orange-500 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black font-mono tracking-wider text-gray-400 uppercase">Phone Number</label>
                  <input 
                    required
                    type="tel" 
                    placeholder="1234567890" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-xs outline-none focus:border-orange-500 font-medium"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black font-mono tracking-wider text-gray-400 uppercase">Business Email</label>
              <input 
                required
                type="email" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-xs outline-none focus:border-orange-500 font-medium"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black font-mono tracking-wider text-gray-400 uppercase">Password</label>
                {!isRegister && (
                  <button 
                    type="button" 
                    onClick={() => alert('Secure password reset instructions sent.')}
                    className="text-[#b3360c] hover:underline text-[10px] font-bold uppercase tracking-wider"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input 
                required
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-xs outline-none focus:border-orange-500 font-medium"
              />
            </div>

            {isRegister && (
              <div className="pt-2 border-t border-gray-100 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black font-mono tracking-wider text-gray-400 uppercase">Account Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAccountType('restaurant')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${accountType === 'restaurant' ? 'bg-[#b3360c] text-white border-[#b3360c]' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                    >
                      Restaurant Owner
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType('customer')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${accountType === 'user' ? 'bg-[#b3360c] text-white border-[#b3360c]' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                    >
                      Regular User
                    </button>
                  </div>
                </div>

                {accountType === 'restaurant' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black font-mono tracking-wider text-gray-400 uppercase">Restaurant Name (Optional)</label>
                      <input 
                        type="text"  
                        placeholder="My Restaurant" 
                        value={restaurantName}
                        onChange={(e) => setRestaurantName(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-xs outline-none focus:border-orange-500 font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black font-mono tracking-wider text-gray-400 uppercase">Country</label>
                      <select 
                        value={primaryCountry}
                        onChange={(e) => setPrimaryCountry(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-xs outline-none focus:border-orange-500 font-medium"
                      >
                        <option value="US">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AE">UAE</option>
                        <option value="SA">Saudi Arabia</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#b3360c] hover:bg-[#942a08] disabled:opacity-70 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-1 text-xs uppercase tracking-wider cursor-pointer mt-4"
            >
              {isLoading ? (
                <span>Loading...</span>
              ) : (
                <>
                  {isRegister ? <UserPlus className="w-4 h-4 mr-1" /> : <LogIn className="w-4 h-4 mr-1" />}
                  <span>{isRegister ? 'Register Account' : 'Sign In'}</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom toggle anchor */}
          <p className="text-center text-xs text-gray-400 font-medium">
            {isRegister ? 'Already have a workspace account?' : 'New to OrderFlow?'}
            <button 
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg('');
              }}
              className="text-[#b3360c] font-bold hover:underline ml-1 uppercase text-[10.5px] tracking-wide"
            >
              {isRegister ? 'Sign In' : 'Create an account'}
            </button>
          </p>
        </div>

        {/* Footer info line */}
        <div className="text-center text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mt-4">
          © 2026 OrderFlow Pro. Built for speed.
        </div>
      </div>

    </div>
  );
}
