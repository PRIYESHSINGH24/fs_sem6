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

export const createPostSchema = Yup.object({
  title: Yup.string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title can be at most 120 characters')
    .required('Title is required'),
  body: Yup.string()
    .trim()
    .min(10, 'Body must be at least 10 characters')
    .max(2000, 'Body can be at most 2000 characters')
    .required('Body is required'),
  category: Yup.string()
    .oneOf(
      ['General', 'Tech', 'Design', 'Lifestyle', 'News', 'Discussion'],
      'Please select a valid category'
    )
    .required('Category is required'),
});
