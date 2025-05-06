
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Book, User, Library, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { authApi } from '@/utils/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(authApi.isAuthenticated());
      setUser(authApi.getCurrentUser());
    };
    
    checkAuth();
    
    // Setup an event listener to check auth status changes
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/books?search=${encodeURIComponent(searchQuery)}`);
  };
  
  const handleLogout = () => {
    authApi.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <Link to="/" className="flex items-center space-x-2">
            <Library className="h-8 w-8 text-library-DEFAULT" />
            <span className="font-semibold text-xl text-library-DEFAULT">BookAccess</span>
          </Link>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/books" className="text-gray-600 hover:text-library-DEFAULT transition-colors">
              Browse Books
            </Link>
            {isAuthenticated && (
              <Link to="/loans" className="text-gray-600 hover:text-library-DEFAULT transition-colors">
                My Loans
              </Link>
            )}
          </nav>
          
          {/* Search form - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center max-w-xs w-full relative">
            <Input
              type="text"
              placeholder="Search books..."
              className="w-full pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              className="absolute right-0"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
          
          {/* User actions - desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-1">
                    <User className="h-5 w-5 text-library-DEFAULT" />
                    <span>{user?.name || 'User'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/loans" className="cursor-pointer">My Loans</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Register
                </Button>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 bg-white">
          <form onSubmit={handleSearch} className="mb-4 flex items-center relative">
            <Input
              type="text"
              placeholder="Search books..."
              className="w-full pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              className="absolute right-0"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
          
          <nav className="flex flex-col space-y-3 mb-4">
            <Link 
              to="/books" 
              className="text-gray-600 hover:text-library-DEFAULT transition-colors py-2 border-b border-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Book className="inline-block mr-2 h-4 w-4" /> 
              Browse Books
            </Link>
            {isAuthenticated && (
              <Link 
                to="/loans" 
                className="text-gray-600 hover:text-library-DEFAULT transition-colors py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Loans
              </Link>
            )}
          </nav>
          
          {isAuthenticated ? (
            <div className="border-t border-gray-100 pt-3 flex flex-col space-y-2">
              <Link 
                to="/profile" 
                className="text-gray-600 hover:text-library-DEFAULT transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <Button variant="outline" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="border-t border-gray-100 pt-3 flex flex-col space-y-2">
              <Button variant="outline" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
                Login
              </Button>
              <Button onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}>
                Register
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
