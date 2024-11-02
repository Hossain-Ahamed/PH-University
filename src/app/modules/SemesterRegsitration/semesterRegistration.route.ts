import express from 'express';
import { validateRequest } from '../../../middlewares/validateRequest';
import { SemesterRegistrationValidations } from './semesterRegistration.validation';
import { SemesterRegistrationControllers } from './semesterRegistration.controller';

const router = express.Router();

router.post(
  '/create-semester-registration',
  validateRequest(
    SemesterRegistrationValidations.createSemesterRegistrationSchema,
  ),
  SemesterRegistrationControllers.createSemesterRegistration,
);
router.patch(
  '/:id',
  validateRequest(
    SemesterRegistrationValidations.UpdateSemesterRegistrationSchema,
  ),
  SemesterRegistrationControllers.updateSemesterRegistration,
);
router.get('/', SemesterRegistrationControllers.getAllSemesterRegistrations);
router.get(
  '/:id',
  SemesterRegistrationControllers.getSingleSemesterRegistration,
);
router.delete(
  '/:id',
  SemesterRegistrationControllers.deleteSemesterRegistration,
);

export const SemesterRegistrationRoutes = router;
