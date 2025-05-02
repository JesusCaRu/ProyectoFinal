import { motion as _motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const AuthFooter = ({ text, linkText, linkTo }) => {
  return (
    <_motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mt-6 text-center"
    >
      <p className="text-sm text-accessibility-text-secondary">
        {text}{' '}
        <Link
          to={linkTo}
          className="font-medium text-solid-color hover:text-solid-color-secondary transition-colors duration-200"
        >
          {linkText}
        </Link>
      </p>
    </_motion.div>
  );
};