/**
 * Validate email format.
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate phone number (basic — allows digits, spaces, dashes, parens, plus).
 */
export const isValidPhone = (phone) => {
  if (!phone) return true; // Phone is optional
  const regex = /^[+]?[\d\s\-()]{7,20}$/;
  return regex.test(phone);
};

/**
 * Validate a lead form.
 * Returns an object with field-level error messages, or empty object if valid.
 */
export const validateLeadForm = (data) => {
  const errors = {};

  if (!data.name?.trim()) {
    errors.name = 'Full name is required';
  }

  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email';
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  return errors;
};

/**
 * Validate login form.
 */
export const validateLoginForm = (data) => {
  const errors = {};

  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email';
  }

  if (!data.password?.trim()) {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
};
