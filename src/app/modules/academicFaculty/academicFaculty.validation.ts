import { z } from 'zod';

const createacademicFacultyValidationSchema = z.object({
  body: z.object({
    name: z.string({
      invalid_type_error: 'Faculty name must be string',
    }),
  }),
});

const updatecademicFacultyValidationSchema = z.object({
  body: z.object({
    name: z.string({
      invalid_type_error: 'Faculty name must be string',
    }),
  }),
});

export const academicFacultyValidation = {
  createacademicFacultyValidationSchema,
  updatecademicFacultyValidationSchema,
};
