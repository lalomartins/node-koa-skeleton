const app = require('./index');
const Reward = require('./model/reward');
const Rewards = require('./model/rewards');
const dateUtil = require('./date');
const agent = require('supertest-koa-agent');
const request = agent(app);
jest.spyOn(dateUtil, 'now');

beforeEach(() => {
  app.db = new Rewards();
});

test('Gets the health endpoint', () => request.get('/health').expect(200));

describe('Get week rewards', () => {
  test('Fails on invalid user ID', async () => {
    await request
      .get('/users/root/rewards?at=2020-03-19T12:00:00.000Z')
      .expect(400);
    expect(app.db.rewards).toHaveLength(0);
  });

  test('Fails on invalid date', async () => {
    await request.get('/users/1/rewards?at=fnord').expect(400);
    expect(app.db.rewards).toHaveLength(0);
  });

  test('Gets a set of new tasks', async () => {
    const response = await request
      .get('/users/1/rewards?at=2020-03-19T12:00:00.000Z')
      .expect(200)
      .expect('content-type', 'application/json; charset=utf-8');
    expect(Object.keys(app.db.index)).toHaveLength(1);
    expect(app.db.rewards).toHaveLength(7);
    expect(response.body.data).toHaveLength(7);
    expect(response.body.data).toMatchObject([
      {
        availableAt: '2020-03-15T00:00:00.000Z',
        redeemedAt: null,
        expiresAt: '2020-03-16T00:00:00.000Z',
      },
      {
        availableAt: '2020-03-16T00:00:00.000Z',
        redeemedAt: null,
        expiresAt: '2020-03-17T00:00:00.000Z',
      },
      {
        availableAt: '2020-03-17T00:00:00.000Z',
        redeemedAt: null,
        expiresAt: '2020-03-18T00:00:00.000Z',
      },
      {
        availableAt: '2020-03-18T00:00:00.000Z',
        redeemedAt: null,
        expiresAt: '2020-03-19T00:00:00.000Z',
      },
      {
        availableAt: '2020-03-19T00:00:00.000Z',
        redeemedAt: null,
        expiresAt: '2020-03-20T00:00:00.000Z',
      },
      {
        availableAt: '2020-03-20T00:00:00.000Z',
        redeemedAt: null,
        expiresAt: '2020-03-21T00:00:00.000Z',
      },
      {
        availableAt: '2020-03-21T00:00:00.000Z',
        redeemedAt: null,
        expiresAt: '2020-03-22T00:00:00.000Z',
      },
    ]);
  });

  test('Gets a set of new tasks with some existing', async () => {
    app.db.add(
      new Reward({
        user: 1,
        availableAt: new Date('2020-03-19T00:00:00.000Z'),
        redeemedAt: new Date('2020-03-19T05:23:00.000Z'),
      }),
    );
    const response = await request
      .get('/users/1/rewards?at=2020-03-19T12:00:00.000Z')
      .expect(200)
      .expect('content-type', 'application/json; charset=utf-8');
    expect(Object.keys(app.db.index)).toHaveLength(1);
    expect(app.db.rewards).toHaveLength(7);
    expect(response.body.data).toHaveLength(7);
    expect(response.body.data).toMatchObject([
      {
        availableAt: '2020-03-15T00:00:00.000Z',
        redeemedAt: null,
        expiresAt: '2020-03-16T00:00:00.000Z',
      },
      {
        availableAt: '2020-03-16T00:00:00.000Z',
        redeemedAt: null,
        expiresAt: '2020-03-17T00:00:00.000Z',
      },
      {
        availableAt: '2020-03-17T00:00:00.000Z',
        redeemedAt: null,
        expiresAt: '2020-03-18T00:00:00.000Z',
      },
      {
        availableAt: '2020-03-18T00:00:00.000Z',
        redeemedAt: null,
        expiresAt: '2020-03-19T00:00:00.000Z',
      },
      {
        availableAt: '2020-03-19T00:00:00.000Z',
        redeemedAt: '2020-03-19T05:23:00.000Z',
        expiresAt: '2020-03-20T00:00:00.000Z',
      },
      {
        availableAt: '2020-03-20T00:00:00.000Z',
        redeemedAt: null,
        expiresAt: '2020-03-21T00:00:00.000Z',
      },
      {
        availableAt: '2020-03-21T00:00:00.000Z',
        redeemedAt: null,
        expiresAt: '2020-03-22T00:00:00.000Z',
      },
    ]);
  });
});

describe('Claim rewards', () => {
  const now = new Date('2020-03-19T23:05:00.000Z');
  beforeEach(() => {
    dateUtil.now.mockReturnValue(now);
    return request.get('/users/1/rewards?at=2020-03-19T12:00:00.000Z');
  });

  afterEach(() => {
    dateUtil.now.mockClear();
  });

  test('Fail if user is invalid', () =>
    request
      .patch('/users/root/rewards/2020-03-19T00:00:00Z/redeem')
      .expect(400));

  test('Fail if date is invalid', () =>
    request.patch('/users/1/rewards/fnord/redeem').expect(400));

  test('Fails if the reward does not exist', async () =>
    request.patch('/users/2/rewards/2020-03-19T00:00:00Z/redeem').expect(404));

  test('Fails if the reward is already claimed', async () => {
    app.db.get(1, dateUtil.day(now)).redeemedAt = new Date(
      '2020-03-19T05:23:00.000Z',
    );
    return request
      .patch('/users/1/rewards/2020-03-19T00:00:00Z/redeem')
      .expect(403);
  });

  test('Fails if the reward is already expired', async () =>
    request.patch('/users/1/rewards/2020-03-16T00:00:00Z/redeem').expect(403));

  test('Successfully claim an available reward', async () => {
    const response = await request
      .patch('/users/1/rewards/2020-03-19T00:00:00Z/redeem')
      .expect(200);
    expect(app.db.get(1, dateUtil.day(now)).redeemedAt).toBe(now);
    expect(response.body.data.redeemedAt).toBe('2020-03-19T23:05:00.000Z');
  });
});
