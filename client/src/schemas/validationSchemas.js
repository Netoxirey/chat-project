import * as yup from 'yup'

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
})


export const postSchema = yup.object({
  title: yup
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters')
    .required('Title is required'),
  content: yup
    .string()
    .min(10, 'Content must be at least 10 characters')
    .required('Content is required'),
  tags: yup
    .string()
    .optional(),
})

export const commentSchema = yup.object({
  content: yup
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must be less than 500 characters')
    .required('Comment is required'),
})
