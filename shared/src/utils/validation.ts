// Validation utility functions
import { VALIDATION_RULES } from '../constants/validation';

export const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL.REGEX.test(email);
};

export const validatePhone = (phone: string): boolean => {
  return VALIDATION_RULES.PHONE.REGEX.test(phone);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= VALIDATION_RULES.PASSWORD.MIN_LENGTH;
};

export const validateStrongPassword = (password: string): boolean => {
  return VALIDATION_RULES.PASSWORD.REGEX.test(password);
};

export const validateName = (name: string): boolean => {
  return (
    name.length >= VALIDATION_RULES.NAME.MIN_LENGTH &&
    name.length <= VALIDATION_RULES.NAME.MAX_LENGTH &&
    VALIDATION_RULES.NAME.REGEX.test(name)
  );
};

export const validateSkillLevel = (level: number): boolean => {
  return level >= VALIDATION_RULES.SKILL_LEVEL.MIN && level <= VALIDATION_RULES.SKILL_LEVEL.MAX;
};

export const validateAmount = (amount: number): boolean => {
  return amount >= 0 && Number.isFinite(amount);
};

export const validateFutureDate = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d > new Date();
};

export const validateDateRange = (startDate: Date | string, endDate: Date | string): boolean => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  return start < end;
};

export const sanitizeString = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
