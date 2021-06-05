import stringUtils from 'utils/string';

/*it('Test getMonths', async () => {
  expect(stringUtils.getMonths(0)).toBe('January');
  expect(stringUtils.getMonths(1)).toBe('February');
  expect(stringUtils.getMonths(2)).toBe('March');
  expect(stringUtils.getMonths(3)).toBe('April');
  expect(stringUtils.getMonths(4)).toBe('May');
  expect(stringUtils.getMonths(5)).toBe('June');
  expect(stringUtils.getMonths(6)).toBe('July');
  expect(stringUtils.getMonths(7)).toBe('August');
  expect(stringUtils.getMonths(8)).toBe('September');
  expect(stringUtils.getMonths(9)).toBe('October');
  expect(stringUtils.getMonths(10)).toBe('November');
  expect(stringUtils.getMonths(11)).toBe('December');
});
*/
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
      new Date('1995-12-17T11:16:00'),
      new Date('1995-12-18T11:16:00'),
    ),
  ).toBe('17 December 11:16');
});

it('Test toMsg one year', async () => {
  expect(
    stringUtils.toMsg(
      new Date('1995-12-18T11:16:00'),
      new Date('1995-10-15T11:16:00'),
    ),
  ).toBe('15 October 11:16');
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
  ).toBe('Yesterday');
});

it('Test forChatInfo one year', async () => {
  expect(
    stringUtils.forChatInfo(
      new Date('1995-12-18T11:16:00'),
      new Date('1995-10-15T11:16:00'),
    ),
  ).toBe('15 October');
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
  ).toBe('Today');
});

it('Test toTitle yesterday', async () => {
  expect(
    stringUtils.toTitle(
      new Date('1995-12-18T11:16:00'),
      new Date('1995-12-17T11:16:00'),
    ),
  ).toBe('Yesterday');
});

it('Test toTitle one year', async () => {
  expect(
    stringUtils.toTitle(
      new Date('1995-12-18T11:16:00'),
      new Date('1995-10-15T11:16:00'),
    ),
  ).toBe('15 October');
});

it('Test toTitle any date', async () => {
  expect(
    stringUtils.toTitle(
      new Date('1995-12-18T11:16:00'),
      new Date('1994-12-18T11:16:00'),
    ),
  ).toBe('18 December 1994');
});
