import dateUtil from 'utils/date'


it('Test date today', async () => {
    const date = new Date(2020, 11, 12)
    const value = dateUtil.toTitle(date, date)
    expect(value).toBe("Today")
});

it('Test date yesterday', async () => {
    const now = new Date(2020, 11, 12)
    const date = new Date(2020, 11, 11)
    const value = dateUtil.toTitle(now, date)
    expect(value).toBe("Yesterday")
});

it('Test date now year', async () => {
    const now = new Date(2020, 11, 12)
    const date = new Date(2020, 10, 11)
    const value = dateUtil.toTitle(now, date)
    expect(value).toBe("11 November")
});

it('Test date any', async () => {
    const now = new Date(2020, 11, 12)
    const date = new Date(2019, 0, 11)
    const value = dateUtil.toTitle(now, date)
    expect(value).toBe("11 January 2019")
});

it('Test get months', async () => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    for(let i = 0; i < 12; i++) {
        expect(dateUtil.getMonths(i)).toBe(months[i])
    }
});
