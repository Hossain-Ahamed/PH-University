import express from 'express';
import { validateRequest } from '../../../middlewares/validateRequest';
import { AcademicSemesterValidations } from './academicSemester.validation';
import { AcademicSemsterControllers } from './academicSemester.controller';
import { auth } from '../../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();
router.get(
  '/',
  auth(
    USER_ROLE.admin,
    USER_ROLE.superAdmin,
    USER_ROLE.faculty,
    USER_ROLE.student,
  ),
  AcademicSemsterControllers.getAllAcademicSemesters,
);
router.get(
  '/:semesterId',
  auth(
    USER_ROLE.admin,
    USER_ROLE.superAdmin,
    USER_ROLE.faculty,
    USER_ROLE.student,
  ),
  AcademicSemsterControllers.getSingleAcademicSemester,
);
router.patch(
  '/:semesterId',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(
    AcademicSemesterValidations.updateAcademicSemesterValidationSchema,
  ),
  AcademicSemsterControllers.updateAcademicSemester,
);
router.post(
  '/create-academic-semester',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(
    AcademicSemesterValidations.createAcademicSemsterValidationSchema,
  ),
  AcademicSemsterControllers.createAcademicSemster,
);
export const AcademicSemesterRoutes = router;
