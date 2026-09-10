/**
 * Skill Gap Engine & Career Readiness Calculator Service
 *
 * Provides pure, deterministic business logic to analyze student performance against
 * target career requirements without relying on external AI services.
 */

/**
 * Classifies a skill gap into predefined proficiency status tiers.
 *
 * Gap Tiers:
 * 0–10:  Strong
 * 11–25: Moderate
 * 26–40: Needs Improvement
 * 41+:   Critical Gap
 *
 * @param {number} gap
 * @returns {string} Classification tier
 */
export const classifySkillGap = (gap) => {
  if (gap <= 10) return 'Strong';
  if (gap <= 25) return 'Moderate';
  if (gap <= 40) return 'Needs Improvement';
  return 'Critical Gap';
};

/**
 * Computes Skill Gaps & Career Readiness Score.
 *
 * FORMULAS:
 * 1. Skill Gap = Math.max(0, requiredSkillLevel - studentSkillLevel)
 * 2. Career Readiness Score = Math.min(100, Math.max(0, (Sum of Student Skill Levels / Sum of Required Skill Levels) * 100))
 *
 * Distinction:
 * - Assessment Score: Percentage of assessment questions answered correctly.
 * - Career Readiness Score: How closely demonstrated skill scores match target career benchmarks.
 *
 * Fallback Behavior:
 * - Unassessed required skills default to studentSkillLevel = 0 (untested domain skills require full training).
 *
 * @param {Object} career - Career document with requiredSkills array
 * @param {Object} latestAssessmentResult - Student's completed AssessmentResult document
 * @returns {Object} Skill gap analysis payload
 */
export const calculateSkillGapAndReadiness = (career, latestAssessmentResult) => {
  if (!career || !career.requiredSkills || career.requiredSkills.length === 0) {
    throw new Error('Invalid career document or no required skills defined.');
  }

  // Create lookup map for student's demonstrated skill scores
  const studentScoresMap = {};
  if (latestAssessmentResult && Array.isArray(latestAssessmentResult.skillScores)) {
    latestAssessmentResult.skillScores.forEach((item) => {
      const nameKey = (item.skillName || '').toLowerCase().trim();
      studentScoresMap[nameKey] = item.score;
    });
  }

  let totalStudentScore = 0;
  let totalRequiredLevel = 0;

  const summary = {
    totalSkills: career.requiredSkills.length,
    strong: 0,
    moderate: 0,
    needsImprovement: 0,
    critical: 0,
  };

  const skillAnalysis = career.requiredSkills.map((reqItem) => {
    const skillObj = reqItem.skill || {};
    const skillName = skillObj.name || reqItem.name || 'Skill';
    const category = skillObj.category || 'Core';
    const requiredLevel = Number(reqItem.targetLevel) || 80;

    // Fallback: If skill was not assessed, default score to 0
    const nameKey = skillName.toLowerCase().trim();
    const studentScore = studentScoresMap[nameKey] !== undefined ? studentScoresMap[nameKey] : 0;

    // Gap calculation (clamped to min 0)
    const rawGap = requiredLevel - studentScore;
    const gap = Math.max(0, rawGap);

    const status = classifySkillGap(gap);

    // Increment summary counters
    if (status === 'Strong') summary.strong++;
    else if (status === 'Moderate') summary.moderate++;
    else if (status === 'Needs Improvement') summary.needsImprovement++;
    else if (status === 'Critical Gap') summary.critical++;

    totalStudentScore += studentScore;
    totalRequiredLevel += requiredLevel;

    return {
      skill: skillName,
      category,
      studentScore,
      requiredLevel,
      gap,
      status,
    };
  });

  // Calculate Career Readiness Score (clamped 0 - 100, rounded to 1 decimal place)
  const rawReadiness = totalRequiredLevel > 0 ? (totalStudentScore / totalRequiredLevel) * 100 : 0;
  const readinessScore = Math.min(100, Math.max(0, Math.round(rawReadiness * 10) / 10));

  // Determine Strongest and Weakest Skills (sorted deterministically)
  const sortedByScore = [...skillAnalysis].sort((a, b) => {
    if (b.studentScore !== a.studentScore) return b.studentScore - a.studentScore;
    return a.skill.localeCompare(b.skill); // Tie-breaker by alphabetical name
  });

  const strongestSkills = sortedByScore.slice(0, 3).map((s) => s.skill);
  const weakestSkills = [...sortedByScore].reverse().slice(0, 3).map((s) => s.skill);

  return {
    career: {
      id: career._id || career.id,
      name: career.name,
      description: career.description,
    },
    readinessScore,
    assessmentScore: latestAssessmentResult ? latestAssessmentResult.overallScore : 0,
    skillAnalysis,
    summary,
    strongestSkills,
    weakestSkills,
    calculatedAt: new Date().toISOString(),
  };
};
