import { Schema, model } from 'mongoose';
import validator from 'validator';
import {
  TGuardian,
  LocalGuardian,
  TStudent,
  TStudentModel,
  UserName,
} from './student.interface';
import AppError from '../../errors/AppError';

const NameSchema = new Schema<UserName>({
  firstName: {
    type: String,
    required: [true, "First name can't be blank"],
    trim: true, //remove space
    maxlength: [20, 'name cant be greater than 20 character'],
    validate: {
      validator: function (value: string) {
        return value === value.charAt(0).toUpperCase() + value.slice(1);
      },
      message: '{VALUE} is not in capitalize format',
    },
  },
  middleName: { type: String },
  lastName: {
    type: String,
    required: [true, "Last name can't be blank"],
    validate: {
      validator: (value: string) => validator.isAlpha(value),
      message: '{VALUE} is not valid',
    },
  },
});

const GuardianScema = new Schema<TGuardian>({
  fatherName: { type: String, required: true },
  fatherOccupation: { type: String, required: true },
  fatherContactNo: { type: String, required: true },
  motherName: { type: String, required: true },
  motherOccupation: { type: String, required: true },
  motherContactNo: { type: String, required: true },
});

const LocalGuardianScema = new Schema<LocalGuardian>({
  name: { type: String, required: true },
  occupation: { type: String, required: true },
  contactNo: { type: String, required: true },
  address: { type: String, required: true },
});

const studentSchema = new Schema<TStudent, TStudentModel>(
  {
    id: { type: String, required: true, unique: true },
    user: {
      type: Schema.Types.ObjectId,
      required: [true, 'uesr Id is required'],
      unique: true,
      ref: 'User',
    },
    name: {
      type: NameSchema,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'others'],
    },
    dateOfBirth: {
      type: Date,
      required: true,
      message: 'Date of Birth is required',
    },
    contactNo: {
      type: String,
      required: true,
      message: 'Contact Number is required',
    },
    emergencyContactNo: {
      type: String,
      required: true,
      message: 'Emergency Contact Number is required',
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      message: 'Email is required and must be unique',
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: '{VALUE} is not valid email',
      },
    },
    presentAddress: {
      type: String,
      required: true,
      message: 'Present Address is required',
    },
    permanentAddress: {
      type: String,
      required: true,
      message: 'Permanent Address is required',
    },
    guardian: {
      type: GuardianScema,
      required: true,
    },
    localGuardian: {
      type: LocalGuardianScema,
      required: true,
    },
    profileImg: { type: String, default: '' },
    admissionSemester: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicSemester',
    },
    academicDepartment: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicDepartment',
    },
    academicFaculty: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicFaculty',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  },
);

// query middleware
studentSchema.pre('find', async function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

studentSchema.pre('findOne', async function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

studentSchema.pre('findOneAndUpdate', async function (next) {
  const query = this.getQuery();
  const isExist = await Student.findOne(query);

  if (!isExist) {
    throw new AppError(404, 'No student by this query');
  }
  next();
});

studentSchema.pre('aggregate', async function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: false } } });
  next();
});

//creating a custom static  method
studentSchema.statics.isUserExists = async function (id: string) {
  const existingUser = await Student.findOne({ id });
  return existingUser;
};

// ------------------- Virtual ----------------- 9-11
studentSchema.virtual('fullName').get(function () {
  return `${this?.name?.firstName} ${this?.name?.middleName || ''} ${this?.name?.lastName}`;
});

export const Student = model<TStudent, TStudentModel>('Student', studentSchema);
