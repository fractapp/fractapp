import stringUtils from 'utils/string';
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));
it('Test getMonths', async () => {
  expect(stringUtils.months[0]).toBe('months.january');
  expect(stringUtils.months[1]).toBe('months.february');
  expect(stringUtils.months[2]).toBe('months.march');
  expect(stringUtils.months[3]).toBe('months.april');
  expect(stringUtils.months[4]).toBe('months.may');
  expect(stringUtils.months[5]).toBe('months.june');
  expect(stringUtils.months[6]).toBe('months.july');
  expect(stringUtils.months[7]).toBe('months.august');
  expect(stringUtils.months[8]).toBe('months.september');
  expect(stringUtils.months[9]).toBe('months.october');
  expect(stringUtils.months[10]).toBe('months.november');
  expect(stringUtils.months[11]).toBe('months.december');
});

it('Test formatNameOrAddress one', async () => {
  expect(stringUtils.formatNameOrAddress('Name')).toBe('Name');
});

it('Test formatNameOrAddress two', async () => {
  expect(
    stringUtils.formatNameOrAddress(
      '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
    ),
  ).toBe('1exaAg2VJRQ...o23R2T6EGdE');
});

it('Test fromTime one', async () => {
  expect(stringUtils.fromTime(new Date('1995-12-17T03:06:00'))).toBe('03:06');
});

it('Test fromTime two', async () => {
  expect(stringUtils.fromTime(new Date('1995-12-17T11:16:00'))).toBe('11:16');
});

it('Test fromFullDate one', async () => {
  expect(stringUtils.fromFullDate(new Date('1995-01-03T03:06:00'))).toBe(
    '03/01/95',
  );
});

it('Test fromFullDate two', async () => {
  expect(stringUtils.fromFullDate(new Date('1995-12-17T11:16:00'))).toBe(
    '17/12/95',
  );
});

it('Test toMsg today', async () => {
  expect(
    stringUtils.toMsg(
      new Date('1995-12-17T11:16:00'),
      new Date('1995-12-17T11:16:00'),
    ),
  ).toBe('11:16');
});

it('Test toMsg yesterday', async () => {
  expect(
    stringUtils.toMsg(
      new Date('1995-12-18T11:16:00'),
      new Date('1995-12-17T11:16:00'),
    ),
  ).toBe('17 ' + stringUtils.months[11] + ' 11:16');
});

it('Test toMsg one year', async () => {
  expect(
    stringUtils.toMsg(
      new Date('1995-12-18T11:16:00'),
      new Date('1995-10-15T11:16:00'),
    ),
  ).toBe('15 ' + stringUtils.months[9] + ' 11:16');
});

it('Test toMsg any date', async () => {
  expect(
    stringUtils.toMsg(
      new Date('1995-12-18T11:16:00'),
      new Date('1994-12-18T11:16:00'),
    ),
  ).toBe('18/12/94 11:16');
});

it('Test forChatInfo today one', async () => {
  expect(
    stringUtils.forChatInfo(
      new Date('1995-12-17T11:16:00'),
      new Date('1995-12-17T11:16:00'),
    ),
  ).toBe('11:16');
});

it('Test forChatInfo today two', async () => {
  expect(
    stringUtils.forChatInfo(
      new Date('1995-12-17T11:16:00'),
      new Date('1995-12-17T01:02:03'),
    ),
  ).toBe('01:02');
});

it('Test forChatInfo yesterday', async () => {
  expect(
    stringUtils.forChatInfo(
      new Date('1995-12-18T11:16:00'),
      new Date('1995-12-17T11:16:00'),
    ),
  ).toBe(stringUtils.yesterday);
});

it('Test forChatInfo one year', async () => {
  expect(
    stringUtils.forChatInfo(
      new Date('1995-12-18T11:16:00'),
      new Date('1995-10-15T11:16:00'),
    ),
  ).toBe('15 ' + stringUtils.months[9]);
});

it('Test forChatInfo any date', async () => {
  expect(
    stringUtils.forChatInfo(
      new Date('1995-12-18T11:16:00'),
      new Date('1994-12-18T11:16:00'),
    ),
  ).toBe('18/12/94');
});

it('Test toTitle today', async () => {
  expect(
    stringUtils.toTitle(
      new Date('1995-12-17T11:16:00'),
      new Date('1995-12-17T11:16:00'),
    ),
  ).toBe(stringUtils.today);
});

it('Test toTitle yesterday', async () => {
  expect(
    stringUtils.toTitle(
      new Date('1995-12-18T11:16:00'),
      new Date('1995-12-17T11:16:00'),
    ),
  ).toBe(stringUtils.yesterday);
});

it('Test toTitle one year', async () => {
  expect(
    stringUtils.toTitle(
      new Date('1995-12-18T11:16:00'),
      new Date('1995-10-15T11:16:00'),
    ),
  ).toBe('15 ' + stringUtils.months[9]);
});

it('Test toTitle any date', async () => {
  expect(
    stringUtils.toTitle(
      new Date('1995-12-18T11:16:00'),
      new Date('1994-12-18T11:16:00'),
    ),
  ).toBe('18 '  + stringUtils.months[11] + ' 1994');
});
