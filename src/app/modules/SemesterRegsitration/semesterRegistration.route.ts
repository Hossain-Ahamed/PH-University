import express from 'express';
import { validateRequest } from '../../../middlewares/validateRequest';
import { SemesterRegistrationValidations } from './semesterRegistration.validation';
import { SemesterRegistrationControllers } from './semesterRegistration.controller';
import { auth } from '../../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router.post(
  '/create-semester-registration',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(
    SemesterRegistrationValidations.createSemesterRegistrationSchema,
  ),
  SemesterRegistrationControllers.createSemesterRegistration,
);
router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(
    SemesterRegistrationValidations.UpdateSemesterRegistrationSchema,
  ),
  SemesterRegistrationControllers.updateSemesterRegistration,
);
router.get(
  '/',
  auth(
    USER_ROLE.admin,
    USER_ROLE.superAdmin,
    USER_ROLE.faculty,
    USER_ROLE.student,
  ),
  SemesterRegistrationControllers.getAllSemesterRegistrations,
);
router.get(
  '/:id',
  auth(
    USER_ROLE.admin,
    USER_ROLE.superAdmin,
    USER_ROLE.faculty,
    USER_ROLE.student,
  ),
  SemesterRegistrationControllers.getSingleSemesterRegistration,
);
router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  SemesterRegistrationControllers.deleteSemesterRegistration,
);

export const SemesterRegistrationRoutes = router;
