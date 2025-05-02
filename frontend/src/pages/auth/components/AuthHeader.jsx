import { motion as _motion } from 'framer-motion';

export const AuthHeader = ({ title, subtitle, icon }) => {
  return (
    <div className="text-center mb-8">
      <_motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-16 h-16 bg-interactive-component rounded-full flex items-center justify-center mx-auto mb-4"
      >
        {icon || <div className="h-8 w-8 text-solid-color">{icon}</div>}
      </_motion.div>
      <h2 className="text-3xl font-bold text-accessibility-text mb-2">{title}</h2>
      <p className="text-accessibility-text-secondary">{subtitle}</p>
    </div>
  );
};