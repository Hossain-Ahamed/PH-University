import { z } from 'zod';
import {
  AcademicSemesterCodes,
  AcademicSemsterNames,
  Months,
} from './academicSemester.constant';

const createAcademicSemsterValidationSchema = z.object({
  body: z.object({
    name: z.enum([...AcademicSemsterNames] as [string, ...string[]]),
    year: z.string(),
    code: z.enum([...AcademicSemesterCodes] as [string, ...string[]]),
    startMonth: z.enum([...Months] as [string, ...string[]]),
    endMonth: z.enum([...Months] as [string, ...string[]]),
  }),
});

const updateAcademicSemesterValidationSchema = z.object({
  body: z.object({
    name: z.enum([...AcademicSemsterNames] as [string, ...string[]]).optional(),
    year: z.string().optional(),
    code: z
      .enum([...AcademicSemesterCodes] as [string, ...string[]])
      .optional(),
    startMonth: z.enum([...Months] as [string, ...string[]]).optional(),
    endMonth: z.enum([...Months] as [string, ...string[]]).optional(),
  }),
});

export const AcademicSemesterValidations = {
  createAcademicSemsterValidationSchema,
  updateAcademicSemesterValidationSchema,
};
