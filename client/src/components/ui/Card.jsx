import { motion } from 'framer-motion';
import './Card.css';

const Card = ({ children, className = '', hover = false, gradient, variant, onClick, ...props }) => {
  const variantClass = variant ? `card-${variant}` : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -4, boxShadow: 'var(--shadow-card-hover)' } : {}}
      className={`card glass ${variantClass} ${gradient ? 'card-gradient' : ''} ${onClick ? 'card-clickable' : ''} ${className}`}
      style={gradient ? { background: gradient } : undefined}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
