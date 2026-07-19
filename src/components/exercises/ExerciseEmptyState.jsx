import React from 'react';
import { SearchX } from 'lucide-react';

const ExerciseEmptyState = ({ message }) => (
  <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
    <SearchX className="mb-3 h-8 w-8 text-slate-400" aria-hidden="true" />
    <p className="font-bold text-slate-600">{message}</p>
  </div>
);

export default ExerciseEmptyState;
