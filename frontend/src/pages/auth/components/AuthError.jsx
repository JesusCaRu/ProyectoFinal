import { motion as _motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export const AuthError = ({ error }) => {
  if (!error) return null;

  return (
    <_motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-interactive-component border border-border-tertiary text-accessibility-text px-4 py-3 rounded-lg mb-6 flex items-center"
    >
      <AlertCircle className="h-5 w-5 mr-2 text-border-tertiary" />
      {error}
    </_motion.div>
  );
};