import mathUtils from 'utils/math';
import BN from 'bn.js';

it('Test floor', async () => {
  expect(mathUtils.floor(0.155555, 3)).toBe(0.155);
  expect(mathUtils.floor(0.1544444, 3)).toBe(0.154);
});

it('Test floorUsd', async () => {
  expect(mathUtils.floorUsd(0.154555)).toBe(0.15);
  expect(mathUtils.floorUsd(0.155555)).toBe(0.15);
});

it('Test round', async () => {
  expect(mathUtils.round(0.155555, 3)).toBe(0.156);
  expect(mathUtils.round(0.154544, 3)).toBe(0.155);
  expect(mathUtils.round(0.155444, 3)).toBe(0.155);
  expect(mathUtils.round(0.154444, 3)).toBe(0.154);
});

it('Test calculateUsdValue', async () => {
  const v = await mathUtils.calculateUsdValue(new BN('1234567890000'), 10, 100);
  expect(v).toBe(12345.68);
});

it('Test calculatePlanksValue', async () => {
  expect(
    await mathUtils.calculatePlanksValue(500, 8, 61000.99).toString(),
  ).toBe('819658');

  expect(
    await mathUtils.calculatePlanksValue(0.9, 8, 61000.99).toString(),
  ).toBe('1475');
});

it('Test convertFromPlanckToViewDecimals (isRound=false)', async () => {
  const v = await mathUtils.convertFromPlanckToViewDecimals(
    new BN('1234567890000'),
    10,
    3,
    false,
  );
  expect(v).toBe(123.456);
});

it('Test convertFromPlanckToViewDecimals (isRound=true)', async () => {
  expect(
    await mathUtils.convertFromPlanckToViewDecimals(
      new BN('1234567890000'),
      10,
      3,
      true,
    ),
  ).toBe(123.457);
  expect(
    await mathUtils.convertFromPlanckToViewDecimals(
      new BN('1234560000001'),
      10,
      3,
      true,
    ),
  ).toBe(123.457);
  expect(
    await mathUtils.convertFromPlanckToViewDecimals(
      new BN('1234560000001'),
      10,
      3,
      true,
    ),
  ).toBe(123.457);
  expect(
    await mathUtils.convertFromPlanckToViewDecimals(
      new BN('1234500000001'),
      10,
      3,
      true,
    ),
  ).toBe(123.451);
});

it('Test convertFromPlanckString', async () => {
  expect(
    mathUtils.convertFromPlanckToString(new BN('10000000000001'), 12),
  ).toBe('10.000000000001');
  expect(mathUtils.convertFromPlanckToString(new BN('1'), 12)).toBe(
    '0.000000000001',
  );
  expect(mathUtils.convertFromPlanckToString(new BN('100000000123'), 12)).toBe(
    '0.100000000123',
  );
  expect(
    mathUtils.convertFromPlanckToString(new BN('25000004000000'), 12),
  ).toBe('25.000004');
});
