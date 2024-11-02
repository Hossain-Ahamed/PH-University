import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  PORT: process.env.PORT,
  database_URL: process.env.DATABASE_URL,
  bcrypt_salt_round: process.env.BSCRYPT_SALT_ROUND,
  default_password: process.env.DEFAULT_PASS,
  NODE_ENV: process.env.NODE_ENV,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
  RESET_PASSWORD_URI: process.env.RESET_PASSWORD_URI,
  Clourdinary_cloud_name: process.env.Clourdinary_cloud_name,
  Clourdinary_api_key: process.env.Clourdinary_api_key,
  Clourdinary_api_secret: process.env.Clourdinary_api_secret,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
};
