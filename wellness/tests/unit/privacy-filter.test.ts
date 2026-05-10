import { anonymizeId, anonymizeResourceId, maskEmail, maskPhone, maskTcId, sanitizeForLog } from '../../modules/privacy-filter';

describe('anonymizeId', () => {
  it('aynı giriş için her zaman aynı çıktıyı üretir', () => {
    expect(anonymizeId('user123')).toBe(anonymizeId('user123'));
  });

  it('farklı girişler için farklı çıktı üretir', () => {
    expect(anonymizeId('user123')).not.toBe(anonymizeId('user456'));
  });

  it('"usr_" prefix ile başlar', () => {
    expect(anonymizeId('abc')).toMatch(/^usr_/);
  });
});

describe('anonymizeResourceId', () => {
  it('"rec_" prefix ile başlar', () => {
    expect(anonymizeResourceId('record1')).toMatch(/^rec_/);
  });
});

describe('maskEmail', () => {
  it('kullanıcı adının ilk 2 karakterini görünür bırakır', () => {
    expect(maskEmail('john.doe@example.com')).toMatch(/^jo/);
  });

  it('domain kısmını korur', () => {
    expect(maskEmail('john@example.com')).toContain('@example.com');
  });

  it('geçersiz e-posta için güvenli fallback döner', () => {
    expect(maskEmail('invalid')).toBe('***@***.***');
  });
});

describe('maskPhone', () => {
  it('son 2 haneyi görünür bırakır', () => {
    const result = maskPhone('05551234567');
    expect(result.slice(-2)).toBe('67');
  });
});

describe('maskTcId', () => {
  it('11 haneli TC için doğru maskeleme yapar', () => {
    expect(maskTcId('12345678901')).toBe('123******01');
  });

  it('11 haneden farklı için güvenli fallback döner', () => {
    expect(maskTcId('123')).toBe('***********');
  });
});

describe('sanitizeForLog', () => {
  it('PII alanlarını [REDACTED] ile değiştirir', () => {
    const result = sanitizeForLog({ email: 'test@test.com', userId: 'abc' });
    expect(result.email).toBe('[REDACTED]');
    expect(result.userId).toBe('abc');
  });

  it('PII olmayan alanları olduğu gibi bırakır', () => {
    const result = sanitizeForLog({ action: 'LOGIN', status: 'SUCCESS' });
    expect(result.action).toBe('LOGIN');
    expect(result.status).toBe('SUCCESS');
  });
});
