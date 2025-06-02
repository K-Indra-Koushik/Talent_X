
import React from 'react';
import { APP_NAME } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900/80 border-t border-slate-700 text-center py-8">
      <div className="container mx-auto px-4">
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Empowering Your Career Journey.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
