import './Skeleton.css';

const Skeleton = ({ width, height, radius, className = '' }) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '20px',
        borderRadius: radius || 'var(--radius-sm)',
      }}
    />
  );
};

// Preset skeleton patterns
export const SkeletonCard = () => (
  <div className="skeleton-card">
    <Skeleton height="24px" width="40%" />
    <Skeleton height="40px" width="60%" />
    <Skeleton height="16px" width="80%" />
  </div>
);

export const SkeletonRow = () => (
  <div className="skeleton-row">
    <Skeleton width="30%" height="16px" />
    <Skeleton width="25%" height="16px" />
    <Skeleton width="20%" height="16px" />
    <Skeleton width="15%" height="16px" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="skeleton-table">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} />
    ))}
  </div>
);

export default Skeleton;
