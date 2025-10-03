export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const re = /^[0-9]{10,11}$/;
  return re.test(phone);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};
