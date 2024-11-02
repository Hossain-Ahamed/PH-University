import mongoose from 'mongoose';
import config from '../../config';
import AppError from '../../errors/AppError';
import { AcademicSemesterModel } from '../academicSemester/academicSemester.model';
import { TStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { TUser, TUserRole } from './user.interface';
import { User } from './user.model';
import {
  generateAdminId,
  generateFacultyID,
  generateStudentID,
} from './user.utils';
import httpStatus from 'http-status';
import { TFaculty } from '../Faculty/faculty.interface';
import { FacultyModel } from '../Faculty/faculty.model';
import { AcamdemicDepartmentModel } from '../academicDepartment/academicDepartment.model';
import { TAdmin } from '../admin/admin.interface';
import { AdminModel } from '../admin/admin.model';
import { sendImageToCloudinary } from '../../../utils/sendImageToCloudinary';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createStudentIntoDb = async (
  file: any,
  password: string,
  payload: TStudent,
) => {
  //create a user object
  const userData: Partial<TUser> = {};
  userData.password = password || (config.default_password as string); //if password is not given use default pass
  userData.role = 'student'; //set student role --> as I received by route
  userData.email = payload.email;

  //find academic sesmster info
  const admissionSemester = await AcademicSemesterModel.findById(
    payload.admissionSemester,
  );

  if (!admissionSemester) {
    throw new AppError(404, 'Admission semester not found');
  }

  //find academic department info
  const academicDepartment = await AcamdemicDepartmentModel.findById(
    payload.academicDepartment,
  );

  if (!academicDepartment) {
    throw new AppError(404, 'Academic department  not found');
  }
  payload.academicFaculty = academicDepartment.academicFaculty;

  //create session  //13-9
  const session = await mongoose.startSession();

  try {
    //start session transaction
    session.startTransaction();

    //generate student id
    userData.id = await generateStudentID(admissionSemester);

    //send image to cloudinary
    if (file) {
      const imageName = `${userData.id}${payload?.name?.firstName}`;
      const path = file.path; // uplaoded image in local files
      const { secure_url } = await sendImageToCloudinary(imageName, path);
      payload.profileImg = secure_url as string;
    }

    //create a user --> trasnsaction 1
    const newUser = await User.create([userData], { session });
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create user');
    }

    // Set id and _id in student payload
    payload.id = newUser[0].id; // Embedded id
    payload.user = newUser[0]._id; // Reference _id

    //create a student ---------> transaction 2
    const newStudent = await Student.create([payload], { session });

    if (!newStudent.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create student');
    }

    //completed -->end
    await session.commitTransaction();
    await session.endSession();

    return newStudent;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error) {
    //session error
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(
      httpStatus.BAD_REQUEST,
      (error as Error).message || 'An unknown error occurred',
      (error as Error)?.stack,
    );
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createFacultyIntoDB = async (
  file: any,
  password: string,
  payload: TFaculty,
) => {
  const userData: Partial<TUser> = {};

  userData.role = 'faculty';
  userData.email = payload.email;
  userData.password = password || config.default_password;

  const academicDepartment = await AcamdemicDepartmentModel.findById(
    payload.academicDepartment,
  );

  if (!academicDepartment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Academic department not found');
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    userData.id = await generateFacultyID();

    //create user w transaction

    const newUser = await User.create([userData], { session });

    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create a user');
    }

    //send image to cloudinary
    if (file) {
      const imageName = `${userData.id}${payload?.name?.firstName}`;
      const path = file.path; // uplaoded image in local files
      const { secure_url } = await sendImageToCloudinary(imageName, path);
      payload.profileImg = secure_url as string;
    }

    payload.id = newUser[0].id;
    payload.user = newUser[0]._id;

    const newFaculty = await FacultyModel.create([payload], { session });

    if (!newFaculty.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create a faculty');
    }

    await session.commitTransaction();
    await session.endSession();

    return newFaculty;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create', err?.stack);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createAdminIntoDB = async (
  file: any,
  password: string,
  payload: TAdmin,
) => {
  const userData: Partial<TUser> = {};

  userData.password = password || (config.default_password as string);

  userData.role = 'admin';
  userData.email = payload.email;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    //set  generated id
    userData.id = await generateAdminId();

    // create a user (transaction-1)
    const newUser = await User.create([userData], { session });

    //create a admin
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create admin');
    }

    /**  --------------------- UPLOADING IMAGE ---------------------------------------------- */
    if (file) {
      const imageName = `${userData.id}${payload?.name?.firstName}`;
      const path = file.path; // uplaoded image in local files
      const { secure_url } = await sendImageToCloudinary(imageName, path);
      payload.profileImg = secure_url as string;
    }

    // set id , _id as user
    payload.id = newUser[0].id;
    payload.user = newUser[0]._id; //reference _id

    // create a admin (transaction-2)
    const newAdmin = await AdminModel.create([payload], { session });

    if (!newAdmin.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create admin');
    }

    await session.commitTransaction();
    await session.endSession();

    return newAdmin;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create', err?.stack);
  }
};

const getMyProfile = async (userId: string, role: TUserRole) => {
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
  let result;
  if (role === 'student') {
    result = await Student.findOne({ id: userId })
      .populate('admissionSemester')
      .populate('academicDepartment')
      .populate({
        path: 'academicDepartment',
        populate: {
          path: 'academicFaculty',
        },
      });
  }
  if (role === 'admin') {
    result = await AdminModel.findOne({ id: userId });
  }
  if (role === 'faculty') {
    result = await FacultyModel.findOne({ id: userId })
      .populate('admissionSemester')
      .populate('academicDepartment')
      .populate({
        path: 'academicDepartment',
        populate: {
          path: 'academicFaculty',
        },
      });
  }

  return result;
};

// 19-8
const changeUserStatusIntoDB = async (
  id: string,
  payload: { status: string },
) => {
  const result = await User.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

export const UserServices = {
  createStudentIntoDb,
  createFacultyIntoDB,
  createAdminIntoDB,
  getMyProfile,
  changeUserStatusIntoDB,
};
