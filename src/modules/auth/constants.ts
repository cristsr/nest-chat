import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

export const Login: ApiOperationOptions = {
  summary: 'User login',
};

export const LoginApiResponse403: ApiResponseOptions = {
  status: 403,
  description: 'Bad request exception',
};

export const LoginApiResponse401: ApiResponseOptions = {
  status: 401,
  description: 'Unauthorized exception',
};
