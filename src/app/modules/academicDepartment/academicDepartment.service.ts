import QueryBuilder from '../../builder/QueryBuilder';
import { AcademicDepartmentSearchableFields } from './academicDepartment.constant';
import { TAcademicDepartment } from './academicDepartment.interface';
import { AcamdemicDepartmentModel } from './academicDepartment.model';

const cretaeAcademicDepartmentIntoDB = async (payload: TAcademicDepartment) => {
  const result = await AcamdemicDepartmentModel.create(payload);
  return result;
};

const getAllAcademicDepartmentFromDB = async (query: Record<string, unknown>,) => {
  const academicDepartmentQuery = new QueryBuilder(
    AcamdemicDepartmentModel.find().populate('academicFaculty'),
    query,
  )
    .search(AcademicDepartmentSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await academicDepartmentQuery.modelQuery;
  const meta = await academicDepartmentQuery.countTotal();

  return {
    meta,
    result,
  };
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
