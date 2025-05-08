import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Library, BookOpen, UserCheck, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Book } from "@/types";
import { booksApi } from "@/utils/api";
import BookCard from "@/components/BookCard";

const Index = () => {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      setLoading(true);
      try {
        const response = await booksApi.getBooks(1);
        if (response?.data) {
          setFeaturedBooks(response.data.slice(0, 4));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);
  return (
    <Layout>
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row gap-8 items-center mb-16 py-8">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold text-library-DEFAULT mb-4">
            Your Gateway to Digital & Physical Books
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Request physical books or download digital copies from our extensive
            collection. All in one platform, accessible anytime.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              className="bg-library-DEFAULT hover:bg-library-light text-white"
              asChild
            >
              <Link to="/books">Browse Collection</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-md aspect-square">
            <div className="absolute top-0 right-0 w-4/5 h-4/5 bg-library-DEFAULT/10 rounded-lg"></div>
            <div className="absolute bottom-0 left-0 w-4/5 h-4/5 bg-library-secondary/10 rounded-lg"></div>
            <div className="absolute inset-0 m-auto w-4/5 h-4/5 bg-white shadow-xl rounded-lg flex items-center justify-center">
              <Library size={100} className="text-library-DEFAULT" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-library-DEFAULT/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} className="text-library-DEFAULT" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Browse Books</h3>
            <p className="text-gray-600">
              Explore our extensive collection of physical and digital books
              across various categories.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-library-DEFAULT/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck size={32} className="text-library-DEFAULT" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Request or Download</h3>
            <p className="text-gray-600">
              Request physical books for pickup or instantly download available
              eBooks.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-library-DEFAULT/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download size={32} className="text-library-DEFAULT" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Manage Your Books</h3>
            <p className="text-gray-600">
              Track borrowed books, request extensions, and maintain your
              reading history.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Featured Books</h2>
          <Button variant="link" className="text-library-DEFAULT" asChild>
            <Link to="/books">View All</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? // Show loading skeletons
              Array(4)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="book-card bg-white rounded-lg shadow overflow-hidden animate-pulse"
                  >
                    <div className="h-40 bg-gray-200" />
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                      <div className="h-20 bg-gray-200 rounded mb-4" />
                    </div>
                  </div>
                ))
            : featuredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
