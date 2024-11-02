import { TAcademicDepartment } from './academicDepartment.interface';
import { AcamdemicDepartmentModel } from './academicDepartment.model';

const cretaeAcademicDepartmentIntoDB = async (payload: TAcademicDepartment) => {
  const result = await AcamdemicDepartmentModel.create(payload);
  return result;
};

const getAllAcademicDepartmentFromDB = async () => {
  const result =
    await AcamdemicDepartmentModel.find().populate('academicFaculty');
  return result;
};
const getSingleAcademicDepartmentFromDB = async (id: string) => {
  const result =
    await AcamdemicDepartmentModel.findById(id).populate('academicFaculty');
  return result;
};

const updateAcademicDepartmentIntoDB = async (
  id: string,
  payload: Partial<TAcademicDepartment>,
) => {
  const result = await AcamdemicDepartmentModel.findOneAndUpdate(
    { _id: id },
    payload,
    { new: true },
  );
  return result;
};

export const AcademicDepartmentServices = {
  cretaeAcademicDepartmentIntoDB,
  getAllAcademicDepartmentFromDB,
  getSingleAcademicDepartmentFromDB,
  updateAcademicDepartmentIntoDB,
};
