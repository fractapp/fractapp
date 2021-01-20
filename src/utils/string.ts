/**
 * @namespace
 * @category Utils
 */
namespace StringUtils {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  /**
   * get month name by day number
   */
  export function getMonths(day: number): string {
    return months[day];
  }

  /**
   * convert date to string
   */
  export function toTitle(now: Date, date: Date): string {
    let dateValue = '';
    if (
      now.getFullYear() == date.getFullYear() &&
      now.getMonth() == date.getMonth() &&
      now.getDay() == date.getDay()
    ) {
      dateValue = 'Today';
    } else if (
      now.getFullYear() == date.getFullYear() &&
      now.getMonth() == date.getMonth() &&
      now.getDay() - 1 == date.getDay()
    ) {
      dateValue = 'Yesterday';
    } else if (now.getFullYear() == date.getFullYear()) {
      dateValue = date.getDate() + ' ' + months[date.getMonth()];
    } else {
      dateValue =
        date.getDate() +
        ' ' +
        months[date.getMonth()] +
        ' ' +
        date.getFullYear();
    }

    return dateValue;
  }

  /**
   * convert date to string
   */
  export function forChatInfo(now: Date, date: Date): string {
    let dateValue = '';
    if (
      now.getFullYear() == date.getFullYear() &&
      now.getMonth() == date.getMonth() &&
      now.getDay() == date.getDay()
    ) {
      let hours = String(date.getHours());
      let minutes = String(date.getMinutes());
      if (hours.length == 1) {
        hours = '0' + hours;
      }
      if (minutes.length == 1) {
        minutes = '0' + minutes;
      }

      dateValue = hours + ':' + minutes;
    } else if (
      now.getFullYear() == date.getFullYear() &&
      now.getMonth() == date.getMonth() &&
      now.getDay() - 1 == date.getDay()
    ) {
      dateValue = 'Yesterday';
    } else if (now.getFullYear() == date.getFullYear()) {
      dateValue = date.getDate() + ' ' + months[date.getMonth()];
    } else {
      dateValue = toFullDate(date);
    }

    return dateValue;
  }

  /**
   * convert date to string
   */
  export function toMsg(now: Date, date: Date): string {
    let dateValue = '';
    let time = '';

    let hours = String(date.getHours());
    let minutes = String(date.getMinutes());
    if (hours.length == 1) {
      hours = '0' + hours;
    }
    if (minutes.length == 1) {
      minutes = '0' + minutes;
    }
    time = hours + ':' + minutes;

    if (
      now.getFullYear() == date.getFullYear() &&
      now.getMonth() == date.getMonth() &&
      now.getDay() == date.getDay()
    ) {
      dateValue = time;
    } else if (
      now.getFullYear() == date.getFullYear() &&
      now.getMonth() == date.getMonth() &&
      now.getDay() - 1 == date.getDay()
    ) {
      dateValue = date.getDate() + ' ' + months[date.getMonth()] + ' ' + time;
    } else if (now.getFullYear() == date.getFullYear()) {
      dateValue = date.getDate() + ' ' + months[date.getMonth()] + ' ' + time;
    } else {
      dateValue = toFullDate(date) + ' ' + time;
    }

    return dateValue;
  }

  export function toFullDate(date: Date): string {
    let day = String(date.getDate());
    if (day.length == 1) {
      day = '0' + day;
    }
    let month = String(date.getMonth() + 1);
    if (month.length == 1) {
      month = '0' + month;
    }
    const year = String(date.getFullYear());

    return day + '/' + month + '/' + year[2] + year[3];
  }

  export function formatNameOrAddress(value: string): string {
    return value.length <= 32
      ? `${value}`
      : `${value.substring(0, 11)}...${value.substring(
          value.length - 11,
          value.length,
        )}`;
  }
}

export default StringUtils;
