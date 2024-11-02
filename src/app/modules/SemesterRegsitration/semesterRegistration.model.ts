import { model, Schema } from 'mongoose';
import { TSemesterRegsitration } from './semesterRegistration.interface';
import { SemesterRegistrationStatus } from './semesterRegistration.constant';

const semesterRegistrationSchema = new Schema<TSemesterRegsitration>(
  {
    academicSemester: {
      type: Schema.ObjectId,
      required: true,
      ref: 'AcademicSemester',
      unique: true,
    },
    status: {
      type: String,
      required: true,
      enum: SemesterRegistrationStatus,
      default: 'UPCOMING',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    minCredit: {
      type: Number,
      default: 3,
    },
    maxCredit: {
      type: Number,
      default: 16,
    },
  },
  {
    timestamps: true,
  },
);

export const SemesterRegistrationModel = model<TSemesterRegsitration>(
  'SemesterRegistration',
  semesterRegistrationSchema,
);
