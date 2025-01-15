import type { User } from '@/types/user'
import { axiosInstance } from './axiosCofig'

export const onLogin = ({ email, password }: User) => {
  return axiosInstance.post('/auth/login', { email, password })
}

export const onLogout = () => {
  return axiosInstance.get('/auth/logout')
}

export const resetPassword = ({ newPassword, confirmPassword, token }: User) => {
  return axiosInstance.post('/auth/reset-password', {
    newPassword,
    token,
    confirmPassword
  })
}

export const updatePassword = ({ id, password, newPassword, confirmPassword }: User) => {
  // console.log({ userId: id, currentPassword: password, newPassword, confirmPassword })

  return axiosInstance.post('/auth/update-password', {
    userId: id,
    currentPassword: password,
    newPassword,
    confirmPassword
  })
}

export const ForgetPassword = ({ email }: User) => {
  return axiosInstance.post('/auth/forgot-password', {
    email
  })
}

// export const verifyEmail = ({ token, password, confirmPassword }: User) => {
//   return axiosInstance.post("/users/verify-email", {
//     token,
//     password,
//     confirmPassword,
//   });
// };

export const getMeDetails = (): Promise<User> => {
  const response = axiosInstance.get('/auth/me').then(res => {
    return res?.data?.data
  })

  return response
}

export const onSignUp = ({ name, role, email, password }: User) => {
  return axiosInstance.post('/auth/signup', { name, role, email, password })
}
