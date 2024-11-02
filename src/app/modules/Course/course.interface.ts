import { Types } from 'mongoose';

export type TPreRequisiteCourse = {
  course: Types.ObjectId;
  isDeleted: boolean;
};
export type Tcourse = {
  title: string;
  prefix: string;
  code: number;
  credits: number;
  preRequisiteCourses: TPreRequisiteCourse[];
  isDeleted: boolean;
};

export type TCourseFaculty = {
  course: Types.ObjectId;
  faculties: Types.ObjectId[];
};
