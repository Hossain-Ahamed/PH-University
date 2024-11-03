import mongoose from 'mongoose';
import { Student } from './student.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { User } from '../user/user.model';
import { TStudent } from './student.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import { studentSearchableFields } from './student.constant';

//get student
const getAllStudentFromDB = async (query: Record<string, unknown>) => {
  const studentQuery = new QueryBuilder(
    Student.find()
      .populate('admissionSemester academicDepartment academicFaculty'),query,
      // .populate({
      //   path: 'academicDepartment',
      //   populate: {
      //     path: 'academicFaculty',
      //   },
      // }),
    
  )
    .search(studentSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await studentQuery.modelQuery;
  const meta = await studentQuery.countTotal();
  return { meta, result };
};

const getAStudentFromDB = async (id: string) => {
  const result = await Student.findById(id)
    .populate('admissionSemester')
    .populate('academicDepartment')
    .populate({
      path: 'academicDepartment',
      populate: {
        path: 'academicFaculty',
      },
    });
  return result;
};

const flattenNestedObject = (
  prefix: string,
  nestedObject: Record<string, unknown>,
) => {
  const flatObject: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(nestedObject)) {
    flatObject[`${prefix}.${key}`] = value;
  }
  return flatObject;
};

const updateStudentIntoDB = async (id: string, payload: Partial<TStudent>) => {
  const { name, guardian, localGuardian, ...remainingStudentData } = payload;
  const modifiedData_ForDB: Record<string, unknown> = {
    ...remainingStudentData,
  };

  if (name && Object.keys(name).length) {
    Object.assign(modifiedData_ForDB, flattenNestedObject('name', name));
  }
  if (guardian && Object.keys(guardian).length) {
    Object.assign(
      modifiedData_ForDB,
      flattenNestedObject('guardian', guardian),
    );
  }
  if (localGuardian && Object.keys(localGuardian).length) {
    Object.assign(
      modifiedData_ForDB,
      flattenNestedObject('localGuardian', localGuardian),
    );
  }

  const result = await Student.findByIdAndUpdate(id, modifiedData_ForDB, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteStudentFromDB = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const deletedStudent = await Student.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true, session },
    );

    if (!deletedStudent) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete student');
    }

    const deletedUser = await User.findByIdAndUpdate(
      deletedStudent.user,
      { isDeleted: true },
      { new: true, session },
    );
    if (!deletedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete user');
    }

    await session.commitTransaction();
    await session.endSession();

    return deletedStudent;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(
      httpStatus.BAD_REQUEST,
      (error as Error).message || 'An unknown error occurred',
      (error as Error)?.stack,
    );
  }
};
export const StudentServices = {
  getAllStudentFromDB,
  getAStudentFromDB,
  updateStudentIntoDB,
  deleteStudentFromDB,
};
