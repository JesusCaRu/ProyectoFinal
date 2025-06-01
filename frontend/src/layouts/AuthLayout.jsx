import { Outlet } from 'react-router-dom';
import { motion as _motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const AuthLayout = () => {
  const [ref] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <div 
      className="h-screen flex flex-col md:flex-row bg-gradient-to-br from-bg via-bg-secondary to-bg overflow-hidden"
      ref={ref}
    >
      {/* Visual Side */}
      <_motion.div 
        className="hidden md:flex w-full md:w-1/2 relative overflow-hidden items-center justify-center p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <_motion.div
              key={i}
              className="absolute rounded-full bg-solid-color opacity-10"
              initial={{
                x: Math.random() * 100,
                y: Math.random() * 100,
                width: Math.random() * 20 + 10,
                height: Math.random() * 20 + 10
              }}
              animate={{
                y: [null, Math.random() * 200 - 100],
                x: [null, Math.random() * 200 - 100],
              }}
              transition={{
                duration: Math.random() * 15 + 15,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>

        <_motion.div
          className="relative z-10 text-center text-accessibility-text-secondary max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <_motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="w-24 h-24 bg-solid-color bg-opacity-30 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm shadow-lg">
              <svg 
                className="w-14 h-14 text-accessibility-text-secondary" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
                />
              </svg>
            </div>
          </_motion.div>
          
          <_motion.h1 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Bienvenido a <span className="text-solid-color">StockFlow</span>
          </_motion.h1>
          
          <_motion.p 
            className="text-lg md:text-xl opacity-90 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            La solución inteligente para gestionar tu inventario de robots
          </_motion.p>
          
          <_motion.div 
            className="flex justify-center space-x-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {['Robótica', 'Inventario', 'Control'].map((feature, index) => (
              <_motion.span
                key={index}
                className="px-3 py-1.5 bg-solid-color bg-opacity-20 rounded-full text-sm font-medium backdrop-blur-sm text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {feature}
              </_motion.span>
            ))}
          </_motion.div>
        </_motion.div>
      </_motion.div>

      {/* Form Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        <_motion.div
          className="w-full max-w-xl relative"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Glass card effect */}
          <div className="relative bg-bg rounded-2xl border border-border overflow-hidden backdrop-blur-sm bg-opacity-80 shadow-xl">
            {/* Subtle texture */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2IiBoZWlnaHQ9IjYiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjMiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')] opacity-10"></div>
            
            {/* Content container with padding */}
            <div className="relative z-10 p-5">
              <Outlet />
            </div>
          </div>
        </_motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;