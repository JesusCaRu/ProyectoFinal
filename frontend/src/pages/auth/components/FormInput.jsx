import { motion as _motion } from 'framer-motion';
import { AlertCircle, Mail, Lock, User } from 'lucide-react';

const iconMap = {
  email: Mail,
  password: Lock,
  username: User
};

export const FormInput = ({
  type = 'text',
  name,
  label,
  value,
  onChange,
  error,
  placeholder,
  icon,
  delay = 0
}) => {
  const IconComponent = icon ? iconMap[icon] : null;

  return (
    <_motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="mb-4"
    >
      <label htmlFor={name} className="block text-sm font-medium text-accessibility-text mb-2">
        {label}
      </label>
      <div className="relative">
        {IconComponent && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconComponent className="h-5 w-5 text-border-secondary" />
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`${IconComponent ? 'pl-10' : 'pl-3'} block w-full rounded-lg border ${
            error ? 'border-border-tertiary' : 'border-border'
          } bg-bg text-accessibility-text shadow-sm focus:border-solid-color focus:ring-solid-color transition-colors duration-200 py-2 px-3`}
          placeholder={placeholder}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-border-tertiary flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </_motion.div>
  );
};