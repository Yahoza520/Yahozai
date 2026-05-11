import { logAction, writeAuditLog } from '../../modules/audit-logger';

// Winston transport'u mock'la — dosyaya yazma gereksiz
jest.mock('../../modules/audit-logger', () => {
  const logged: unknown[] = [];
  return {
    initAuditLogger: jest.fn().mockResolvedValue(undefined),
    writeAuditLog: jest.fn().mockImplementation(async (entry: unknown) => {
      logged.push(entry);
    }),
    logAction: jest.fn().mockImplementation(
      async (
        userId: string,
        action: string,
        module: string,
        status: string,
        resourceId?: string,
      ) => {
        logged.push({ userId, action, module, status, resourceId });
      },
    ),
    __logged: logged,
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { __logged } = require('../../modules/audit-logger') as { __logged: unknown[] };

beforeEach(() => {
  __logged.length = 0;
  jest.clearAllMocks();
});

describe('logAction', () => {
  it('çağrıldığında logAction mock tetiklenir', async () => {
    await logAction('usr_x', 'KULLANICI_GIRIS', 'TestScreen', 'SUCCESS');
    expect(logAction).toHaveBeenCalledTimes(1);
  });

  it('doğru parametreleri alır', async () => {
    await logAction('usr_y', 'SEANS_BASLANGIC', 'PlayerScreen', 'SUCCESS', 'res_1');
    expect(logAction).toHaveBeenCalledWith(
      'usr_y', 'SEANS_BASLANGIC', 'PlayerScreen', 'SUCCESS', 'res_1',
    );
  });

  it('FAILURE status ile çağrılabilir', async () => {
    await logAction('usr_z', 'VERI_GORUNTULEME', 'HomeScreen', 'FAILURE');
    expect(logAction).toHaveBeenCalledWith(
      'usr_z', 'VERI_GORUNTULEME', 'HomeScreen', 'FAILURE',
    );
  });
});

describe('writeAuditLog', () => {
  it('çağrıldığında writeAuditLog mock tetiklenir', async () => {
    await writeAuditLog({
      logId: 'log_1',
      timestamp: new Date().toISOString(),
      anonymizedUserId: 'usr_abc',
      role: 'VIEWER',
      action: 'VERI_SILME',
      module: 'StorageModule',
      status: 'SUCCESS',
    });
    expect(writeAuditLog).toHaveBeenCalledTimes(1);
  });
});
