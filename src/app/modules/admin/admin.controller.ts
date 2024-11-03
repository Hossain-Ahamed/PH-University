import { AdminServices } from './admin.service';
import catchAsync from './../../../utils/catchAsync';
import sendResponse from './../../../utils/sendResponse';
import httpStatus from 'http-status';

const getSingleAdmin = catchAsync(async (req, res) => {
  const { adminID } = req.params;
  const result = await AdminServices.getSingleAdminFromDB(adminID);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin is retrieved succesfully',
    data: result,
  });
});

const getAllAdmins = catchAsync(async (req, res) => {
  const result = await AdminServices.getAllAdminsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admins are retrieved succesfully',
    meta: result.meta,
    data: result.result,
  });
});

const updateAdmin = catchAsync(async (req, res) => {
  const { adminID } = req.params;
  const { admin } = req.body;
  const result = await AdminServices.updateAdminIntoDB(adminID, admin);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin is updated succesfully',
    data: result,
  });
});

const deleteAdmin = catchAsync(async (req, res) => {
  const { adminID } = req.params;
  const result = await AdminServices.deleteAdminFromDB(adminID);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin is deleted succesfully',
    data: result,
  });
});

export const AdminControllers = {
  getAllAdmins,
  getSingleAdmin,
  deleteAdmin,
  updateAdmin,
};
