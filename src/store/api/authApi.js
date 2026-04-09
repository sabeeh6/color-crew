// src/store/api/authApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '../slices/authSlice';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL + '/api',
  }),

  endpoints: (builder) => ({

    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/signIn',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data: responseBody } = await queryFulfilled;
          // The exact backend shape is: responseBody.data.userData and responseBody.data.token
          if (responseBody && responseBody.data) {
            dispatch(setCredentials({ user: responseBody.data.userData, token: responseBody.data.token }));
          }
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),

    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/signUp',
        method: 'POST',
        body: userData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ user: data.user, token: data.token }));
        } catch (error) {
          console.error('Register failed:', error);
        }
      },
    }),

    getMe: builder.query({
      query: () => '/auth/me',
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetMeQuery } = authApi;