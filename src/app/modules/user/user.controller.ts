import { RequestHandler } from 'express';
import { UserServices } from './user.service';
import sendResponse from '../../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../../utils/catchAsync';
const createStudent: RequestHandler = catchAsync(async (req, res) => {
  const { password, student: studentData } = req.body;

  // const zodParseData = StudentZodValidationSchema.parse(studentData);
  const result = await UserServices.createStudentIntoDb(
    req.file,
    password,
    studentData,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student created successfully',
    data: result,
  });
});

const createFaculty: RequestHandler = catchAsync(async (req, res) => {
  const { password, faculty } = req.body;

  const result = await UserServices.createFacultyIntoDB(
    req.file,
    password,
    faculty,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Faculty created succcessfully',
    data: result,
  });
});

const createAdmin: RequestHandler = catchAsync(async (req, res) => {
  const { password, admin } = req.body;

  const result = await UserServices.createAdminIntoDB(
    req.file,
    password,
    admin,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Faculty created succcessfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  //   const token = req.headers.authorization;
  // console.log(req.user)
  //   if(!token){
  //     throw new AppError(httpStatus.FORBIDDEN,"Not authrozied")
  //   }

  const { userId, role } = req.user;

  const result = await UserServices.getMyProfile(userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User data found succcessfully',
    data: result,
  });
});

const changeStatus = catchAsync(async (req, res) => {
  const id = req.params?.id;
  const result = await UserServices.changeUserStatusIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User status changed succcessfully',
    data: result,
  });
});

export const userControllers = {
  createStudent,
  createFaculty,
  createAdmin,
  getMyProfile,
  changeStatus,
};
