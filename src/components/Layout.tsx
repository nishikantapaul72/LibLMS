
import React from 'react';
import Navbar from './Navbar';
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto py-6 px-4 md:py-8">
        {children}
      </main>
      <footer className="bg-library-dark text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-semibold">Digital Book Access</h3>
              <p className="text-sm text-gray-300">Your gateway to knowledge</p>
            </div>
            <div className="flex space-x-6">
              <div>
                <h4 className="font-semibold mb-2">Hours</h4>
                <p className="text-sm">Mon-Fri: 9am - 8pm</p>
                <p className="text-sm">Sat-Sun: 10am - 6pm</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Contact</h4>
                <p className="text-sm">support@library.com</p>
                <p className="text-sm">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-700 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Digital Book Access. All rights reserved.
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
};

export default Layout;
