import {
    format,
    subDays,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
} from "date-fns";


export const toDateKey = (date) =>
    format(date, "yyyy-MM-dd");


export const todayKey = () =>
    toDateKey(new Date());


export const last90Days = () => {
    const end = new Date();
    const start = subDays(end, 89);

    return eachDayOfInterval({
        start,
        end,
    }).map(toDateKey);
};


export const currentWeekKeys = () => {
    const now = new Date();

    const start = startOfWeek(now, {
        weekStartsOn: 1,
    });

    const end = endOfWeek(now, {
        weekStartsOn: 1,
    });

    return eachDayOfInterval({
        start,
        end,
    }).map(toDateKey);
};


export const lastNDays = (n) => {
    const end = new Date();
    const start = subDays(end, n - 1);

    return eachDayOfInterval({
        start,
        end,
    }).map(toDateKey);
};


export const calcStreak = (dateKeys) => {
    if (!dateKeys || dateKeys.length === 0) {
        return {
            current: 0,
            longest: 0,
        };
    }

    const sortedDates = [...new Set(dateKeys)].sort();

    const parseDateKey = (key) => {
        const [year, month, day] = key.split("-").map(Number);

        return new Date(
            year,
            month - 1,
            day
        );
    };

    const daysBetween = (date1, date2) => {
        const d1 = parseDateKey(date1);
        const d2 = parseDateKey(date2);

        return Math.round(
            (d2 - d1) /
            (1000 * 60 * 60 * 24)
        );
    };

    let longest = 1;
    let run = 1;

    for (let i = 1; i < sortedDates.length; i++) {

        const diff = daysBetween(
            sortedDates[i - 1],
            sortedDates[i]
        );

        if (diff === 1) {
            run++;
        } else {
            run = 1;
        }

        longest = Math.max(
            longest,
            run
        );
    }

    const today = todayKey();

    const yesterday = toDateKey(
        subDays(new Date(), 1)
    );

    const dateSet = new Set(sortedDates);

    let current = 0;

    if (dateSet.has(today)) {

        let cursor = today;

        while (dateSet.has(cursor)) {

            current++;

            cursor = toDateKey(
                subDays(
                    parseDateKey(cursor),
                    1
                )
            );
        }

    }

    else if (dateSet.has(yesterday)) {

        let cursor = yesterday;

        while (dateSet.has(cursor)) {

            current++;

            cursor = toDateKey(
                subDays(
                    parseDateKey(cursor),
                    1
                )
            );
        }
    }


    return {
        current,
        longest,
    };
};