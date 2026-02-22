import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Palette, Zap, Users, Brain, ArrowRight, CheckCircle,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';

const features = [
  { Icon: Palette, title: 'Professional Tools',   desc: 'Pencil, spray, shapes, eraser, text — everything a sketch artist needs.' },
  { Icon: Zap,     title: 'Instant Export',        desc: 'Export your work as high-resolution PNG or PDF in one click.' },
  { Icon: Users,   title: 'Collaborate (Phase 2)', desc: 'Draw together with your team in real-time via Socket.io.' },
  { Icon: Brain,   title: 'AI Suggestions (Phase 3)', desc: 'Let AI analyze symmetry, proportions and suggest improvements.' },
];

const FeatureCard = ({ Icon, title, desc }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 300 }}
    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6
               hover:border-violet-800 transition-colors"
  >
    <div className="w-10 h-10 bg-violet-900/50 rounded-xl flex items-center
                    justify-center mb-4">
      <Icon size={20} className="text-violet-400" />
    </div>
    <h3 className="text-white font-semibold mb-2">{title}</h3>
    <p className="text-neutral-500 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

const LandingPage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <div className="min-h-screen ">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center
                          text-center pt-28 pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-violet-900/30
                          border border-violet-800/50 rounded-full px-4 py-1.5
                          text-violet-400 text-xs font-medium mb-8">
            <Palette size={12} />
            Professional Drawing Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white
                         leading-tight tracking-tight mb-6">
            Draw Without
            <br />
            <span className="text-transparent bg-clip-text
                             bg-gradient-to-r from-violet-400 to-pink-400">
              Limits
            </span>
          </h1>

          <p className="text-neutral-400 text-lg md:text-xl max-w-xl mx-auto mb-10
                        leading-relaxed">
            Color Crew gives professional sketch artists a powerful browser-based
            canvas — with every tool they need, cloud storage, and AI guidance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? '/draw' : '/register'}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500
                         text-white font-semibold px-8 py-3.5 rounded-xl
                         transition-colors shadow-lg shadow-violet-900/40
                         text-base"
            >
              Start Drawing Free
              <ArrowRight size={18} />
            </Link>

            {!isAuthenticated && (
              <Link
                to="/login"
                className="text-neutral-400 hover:text-white font-medium
                           px-8 py-3.5 rounded-xl border border-neutral-800
                           hover:border-neutral-700 transition-colors text-base"
              >
                Sign In
              </Link>
            )}
          </div>
        </motion.div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-white text-3xl font-bold mb-12"
        >
          Everything You Need
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <FeatureCard {...f} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA footer strip ─────────────────────────────────────────── */}
      <section className="border-t border-neutral-900 py-16 text-center px-6">
        <h2 className="text-white text-3xl font-bold mb-4">
          Ready to create?
        </h2>
        <p className="text-neutral-500 mb-8">
          Free to use. No credit card required.
        </p>
        <Link
          to={isAuthenticated ? '/draw' : '/register'}
          className="inline-flex items-center gap-2 bg-violet-600
                     hover:bg-violet-500 text-white font-semibold
                     px-8 py-3.5 rounded-xl transition-colors"
        >
          <Palette size={18} />
          Open the Canvas
        </Link>
      </section>
    </div>
  );
};

export default LandingPage;
