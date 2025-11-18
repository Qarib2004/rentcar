export interface UserPublicData {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatar: string | null;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
}
