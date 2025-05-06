/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import BookCard from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Book} from '@/types';
import { booksApi } from '@/utils/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Filter, BookOpen, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const BooksPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Extract search query from URL if present
    const queryParams = new URLSearchParams(location.search);
    const searchFromURL = queryParams.get('search') || '';
    if (searchFromURL) {
      setSearchQuery(searchFromURL);
    }
    
    fetchBooks(1, searchFromURL);
  }, [location.search]);

  const fetchBooks = async (page: number, search = searchQuery) => {
    setLoading(true);
    try {
      const response = await booksApi.getBooks(page, search);
      console.log('Books response:', response);
      if (response) {
        setBooks(response.data);
        setCurrentPage(response.meta.current_page);
        setTotalPages(response.meta.last_page);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(response.data.map(book => book.category))
        );
        setCategories(uniqueCategories);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/books?search=${encodeURIComponent(searchQuery)}`);
    fetchBooks(1, searchQuery);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchBooks(page);
  };

  const filteredBooks = books.filter(book => {
    // Filter by type
    if (filterType === 'physical' && book.hasPhysical !== 1) return false;
    if (filterType === 'ebook' && book.has_pdf !== 1 && !book.ebook) return false;
    
    // Filter by category
    if (filterCategory !== 'all' && book.category !== filterCategory) return false;
    
    return true;
  });

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-library-DEFAULT flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          Book Collection
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search books by title, author or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10"
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-auto">
              <Select 
                value={filterType} 
                onValueChange={setFilterType}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Book Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="physical">Physical</SelectItem>
                  <SelectItem value="ebook">eBook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-auto">
              <Select 
                value={filterCategory} 
                onValueChange={setFilterCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 text-library-DEFAULT animate-spin" />
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {filteredBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No Books Found</h3>
          <p className="text-gray-500 mb-4">
            We couldn't find any books matching your criteria.
          </p>
          <Button onClick={() => {
            setSearchQuery('');
            setFilterType('all');
            setFilterCategory('all');
            fetchBooks(1, '');
            navigate('/books');
          }}>
            Clear Filters
          </Button>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className="cursor-pointer"
                aria-disabled={currentPage === 1}
              />
            </PaginationItem>
            
            {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={page === currentPage}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className="cursor-pointer"
                aria-disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </Layout>
  );
};

export default BooksPage;
