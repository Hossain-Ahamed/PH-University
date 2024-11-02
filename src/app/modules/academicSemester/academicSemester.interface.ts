export type TacademicSemsterCodeMappaer = {
  [key: string]: string;
};

export type TMonths =
  | 'January'
  | 'February'
  | 'March'
  | 'April'
  | 'May'
  | 'June'
  | 'July'
  | 'August'
  | 'September'
  | 'October'
  | 'November'
  | 'December';

export type TAcademicSemsterNames = 'Autumn' | 'Summer' | 'Fall';
export type TAcademicSemsterCodes = '01' | '02' | '03';

export type TAcademicSemester = {
  name: TAcademicSemsterNames;
  code: TAcademicSemsterCodes;
  year: string;
  startMonth: TMonths;
  endMonth: TMonths;
};
