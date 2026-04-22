import * as Yup from 'yup';

export const signupSchema = Yup.object({
  name: Yup.string().trim().min(2, 'Name should be at least 2 chars').required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(8, 'Minimum 8 characters')
    .matches(/[A-Z]/, 'At least one uppercase letter required')
    .matches(/[0-9]/, 'At least one number required')
    .required('Password is required'),
});

export const loginSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});
