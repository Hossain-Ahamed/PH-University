import express from 'express';
import { AdminControllers } from './admin.controller';
import { validateRequest } from './../../../middlewares/validateRequest';
import { AdminValidations } from './admin.validation';

const router = express.Router();

router.get('/', AdminControllers.getAllAdmins);
router.get('/:adminID', AdminControllers.getSingleAdmin);
router.patch(
  '/:adminID',
  validateRequest(AdminValidations.updateAdminValidationSchema),
  AdminControllers.updateAdmin,
);
router.delete('/:adminID', AdminControllers.deleteAdmin);

export const AdminRoutes = router;
