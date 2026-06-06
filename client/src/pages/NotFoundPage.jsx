import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="notfound-page">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="notfound-content"
      >
        <div className="notfound-icon">
          <AlertTriangle size={48} />
        </div>
        <h1 className="notfound-title">404</h1>
        <p className="notfound-subtitle">Page Not Found</p>
        <p className="notfound-description">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="primary" icon={Home}>Back to Dashboard</Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
