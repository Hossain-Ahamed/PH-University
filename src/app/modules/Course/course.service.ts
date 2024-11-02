import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { courseSearchableFields } from './course.constant';
import { Tcourse, TCourseFaculty } from './course.interface';
import { CourseFacultyModel, CourseModel } from './course.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

const createCourseIntoDB = async (payload: Tcourse) => {
  const result = await CourseModel.create(payload);
  return result;
};

const getAllcoursesFromDB = async (query: Record<string, unknown>) => {
  const courseQuery = new QueryBuilder(
    CourseModel.find().populate('preRequisiteCourses.course'),
    query,
  )
    .search(courseSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await courseQuery.modelQuery;
  const meta = await courseQuery.countTotal();
  return { meta, result };
};

const getSinglecourseFromDB = async (id: string) => {
  const result = await CourseModel.findById(id).populate(
    'preRequisiteCourses.course',
  );
  return result;
};

const deleteCourseIntoDB = async (id: string) => {
  const result = await CourseModel.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
    },
    { new: true },
  );
  return result;
};

const updateCourseIntoDB = async (id: string, payload: Partial<Tcourse>) => {
  const { preRequisiteCourses, ...courseRemainingData } = payload;

  //step 1 : basic course info update

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const UpdatebasicCourseInfo = await CourseModel.findByIdAndUpdate(
      id,
      courseRemainingData,
      {
        new: true,
        runValidators: true,
        session,
      },
    );

    if (!UpdatebasicCourseInfo) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to Update course');
    }
    if (
      preRequisiteCourses &&
      Array.isArray(preRequisiteCourses) &&
      preRequisiteCourses.length > 0
    ) {
      //filter out the deleted fields and get the course id
      const deletedPrerequisites = preRequisiteCourses
        .filter((el) => el.course && el.isDeleted)
        .map((el) => el.course);
      const deletedPrerequisiteCourses = await CourseModel.findByIdAndUpdate(
        id,
        {
          $pull: {
            preRequisiteCourses: { course: { $in: deletedPrerequisites } },
          },
        },
        {
          new: true,
          runValidators: true,
          session,
        },
      );

      if (!deletedPrerequisiteCourses) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Failed to delete prerequisite course',
        );
      }

      //filter out the new course fields and get the course id
      const newPrerequisiteCourse = preRequisiteCourses.filter(
        (el) => el.course && !el.isDeleted,
      );

      const newPrerequisiteCourses = await CourseModel.findByIdAndUpdate(
        id,
        {
          $addToSet: { preRequisiteCourses: { $each: newPrerequisiteCourse } },
        },
        {
          new: true,
          runValidators: true,
          session,
        },
      );

      if (!newPrerequisiteCourses) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Failed to add new prerequisite course',
        );
      }
    }

    await session.commitTransaction();
    await session.endSession();

    const updatedData = await CourseModel.findById(id).populate(
      'preRequisiteCourses.course',
    );
    return updatedData;
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

const getFacultiesWithCourseFromDB = async (courseID: string) => {
  const result = await CourseFacultyModel.findOne({
    course: courseID,
  }).populate('faculties');
  return result;
};

const assignFacultiesWithCourseIntoDB = async (
  id: string,
  payload: Partial<TCourseFaculty>,
) => {
  const result = await CourseFacultyModel.findByIdAndUpdate(
    id,
    {
      course: id,
      $addToSet: { faculties: { $each: payload } },
    },
    {
      upsert: true, //if previous update,dont create,
      new: true,
    },
  );
  return result;
};

const removeFacultiesFromCourseIntoDB = async (
  id: string,
  payload: Partial<TCourseFaculty>,
) => {
  const result = await CourseFacultyModel.findByIdAndUpdate(
    id,
    {
      $pull: { faculties: { $in: payload } },
    },
    {
      new: true,
    },
  );
  return result;
};

export const CourseServices = {
  createCourseIntoDB,
  getAllcoursesFromDB,
  getSinglecourseFromDB,
  updateCourseIntoDB,
  deleteCourseIntoDB,
  getFacultiesWithCourseFromDB,
  assignFacultiesWithCourseIntoDB,
  removeFacultiesFromCourseIntoDB,
};
