import express from 'express';
import { FacultyControllers } from './faculty.controller';
import { validateRequest } from '../../../middlewares/validateRequest';
import { FacultyValidations } from './faculty.validation';
import { auth } from '../../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.faculty),
  FacultyControllers.getAllFaculty,
);
router.get(
  '/:facultyID',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.faculty),
  FacultyControllers.getSingleFaculty,
);
router.patch(
  '/:facultyID',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.faculty),
  validateRequest(FacultyValidations.Update_FacultyValidationSchema),
  FacultyControllers.updateFaculty,
);
router.delete(
  '/:facultyID',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  FacultyControllers.deleteFaculty,
);

export const FacultyRoutes = router;
