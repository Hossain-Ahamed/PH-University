import express from 'express';
import { FacultyControllers } from './faculty.controller';
import { validateRequest } from '../../../middlewares/validateRequest';
import { FacultyValidations } from './faculty.validation';
import { auth } from '../../../middlewares/auth';

const router = express.Router();

router.get('/', auth('admin'), FacultyControllers.getAllFaculty);
router.get('/:facultyID', FacultyControllers.getSingleFaculty);
router.patch(
  '/:facultyID',
  validateRequest(FacultyValidations.Update_FacultyValidationSchema),
  FacultyControllers.updateFaculty,
);
router.delete('/:facultyID', FacultyControllers.deleteFaculty);

export const FacultyRoutes = router;
