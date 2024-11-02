import {
  TacademicSemsterCodeMappaer,
  TAcademicSemsterCodes,
  TAcademicSemsterNames,
  TMonths,
} from './academicSemester.interface';

export const AcademicSemsterNames: TAcademicSemsterNames[] = [
  'Autumn',
  'Fall',
  'Summer',
];
export const Months: TMonths[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const AcademicSemesterCodes: TAcademicSemsterCodes[] = [
  '01',
  '02',
  '03',
];

export const academicSemsterCodeMappaer: TacademicSemsterCodeMappaer = {
  Autumn: '01',
  Summer: '02',
  Fall: '03',
};
