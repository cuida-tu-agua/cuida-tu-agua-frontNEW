import { AxiosInstance } from 'axios';
import { HttpGuestRepository } from '../HttpGuestRepository';
import { HttpSharingRepository } from '../HttpSharingRepository';

const sharing = (http: object) => new HttpSharingRepository(http as unknown as AxiosInstance);
const notFound = () => Object.assign(new Error('nf'), { isAxiosError: true, response: { status: 404, data: {} } });

describe('HttpSharingRepository', () => {
  it('asks for the access of the place', async () => {
    const get = jest.fn().mockResolvedValue({ data: { placeId: 'p1', role: 'COLLABORATOR', permissions: ['VIEW_CONSUMPTION'] } });

    const access = await sharing({ get }).getAccess('p1');

    expect(get).toHaveBeenCalledWith('/api/places/p1/access');
    expect(access.role).toBe('COLLABORATOR');
  });

  it('a place without a guest link answers null instead of failing', async () => {
    const get = jest.fn().mockRejectedValue(notFound());

    await expect(sharing({ get }).getGuestLink('p1')).resolves.toBeNull();
    expect(get).toHaveBeenCalledWith('/api/places/p1/guest-link');
  });

  it('any other failure while reading the guest link is still an error', async () => {
    const get = jest.fn().mockRejectedValue(new Error('boom'));

    await expect(sharing({ get }).getGuestLink('p1')).rejects.toBeDefined();
  });

  it('creates the link, and only regenerates when asked', async () => {
    const post = jest.fn().mockResolvedValue({ data: { id: 'g', token: 't', url: 'u', createdAt: '' } });

    await sharing({ post }).createGuestLink('p1');
    await sharing({ post }).createGuestLink('p1', true);

    expect(post).toHaveBeenNthCalledWith(1, '/api/places/p1/guest-link', undefined, undefined);
    expect(post).toHaveBeenNthCalledWith(2, '/api/places/p1/guest-link', undefined, { params: { regenerate: true } });
  });

  it('turns the guest link off with a DELETE', async () => {
    const del = jest.fn().mockResolvedValue({});

    await sharing({ delete: del }).deactivateGuestLink('p1');

    expect(del).toHaveBeenCalledWith('/api/places/p1/guest-link');
  });

  it('invites with the e-mail and the permissions', async () => {
    const post = jest.fn().mockResolvedValue({ data: { invitation: { id: 'i' }, emailSent: true } });

    const sent = await sharing({ post }).invite('p1', 'a@b.co', ['VIEW_CONSUMPTION', 'CONTROL_VALVE']);

    expect(post).toHaveBeenCalledWith('/api/places/p1/invitations', { email: 'a@b.co', permissions: ['VIEW_CONSUMPTION', 'CONTROL_VALVE'] });
    expect(sent.emailSent).toBe(true);
  });

  it('cancels an invitation, changes permissions and revokes a collaborator on their own addresses', async () => {
    const del = jest.fn().mockResolvedValue({});
    const put = jest.fn().mockResolvedValue({ data: { id: 'm' } });

    await sharing({ delete: del }).cancelInvitation('p1', 'i1');
    await sharing({ put }).changePermissions('p1', 'm1', ['VIEW_CONSUMPTION']);
    await sharing({ delete: del }).revokeMember('p1', 'm1');

    expect(del).toHaveBeenNthCalledWith(1, '/api/places/p1/invitations/i1');
    expect(put).toHaveBeenCalledWith('/api/places/p1/members/m1/permissions', { permissions: ['VIEW_CONSUMPTION'] });
    expect(del).toHaveBeenNthCalledWith(2, '/api/places/p1/members/m1');
  });

  it('lists the places shared with the person and their inbox, and answers an invitation', async () => {
    const get = jest.fn().mockResolvedValue({ data: [] });
    const post = jest.fn().mockResolvedValue({ data: {} });

    await sharing({ get }).listSharedPlaces();
    await sharing({ get }).listInbox();
    await sharing({ post }).acceptInvitation('i1');
    await sharing({ post }).rejectInvitation('i2');

    expect(get).toHaveBeenNthCalledWith(1, '/api/shared-places');
    expect(get).toHaveBeenNthCalledWith(2, '/api/invitations');
    expect(post).toHaveBeenNthCalledWith(1, '/api/invitations/i1/accept');
    expect(post).toHaveBeenNthCalledWith(2, '/api/invitations/i2/reject');
  });

  it('a collaborator leaves with a DELETE on the membership', async () => {
    const del = jest.fn().mockResolvedValue({});

    await sharing({ delete: del }).leave('p1');

    expect(del).toHaveBeenCalledWith('/api/places/p1/membership');
  });

  it('turns a server refusal into an app error', async () => {
    const post = jest.fn().mockRejectedValue(new Error('boom'));

    await expect(sharing({ post }).acceptInvitation('i1')).rejects.toBeDefined();
  });
});

describe('HttpGuestRepository', () => {
  const guest = (places: object, consumption: object) =>
    new HttpGuestRepository(places as unknown as AxiosInstance, consumption as unknown as AxiosInstance);

  it('reads the place with the token in the path', async () => {
    const get = jest.fn().mockResolvedValue({ data: { name: 'Casa', cityName: 'Cali', measurementUnit: 'LITERS' } });

    const place = await guest({ get }, {}).getPlace('abc-DEF_123');

    expect(get).toHaveBeenCalledWith('/api/guest/abc-DEF_123');
    expect(place.name).toBe('Casa');
  });

  it('never leaves a character of the token unescaped', async () => {
    const get = jest.fn().mockResolvedValue({ data: {} });

    await guest({ get }, {}).getPlace('a/b?c');

    expect(get).toHaveBeenCalledWith('/api/guest/a%2Fb%3Fc');
  });

  it('reads the consumption with period and zone, and turns numbers into numbers', async () => {
    const get = jest.fn().mockResolvedValue({
      data: { totalLiters: '12.5', currentFlowLpm: null, buckets: [{ start: 's', liters: '2.5' }] },
    });

    const data = await guest({}, { get }).getConsumption('tok', 'WEEK', 'America/Bogota');

    expect(get).toHaveBeenCalledWith('/api/guest/tok/consumption', { params: { period: 'week', tz: 'America/Bogota' } });
    expect(data.totalLiters).toBe(12.5);
    expect(data.currentFlowLpm).toBeNull();
    expect(data.buckets[0].liters).toBe(2.5);
  });

  it('a link that does not work is a not_found error', async () => {
    const get = jest.fn().mockRejectedValue(notFound());

    await expect(guest({ get }, {}).getPlace('tok')).rejects.toMatchObject({ kind: 'not_found' });
  });
});
