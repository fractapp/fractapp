/**
 * @namespace
   * @category Utils
*/
namespace Date {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    /**
     * get month name by day number 
     */
    export function getMonths(day: number): string {
        return months[day]
    }

    /**
     * convert date to string 
     */
    export function toTitle(now: Date, date: Date): string {
        let dateValue = ""
        if (now.getFullYear() == date.getFullYear() &&
            now.getMonth() == date.getMonth() &&
            now.getDay() == date.getDay()) {
            dateValue = "Today"
        } else if (now.getFullYear() == date.getFullYear() &&
            now.getMonth() == date.getMonth() &&
            (now.getDay() - 1) == date.getDay()) {
            dateValue = "Yesterday"
        }
        else if (now.getFullYear() == date.getFullYear()) {
            dateValue = date.getDate() + " " + months[date.getMonth()]
        } else {
            dateValue = date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear()
        }

        return dateValue
    }

    /*
    export function dateReviver(key: string, value: any): Date {
        var datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
        if ({}.toString.call(value) === "[object String]" && datePattern.test(value)) {
            return (new Date(value));
        }
    
        return (value);
    }*/
}

export default Date