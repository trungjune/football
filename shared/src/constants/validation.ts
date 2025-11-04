// Validation constants and regex patterns
export const VALIDATION_RULES = {
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MIN_LENGTH: 5,
    MAX_LENGTH: 254,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
    REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
  },
  PHONE: {
    REGEX: /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/,
    MIN_LENGTH: 10,
    MAX_LENGTH: 12,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    REGEX: /^[a-zA-ZÀ-ỹ\s]+$/,
  },
  SKILL_LEVEL: {
    MIN: 1,
    MAX: 10,
  },
  SESSION: {
    TITLE: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 200,
    },
    DESCRIPTION: {
      MAX_LENGTH: 1000,
    },
    LOCATION: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 200,
    },
    MAX_PLAYERS: {
      MIN: 1,
      MAX: 30,
    },
    COST: {
      MIN: 0,
      MAX: 1000000, // 1 million VND
    },
  },
  FEE: {
    TITLE: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 200,
    },
    AMOUNT: {
      MIN: 0,
      MAX: 10000000, // 10 million VND
    },
  },
} as const;

export const ERROR_MESSAGES = {
  REQUIRED: 'Trường này là bắt buộc',
  INVALID_EMAIL: 'Email không hợp lệ',
  INVALID_PHONE: 'Số điện thoại không hợp lệ',
  PASSWORD_TOO_SHORT: 'Mật khẩu phải có ít nhất 6 ký tự',
  PASSWORD_TOO_WEAK: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
  NAME_TOO_SHORT: 'Tên phải có ít nhất 2 ký tự',
  NAME_TOO_LONG: 'Tên không được quá 100 ký tự',
  INVALID_SKILL_LEVEL: 'Trình độ phải từ 1 đến 10',
  INVALID_DATE: 'Ngày không hợp lệ',
  FUTURE_DATE_REQUIRED: 'Ngày phải trong tương lai',
  INVALID_AMOUNT: 'Số tiền không hợp lệ',
} as const;
