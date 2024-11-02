import { z } from 'zod';

const createAcademicDepartmentValidationSchema = z.object({
  body: z.object({
    name: z.string({
      invalid_type_error: 'Academic faculty must be string',
      required_error: 'Acadmeic faculty name is required',
    }),
    academicFaculty: z.string({
      invalid_type_error: 'academic faculty info must be string',
      required_error: 'Faculty name is required',
    }),
  }),
});

const updateAcademicDepartmentValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        invalid_type_error: 'Academic faculty must be string',
        required_error: 'Acadmeic faculty name is required',
      })
      .optional(),
    academicFaculty: z
      .string({
        invalid_type_error: 'academic faculty info must be string',
        required_error: 'Faculty name is required',
      })
      .optional(),
  }),
});

export const AcademicDepartmentValidations = {
  createAcademicDepartmentValidationSchema,
  updateAcademicDepartmentValidationSchema,
};
