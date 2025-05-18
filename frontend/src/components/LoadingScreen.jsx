import { motion as _motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <_motion.div
      className="fixed inset-0 bg-bg z-50 flex items-center justify-center"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <_motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 border-4 border-solid-color border-t-transparent rounded-full"
      />
    </_motion.div>
  );
};

export default LoadingScreen;