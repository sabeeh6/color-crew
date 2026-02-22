import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Pencil, Clock, ImageOff, Loader2,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/authSlice';
import {
  useGetUserSketchesQuery,
  useDeleteSketchMutation,
} from '../store/api/sketchApi';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';

const SketchCard = ({ sketch, onOpen, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -3 }}
      className="bg-neutral-900 border border-neutral-800 rounded-2xl
                 overflow-hidden group hover:border-violet-800 transition-colors"
    >
      {/* Thumbnail */}
      <div
        className="h-40 bg-neutral-800 flex items-center justify-center
                   cursor-pointer overflow-hidden relative"
        onClick={() => onOpen(sketch._id)}
      >
        {sketch.thumbnailURL ? (
          <img
            src={sketch.thumbnailURL}
            alt={sketch.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageOff size={28} className="text-neutral-700" />
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-violet-900/0 group-hover:bg-violet-900/20
                        flex items-center justify-center transition-all">
          <span className="opacity-0 group-hover:opacity-100 text-white text-sm
                           font-medium bg-violet-700/80 rounded-lg px-3 py-1.5
                           backdrop-blur transition-opacity">
            Open
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm truncate mb-1">
          {sketch.title}
        </h3>
        <div className="flex items-center gap-1.5 text-neutral-600 text-xs">
          <Clock size={11} />
          {formatDate(sketch.updatedAt)}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => onOpen(sketch._id)}
            className="flex-1 flex items-center justify-center gap-1.5
                       bg-neutral-800 hover:bg-violet-700 text-neutral-300
                       hover:text-white rounded-lg py-1.5 text-xs font-medium
                       transition-colors"
          >
            <Pencil size={12} />
            Edit
          </button>

          {confirmDelete ? (
            <button
              onClick={() => onDelete(sketch._id)}
              className="flex-1 flex items-center justify-center gap-1.5
                         bg-red-700 hover:bg-red-600 text-white rounded-lg
                         py-1.5 text-xs font-medium transition-colors"
            >
              Confirm
            </button>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              onBlur={() => setTimeout(() => setConfirmDelete(false), 200)}
              className="w-8 h-8 flex items-center justify-center rounded-lg
                         text-neutral-600 hover:text-red-400 hover:bg-red-900/30
                         transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const DashboardPage = () => {
  const navigate     = useNavigate();
  const user         = useSelector(selectCurrentUser);
  const [page]       = useState(1);

  const { data, isLoading, isFetching } = useGetUserSketchesQuery({ page, limit: 12 });
  const [deleteSketch, { isLoading: deleting }] = useDeleteSketchMutation();

  const handleOpen   = (id) => navigate(`/draw/${id}`);
  const handleNew    = ()   => navigate('/draw');

  const handleDelete = async (id) => {
    try {
      await deleteSketch(id).unwrap();
      toast.success('Sketch deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-white text-3xl font-bold">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-neutral-500 mt-1">
              {data?.total ?? 0} sketch{data?.total !== 1 ? 'es' : ''} saved
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleNew}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500
                       text-white font-semibold px-5 py-3 rounded-xl
                       transition-colors shadow-lg shadow-violet-900/30"
          >
            <Plus size={18} />
            New Sketch
          </motion.button>
        </motion.div>

        {/* ── Grid ──────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Spinner size="lg" />
          </div>
        ) : data?.sketches?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 gap-4"
          >
            <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center">
              <ImageOff size={28} className="text-neutral-700" />
            </div>
            <p className="text-neutral-600 text-lg">No sketches yet</p>
            <button
              onClick={handleNew}
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold
                         px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              Create your first sketch
            </button>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {data?.sketches?.map((sketch) => (
                <SketchCard
                  key={sketch._id}
                  sketch={sketch}
                  onOpen={handleOpen}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {isFetching && !isLoading && (
          <div className="flex justify-center mt-8">
            <Loader2 size={20} className="animate-spin text-violet-500" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
