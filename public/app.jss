// =====================================
// LearnLoop Frontend Logic
// =====================================

let subjects = [];


// -------------------------------------
// Start Planning
// -------------------------------------

function startPlanning() {
    window.location.href = "planner.html";
}


// -------------------------------------
// Add Subject
// -------------------------------------

function addSubject() {

    const input = document.getElementById("subjectInput");

    if (!input) {
        return;
    }

    const subject = input.value.trim();

    if (subject === "") {
        return;
    }

    // Prevent duplicates
    if (subjects.includes(subject)) {
        input.value = "";
        return;
    }

    subjects.push(subject);

    input.value = "";

    renderSubjects();
}


// -------------------------------------
// Display Subjects
// -------------------------------------

function renderSubjects() {

    const subjectList = document.getElementById("subjectList");

    if (!subjectList) {
        return;
    }

    subjectList.innerHTML = "";

    subjects.forEach((subject, index) => {

        const tag = document.createElement("div");

        tag.className = "subject-tag";

        tag.innerHTML = `
            ${escapeHTML(subject)}

            <button
                type="button"
                class="remove-subject"
                onclick="removeSubject(${index})">
                ×
            </button>
        `;

        subjectList.appendChild(tag);
    });
}


// -------------------------------------
// Remove Subject
// -------------------------------------

function removeSubject(index) {

    subjects.splice(index, 1);

    renderSubjects();
}


// -------------------------------------
// Study Hours
// -------------------------------------

function updateHours() {

    const slider = document.getElementById("studyHours");
    const display = document.getElementById("hoursDisplay");

    if (!slider || !display) {
        return;
    }

    const hours = Number(slider.value);

    display.textContent =
        hours === 1
            ? "1 hour"
            : `${hours} hours`;
}


// -------------------------------------
// Form Submit
// -------------------------------------

const studyForm = document.getElementById("studyForm");

if (studyForm) {

    studyForm.addEventListener("submit", function (event) {

        event.preventDefault();

        if (subjects.length === 0) {

            alert("Please add at least one subject.");

            return;
        }

        const examName =
            document.getElementById("examName").value.trim();

        const examDate =
            document.getElementById("examDate").value;

        const studyHours =
            document.getElementById("studyHours").value;

        const weakTopics =
            document.getElementById("weakTopics").value.trim();


        const studyData = {

            examName: examName,

            examDate: examDate,

            subjects: subjects,

            studyHours: Number(studyHours),

            weakTopics: weakTopics,

            createdAt: new Date().toISOString()
        };


        // Temporary local storage.
        // Firebase will replace this later.

        localStorage.setItem(
            "learnLoopStudyData",
            JSON.stringify(studyData)
        );


        // Move to dashboard for now.

        window.location.href = "dashboard.html";

    });
}


// -------------------------------------
// Basic HTML escaping
// -------------------------------------

function escapeHTML(value) {

    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// =====================================
// DASHBOARD LOGIC
// =====================================


// -------------------------------------
// Load Student Data
// -------------------------------------

function loadDashboardData() {

    const savedData =
        localStorage.getItem("learnLoopStudyData");

    if (!savedData) {
        return;
    }

    try {

        const data = JSON.parse(savedData);

        // Exam countdown

        if (data.examDate) {

            const today = new Date();

            today.setHours(0, 0, 0, 0);

            const examDate = new Date(data.examDate);

            examDate.setHours(0, 0, 0, 0);

            const difference =
                examDate.getTime() - today.getTime();

            const days =
                Math.ceil(
                    difference /
                    (1000 * 60 * 60 * 24)
                );

            const examDays =
                document.getElementById("examDays");

            if (examDays) {

                examDays.textContent =
                    days >= 0
                        ? days
                        : "0";
            }

        }


        // Current date

        const currentDate =
            document.getElementById("currentDate");

        if (currentDate) {

            currentDate.textContent =
                new Date().toLocaleDateString(
                    "en-IN",
                    {
                        weekday: "long",
                        month: "long",
                        day: "numeric"
                    }
                );
        }


        // Exam name

        const welcomeDescription =
            document.getElementById(
                "welcomeDescription"
            );

        if (
            welcomeDescription &&
            data.examName
        ) {

            welcomeDescription.textContent =
                `Preparing for ${data.examName}? Here's what matters most today.`;
        }

    } catch (error) {

        console.error(
            "Could not load dashboard data:",
            error
        );

    }
}


// -------------------------------------
// Start Study Session
// -------------------------------------

function startStudySession() {

    showToast(
        "Study session started. Good luck! 🎯"
    );

    setTimeout(() => {

        window.location.href = "quiz.html";

    }, 1200);
}


// -------------------------------------
// Simulate Missed Session
// -------------------------------------

function simulateMissedSession() {

    const taskList =
        document.getElementById("studyTasks");

    if (!taskList) {
        return;
    }


    /*
        This is a temporary simulation.

        Later, this will be connected
        to our real adaptive engine.
    */

    taskList.innerHTML = `

        <div class="study-task completed">

            <div class="task-check">
                ✓
            </div>

            <div class="study-task-info">

                <strong>
                    Mathematics
                </strong>

                <span>
                    Integration • 45 min
                </span>

            </div>

            <span class="task-label completed-label">
                Completed
            </span>

        </div>


        <div class="study-task current">

            <div class="task-check">
                →
            </div>

            <div class="study-task-info">

                <strong>
                    Physics
                </strong>

                <span>
                    Electrostatics • 50 min
                </span>

            </div>

            <span class="task-label current-label">
                Rescheduled
            </span>

        </div>


        <div class="study-task">

            <div class="task-check">
                ○
            </div>

            <div class="study-task-info">

                <strong>
                    Chemistry
                </strong>

                <span>
                    Organic Revision • moved to tomorrow
                </span>

            </div>

            <span class="task-label">
                Adjusted
            </span>

        </div>

    `;


    const nextAction =
        document.getElementById(
            "nextActionText"
        );

    if (nextAction) {

        nextAction.textContent =
            "Focus on Electrostatics for 50 minutes. Your plan has been adjusted.";

    }


    showToast(
        "✓ Plan adapted successfully"
    );
}


// -------------------------------------
// Toast Notification
// -------------------------------------

function showToast(message) {

    const toast =
        document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);
}


// -------------------------------------
// Automatically load dashboard
// -------------------------------------

if (
    document.body.classList.contains(
        "dashboard-page"
    )
) {

    loadDashboardData();

}