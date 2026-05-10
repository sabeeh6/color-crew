import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../slices/authSlice';
import toast from 'react-hot-toast';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL + '/api',

  // Automatically attach JWT from Redux auth state
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    console.log("🔑 [FRONTEND API] Token retrieved from Redux State:", token ? token.substring(0, 20) + "..." : "NULL/UNDEFINED");
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      console.log("🔑 [FRONTEND API] Authorization Header successfully attached!");
    } else {
      console.warn("⚠️ [FRONTEND API] No token found in state! Header NOT set.");
    }
    return headers;
  },
});

// Professional standard interceptor for API calls
const baseQueryWithReauth = async (args, api, extraOptions) => {
  // 1. Make the actual API request
  let result = await baseQuery(args, api, extraOptions);

  // 2. Catch Backend auth rejections (like expired token 401 or 403)
  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    // Only redirect if we are NOT on a sharing page (DrawingPage)
    // or if the user is trying to perform a restricted action (like saving)
    const isDrawingPage = window.location.pathname.startsWith('/drawing/');
    
    if (!isDrawingPage || result.error.status === 403) {
      console.error("🔴 [AUTH ERROR] Unauthorized, auto-logging out...");
      toast.error('Session expired or unauthorized. Please log in.');
      api.dispatch(logout());
      window.location.href = '/login';
    }
  }

  return result;
};

export const sketchApi = createApi({
  reducerPath: 'sketchApi',
  baseQuery: baseQueryWithReauth,

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
      invalidatesTags: (result, error, body) => 
        body.sketchId 
          ? [{ type: 'Sketch', id: body.sketchId }, { type: 'Sketch', id: 'LIST' }]
          : [{ type: 'Sketch', id: 'LIST' }],
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
