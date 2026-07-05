import { User } from './user.model';

const getUserProfile = async (id: string) => {
  const user = await User.findById(id).select('-password');
  return user;
};

const getAllUsers = async () => {
  const users = await User.find().select('-password');
  return users;
};

export const UserService = {
  getUserProfile,
  getAllUsers,
};
