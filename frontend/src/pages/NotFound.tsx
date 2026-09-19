import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0B12] text-foreground flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-3xl bg-accent-gradient flex items-center justify-center mx-auto text-white shadow-xl shadow-accent-violet/30">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="font-display text-4xl font-extrabold text-white">404 — Page Not Found</h1>
        <p className="text-gray-400 text-sm">
          The diary page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/app"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent-gradient text-white font-bold text-sm shadow-xl shadow-accent-violet/30 hover:scale-105 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Calendar</span>
        </Link>
      </div>
    </div>
  );
};
