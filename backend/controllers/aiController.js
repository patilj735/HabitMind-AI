import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";
import AIInsights from "../models/AIInsights.js";
import {
    chatCompletion,
    SYSTEM_PROMPTS,
} from "../utils/aiService.js";
import {
    lastNDays,
    calcStreak,
    todayKey,
} from "../utils/dateHelpers.js";

const buildWeeklyContext = async (userId) => {
    const habits = await Habit.find({
        userId,
        isArchived: false,
    });

    const days = lastNDays(7);

    const logs = await HabitLog.find({
        userId,
        completedDate: {
            $gte: days[0],
            $lte: days[days.length - 1],
        },
    });

    const perHabit = habits.map((h) => {
        const completed = logs.filter(
            (l) => String(l.habitId) === String(h._id)
        ).length;

        return {
            name: h.name,
            category: h.category,
            frequency: h.frequency,
            completedDays: completed,
            targetDays: h.targetDays,
        };
    });

    return {
        days,
        perHabit,
    };
};

export const weeklyReport = async (req, res) => {
    try {
        const ctx = await buildWeeklyContext(req.user._id);

        if (!ctx.perHabit.length) {
            return res.json({
                content:
                    "You don't have any active habits yet. Create your first habit to start tracking - I'll generate a weekly report once you have some data.",
            });
        }

        const userMsg = `Here is the user's habit data for the past 7 days (${ctx.days[0]} to ${ctx.days[6]}):

${ctx.perHabit
    .map(
        (h) =>
            `- ${h.name} (${h.category}, ${h.frequency}): completed ${h.completedDays} of the past 7 days, target ${h.targetDays}/week`
    )
    .join("\n")}

Please write the personalized weekly report now.`;

        const result = await chatCompletion({
            system: SYSTEM_PROMPTS.weekly,
            user: userMsg,
        });

        let content = result.content;

        if (!result.ok || !content) {
            content =
                "Your weekly report is temporarily unavailable because the AI service could not be reached. Keep tracking your habits and check back again later.";
        }

        await AIInsights.create({
            userId: req.user._id,
            type: "weekly",
            content,
            meta: {
                aiGenerated: Boolean(result.ok),
            },
        });

        return res.json({
            content,
        });
    } catch (err) {
        console.error("Weekly report error:", err);

        return res.status(500).json({
            message: err.message,
        });
    }
};

export const suggestHabits = async (req, res) => {
    try {
        const {
            goals,
            productiveTime,
            struggles,
        } = req.body;

        const userMsg = `User goals: ${goals || "not provided"}
Most productive time: ${productiveTime || "not provided"}
Past struggles: ${struggles || "not provided"}

Suggest 3 personalised habits now. Return JSON only.`;

        const result = await chatCompletion({
            system: SYSTEM_PROMPTS.suggestion,
            user: userMsg,
        });

        let suggestions = [];

        if (result.ok && result.content) {
            try {
                const cleaned = result.content
                    .replace(/```json/gi, "")
                    .replace(/```/g, "")
                    .trim();

                const parsed = JSON.parse(cleaned);

                suggestions = parsed.suggestions || [];
            } catch (parseError) {
                console.log(
                    "Suggestion JSON parse failed:",
                    parseError.message
                );

                suggestions = [];
            }
        }

        // Fallback suggestions
        if (!suggestions.length) {
            suggestions = [
                {
                    name: "10-minute morning walk",
                    description:
                        "Start the day with movement and fresh air.",
                    frequency: "daily",
                    category: "Fitness",
                    icon: "💪",
                    reason:
                        "Low-friction way to build consistency early in the day.",
                },
                {
                    name: "Read 5 pages",
                    description:
                        "Short daily reading to build a learning routine.",
                    frequency: "daily",
                    category: "Learning",
                    icon: "📚",
                    reason:
                        "Compounds into significant knowledge over weeks.",
                },
                {
                    name: "2-minutes of mindful breathing",
                    description:
                        "Pause and breathe to reset focus and improve concentration.",
                    frequency: "daily",
                    category: "Mindfulness",
                    icon: "🧘",
                    reason:
                        "Tiny anchor habit that fits any schedule.",
                },
            ];
        }

        await AIInsights.create({
            userId: req.user._id,
            type: "suggestion",
            content: JSON.stringify(suggestions),
            meta: {
                goals,
                productiveTime,
                struggles,
                aiGenerated: Boolean(result.ok),
            },
        });

        return res.json({
            suggestions,
        });
    } catch (err) {
        console.error("Suggest habits error:", err);

        return res.status(500).json({
            message: err.message,
        });
    }
};


export const recoveryPlan = async (req, res) => {
    try {
        const { habitId } = req.body;

        if (!habitId) {
            return res.status(400).json({
                message: "Habit ID is required",
            });
        }

        const habit = await Habit.findOne({
            _id: habitId,
            userId: req.user._id,
        });

        if (!habit) {
            return res.status(404).json({
                message: "Habit not found",
            });
        }

        const logs = await HabitLog.find({
            userId: req.user._id,
            habitId,
        }).sort({
            completedDate: -1,
        });

        const keys = logs.map((l) => l.completedDate);

        const {
            current,
            longest,
        } = calcStreak(keys);

        const userMsg = `Habit: ${habit.name} (${habit.category}).
Description: ${habit.description || "none"}.
Current streak: ${current} days.
Longest ever: ${longest} days.

The user just broke a streak.

Write a warm, actionable 3-4 step recovery plan that helps the user restart this habit without feeling overwhelmed. Keep it practical and encouraging.`;

        const result = await chatCompletion({
            system: SYSTEM_PROMPTS.recovery,
            user: userMsg,
        });

        let content = result.content;

        // Fallback when Gemini is unavailable
        if (
            !result.ok ||
            !content ||
            content.includes("AI request failed")
        ) {
            content = `### Let's get back on track 💪

Your **${habit.name}** habit previously reached a best streak of **${longest} days**. Missing a day does not erase that progress.

**1. Start small today**  
Complete the easiest realistic version of **${habit.name}** today. Don't try to make up for every missed day at once.

**2. Focus only on today**  
Your goal is simply to complete the habit today. Rebuilding the streak starts with one successful day.

**3. Create a consistent trigger**  
Try doing this habit at the same time each day or immediately after an activity you already do regularly.

**4. Rebuild gradually**  
Aim for your next **3 successful days** first. Once those are complete, continue building from there. Consistency matters more than perfection.`;
        }

        await AIInsights.create({
            userId: req.user._id,
            type: "recovery",
            content,
            meta: {
                habitId,
                aiGenerated: Boolean(result.ok),
            },
        });

        return res.json({
            content,
        });
    } catch (err) {
        console.error("Recovery plan error:", err);

        return res.status(500).json({
            message: err.message,
        });
    }
};


const getWeekdayConsistency = (logs) => {
    const weekdayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    const counts = [
        0, // Sunday
        0, // Monday
        0, // Tuesday
        0, // Wednesday
        0, // Thursday
        0, // Friday
        0, // Saturday
    ];

    for (const log of logs) {
        const date = new Date(`${log.completedDate}T00:00:00`);

        if (!Number.isNaN(date.getTime())) {
            const day = date.getDay();
            counts[day]++;
        }
    }

    const total = counts.reduce((sum, count) => sum + count, 0);

    if (total === 0) {
        return {
            hasData: false,
            counts,
            weekdayNames,
        };
    }

    const max = Math.max(...counts);

    const bestIndexes = counts
        .map((count, index) =>
            count === max ? index : -1
        )
        .filter((index) => index !== -1);

    return {
        hasData: true,
        counts,
        weekdayNames,
        max,
        bestIndexes,
        total,
    };
};

export const chatAnalysis = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({
                message: "Question is required",
            });
        }

        const habits = await Habit.find({
            userId: req.user._id,
            isArchived: false,
        });

        const days = lastNDays(30);

        const logs = await HabitLog.find({
            userId: req.user._id,
            completedDate: {
                $gte: days[0],
                $lte: days[days.length - 1],
            },
        });

        const normalizedQuestion = question
            .toLowerCase()
            .replace(/[?!.]/g, "")
            .trim();

        // ========================================================
        // LOCAL ANSWER: WEEKDAY CONSISTENCY
        // ========================================================

        const isWeekdayQuestion =
            normalizedQuestion.includes("day of the week") ||
            normalizedQuestion.includes("day of week") ||
            normalizedQuestion.includes("weekday") ||
            normalizedQuestion.includes("most consistent day") ||
            normalizedQuestion.includes("consistent day");

        if (isWeekdayQuestion) {
            const weekdayData = getWeekdayConsistency(logs);

            if (!weekdayData.hasData) {
                const content =
                    "I don't have enough completion data from the last 30 days to determine which day of the week you're most consistent on.";

                await AIInsights.create({
                    userId: req.user._id,
                    type: "chat",
                    content,
                    meta: {
                        question,
                        source: "local-analysis",
                    },
                });

                return res.json({
                    content,
                });
            }

            const bestDays = weekdayData.bestIndexes.map(
                (index) => weekdayData.weekdayNames[index]
            );

            let content;

            if (bestDays.length === 1) {
                const bestDay = bestDays[0];

                content = `You are most consistent on **${bestDay}**, with **${weekdayData.max} habit completion${weekdayData.max === 1 ? "" : "s"}** in the last 30 days.

Your weekday breakdown is:
- Sunday: ${weekdayData.counts[0]}
- Monday: ${weekdayData.counts[1]}
- Tuesday: ${weekdayData.counts[2]}
- Wednesday: ${weekdayData.counts[3]}
- Thursday: ${weekdayData.counts[4]}
- Friday: ${weekdayData.counts[5]}
- Saturday: ${weekdayData.counts[6]}

This is based on your recorded habit completions, so the result reflects your actual tracking data.`;
            } else {
                content = `You are equally most consistent on **${bestDays.join(
                    " and "
                )}**, with **${weekdayData.max} habit completion${
                    weekdayData.max === 1 ? "" : "s"
                }** on each in the last 30 days.

Your weekday breakdown is:
- Sunday: ${weekdayData.counts[0]}
- Monday: ${weekdayData.counts[1]}
- Tuesday: ${weekdayData.counts[2]}
- Wednesday: ${weekdayData.counts[3]}
- Thursday: ${weekdayData.counts[4]}
- Friday: ${weekdayData.counts[5]}
- Saturday: ${weekdayData.counts[6]}

This is based on your recorded habit completions.`;
            }

            await AIInsights.create({
                userId: req.user._id,
                type: "chat",
                content,
                meta: {
                    question,
                    source: "local-analysis",
                    weekdayCounts: weekdayData.counts,
                },
            });

            return res.json({
                content,
            });
        }

        // ========================================================
        // BUILD HABIT CONTEXT FOR GEMINI
        // ========================================================

        const context = habits
            .map((h) => {
                const hLogs = logs.filter(
                    (l) => String(l.habitId) === String(h._id)
                );

                const byDow = [
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                ];

                for (const l of hLogs) {
                    const date = new Date(
                        `${l.completedDate}T00:00:00`
                    );

                    if (!Number.isNaN(date.getTime())) {
                        const dow = date.getDay();

                        if (dow >= 0 && dow <= 6) {
                            byDow[dow]++;
                        }
                    }
                }

                return `${h.name} (${h.category}): ${
                    hLogs.length
                }/30 in last 30 days, by weekday [Sun, Mon, Tue, Wed, Thurs, Fri, Sat] (${byDow.join(
                    ", "
                )})`;
            })
            .join("\n");

        const userMsg = `User question: "${question}"

User data (last 30 days):

${context || "No habit completion data available."}

Important:
The weekday numbers are ordered as:
Sun, Mon, Tue, Wed, Thurs, Fri, Sat.

Answer the user's question using ONLY the provided habit data.
Do not invent data.
Use actual habit names and numbers when relevant.

Answer now.`;

        const result = await chatCompletion({
            system: SYSTEM_PROMPTS.chat,
            user: userMsg,
        });

        let content = result.content;

        if (!result.ok || !content) {
            content =
                "AI is temporarily unavailable. Please try again later. Your habit data is still being tracked normally.";
        }

        await AIInsights.create({
            userId: req.user._id,
            type: "chat",
            content,
            meta: {
                question,
                source: result.ok
                    ? "gemini"
                    : "fallback",
            },
        });

        return res.json({
            content,
        });
    } catch (err) {
        console.error("Chat analysis error:", err);

        return res.status(500).json({
            message: err.message,
        });
    }
};


// ============================================================
// MORNING MOTIVATION
// ============================================================

export const morningMotivation = async (req, res) => {
    try {
        const habits = await Habit.find({
            userId: req.user._id,
            isArchived: false,
        });

        if (!habits.length) {
            return res.json({
                content:
                    "Good morning! Add your first habit today and let's get the momentum started.",
            });
        }

        const days = lastNDays(30);

        const logs = await HabitLog.find({
            userId: req.user._id,
            completedDate: {
                $gte: days[0],
                $lte: days[days.length - 1],
            },
        });

        const ctx = habits
            .map((h) => {
                const hLogs = logs
                    .filter(
                        (l) =>
                            String(l.habitId) === String(h._id)
                    )
                    .map((l) => l.completedDate)
                    .sort()
                    .reverse();

                const { current } = calcStreak(hLogs);

                return `${h.name}: current streak ${current}`;
            })
            .join("\n");

        const today = todayKey();

        const todayLogs = logs.filter(
            (l) => l.completedDate === today
        );

        const done = todayLogs.length;
        const total = habits.length;

        const userMsg = `Today's habits and streaks:
${ctx}

Done today: ${done}/${total}.

Write the morning message.`;

        const result = await chatCompletion({
            system: SYSTEM_PROMPTS.morning,
            user: userMsg,
            temperature: 0.0,
        });

        let content = result.content;

        if (!result.ok || !content) {
            content = `Good morning! 🌅

You have completed ${done} of ${total} habits today.

Focus on one habit at a time and keep building your consistency. You've got this! 💪`;
        }

        await AIInsights.create({
            userId: req.user._id,
            type: "morning",
            content,
            meta: {
                aiGenerated: Boolean(result.ok),
            },
        });

        return res.json({
            content,
        });
    } catch (err) {
        console.error("Morning motivation error:", err);

        return res.status(500).json({
            message: err.message,
        });
    }
};