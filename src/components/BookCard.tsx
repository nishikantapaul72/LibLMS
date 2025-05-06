import React from "react";
import { Link } from "react-router-dom";
import { Book } from "@/types";
import { BookOpen, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  console.log("From BookCard", book);
  return (
    <div className="book-card rounded-lg border border-gray-200 overflow-hidden bg-white shadow hover:shadow-lg">
      <div className="h-40 bg-library-light/10 flex items-center justify-center">
        <BookOpen size={60} className="text-library-DEFAULT/50" />
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {book.hasPhysical === 1 && (
            <span className="badge-physical">Physical</span>
          )}
          {(book.ebook || book.has_pdf === 1) && (
            <span className="badge-ebook">eBook</span>
          )}
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 text-xs rounded-full">
            {book.category}
          </span>
        </div>
        <Link to={`/books/${book.id}`}>
          <h3 className="text-lg font-semibold text-library-DEFAULT line-clamp-2 hover:underline">
            {book.title}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
        <p className="text-gray-700 text-sm line-clamp-3 mb-4">
          {book.description}
        </p>
        <div className="flex justify-between items-center mt-auto">
          {book.hasPhysical === 1 ? (
            <div className="text-sm text-gray-600">
              Stock: {book.physicalStock !== null ? book.physicalStock : "N/A"}
            </div>
          ) : (
            <div></div>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link to={`/books/${book.id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
