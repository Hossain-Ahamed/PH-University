import { model, Schema } from 'mongoose';
import { TAcademicDepartment } from './academicDepartment.interface';
import AppError from '../../errors/AppError';

const AcademicDepartmentSchema = new Schema<TAcademicDepartment>(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    academicFaculty: {
      type: Schema.Types.ObjectId,
      ref: 'academicFaculty',
    },
  },
  {
    timestamps: true,
  },
);

AcademicDepartmentSchema.pre('save', async function (next) {
  const isExist = await AcamdemicDepartmentModel.findOne({
    name: this.name,
  });
  if (isExist) {
    throw new AppError(409, 'dept already exists');
  }
  next();
});

AcademicDepartmentSchema.pre('findOneAndUpdate', async function (next) {
  const query = this.getQuery();
  const isDeptExist = await AcamdemicDepartmentModel.findOne(query);
  if (!isDeptExist) {
    throw new AppError(404, 'dept  does not exists');
  }
  next();
});

AcademicDepartmentSchema.post('save', async function (doc, next) {
  next();
});

AcademicDepartmentSchema.pre('save', async function (next) {
  const isSemExists = await AcamdemicDepartmentModel.findOne({
    name: this.name,
  });
  if (isSemExists) {
    throw new AppError(409, 'Semester already exists');
  }
  next();
});

export const AcamdemicDepartmentModel = model<TAcademicDepartment>(
  'AcademicDepartment',
  AcademicDepartmentSchema,
);
