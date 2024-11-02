import { Model, Types } from 'mongoose';

export type TFacultyGender = 'male' | 'female' | 'other';
export type TFacultyBloodGroup =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-';

export type TFacultyUserName = {
  firstName: string;
  middleName?: string;
  lastName: string;
};

export type TFaculty = {
  id: string;
  user: Types.ObjectId;
  designation: string;
  name: TFacultyUserName;
  gender: TFacultyGender;
  dateOfBirth?: Date;
  email: string;
  contactNo: string;
  emergencyContactNo: string;
  bloodgGroup?: TFacultyBloodGroup;
  presentAddress: string;
  permanentAddress: string;
  profileImg?: string;
  academicDepartment: Types.ObjectId;
  academicFaculty: Types.ObjectId;
  isDeleted: boolean;
};

export interface TFacultyModel extends Model<TFaculty> {
  // eslint-disable-next-line no-unused-vars
  isFacultyExist(id: string): Promise<TFaculty | null>;
}
