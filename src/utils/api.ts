import { toast } from "@/components/ui/use-toast";
import {
  AuthResponse,
  Book,
  BookLoan,
  User,
  ValidationError,
  ApiResponse,
  Feedback,
} from "@/types";

// Base API URL - replace with your actual API URL in production
const API_BASE_URL = "http://libms.laravel-sail.site:8080/api/v1";

// Add this after the API_BASE_URL constant
const getHeaders = (includeContentType = false) => {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

// Helper to get the stored auth token
const getToken = () => localStorage.getItem("library_token");

interface ApiError {
  response?: {
    data?: ValidationError & {
      message?: string;
    };
  };
}
// Helper to handle API errors
const handleApiError = (error: ApiError) => {
  if (error.response?.data?.errors) {
    // Handle validation errors
    const validationError = error.response.data as ValidationError;
    const firstError =
      Object.values(validationError.errors)[0]?.[0] || validationError.message;
    toast({
      title: "Error",
      description: firstError,
      variant: "destructive",
    });
    return validationError;
  } else if (error.response?.data?.message) {
    // Handle API error messages
    toast({
      title: "Error",
      description: error.response.data.message,
      variant: "destructive",
    });
    return error.response.data;
  } else {
    // Handle network or unexpected errors
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive",
    });
    return { message: "An unexpected error occurred" };
  }
};

// Auth API calls
export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw { response: { data } };
      }

      // Store the token
      localStorage.setItem("library_token", data.access_token);
      localStorage.setItem("library_user", JSON.stringify(data.user));

      return data;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  async logout() {
    localStorage.removeItem("library_token");
    localStorage.removeItem("library_user");
  },

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem("library_user");
    return userJson ? JSON.parse(userJson) : null;
  },

  isAuthenticated(): boolean {
    return !!getToken();
  },
};

// Books API
export const booksApi = {
  async getBooks(
    page = 1,
    searchQuery = ""
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<{ data: Book[]; meta: any } | null> {
    try {
      const token = getToken();
      let url = `${API_BASE_URL}/books?page=${page}`;
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const response = await fetch(url, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw { response };
      }

      return await response.json();
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  async getBookById(id: number): Promise<ApiResponse<Book> | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw { response };
      }

      return await response.json();
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },
};

// Book Loans API
export const bookLoansApi = {
  async requestBook(bookId: number): Promise<boolean> {
    try {
      const token = getToken();
      if (!token) {
        toast({
          title: "Error",
          description: "You need to login first",
          variant: "destructive",
        });
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/book-loan-request`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({ book_id: bookId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw { response: { data } };
      }

      toast({
        title: "Success",
        description: data.message || "Book requested successfully",
      });

      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },

  async getLoans(
    status?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<{ data: BookLoan[]; meta: any } | null> {
    try {
      const token = getToken();
      if (!token) return null;

      const url = status
        ? `${API_BASE_URL}/book-loans?status=${encodeURIComponent(status)}`
        : `${API_BASE_URL}/book-loans`;

      const response = await fetch(url, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw { response };
      }

      return await response.json();
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  async requestExtension(
    loanId: number,
    newDate: string,
    Reason: string
  ): Promise<boolean> {
    console.log("Requesting extension for loan ID:", loanId);
    console.log("New date:", newDate);
    console.log("Reason:", Reason);
    try {
      const token = getToken();
      if (!token) return false;
      const response = await fetch(
        `${API_BASE_URL}/book-loans/${loanId}/request-due-date`,
        {
          method: "PUT",
          headers: getHeaders(true),
          body: JSON.stringify({ dueDate: newDate, reason: Reason }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw { response: { data } };
      }

      toast({
        title: "Success",
        description: data.message || "Extension requested successfully",
      });

      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },

  async returnBook(loanId: number): Promise<boolean> {
    try {
      const token = getToken();
      if (!token) return false;

      const response = await fetch(
        `${API_BASE_URL}/book-loans/${loanId}/return`,
        {
          method: "PATCH",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw { response: { data } };
      }

      toast({
        title: "Success",
        description: data.message || "Book returned successfully",
      });

      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },
};

// Feedback API
export const feedbackApi = {
  async submitFeedback(
    bookId: number,
    rating: number,
    comment: string
  ): Promise<boolean> {
    try {
      const token = getToken();
      if (!token) return false;

      const response = await fetch(`${API_BASE_URL}/books/${bookId}/feedback`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({ rating: rating.toString(), comment }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw { response: { data } };
      }

      toast({
        title: "Success",
        description: data.message || "Feedback submitted successfully",
      });

      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },
  async getFeedbackByBookId(
    bookId: number
  ): Promise<ApiResponse<Feedback[] | null>> {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${bookId}/feedback`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw { response };
      }

      return await response.json();
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },
};
