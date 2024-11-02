import { StudentServices } from './student.service';
import sendResponse from '../../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../../utils/catchAsync';

const getAllStudents = catchAsync(async (req, res) => {
  const result = await StudentServices.getAllStudentFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Students data found successfully',
    data: result,
  });
});

const getSingleStudent = catchAsync(async (req, res) => {
  const studentID = req.params.id;
  const result = await StudentServices.getAStudentFromDB(studentID);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Students data found successfully',
    data: result,
  });
});

const updateStudent = catchAsync(async (req, res) => {
  const studentID = req.params.studentId;

  const { student } = req.body;
  const result = await StudentServices.updateStudentIntoDB(studentID, student);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Students data updated successfully',
    data: result,
  });
});
const deleteStudent = catchAsync(async (req, res) => {
  const studentID = req.params.id;
  const result = await StudentServices.deleteStudentFromDB(studentID);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Students  deleted successfully',
    data: result,
  });
});

export const StudentController = {
  getAllStudents,
  getSingleStudent,
  updateStudent,
  deleteStudent,
};
