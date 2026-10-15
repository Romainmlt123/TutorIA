/**
 * @jest-environment node
 */
import { serverLog } from './log';

describe('serverLog.error', () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  afterAll(() => spy.mockRestore());

  it('donne la cause d’une erreur (l’erreur réseau sous celle du SDK)', () => {
    const network = new TypeError('Network connection lost.');
    serverLog.error('chat.stream', new Error('Connection error.', { cause: network }));
    expect(spy).toHaveBeenLastCalledWith(
      '[tutor:chat.stream]',
      'Error: Connection error. ← TypeError: Network connection lost.',
    );
  });

  it('résume une erreur de Supabase par son code et son message, sans ses détails', () => {
    serverLog.error('tutor.record', {
      code: '42703',
      message: 'column does not exist',
      details: 'x',
    });
    expect(spy).toHaveBeenLastCalledWith('[tutor:tutor.record]', '42703: column does not exist');
  });
});
