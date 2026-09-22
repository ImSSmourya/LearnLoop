import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));


// ============================================
// BASIC BACKEND TEST
// ============================================

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "LearnLoop backend is working!"
    });
});


// ============================================
// LOCAL STUDY PLAN GENERATOR
// ============================================

function generateLocalPlan({
    examName,
    examDate,
    subjects,
    studyHours,
    weakTopics
}) {

    const minutesPerDay =
        Math.round(Number(studyHours) * 60);

    const safeSubjects =
        subjects.map(subject => subject.trim());

    const weakList =
        (weakTopics || "")
            .split(",")
            .map(topic => topic.trim().toLowerCase())
            .filter(Boolean);


    const sessionLength = 30;

    const normalSessionCount =
        Math.max(
            1,
            Math.floor(
                minutesPerDay / sessionLength
            )
        );


    const days = [];


    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {

        const sessions = [];

        const lighterDay =
            dayIndex === 6;


        let availableMinutes =
            lighterDay
                ? Math.max(
                    30,
                    Math.floor(
                        minutesPerDay * 0.65
                    )
                )
                : minutesPerDay;


        let subjectIndex =
            dayIndex % safeSubjects.length;


        while (
            availableMinutes >= 20 &&
            sessions.length <
                normalSessionCount
        ) {

            const subject =
                safeSubjects[
                    subjectIndex %
                    safeSubjects.length
                ];


            const isWeakSubject =
                weakList.some(topic =>
                    topic.includes(
                        subject.toLowerCase()
                    )
                );


            let topic;

            if (isWeakSubject) {

                topic =
                    weakList.find(topic =>
                        topic.includes(
                            subject.toLowerCase()
                        )
                    ) || "Weak Topic Revision";

            } else {

                const topicTypes = [
                    "Core Concepts",
                    "Practice Problems",
                    "Concept Revision",
                    "Application Practice"
                ];

                topic =
                    topicTypes[
                        (dayIndex + sessions.length) %
                        topicTypes.length
                    ];
            }


            let type;

            if (lighterDay) {

                type = "Revision";

            } else if (sessions.length === 0) {

                type = "Learning";

            } else {

                type =
                    sessions.length % 2 === 0
                        ? "Practice"
                        : "Revision";
            }


            const priority =
                isWeakSubject
                    ? "High"
                    : sessions.length === 0
                        ? "Medium"
                        : "Low";


            const duration =
                Math.min(
                    sessionLength,
                    availableMinutes
                );


            sessions.push({

                subject: subject,

                topic: topic,

                duration: duration,

                type: type,

                priority: priority

            });


            availableMinutes -= duration;

            subjectIndex++;

        }


        const totalMinutes =
            sessions.reduce(
                (total, session) =>
                    total + session.duration,
                0
            );


        const focus =
            lighterDay
                ? "Weekly revision and catch-up"
                : sessions[0]?.subject ||
                  "General Revision";


        days.push({

            day: `Day ${dayIndex + 1}`,

            focus: focus,

            totalMinutes: totalMinutes,

            sessions: sessions

        });

    }


    return {

        summary:
            `A 7-day study plan for ${examName}.`,

        strategy:
            "The plan prioritizes weak areas, balances learning with practice and revision, and stays within the student's daily time limit.",

        examDate: examDate,

        days: days

    };

}


// ============================================
// GENERATE PLAN API
// ============================================

app.post("/api/generate-plan", (req, res) => {

    try {

        const {
            examName,
            examDate,
            subjects,
            studyHours,
            weakTopics
        } = req.body;


        // -----------------------------
        // Validate
        // -----------------------------

        if (!examName) {

            return res.status(400).json({

                success: false,

                error:
                    "Please enter your exam name."

            });

        }


        if (!examDate) {

            return res.status(400).json({

                success: false,

                error:
                    "Please select your exam date."

            });

        }


        if (
            !Array.isArray(subjects) ||
            subjects.length === 0
        ) {

            return res.status(400).json({

                success: false,

                error:
                    "Please add at least one subject."

            });

        }


        if (
            !studyHours ||
            Number(studyHours) <= 0
        ) {

            return res.status(400).json({

                success: false,

                error:
                    "Please enter valid study hours."

            });

        }


        // -----------------------------
        // Generate plan
        // -----------------------------

        console.log("");
        console.log("================================");
        console.log("📚 GENERATING LOCAL STUDY PLAN");
        console.log("================================");
        console.log("");


        const plan =
            generateLocalPlan({

                examName,
                examDate,
                subjects,
                studyHours,
                weakTopics

            });


        console.log(
            `✅ Created ${plan.days.length}-day plan.`
        );


        // -----------------------------
        // Send to browser
        // -----------------------------

        res.json({

            success: true,

            plan: plan,

            source: "local-planner"

        });


    } catch (error) {

        console.error(
            "❌ PLAN GENERATION ERROR"
        );

        console.error(error);


        res.status(500).json({

            success: false,

            error:
                "Could not generate your study plan."

        });

    }

});


// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {

    console.log("");
    console.log("================================");
    console.log("🚀 LEARNLOOP BACKEND STARTED");
    console.log("================================");
    console.log("");
    console.log(
        `🌐 http://localhost:${PORT}`
    );
    console.log("");

});