export type IUser = {
  name: string;
  email: string;
  password?: string;
  profileImage?: string;
  role: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
};
