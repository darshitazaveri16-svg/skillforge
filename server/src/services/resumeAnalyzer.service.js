import mongoose from 'mongoose';
import Skill from '../models/Skill.js';
import { inMemoryStore } from '../config/seedData.js';

/**
 * Escapes special regex characters in skill names.
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks whether a specific skill name appears in the extracted text case-insensitively,
 * respecting alphanumeric word boundaries so that e.g. "React" doesn't match "Reaction",
 * while correctly handling symbols like "Node.js", "Express.js", "C#", "REST APIs", etc.
 *
 * @param {string} text - Resume text
 * @param {string} skillName - Name of skill to check
 * @returns {boolean}
 */
export function matchesSkill(text, skillName) {
  if (!text || !skillName || typeof text !== 'string' || typeof skillName !== 'string') {
    return false;
  }

  const trimmed = skillName.trim();
  if (!trimmed) return false;

  const escaped = escapeRegex(trimmed);
  const startPattern = /^[a-zA-Z0-9]/.test(trimmed) ? '(?<![a-zA-Z0-9])' : '';
  const endPattern = /[a-zA-Z0-9]$/.test(trimmed) ? '(?![a-zA-Z0-9])' : '(?![a-zA-Z0-9])';

  try {
    const regex = new RegExp(`${startPattern}${escaped}${endPattern}`, 'i');
    return regex.test(text);
  } catch {
    // Fallback simple case-insensitive include if regex compilation fails
    return text.toLowerCase().includes(trimmed.toLowerCase());
  }
}

/**
 * Fetches all available skills from the database (or in-memory cache).
 *
 * @returns {Promise<Array<{ name: string, category: string }>>}
 */
export async function getAllSkillsList() {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    const skills = await Skill.find().select('name category description').lean();
    if (skills && skills.length > 0) {
      return skills;
    }
  }

  // Fallback to in-memory seed store
  return inMemoryStore.skills || [];
}

/**
 * Analyzes resume text against the system's skills and the student's target career.
 *
 * @param {string} resumeText - Normalized resume text
 * @param {Object} careerDoc - Target Career document (populated with requiredSkills)
 * @param {Array} [customSkillsList] - Optional preloaded skills list
 * @returns {Promise<{
 *   detectedSkills: string[],
 *   matchedSkills: string[],
 *   missingSkills: string[],
 *   matchScore: number,
 *   totalRequired: number
 * }>}
 */
export async function analyzeResumeSkills(resumeText, careerDoc, customSkillsList = null) {
  if (!resumeText || typeof resumeText !== 'string') {
    throw new Error('Valid resume text is required for skill analysis.');
  }

  if (!careerDoc || !careerDoc.requiredSkills) {
    throw new Error('Target career with required skills specification is required.');
  }

  // 1. Retrieve all system skills
  const allSkills = customSkillsList || (await getAllSkillsList());

  // 2. Detect all skills present in resume (deterministic & case-insensitive)
  const detectedSet = new Set();
  for (const skill of allSkills) {
    const skillName = skill.name || skill;
    if (matchesSkill(resumeText, skillName)) {
      detectedSet.add(skillName);
    }
  }

  const detectedSkills = Array.from(detectedSet);

  // 3. Extract required skills from Target Career
  const requiredSkillNames = [];
  const requiredSkillMap = new Map();

  for (const reqItem of careerDoc.requiredSkills) {
    let name = '';
    if (typeof reqItem === 'string') {
      name = reqItem;
    } else if (reqItem.skill && typeof reqItem.skill === 'object') {
      name = reqItem.skill.name;
    } else if (reqItem.name) {
      name = reqItem.name;
    } else if (typeof reqItem.skill === 'string') {
      // Could be an id or skill name
      const foundInAll = allSkills.find((s) => s._id?.toString() === reqItem.skill || s.name === reqItem.skill);
      name = foundInAll ? foundInAll.name : reqItem.skill;
    }

    if (name && !requiredSkillMap.has(name.toLowerCase())) {
      requiredSkillMap.set(name.toLowerCase(), name);
      requiredSkillNames.push(name);
    }
  }

  // 4. Compare Detected Skills with Required Career Skills
  const matchedSkills = [];
  const missingSkills = [];

  for (const reqName of requiredSkillNames) {
    // Check if detected in resume
    const isDetected = detectedSkills.some(
      (d) => d.toLowerCase() === reqName.toLowerCase()
    ) || matchesSkill(resumeText, reqName);

    if (isDetected) {
      matchedSkills.push(reqName);
      if (!detectedSet.has(reqName)) {
        detectedSet.add(reqName);
      }
    } else {
      missingSkills.push(reqName);
    }
  }

  const finalDetectedSkills = Array.from(detectedSet);

  // 5. Calculate Deterministic Resume-Career Match Score
  // matchScore = (matched required skills / total required skills) * 100
  // Rounded to one decimal place
  const totalRequired = requiredSkillNames.length;
  let matchScore = 0;

  if (totalRequired > 0) {
    const rawScore = (matchedSkills.length / totalRequired) * 100;
    matchScore = Math.round(rawScore * 10) / 10;
  }

  return {
    detectedSkills: finalDetectedSkills,
    matchedSkills,
    missingSkills,
    matchScore,
    totalRequired,
  };
}
