import { AppError } from '../../../domain/common/AppError';
import { InMemoryAlertRepository, sampleAlerts } from '../InMemoryAlertRepository';

describe('InMemoryAlertRepository', () => {
  it('lists the alerts it was created with', async () => {
    const repository = new InMemoryAlertRepository(sampleAlerts());
    expect(await repository.list()).toHaveLength(4);
  });

  it('marks one alert as read and keeps the others', async () => {
    const repository = new InMemoryAlertRepository(sampleAlerts());

    await repository.markAsRead('sample-1');

    const alerts = await repository.list();
    expect(alerts.find((a) => a.id === 'sample-1')?.read).toBe(true);
    expect(alerts.find((a) => a.id === 'sample-2')?.read).toBe(false);
  });

  it('removes one alert', async () => {
    const repository = new InMemoryAlertRepository(sampleAlerts());

    await repository.remove('sample-2');

    expect((await repository.list()).map((a) => a.id)).not.toContain('sample-2');
  });

  it('fails with not_found when the alert does not exist', async () => {
    const repository = new InMemoryAlertRepository(sampleAlerts());

    const error = await repository.markAsRead('nope').catch((e) => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.kind).toBe('not_found');
    expect(error.code).toBe('alert.not_found');
  });

  it('does not let the caller change its stored data', async () => {
    const repository = new InMemoryAlertRepository(sampleAlerts());

    const first = await repository.list();
    first[0].read = true;

    expect((await repository.list())[0].read).toBe(false);
  });
});
