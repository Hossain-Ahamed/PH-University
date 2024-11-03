import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { OfferedCourseModel } from '../OfferedCourse/OfferedCourse.model';
import { TEnrolledCourse } from './enrolledCourse.interface';
import EnrolledCourseModel from './enrolledCourse.model';
import { Student } from '../student/student.model';
import mongoose from 'mongoose';
import { SemesterRegistrationModel } from '../SemesterRegsitration/semesterRegistration.model';
import { CourseModel } from '../Course/course.model';
import { FacultyModel } from '../Faculty/faculty.model';
import { calculateGradeAndPoints, SumMarks } from './enrolledCourse.utils';
import QueryBuilder from '../../builder/QueryBuilder';

const createEnrolledCourseIntoDB = async (
  userId: string,
  payload: TEnrolledCourse,
) => {
  /**
   * Check if offered course exist
   * check if the student is already enrolled
   * check if the max credit exceeded or not
   * create an enrolled course
   *
   */

  const student = await Student.findOne({ id: userId }, { _id: 1 });
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'student not found');
  }
  const { offeredCourse } = payload;
  const isOfferedCourseExists =
    await OfferedCourseModel.findById(offeredCourse);

  if (!isOfferedCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered Course not found');
  }

  if (isOfferedCourseExists.maxCapacity <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Room capcity is full');
  }

  const isAlreadyEnrolled = await EnrolledCourseModel.findOne({
    semesterRegistration: isOfferedCourseExists?.semesterRegistration,
    offeredCourse,
    student: student._id,
  });

  if (isAlreadyEnrolled) {
    throw new AppError(httpStatus.CONFLICT, 'already enrolled');
  }

  const courseData = await CourseModel.findById(isOfferedCourseExists?.course, {
    credits: 1,
  });

  //check total credit exceeds max credit or not
  const RegisteredSemesterData = await SemesterRegistrationModel.findById(
    isOfferedCourseExists.semesterRegistration,
    { maxCredit: 1 },
  );

  //total enrolled credits + new enrolled credits > maxCrdit ?
  const enrolledCourses = await EnrolledCourseModel.aggregate([
    // 20-5
    {
      $match: {
        semesterRegistration: isOfferedCourseExists.semesterRegistration,
        student: student._id,
      },
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'enrolledCourseData',
      },
    },
    {
      $unwind: '$enrolledCourseData',
    },
    {
      $group: {
        _id: null,
        totalEnrolledCredits: { $sum: '$enrolledCourseData.credits' },
      },
    },
    {
      $project: {
        _id: 0,
        totalEnrolledCredits: 1,
      },
    },
  ]);
  const AlreadyEnrolledCredits =
    enrolledCourses.length > 0 ? enrolledCourses[0].totalEnrolledCredits : 0;
  const maxCreditLimit = RegisteredSemesterData?.maxCredit;
  const newCourseCredits = courseData?.credits;

  if (
    AlreadyEnrolledCredits &&
    maxCreditLimit &&
    AlreadyEnrolledCredits + newCourseCredits > maxCreditLimit
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have exceeded max number of credit',
    );
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const result = await EnrolledCourseModel.create(
      [
        {
          semesterRegistration: isOfferedCourseExists.semesterRegistration,
          academicSemester: isOfferedCourseExists.academicSemester,
          academicFaculty: isOfferedCourseExists.academicFaculty,
          academicDepartment: isOfferedCourseExists.academicDepartment,
          offeredCourse: payload.offeredCourse,
          course: isOfferedCourseExists.course,
          student: student._id,
          faculty: isOfferedCourseExists.faculty,
          isEnrolled: true,
        },
      ],
      { session },
    );

    if (!result) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to enrol to this course',
      );
    }

    //// const maxCapacity = isOfferedCourseExists.maxCapacity;
    //decreese max capcity of the course after one student enrolled
    await OfferedCourseModel.findByIdAndUpdate(
      offeredCourse,
      {
        $inc: { maxCapacity: -1 },
      },
      {
        new: true,
        session,
      },
    );

    await session.commitTransaction();
    await session.endSession();

    return result;
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

const updateEnrolledCourseMarks = async (
  facultyId: string,
  payload: Partial<TEnrolledCourse>,
) => {
  const { semesterRegistration, offeredCourse, student, courseMarks } = payload;

  const facultyData = await FacultyModel.findOne({ id: facultyId }, { _id: 1 });
  if (!facultyData) {
    throw new AppError(httpStatus.NOT_FOUND, 'faculty not found');
  }

  const isRegisteredSemesterExist =
    await SemesterRegistrationModel.findById(semesterRegistration);
  if (!isRegisteredSemesterExist) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Semester Registration  not found',
    );
  }

  const isOfferedCourseExist = await OfferedCourseModel.findById(offeredCourse);
  if (!isOfferedCourseExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered Course not found');
  }

  const isStudentExist = await Student.findById(student);
  if (!isStudentExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
  }

  const isRequestedCourseBelongToFaculty = await EnrolledCourseModel.findOne({
    semesterRegistration,
    offeredCourse,
    student: student,
    faculty: facultyData._id,
  });
  if (!isRequestedCourseBelongToFaculty) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Your are forbidden to make change',
    );
  }

  //dynamic data

  const modifiedData: Record<string, unknown> = { ...courseMarks };

  if (courseMarks?.finalTerm) {
    const { classTest1, classTest2, midTerm } =
      isRequestedCourseBelongToFaculty.courseMarks;

    // const totalMarks = Math.ceil(classTest1*0.1) +  Math.ceil(classTest2*0.1) +  Math.ceil(midTerm*0.3)+ Math.ceil(courseMarks?.finalTerm*0.5);

    const totalMarks = SumMarks(
      classTest1,
      classTest2,
      midTerm,
      courseMarks.finalTerm,
    );
    const { grade, gradePoints } = calculateGradeAndPoints(totalMarks);

    modifiedData.grade = grade;
    modifiedData.gradePoints = gradePoints;
    modifiedData.isCompleted = true;
  }

  if (courseMarks && Object.keys(courseMarks).length) {
    for (const [key, value] of Object.entries(courseMarks)) {
      modifiedData[`courseMarks.${key}`] = value;
    }
  }

  const result = await EnrolledCourseModel.findByIdAndUpdate(
    isRequestedCourseBelongToFaculty._id,
    modifiedData,
    { new: true },
  );

  return result;
};

const getMyEnrolledCoursesFromDB = async (
  studentId: string,
  query: Record<string, unknown>,
) => {
  const student = await Student.findOne({ id: studentId });

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found !');
  }

  const enrolledCourseQuery = new QueryBuilder(
    EnrolledCourseModel.find({ student: student._id }).populate(
      'semesterRegistration academicSemester academicFaculty academicDepartment offeredCourse course student faculty',
    ),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await enrolledCourseQuery.modelQuery;
  const meta = await enrolledCourseQuery.countTotal();

  return {
    meta,
    result,
  };
};

export const EnrolledCourseServices = {
  createEnrolledCourseIntoDB,
  updateEnrolledCourseMarks,
  getMyEnrolledCoursesFromDB
};
