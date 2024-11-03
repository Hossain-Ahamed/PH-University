import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { SemesterRegistrationModel } from '../SemesterRegsitration/semesterRegistration.model';
import { TOfferedCourse } from './OfferedCourse.interface';
import { OfferedCourseModel } from './OfferedCourse.model';
import { AcademicFacultyModel } from '../academicFaculty/academicFaculty.model';
import { AcamdemicDepartmentModel } from '../academicDepartment/academicDepartment.model';
import { CourseModel } from '../Course/course.model';
import { FacultyModel } from '../Faculty/faculty.model';
import { hasTimeConflict } from './OfferedCourse.utils';
import QueryBuilder from '../../builder/QueryBuilder';
import { TSemesterRegsitration } from '../SemesterRegsitration/semesterRegistration.interface';
import { Student } from '../student/student.model';

const createOfferedCourseIntoDB = async (payload: TOfferedCourse) => {
  // check if te semester regsistration exist
  const {
    semesterRegistration,
    academicFaculty,
    academicDepartment,
    course,
    faculty,
    section,
    days,
    startTime,
    endTime,
  } = payload;
  /**
   * Step 1: check if the semester registration id is exists!
   * Step 2: check if the academic faculty id is exists!
   * Step 3: check if the academic department id is exists!
   * Step 4: check if the course id is exists!
   * Step 5: check if the faculty id is exists!
   * Step 6: check if the department is belong to the  faculty
   * Step 7: check if the same offered course same section in same registered semester exists
   * Step 8: get the schedules of the faculties
   * Step 9: check if the faculty is available at that time. If not then throw error
   * Step 10: create the offered course
   */

  const isSemesterRegistationExists =
    await SemesterRegistrationModel.findById(semesterRegistration);
  if (!isSemesterRegistationExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Semester Registration not found');
  }

  const isAcademicFacultyExists =
    await AcademicFacultyModel.findById(academicFaculty);
  if (!isAcademicFacultyExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Academic Faculty not found');
  }

  const isacademicDepartmentExists =
    await AcamdemicDepartmentModel.findById(academicDepartment);
  if (!isacademicDepartmentExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Academic Department not found');
  }

  const isCourseExists = await CourseModel.findById(course);
  if (!isCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Course not found');
  }

  const isFacultyExists = await FacultyModel.findById(faculty);
  if (!isFacultyExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found');
  }

  // if the academic dept belongs to correct faculty
  const isDepartmentBelongToFaculty = await AcamdemicDepartmentModel.findOne({
    _id: academicDepartment,
    academicFaculty,
  });

  if (!isDepartmentBelongToFaculty) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `This ${isacademicDepartmentExists.name} is not  belong to this ${isAcademicFacultyExists.name}`,
    );
  }

  // check if the same offered course same section in same registered semester exists

  const isSameOfferedCourseExistsWithSameRegisteredSemesterWithSameSection =
    await OfferedCourseModel.findOne({
      semesterRegistration,
      course,
      section,
    });

  if (isSameOfferedCourseExistsWithSameRegisteredSemesterWithSameSection) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Offered course with same section is already exist!`,
    );
  }

  //get the schedules of the faculties
  const assignedSchedules = await OfferedCourseModel.find({
    semesterRegistration,
    faculty,
    days: { $in: days },
  }).select('days startTime endTime');

  const newSchedule = {
    days,
    startTime,
    endTime,
  };

  if (hasTimeConflict(assignedSchedules, newSchedule)) {
    throw new AppError(
      httpStatus.CONFLICT,
      `This faculty is not available at that moment! choose other time or day`,
    );
  }

  payload.academicSemester = isSemesterRegistationExists?.academicSemester;
  const result = await OfferedCourseModel.create(payload);
  return result;
};

const updateOfferedCOurseIntoDB = async (
  id: string,
  payload: Pick<
    TOfferedCourse,
    'maxCapacity' | 'faculty' | 'days' | 'startTime' | 'endTime'
  >,
) => {
  const isOfferedCourseExists = await OfferedCourseModel.findById(id);
  if (!isOfferedCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered Course not found');
  }

  const semesterRegistrationStatus = await SemesterRegistrationModel.findById(
    isOfferedCourseExists.semesterRegistration,
  ).select('status');
  if (semesterRegistrationStatus?.status !== 'UPCOMING') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Can not update while a course is ${semesterRegistrationStatus?.status}`,
    );
  }

  const { faculty, days, startTime, endTime } = payload;
  const isFacultyExists = await FacultyModel.findById(faculty);
  if (!isFacultyExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found');
  }

  const semesterRegistration = isOfferedCourseExists.semesterRegistration;
  //get the schedules of the faculties
  const assignedSchedules = await OfferedCourseModel.find({
    semesterRegistration,
    faculty,
    days: { $in: days },
  }).select('days startTime endTime');

  const newSchedule = {
    days,
    startTime,
    endTime,
  };

  if (hasTimeConflict(assignedSchedules, newSchedule)) {
    throw new AppError(
      httpStatus.CONFLICT,
      `This faculty is not available at that moment! choose other time or day`,
    );
  }

  const result = await OfferedCourseModel.findByIdAndUpdate(id, payload, {
    new: true,
  });

  return result;
};

const getAllOfferedCoursesFromDB = async (query: Record<string, unknown>) => {
  const offeredCourseQuery = new QueryBuilder(
    OfferedCourseModel.find().populate(
      'semesterRegistration academicSemester academicFaculty academicDepartment course faculty',
    ),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await offeredCourseQuery.modelQuery;
  const meta = await offeredCourseQuery.countTotal();
  return { meta, result };
};

const getMyOfferedCoursesFromDB = async (userId: string, query: Record<string, unknown>,) => {
  //pagination setup

  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = (page - 1) * limit;

  const student = await Student.findOne({ id: userId });
  if (!student) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `Student not found`,
    );
  }
  const currentOngoingRegistrationSemester = await SemesterRegistrationModel.findOne({ status: "ONGOING" });
  if (!currentOngoingRegistrationSemester) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `There is no ongoing Semester`,
    );
  }

  //22-8-13
  const aggregationQuery = [
    {
      $match: {
        semesterRegistration: currentOngoingRegistrationSemester._id,
        academicFaculty: student.academicFaculty,
        academicDepartment: student.academicDepartment,
      }
    },
    { // findig the course details
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "course"
      }
    },
    {
      $unwind: "$course",

    },
    {  // getting that student's enrolled course in this sem , so he can not take again that course
      $lookup: {
        from: "enrolledcourses",
        let: {
          currentOngoingRegistrationSemester: currentOngoingRegistrationSemester._id,
          currentStudent: student._id
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ['$semesterRegistration', '$$currentOngoingRegistrationSemester']
                  },
                  {
                    $eq: ['$student', '$$currentStudent']
                  },
                  {
                    $eq: ['$isEnrolled', true]
                  }
                ]
              }
            }
          }
        ],
        as: "enrolledcourses",
      }
    },
    { // all completed courses of the student
      $lookup: {
        from: "enrolledcourses",
        let: {
          currentStudent: student._id
        },
        pipeline : [
          {
            $match : {
              $expr : {
                $and : [
                  {
                    $eq : ['$student', '$$currentStudent']
                  },
                  {
                    $eq: ['$isCompleted', true],
                  }
                ]
              }
            }
          }
        ],
        as: 'completedCourses',
      }
    },
    { //get only the ids from the upper pipe $completedCourses
      $addFields : {
        completedCourseIds : {
          $map : {
            input : '$completedCourses',
            as : 'completed',
            in : '$$completed.course'
          }
        }
      }
    },
    { //checking if student alreafy completed this course previously or not - 
      $addFields: {
        isPreRequisitesFulFilled: {
          $or: [
            { $eq: ['$course.preRequisiteCourses', []] },
            {
              $setIsSubset: [
                '$course.preRequisiteCourses.course',
                '$completedCourseIds',
              ],
            },
          ],
        },
        isAlreadyEnrolled: {
          $in: [
            '$course._id',
            {
              $map: {
                input: '$enrolledcourses',
                as: 'enroll',
                in: "$$enroll.course"
              }
            }
          ]
        }
      }

    },
    {
      $match: {
        isAlreadyEnrolled: false,
        isPreRequisitesFulFilled: true,
      }
    }
  ]

  const paginationQuery = [
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ];
  const result = await OfferedCourseModel.aggregate([
    ...aggregationQuery,
    ...paginationQuery,
  ]);

  const total = (await OfferedCourseModel.aggregate(aggregationQuery)).length;

  const totalPage = Math.ceil(result.length / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
    result,
  };

};
const getSingleOfferedCoursesFromDB = async (id: string) => {
  const result = OfferedCourseModel.findById(id).populate(
    'semesterRegistration academicSemester academicFaculty academicDepartment course faculty',
  );
  return result;
};

const DeleteOfferedCoursesFromDB = async (id: string) => {
  const isOfferedCourseExists = await OfferedCourseModel.findById(id).populate<{
    semesterRegistration: TSemesterRegsitration;
  }>('semesterRegistration');

  if (!isOfferedCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered Course not found');
  }

  if (isOfferedCourseExists?.semesterRegistration?.status !== 'UPCOMING') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Can not update while a course is ${isOfferedCourseExists?.semesterRegistration?.status}`,
    );
  }

  const result = await OfferedCourseModel.findByIdAndDelete(id);
  return result;
};

export const OfferedCourseServices = {
  createOfferedCourseIntoDB,
  updateOfferedCOurseIntoDB,
  getAllOfferedCoursesFromDB,
  getSingleOfferedCoursesFromDB,
  getMyOfferedCoursesFromDB,
  DeleteOfferedCoursesFromDB,
};
