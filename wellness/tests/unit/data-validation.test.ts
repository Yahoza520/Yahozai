import {
  validateAnswers,
  validateSingleAnswer,
  isProgramDuration,
} from '../../modules/data-validation';

describe('validateAnswers', () => {
  it('geçerli string cevabı kabul eder', () => {
    const result = validateAnswers({ P01: '25-35' });
    expect(result.success).toBe(true);
  });

  it('geçerli dizi cevabı kabul eder', () => {
    const result = validateAnswers({ S01: ['fatigue', 'pain'] });
    expect(result.success).toBe(true);
  });

  it('geçerli scale cevabı (number) kabul eder', () => {
    const result = validateAnswers({ E01: 7 });
    expect(result.success).toBe(true);
  });

  it('geçerli boolean cevabı kabul eder', () => {
    const result = validateAnswers({ L01: true });
    expect(result.success).toBe(true);
  });

  it('null cevabı kabul eder', () => {
    const result = validateAnswers({ B01: null });
    expect(result.success).toBe(true);
  });

  it('nesne olmayan giriş hata döner', () => {
    const result = validateAnswers('invalid');
    expect(result.success).toBe(false);
  });
});

describe('validateSingleAnswer', () => {
  it('single tipinde geçerli string kabul eder', () => {
    expect(validateSingleAnswer('yes', 'single')).toBe(true);
  });

  it('single tipinde boş string reddeder', () => {
    expect(validateSingleAnswer('', 'single')).toBe(false);
  });

  it('multi tipinde string dizisi kabul eder', () => {
    expect(validateSingleAnswer(['a', 'b'], 'multi')).toBe(true);
  });

  it('multi tipinde boş dizi reddeder', () => {
    expect(validateSingleAnswer([], 'multi')).toBe(false);
  });

  it('scale tipinde 1–10 arası sayı kabul eder', () => {
    expect(validateSingleAnswer(5, 'scale')).toBe(true);
  });

  it('scale tipinde 0 reddeder', () => {
    expect(validateSingleAnswer(0, 'scale')).toBe(false);
  });

  it('scale tipinde 11 reddeder', () => {
    expect(validateSingleAnswer(11, 'scale')).toBe(false);
  });

  it('boolean tipinde true kabul eder', () => {
    expect(validateSingleAnswer(true, 'boolean')).toBe(true);
  });

  it('boolean tipinde string reddeder', () => {
    expect(validateSingleAnswer('true', 'boolean')).toBe(false);
  });
});

describe('isProgramDuration', () => {
  it('"short" geçerli kabul eder', () => {
    expect(isProgramDuration('short')).toBe(true);
  });

  it('"medium" geçerli kabul eder', () => {
    expect(isProgramDuration('medium')).toBe(true);
  });

  it('"full" geçerli kabul eder', () => {
    expect(isProgramDuration('full')).toBe(true);
  });

  it('"daily" geçersiz kabul eder', () => {
    expect(isProgramDuration('daily')).toBe(false);
  });

  it('undefined geçersiz kabul eder', () => {
    expect(isProgramDuration(undefined)).toBe(false);
  });
});
