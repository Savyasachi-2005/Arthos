/**
 * Navbar Component
 * Modern navigation bar with gradient and animations
 */
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Home,
  LayoutDashboard,
  Wallet,
  Building2,
  Bell,
  Menu,
  X,
} from "lucide-react";

export function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/upi-analyzer", label: "UPI Analyzer", icon: Wallet },
    { path: "/bank-analyzer", label: "Bank Analyzer", icon: Building2 },
    { path: "/subscriptions", label: "Subscriptions", icon: Bell },
  ];

  return (
    <nav
      className={`bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-none sticky top-0 z-50 border-none transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with Animation */}
          <Link
            to="/"
            className="flex items-center space-x-2 group transition-transform hover:scale-105"
          >
            <img
              src="/Gemini_Generated_Image_i6bxxui6bxxui6bx-removebg-preview.png"
              alt="Arthos"
              className="h-24 w-auto"
            />
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
                    ${
                      active
                        ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                        : "text-white/80 hover:bg-white/10 hover:text-white hover:shadow-md"
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>{link.label}</span>
                  </div>

                  {/* Active indicator */}
                  {active && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-white rounded-full"></div>
                  )}
                </Link>
              );
            })}

            {/* CTA Button */}
            <button className="ml-4 px-5 py-2 bg-white text-blue-700 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:bg-white/90 transform hover:scale-105 transition-all duration-300">
              Get Started
            </button>
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
            ${isMobileMenuOpen ? "max-h-96 pb-4" : "max-h-0"}
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
                    ${
                      active
                        ? "bg-white/20 text-white shadow-md backdrop-blur-sm"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <button className="mt-2 px-4 py-3 bg-white text-blue-700 rounded-lg font-semibold shadow-md hover:bg-white/90">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
