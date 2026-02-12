export const QUESTIONS = [
    {
      id: "subjects",
      title: "Which subjects do you enjoy most?",
      subtitle: "Pick up to 3 — this helps us match you with suitable departments.",
      type: "multi",
      max: 3,
      options: ["Math", "Biology", "Technology", "Economics", "Chemistry", "Physics", "Geography"]
    },
    {
      id: "skillLevel",
      title: "What is your current skill level for your favorite subjects?",
      subtitle: "Just choose the closest match.",
      type: "single",
      options: ["Beginner", "Intermediate", "Advanced"]
    },
    {
      id: "careerInterest",
      title: "Which career direction sounds most exciting?",
      subtitle: "We’ll prioritize departments that naturally connect to this path.",
      type: "single",
      options: ["Tech", "Health", "Research", "Business", "Teaching"]
    },
    {
      id: "studyStyle",
      title: "How do you prefer to study?",
      subtitle: "Different departments reward different learning styles.",
      type: "single",
      options: ["Practical", "Theoretical"]
    },
    {
      id: "mathComfort",
      title: "How comfortable are you with mathematics?",
      subtitle: "Be honest — this helps a lot.",
      type: "single",
      options: ["Low", "Medium", "High"]
    },
    {
      id: "gpaRange",
      title: "Optional: What is your GPA range?",
      subtitle: "This won’t block any results — it just refines confidence.",
      type: "single",
      optional: true,
      options: ["< 2.0", "2.0 – 2.5", "2.6 – 3.0", "3.1 – 3.5", "3.6 – 4.0", "Prefer not to say"]
    }
  ];