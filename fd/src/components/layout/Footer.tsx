/**
 * Footer Component
 * Compact modern footer with gradient
 */
import { Link } from 'react-router-dom';
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Heart,
  Sparkles,
  Zap
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 mt-auto relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Compact Single Row Layout */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Brand Section */}
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold text-white">Arthos</span>
              <p className="text-xs text-gray-400">Smart Finance AI</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex items-center space-x-6 text-sm">
            <Link to="/upi-analyzer" className="text-gray-400 hover:text-blue-400 transition-colors">
              UPI Analysis
            </Link>
            <Link to="/bank-analyzer" className="text-gray-400 hover:text-blue-400 transition-colors">
              Bank Analyzer
            </Link>
            <Link to="/subscriptions" className="text-gray-400 hover:text-blue-400 transition-colors">
              Subscriptions
            </Link>
            <Link to="/dashboard" className="text-gray-400 hover:text-blue-400 transition-colors">
              Dashboard
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-3">
            <a 
              href="https://github.com/Savyasachi-2005/Arthos" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-gray-800 rounded-lg hover:bg-blue-600 transition-all duration-300 group"
            >
              <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </a>
            <a 
              href="#" 
              className="p-2 bg-gray-800 rounded-lg hover:bg-blue-400 transition-all duration-300 group"
            >
              <Twitter className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </a>
            <a 
              href="#" 
              className="p-2 bg-gray-800 rounded-lg hover:bg-blue-700 transition-all duration-300 group"
            >
              <Linkedin className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-6"></div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <span>© {currentYear} Arthos. Made with</span>
            <Heart className="w-3 h-3 text-red-500 animate-pulse" />
            <span>for better financial health</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-gray-300">Powered by AI</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


