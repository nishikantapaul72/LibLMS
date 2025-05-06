export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  has_pdf?: number; // Legacy field (0 or 1)
  ebook?: string | null; // New field (URL or null)
  hasPhysical: number; // 0 or 1
  category: string;
  quantity: number;
  physicalStock: number | null;
  createdAt: string;
}

export interface BookLoan {
  id: number;
  book_id: number;
  user_id: number;
  status: "pending" | "approved" | "rejected" | "returned";
  requested_at: string;
  approved_at: string | null;
  due_date: string | null;
  returned_at: string | null;
  book: {
    id: number;
    title: string;
    author: string;
  };
}

export interface Feedback {
  id: number;
  user_id: number;
  book_id: number;
  rating: number;
  review: string;
  submitted_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ValidationError {
  message: string;
  errors: {
    [key: string]: string[];
  };
}

export interface ApiError {
  error: string;
  message: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}
