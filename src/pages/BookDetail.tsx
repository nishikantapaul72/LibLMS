import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Book } from "@/types";
import { booksApi, bookLoansApi, feedbackApi, authApi } from "@/utils/api";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Download,
  Calendar,
  Clock,
  Star,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);
  const [showLoanSuccess, setShowLoanSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBook(parseInt(id));
      fetchFeedback(parseInt(id));
    }

    setIsAuthenticated(authApi.isAuthenticated());
  }, [id]);

  const fetchBook = async (bookId: number) => {
    setLoading(true);
    try {
      const response = await booksApi.getBookById(bookId);
      console.log("fetchbook", response);
      if (response.data) {
        setBook(response.data);
      }
    } finally {
      setLoading(false);
    }
  };
  const fetchFeedback = async (bookId: number) => {
    setLoading(true);
    try {
      const response = await feedbackApi.getFeedbackByBookId(bookId);
      if (response) {
        setBook((prevBook) => ({
          ...prevBook,
          feedback: response,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestBook = async () => {
    if (!book) return;

    setRequestLoading(true);
    try {
      const success = await bookLoansApi.requestBook(book.id);
      if (success) {
        setShowLoanSuccess(true);
        // Hide success message after 5 seconds
        setTimeout(() => setShowLoanSuccess(false), 5000);
      }
    } finally {
      setRequestLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!book) return;

    setReviewLoading(true);
    try {
      const success = await feedbackApi.submitFeedback(book.id, rating, review);
      if (success) {
        setRating(0);
        setReview("");
        setShowFeedbackSuccess(true);
        // Hide success message after 5 seconds
        setTimeout(() => setShowFeedbackSuccess(false), 5000);
      }
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 text-library-DEFAULT animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!book) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Book Not Found</h1>
          <p className="text-gray-500 mb-4">
            The book you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/books">Go Back to Books</Link>
          </Button>
        </div>
      </Layout>
    );
  }
  console.log("book", book);
  return (
    <Layout>
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="flex items-center"
        >
          <Link to="/books">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Books
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
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

            <h1 className="text-3xl font-bold text-library-DEFAULT mb-2">
              {book.title}
            </h1>
            <p className="text-xl text-gray-600 mb-6">by {book.author}</p>

            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700 mb-6">{book.description}</p>

            {showLoanSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-6 flex items-start">
                <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">
                    Book request submitted successfully!
                  </p>
                  <p className="text-sm">
                    You will be notified once your request is approved.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {book.hasPhysical === 1 && (
                <Button
                  onClick={handleRequestBook}
                  disabled={
                    requestLoading ||
                    !isAuthenticated ||
                    (book.quantity !== null && book.quantity <= 0)
                  }
                  className="bg-library-DEFAULT hover:bg-library-light"
                >
                  {requestLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Requesting...
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Request Physical Book
                    </>
                  )}
                </Button>
              )}

              {(book.ebook || book.has_pdf === 1) && (
                <Button disabled={!isAuthenticated} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download eBook
                </Button>
              )}

              {!isAuthenticated && (
                <div className="w-full mt-3 text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                  <Link to="/login" className="font-medium underline">
                    Sign in
                  </Link>{" "}
                  to request or download this book
                </div>
              )}
            </div>
          </div>

          {isAuthenticated && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Rate & Review</CardTitle>
                <CardDescription>
                  Share your thoughts about this book with other readers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showFeedbackSuccess ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md flex items-start">
                    <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">
                        Thank you for your feedback!
                      </p>
                      <p className="text-sm">
                        Your rating and review have been submitted successfully.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        Rating
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`p-1 rounded-full hover:bg-gray-100 transition-colors`}
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= rating
                                  ? "fill-library-accent text-library-accent"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        Review
                      </label>
                      <Textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Share your thoughts about this book..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <Button
                      onClick={handleSubmitFeedback}
                      disabled={reviewLoading || rating === 0}
                      className="w-full"
                    >
                      {reviewLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Review"
                      )}
                    </Button>
                    {book.feedback && book.feedback.length > 0 && (
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle>Reader Feedback</CardTitle>
                          <CardDescription>
                            See What other readers have said about this book
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {book.feedback.map((feedback, index) => (
                            <div
                              key={index}
                              className="border-b last:border-b-0 pb-4 last:pb-0"
                            >
                              <div className="flex items-center mb-2">
                                <div className="flex gap-1 mr-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= feedback.rating
                                          ? "fill-library-accent text-library-accent"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span>
                                  {feedback.createAt
                                    ? new Date(
                                        feedback.createAt
                                      ).toLocaleDateString()
                                    : "Data Not Available"}
                                </span>
                              </div>
                              <p className="text-gray-700">{feedback.review}</p>
                              {feedback.user && (
                                <p className="text-sm text-gray-500 mt-1">
                                  — {feedback.user.name || "Anonymous"}
                                </p>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Book Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{book.category}</p>
              </div>

              {book.hasPhysical === 1 && (
                <div>
                  <p className="text-sm text-gray-500">Physical Stock</p>
                  <div className="flex items-center">
                    {book.quantity !== null ? (
                      <span
                        className={`font-medium ${
                          book.quantity > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {book.quantity > 0
                          ? `${book.quantity} Available`
                          : "Out of stock"}
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        Stock information unavailable
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">Format</p>
                <div className="flex flex-wrap gap-2">
                  {book.hasPhysical === 1 && (
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1 text-library-DEFAULT" />
                      <span>Physical</span>
                    </div>
                  )}
                  {(book.ebook || book.has_pdf === 1) && (
                    <div className="flex items-center">
                      <Download className="h-4 w-4 mr-1 text-library-secondary" />
                      <span>eBook</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Added On</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  <span>{new Date(book.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loan Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <Clock className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Loan Duration</p>
                  <p className="text-sm text-gray-500">
                    Physical books can be borrowed for up to 14 days
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Extensions</p>
                  <p className="text-sm text-gray-500">
                    You can request an extension before the due date
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default BookDetail;
