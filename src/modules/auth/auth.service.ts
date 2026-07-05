import { User } from '../users/user.model';
import { IUser } from '../users/user.interface';
import ApiError from '../../shared/errors/ApiError';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../../config';

const registerUser = async (payload: IUser) => {
  const isExist = await User.findOne({ email: payload.email });
  if (isExist) {
    throw new ApiError(400, 'User already exists');
  }

  const result = await User.create(payload);
  const userWithoutPassword = await User.findById(result._id).select(
    '-password'
  );
  return userWithoutPassword;
};

const loginUser = async (payload: Partial<IUser>) => {
  const { email, password } = payload;
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(404, 'User does not exist');
  }

  const isPasswordMatch = await bcrypt.compare(
    password as string,
    user.password as string
  );

  if (!isPasswordMatch) {
    throw new ApiError(401, 'Password incorrect');
  }

  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    config.jwt.secret as string,
    { expiresIn: config.jwt.expires_in as any }
  );

  const userWithoutPassword = await User.findById(user._id).select('-password');

  return {
    token,
    user: userWithoutPassword,
  };
};

export const AuthService = {
  registerUser,
  loginUser,
};
