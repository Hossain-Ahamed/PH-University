import { z } from 'zod';
import { UserStatus } from './user.constant';
const userValidationSchema = z.object({
  password: z
    .string({
      invalid_type_error: 'Password must be string',
    })
    .max(20, { message: 'Password cant be more than 20 character' })
    .min(6, { message: 'password must be at least 6 character' })
    .optional(),
});

const changeUsersStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([...UserStatus] as [string, ...string[]]),
  }),
});
export const UserValidation = {
  userValidationSchema,
  changeUsersStatusValidationSchema,
};
