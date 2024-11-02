import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { AcademicSemesterModel } from '../academicSemester/academicSemester.model';
import { TSemesterRegsitration } from './semesterRegistration.interface';
import { SemesterRegistrationModel } from './semesterRegistration.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { RegistrationStatus } from './semesterRegistration.constant';
import mongoose from 'mongoose';
import { OfferedCourseModel } from '../OfferedCourse/OfferedCourse.model';

const createSemesterRegistrationIntoDB = async (
  payload: TSemesterRegsitration,
) => {
  const academicSemester = payload?.academicSemester;

  // check if there any registered semester that doesnt ended
  const isNotEndedSemesterExist = await SemesterRegistrationModel.findOne({
    $or: [
      { status: RegistrationStatus.ONGOING },
      { status: RegistrationStatus.UPCOMING },
    ],
  }).select('_id status');

  if (isNotEndedSemesterExist) {
    throw new AppError(
      httpStatus.CONFLICT,
      `There is already a registered ${isNotEndedSemesterExist.status} semester `,
    );
  }

  const isSemesterRegistationExists = await SemesterRegistrationModel.findOne({
    academicSemester,
  });

  if (isSemesterRegistationExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      'This semester is already registered !',
    );
  }

  //check if the semsester exist
  const isAcademicSemesterExist =
    await AcademicSemesterModel.findById(academicSemester);
  if (!isAcademicSemesterExist) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'This academic semester not found !',
    );
  }

  const result = await SemesterRegistrationModel.create(payload);

  return result;
};

const updateSemesterRegistrationIntoDB = async (
  id: string,
  payload: Partial<TSemesterRegsitration>,
) => {
  // if the requested semested ended, no update will be available

  const isRegisteredSemsesterExists =
    await SemesterRegistrationModel.findById(id);

  const currentSemesterStatus = isRegisteredSemsesterExists?.status;
  const requestedStatus = payload?.status;

  if (!isRegisteredSemsesterExists) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'This academic semester not found !',
    );
  }

  if (currentSemesterStatus === RegistrationStatus.ENDED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This academic semester  is already ended !',
    );
  }

  // upcoming --> ongoing--> ended
  if (
    currentSemesterStatus === RegistrationStatus.UPCOMING &&
    payload.status === RegistrationStatus.ENDED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Can not directly change from ${currentSemesterStatus} to ${requestedStatus}`,
    );
  }
  if (
    currentSemesterStatus === RegistrationStatus.ONGOING &&
    payload.status === RegistrationStatus.UPCOMING
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Can not directly change from ${currentSemesterStatus} to ${requestedStatus}`,
    );
  }
};

const getAllSemesterRegistrationsFromDB = async (
  query: Record<string, unknown>,
) => {
  const semesterRegistrationQuery = new QueryBuilder(
    SemesterRegistrationModel.find().populate('academicSemester'),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await semesterRegistrationQuery.modelQuery;
  const meta = await semesterRegistrationQuery.countTotal();
  return { meta, result };
};
const getSingleSemesterRegistrationsFromDB = async (id: string) => {
  const result =
    await SemesterRegistrationModel.findById(id).populate('academicSemester');
  return result;
};

const deleteSemesterRegistrationsFromDB = async (id: string) => {
  const isSemesterRegistrationExist =
    await SemesterRegistrationModel.findById(id);

  if (!isSemesterRegistrationExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Regsitered Semester Not found');
  }
  if (isSemesterRegistrationExist.status !== 'UPCOMING') {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `Can not delete a registered semster while status is ${isSemesterRegistrationExist.status}`,
    );
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const deletedOfferedCourses = await OfferedCourseModel.deleteMany(
      { semesterRegistration: id },
      { session },
    );
    const deletedRegisteredSemester =
      await SemesterRegistrationModel.findByIdAndDelete(id, { session });
    await session.commitTransaction();
    await session.endSession();
    return { deletedRegisteredSemester, deletedOfferedCourses };
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

export const SemesterRegistrationServices = {
  createSemesterRegistrationIntoDB,
  updateSemesterRegistrationIntoDB,
  getAllSemesterRegistrationsFromDB,
  getSingleSemesterRegistrationsFromDB,
  deleteSemesterRegistrationsFromDB,
};
