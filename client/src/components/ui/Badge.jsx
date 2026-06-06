import { useTheme } from '../../context/ThemeContext';
import { STATUS_COLORS } from '../../utils/constants';
import './Badge.css';

const Badge = ({ status, variant, children, size = 'md' }) => {
  const { isDark } = useTheme();

  // If variant="outline", render a simple outline badge
  if (variant === 'outline') {
    return (
      <span className={`badge badge-${size} badge-outline`}>
        {children}
      </span>
    );
  }

  // Status-based badge
  const colors = STATUS_COLORS[status] || STATUS_COLORS['New'];

  const style = {
    background: isDark ? colors.darkBg : colors.bg,
    color: isDark ? colors.darkText : colors.text,
    borderColor: isDark ? 'transparent' : colors.border,
  };

  return (
    <span className={`badge badge-${size}`} style={style}>
      <span className="badge-dot" style={{ background: isDark ? colors.darkText : colors.text }} />
      {status}
    </span>
  );
};

export default Badge;
