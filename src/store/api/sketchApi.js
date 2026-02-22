import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const sketchApi = createApi({
  reducerPath: 'sketchApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL + '/api',

    // Automatically attach JWT from Redux auth state
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  // Cache tags for auto invalidation
  tagTypes: ['Sketch'],

  endpoints: (builder) => ({

    // GET all user sketches (paginated)
    getUserSketches: builder.query({
      query: ({ page = 1, limit = 12 } = {}) =>
        `/sketches?page=${page}&limit=${limit}`,
      providesTags: (result) =>
        result
          ? [
              ...result.sketches.map(({ _id }) => ({ type: 'Sketch', id: _id })),
              { type: 'Sketch', id: 'LIST' },
            ]
          : [{ type: 'Sketch', id: 'LIST' }],
    }),

    // GET single sketch by ID (with full Fabric JSON)
    getSketchById: builder.query({
      query: (id) => `/sketches/${id}`,
      providesTags: (result, error, id) => [{ type: 'Sketch', id }],
    }),

    // POST — Create or update sketch
    saveSketch: builder.mutation({
      query: (body) => ({
        url: '/sketches',
        method: 'POST',
        body,
      }),
      // Automatically refetch sketch list after save
      invalidatesTags: [{ type: 'Sketch', id: 'LIST' }],
    }),

    // DELETE sketch
    deleteSketch: builder.mutation({
      query: (id) => ({
        url: `/sketches/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Sketch', id }],
    }),

    // PATCH — Rename sketch title
    renameSketch: builder.mutation({
      query: ({ id, title }) => ({
        url: `/sketches/${id}/title`,
        method: 'PATCH',
        body: { title },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Sketch', id }],
    }),
  }),
});

export const {
  useGetUserSketchesQuery,
  useGetSketchByIdQuery,
  useSaveSketchMutation,
  useDeleteSketchMutation,
  useRenameSketchMutation,
} = sketchApi;
