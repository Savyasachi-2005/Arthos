/**
 * Navbar Component
 * Modern navigation bar with gradient and animations
 */
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  Home, 
  LayoutDashboard, 
  Wallet, 
  Building2, 
  Bell, 
  Menu, 
  X,
  Sparkles,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/upi-analyzer', label: 'UPI Analyzer', icon: Wallet },
    { path: '/bank-analyzer', label: 'Bank Analyzer', icon: Building2 },
    { path: '/subscriptions', label: 'Subscriptions', icon: Bell },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with Animation */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group transition-transform hover:scale-105"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-300 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-bold text-white tracking-tight">Arthos</span>
              <p className="text-xs text-blue-100 -mt-1">Smart Finance</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    group relative px-4 py-2 rounded-xl text-sm font-medium 
                    transition-all duration-300 ease-out
                    ${active 
                      ? 'bg-white text-blue-700 shadow-lg' 
                      : 'text-white hover:bg-white/10 hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${active ? 'text-blue-600' : ''}`} />
                    <span>{link.label}</span>
                  </div>
                  
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  )}
                  
                  {/* Hover effect */}
                  {!active && (
                    <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-5 transition-opacity"></div>
                  )}
                </Link>
              );
            })}
            
            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="ml-4 flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg">
                  <User className="w-4 h-4 text-white" />
                  <span className="text-sm text-white font-medium">{user?.username}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="ml-4 flex items-center space-x-2">
                <Link to="/login">
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-300">
                    Login
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="px-5 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Sign Up</span>
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu with Slide Animation */}
        <div 
          className={`
            md:hidden overflow-hidden transition-all duration-300 ease-in-out
            ${isMobileMenuOpen ? 'max-h-96 pb-4' : 'max-h-0'}
          `}
        >
          <div className="flex flex-col space-y-2 pt-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium 
                    transition-all duration-200
                    ${active 
                      ? 'bg-white text-blue-700 shadow-md' 
                      : 'text-white hover:bg-white/10'
                    }
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : ''}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            {/* Mobile Auth Buttons */}
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 px-4 py-3 bg-white/10 rounded-lg">
                  <User className="w-5 h-5 text-white" />
                  <span className="text-sm text-white font-medium">{user?.username}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="mt-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full mt-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium">
                    Login
                  </button>
                </Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-semibold shadow-md flex items-center justify-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Sign Up</span>
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

