import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, X } from 'lucide-react';

export default function ShareModal({ onClose }) {
  const [copied, setCopied] = useState(false);
  const currentUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
      >
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white">
          <X size={20} />
        </button>

        <h2 className="text-white font-bold text-xl mb-2">Share this Sketch</h2>
        <p className="text-neutral-400 text-sm mb-6">
          Anyone with this link can join and collaborate in real-time. (Max 5 users allowed)
        </p>

        <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-700 p-2 rounded-xl">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="flex-1 bg-transparent text-neutral-300 text-sm outline-none px-2"
          />
          <button
            onClick={handleCopy}
            className={`flex items-center justify-center w-24 py-2 rounded-lg text-sm font-medium transition-colors ${
              copied ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-violet-600 hover:bg-violet-500 text-white'
            }`}
          >
            {copied ? <><Check size={16} className="mr-1" /> Copied</> : <><Copy size={16} className="mr-1" /> Copy</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
