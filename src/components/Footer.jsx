import { Link } from 'react-router-dom';
import {
  FaceSmileIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Home', href: '/app' },
      { label: 'Dashboard', href: '/app/dashboard' },
      { label: 'About', href: '/app/about' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/app/privacy' },
      { label: 'Terms of Service', href: '/app/terms' },
    ],
  };

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link to="/app" className="flex items-center space-x-2 mb-4">
              <FaceSmileIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">
                EmotiSense
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your personal emotional intelligence companion.
            </p>
            <div className="flex items-center space-x-4">
              <HeartIcon className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Made with love for emotional wellness
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Navigation
            </h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {currentYear} EmotiSense. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;