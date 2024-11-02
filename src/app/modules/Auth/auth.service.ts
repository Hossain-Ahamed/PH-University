import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { TLoginUser } from './auth.interface';
import { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import bcrypt from 'bcrypt';
import { createToken, verifyToken } from './auth.utils';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../../../utils/sendEmail';
const loginUser = async (payload: TLoginUser) => {
  // check if the userExist
  const user = await User.isUserExistsByCustomId(payload.id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'User is already removed from system',
    );
  }

  // checking if the user is blocked
  const userStatus = user?.status;
  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked');
  }

  //access granted : send AccessToken, refreshToken

  //checking if the password is correct
  if (!(await User.isPasswordMatched(payload.password, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password is not correct');
  }
  // create token and sent to the client

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };
  const accessToken = createToken(
    jwtPayload,
    config.JWT_ACCESS_SECRET as string,
    config.JWT_ACCESS_EXPIRES_IN as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.JWT_REFRESH_SECRET as string,
    config.JWT_REFRESH_EXPIRES_IN as string,
  );

  return {
    accessToken,
    refreshToken,
    needsPasswordChange: user?.needsPasswordChange,
  };
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  // check if the userExist
  const user = await User.isUserExistsByCustomId(userData.userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'User is already removed from system',
    );
  }
  // checking if the user is blocked
  const userStatus = user?.status;
  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked');
  }
  //checking if the old password is correcttly matched with db password
  if (!(await User.isPasswordMatched(payload.oldPassword, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'old Password is not correct');
  }

  //hash the new password

  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_round),
  );
  await User.findOneAndUpdate(
    {
      id: user.id,
      role: user.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  );
  return null;
};
const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthrized access');
  }

  const decoded = jwt.verify(
    token,
    config.JWT_REFRESH_SECRET as string,
  ) as JwtPayload;

  const { userId, iat } = decoded;

  const user = await User.isUserExistsByCustomId(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'User is already removed from system',
    );
  }

  // checking if the user is blocked
  const userStatus = user?.status;
  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked');
  }

  //check if the token is generated before the  password has changed
  if (
    user?.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized. Log in Again',
    );
  }

  const jwtPayload = {
    userId: user?.id,
    role: user?.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.JWT_ACCESS_SECRET as string,
    config.JWT_ACCESS_EXPIRES_IN as string,
  );

  return {
    accessToken,
  };
};
// 19-3
const forgetPassword = async (userId: string) => {
  const user = await User.isUserExistsByCustomId(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'User is already removed from system',
    );
  }

  // checking if the user is blocked
  const userStatus = user?.status;
  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked');
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };
  const accessToken = createToken(
    jwtPayload,
    config.JWT_ACCESS_SECRET as string,
    '10m',
  );
  const resetUILink = `${config.RESET_PASSWORD_URI}?id=${user.id}&token=${accessToken}`;
  await sendEmail(user.email, resetUILink);
};

//19-5
const resetPassword = async (
  payload: { id: string; newPassword: string },
  token: string,
) => {
  const { id, newPassword } = payload;
  const user = await User.isUserExistsByCustomId(id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'User is already removed from system',
    );
  }

  // checking if the user is blocked
  const userStatus = user?.status;
  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked');
  }

  const decoded = verifyToken(token, config.JWT_REFRESH_SECRET as string);

  if (decoded?.userId !== id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'User ID not matched with the requested user ID',
    );
  }

  const newHashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_round),
  );
  await User.findOneAndUpdate(
    {
      id: user.id,
      role: user.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  );
};

export const AuthServices = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
};
