import { Link } from 'react-router-dom';
import {
  FaceSmileIcon,
  HeartIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', href: '/about#features' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Analytics', href: '/dashboard' },
      { label: 'Chat Support', href: '/' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Team', href: '/about#team' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
    ],
    support: [
      { label: 'Help Center', href: '#' },
      { label: 'Privacy Policy', href: '/profile#privacy' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Contact Us', href: '#' },
    ],
    social: [
      { label: 'Twitter', href: '#' },
      { label: 'LinkedIn', href: '#' },
      { label: 'GitHub', href: '#' },
      { label: 'Facebook', href: '#' },
    ],
  };

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <FaceSmileIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">
                EmotiSense
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your personal emotional intelligence companion, helping you understand and manage your emotions better.
            </p>
            <div className="flex items-center space-x-4">
              <HeartIcon className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Made with love for emotional wellness
              </span>
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Product
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

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
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

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
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

        {/* Contact and Newsletter Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Contact Info
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>support@emotisense.com</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <PhoneIcon className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="w-4 h-4" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Stay Updated
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Subscribe to our newsletter for emotional wellness tips and updates.
              </p>
              <form className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {currentYear} EmotiSense. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {footerLinks.social.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;