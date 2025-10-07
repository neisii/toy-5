export type User = {
  id: number;
  email: string;
  createdAt: string;
};

export type SignupData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type AuthResponse = {
  message: string;
  user?: User;
  token?: string;
};

export type ErrorResponse = {
  error: string;
};
