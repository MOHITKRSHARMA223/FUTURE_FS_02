import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import Button from './Button';
import './EmptyState.css';

const EmptyState = ({ icon: Icon = Inbox, title, description, actionLabel, onAction }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="empty-state"
    >
      <div className="empty-state-icon">
        <Icon size={48} />
      </div>
      <h3 className="empty-state-title">{title || 'No data found'}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
      )}
    </motion.div>
  );
};

export default EmptyState;
