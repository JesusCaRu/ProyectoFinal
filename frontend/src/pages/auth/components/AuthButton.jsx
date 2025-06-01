import { motion as _motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const AuthButton = ({ isLoading, children, ...props }) => {
  return (
    <_motion.button
      {...props}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="text-white w-full bg-solid-color hover:bg-solid-color-secondary font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solid-color disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
          {children}
        </>
      ) : (
        children
      )}
    </_motion.button>
  );
};