import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';

export default function RoomFullError() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-neutral-950 text-center px-4 z-50 fixed inset-0">
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl max-w-md shadow-2xl flex flex-col items-center">
        <div className="bg-red-500/20 p-4 rounded-full mb-6">
          <Users size={40} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Room is Full</h1>
        <p className="text-neutral-400 mb-8 leading-relaxed">
          This collaborative sketch space has reached its maximum capacity of 5 users. Please try again later or create a new sketch.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl font-medium transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
