import express from 'express';
import { validateRequest } from '../../../middlewares/validateRequest';
import { AcademicSemesterValidations } from './academicSemester.validation';
import { AcademicSemsterControllers } from './academicSemester.controller';
import { auth } from '../../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();
router.get('/', AcademicSemsterControllers.getAllAcademicSemesters);
router.get(
  '/:semesterId',
  AcademicSemsterControllers.getSingleAcademicSemester,
);
router.patch(
  '/:semesterId',
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
