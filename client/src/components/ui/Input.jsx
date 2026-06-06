import './Input.css';

const Input = ({
  label,
  error,
  icon: Icon,
  type = 'text',
  id,
  className = '',
  ...props
}) => {
  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <div className="input-wrapper">
        {Icon && <Icon size={18} className="input-icon" />}
        {type === 'textarea' ? (
          <textarea id={id} className="input-field input-textarea" {...props} />
        ) : (
          <input id={id} type={type} className={`input-field ${Icon ? 'has-icon' : ''}`} {...props} />
        )}
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
};

export default Input;
