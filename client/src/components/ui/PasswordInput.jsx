import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, X, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import './PasswordInput.css';

const PasswordInput = ({
  value = '',
  onChange,
  placeholder = 'Enter password',
  label,
  name = 'password',
  required = false,
  error,
  showStrength = false,
  showRules = false,
  autoFocus = false,
  icon: Icon,
  disabled = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  const toggleVisibility = useCallback(() => {
    setVisible((prev) => !prev);
  }, []);

  // Password rules
  const rules = useMemo(() => [
    { label: 'Minimum 8 characters', test: value.length >= 8 },
    { label: 'Uppercase letter', test: /[A-Z]/.test(value) },
    { label: 'Number', test: /[0-9]/.test(value) },
    { label: 'Special character', test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value) },
  ], [value]);

  const passedCount = rules.filter((r) => r.test).length;

  // Strength
  const strength = useMemo(() => {
    if (value.length === 0) return null;
    if (passedCount <= 1) return { level: 'Weak', color: '#ef4444', percent: 25, icon: ShieldAlert };
    if (passedCount <= 2) return { level: 'Medium', color: '#f59e0b', percent: 50, icon: Shield };
    if (passedCount <= 3) return { level: 'Strong', color: '#22c55e', percent: 75, icon: ShieldCheck };
    return { level: 'Very Strong', color: '#10b981', percent: 100, icon: ShieldCheck };
  }, [value, passedCount]);

  const showMeta = (showStrength || showRules) && value.length > 0 && focused;

  return (
    <div className={`pw-field ${error ? 'pw-field-error' : ''}`}>
      {label && (
        <label className="pw-label">
          {label}
          {required && <span className="pw-required">*</span>}
        </label>
      )}

      <div className={`pw-input-wrap ${focused ? 'pw-input-focused' : ''} ${error ? 'pw-input-err' : ''}`}>
        {Icon && <Icon size={18} className="pw-icon-left" />}
        <input
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoFocus={autoFocus}
          disabled={disabled}
          autoComplete="current-password"
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          className="pw-input"
          aria-label={label || 'Password'}
        />

        <motion.button
          type="button"
          className="pw-toggle"
          onClick={toggleVisibility}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          <AnimatePresence mode="wait" initial={false}>
            {visible ? (
              <motion.span
                key="off"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ duration: 0.15 }}
                className="pw-toggle-icon"
              >
                <EyeOff size={18} />
              </motion.span>
            ) : (
              <motion.span
                key="on"
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 90 }}
                transition={{ duration: 0.15 }}
                className="pw-toggle-icon"
              >
                <Eye size={18} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {error && (
        <motion.p
          className="pw-error-msg"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}

      <AnimatePresence>
        {showMeta && (
          <motion.div
            className="pw-meta"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Strength bar */}
            {showStrength && strength && (
              <div className="pw-strength">
                <div className="pw-strength-bar-bg">
                  <motion.div
                    className="pw-strength-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${strength.percent}%` }}
                    style={{ background: strength.color }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="pw-strength-label" style={{ color: strength.color }}>
                  <strength.icon size={14} />
                  <span>{strength.level}</span>
                </div>
              </div>
            )}

            {/* Rules checklist */}
            {showRules && (
              <div className="pw-rules">
                {rules.map((rule, i) => (
                  <motion.div
                    key={i}
                    className={`pw-rule ${rule.test ? 'pw-rule-pass' : 'pw-rule-fail'}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    {rule.test ? (
                      <Check size={14} className="pw-rule-icon pw-rule-check" />
                    ) : (
                      <X size={14} className="pw-rule-icon pw-rule-x" />
                    )}
                    <span>{rule.label}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PasswordInput;
