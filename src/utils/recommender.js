const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const mathScore = (user, dept) => {
  const map = { Low: 0, Medium: 0.6, High: 1 };
  const userVal = map[user] ?? 0.5;
  const deptNeed = { Low: 0.2, Medium: 0.6, High: 1 }[dept] ?? 0.6;
  const diff = Math.abs(userVal - deptNeed);
  return clamp(1 - diff, 0, 1);
};

const skillBoost = (level) => {
  if (level === "Advanced") return 1;
  if (level === "Intermediate") return 0.7;
  return 0.45;
};

const gpaBoost = (gpaRange) => {
  if (!gpaRange || gpaRange === "Prefer not to say") return 0;
  if (gpaRange === "3.6 – 4.0") return 0.12;
  if (gpaRange === "3.1 – 3.5") return 0.08;
  if (gpaRange === "2.6 – 3.0") return 0.04;
  if (gpaRange === "2.0 – 2.5") return 0.02;
  return 0;
};

function overlapCount(a = [], b = []) {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x)).length;
}

function pickTopBullets({ subjects, careerInterest, studyStyle, mathComfort }, dept) {
  const bullets = [];

  const subjectOverlap = overlapCount(subjects, dept.preferredSubjects);
  if (subjectOverlap > 0) {
    bullets.push(`You like ${subjects.filter((s) => dept.preferredSubjects.includes(s)).join(", ")}, which aligns well with ${dept.name}.`);
  }

  if (dept.careerPaths.includes(careerInterest)) {
    bullets.push(`${dept.name} commonly leads to ${careerInterest}-focused careers, matching your interest.`);
  } else {
    bullets.push(`Even though you chose ${careerInterest}, ${dept.name} can still connect to it through flexible roles.`);
  }

  if (studyStyle === "Practical") {
    bullets.push(`Your practical study style fits well with hands-on learning parts of ${dept.name}.`);
  } else {
    bullets.push(`Your theoretical study style matches the concept-focused learning in ${dept.name}.`);
  }

  if (dept.mathIntensity === "High" && mathComfort === "High") {
    bullets.push("You’re comfortable with math, which is a big advantage for math-intensive departments.");
  } else if (dept.mathIntensity === "High" && mathComfort !== "High") {
    bullets.push("This department is math-intensive — you may need extra practice, but it’s still possible with consistency.");
  } else if (dept.mathIntensity === "Low" && mathComfort === "Low") {
    bullets.push("Lower math intensity matches your comfort level, so you can focus more on the core topics.");
  }

  return bullets.slice(0, 3);
}

export function recommendDepartments(answers, departments) {
  const subjects = answers.subjects ?? [];
  const skillLevel = answers.skillLevel ?? "Beginner";
  const careerInterest = answers.careerInterest ?? "Research";
  const studyStyle = answers.studyStyle ?? "Practical";
  const mathComfort = answers.mathComfort ?? "Medium";
  const gpaRange = answers.gpaRange;

  const sBoost = skillBoost(skillLevel);
  const gBoost = gpaBoost(gpaRange);

  const scored = departments.map((dept) => {
    const subjectMatch = clamp(overlapCount(subjects, dept.preferredSubjects) / Math.max(1, Math.min(3, subjects.length)), 0, 1);
    const careerMatch = dept.careerPaths.includes(careerInterest) ? 1 : 0.55;
    const mathMatch = mathScore(mathComfort, dept.mathIntensity);
    const styleMatch = studyStyle === "Practical" ? 0.85 : 0.85;

    const base =
      subjectMatch * 0.45 +
      careerMatch * 0.25 +
      mathMatch * 0.2 +
      styleMatch * 0.1;

    const boosted = clamp(base * (0.85 + 0.15 * sBoost) + gBoost, 0, 1);
    const percent = Math.round(boosted * 100);

    const bullets = pickTopBullets({ subjects, careerInterest, studyStyle, mathComfort }, dept);
    const explanation = `Based on your answers, ${dept.name} looks like a strong fit. ${bullets.join(" ")}`;

    return {
      ...dept,
      score: boosted,
      percent,
      explanation
    };
  });

  scored.sort((a, b) => b.score - a.score);

  const top = scored.slice(0, 3);
  return { top, all: scored };
}