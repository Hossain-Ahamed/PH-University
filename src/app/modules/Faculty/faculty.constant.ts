import { TFacultyBloodGroup, TFacultyGender } from './faculty.interface';

export const Gender: TFacultyGender[] = ['male', 'female', 'other'];

export const BloodGroup: TFacultyBloodGroup[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
];
export const FacultySearchableFields = [
  'email',
  'id',
  'contactNo',
  'emergencyContactNo',
  'name.firstName',
  'name.lastName',
  'name.middleName',
];
