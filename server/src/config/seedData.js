import mongoose from 'mongoose';
import Skill from '../models/Skill.js';
import Career from '../models/Career.js';

export const INITIAL_SKILLS = [
  // Frontend & Core Web
  { name: 'HTML', category: 'Frontend', description: 'Semantic markup, accessibility, and web document structure.' },
  { name: 'CSS', category: 'Frontend', description: 'Responsive design, Flexbox, Grid, animations, and Tailwind styling.' },
  { name: 'JavaScript', category: 'Frontend', description: 'ES6+, asynchronous JS, DOM manipulation, closures, and promises.' },
  { name: 'React', category: 'Frontend', description: 'Components, hooks, state management, router, and virtual DOM.' },
  
  // Backend & Databases
  { name: 'Node.js', category: 'Backend', description: 'Event-driven JavaScript runtime and server-side execution.' },
  { name: 'Express.js', category: 'Backend', description: 'RESTful API routing, middleware chaining, and HTTP request handling.' },
  { name: 'Python', category: 'Backend', description: 'Core Python syntax, data structures, algorithms, and scripting.' },
  { name: 'Flask', category: 'Backend', description: 'Lightweight WSGI web application framework in Python.' },
  { name: 'Django', category: 'Backend', description: 'High-level Python web framework enforcing ORM and MVC architecture.' },
  { name: 'OOP', category: 'Backend', description: 'Object-Oriented Programming principles: Encapsulation, Abstraction, Inheritance, Polymorphism.' },
  { name: 'REST APIs', category: 'Backend', description: 'API architecture, HTTP methods, status codes, JSON formatting, and authentication.' },
  { name: 'Testing', category: 'Testing', description: 'Unit testing, integration testing, and test automation (Jest/PyTest).' },
  { name: 'MongoDB', category: 'Database', description: 'NoSQL document database, Mongoose ODM, schemas, and aggregation.' },
  { name: 'SQL', category: 'Database', description: 'Relational database queries, joins, indexing, and schema normalization.' },
  { name: 'Git', category: 'DevOps', description: 'Version control system, branching, merging, pull requests, and Git workflows.' },

  // Data Analysis
  { name: 'Excel', category: 'Data Analysis', description: 'Advanced formulas, pivot tables, VLOOKUP, XLOOKUP, and data modeling.' },
  { name: 'Statistics', category: 'Data Analysis', description: 'Descriptive and inferential statistics, probability, and hypothesis testing.' },
  { name: 'Pandas', category: 'Data Analysis', description: 'Data structures, Series, DataFrames, data cleaning, and manipulation.' },
  { name: 'NumPy', category: 'Data Analysis', description: 'Multidimensional array processing, numerical computing, and linear algebra.' },
  { name: 'Data Visualization', category: 'Data Analysis', description: 'Visual data representation using Matplotlib, Seaborn, and Charting libraries.' },
  { name: 'Power BI', category: 'Data Analysis', description: 'Business intelligence dashboards, DAX queries, and interactive reporting.' },

  // Cybersecurity
  { name: 'Networking', category: 'Security', description: 'TCP/IP, OSI model, DNS, DHCP, routing, switching, and firewalls.' },
  { name: 'Linux', category: 'Security', description: 'Unix/Linux command-line navigation, shell scripting, file permissions, and administration.' },
  { name: 'Cybersecurity Fundamentals', category: 'Security', description: 'CIA triad, attack vectors, threat landscapes, and security compliance.' },
  { name: 'SIEM', category: 'Security', description: 'Security Information and Event Management, log analysis, and alert monitoring.' },
  { name: 'Threat Detection', category: 'Security', description: 'Intrusion detection systems (IDS/IPS), malware analysis, and incident response.' },
  { name: 'Cryptography', category: 'Security', description: 'Symmetric/asymmetric encryption, hashing algorithms, PKI, and digital signatures.' },
  { name: 'Vulnerability Assessment', category: 'Security', description: 'System scanning, vulnerability identification, risk rating, and remediation.' },
];

export const INITIAL_CAREERS_SPEC = [
  {
    name: 'Full Stack Developer',
    description: 'Build complete end-to-end web applications using modern frontend frameworks, backend microservices, and databases.',
    skillMapping: [
      { name: 'HTML', level: 90 },
      { name: 'CSS', level: 85 },
      { name: 'JavaScript', level: 90 },
      { name: 'React', level: 85 },
      { name: 'Node.js', level: 85 },
      { name: 'Express.js', level: 80 },
      { name: 'MongoDB', level: 80 },
      { name: 'REST APIs', level: 85 },
      { name: 'Git', level: 80 },
    ],
  },
  {
    name: 'Data Analyst',
    description: 'Transform raw data into meaningful actionable business intelligence using statistical analysis and visualization tools.',
    skillMapping: [
      { name: 'Python', level: 85 },
      { name: 'SQL', level: 90 },
      { name: 'Excel', level: 85 },
      { name: 'Statistics', level: 85 },
      { name: 'Pandas', level: 80 },
      { name: 'NumPy', level: 75 },
      { name: 'Data Visualization', level: 85 },
      { name: 'Power BI', level: 80 },
    ],
  },
  {
    name: 'Python Developer',
    description: 'Design algorithmic solutions, scalable backend web services, automation pipelines, and core Python software.',
    skillMapping: [
      { name: 'Python', level: 95 },
      { name: 'OOP', level: 85 },
      { name: 'SQL', level: 80 },
      { name: 'Git', level: 85 },
      { name: 'REST APIs', level: 85 },
      { name: 'Flask', level: 75 },
      { name: 'Django', level: 80 },
      { name: 'Testing', level: 75 },
    ],
  },
  {
    name: 'Cybersecurity Analyst',
    description: 'Protect organizational digital assets, monitor network traffic, perform vulnerability assessments, and respond to security incidents.',
    skillMapping: [
      { name: 'Networking', level: 90 },
      { name: 'Linux', level: 85 },
      { name: 'Cybersecurity Fundamentals', level: 90 },
      { name: 'SIEM', level: 80 },
      { name: 'Threat Detection', level: 85 },
      { name: 'Cryptography', level: 75 },
      { name: 'Vulnerability Assessment', level: 85 },
      { name: 'Python', level: 80 },
    ],
  },
];

// Fallback in-memory cache for offline/mock mode
export const inMemoryStore = {
  skills: [],
  careers: [],
};

export const seedDatabase = async () => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (!isDbConnected) {
      console.log('[Seed] DB offline. Preparing in-memory seed store...');
      
      // Populate in-memory skills
      inMemoryStore.skills = INITIAL_SKILLS.map((sk, idx) => ({
        _id: `skill_${idx + 1}`,
        id: `skill_${idx + 1}`,
        name: sk.name,
        category: sk.category,
        description: sk.description,
        createdAt: new Date(),
      }));

      // Populate in-memory careers
      inMemoryStore.careers = INITIAL_CAREERS_SPEC.map((car, idx) => {
        const reqSkills = car.skillMapping.map((sm) => {
          const skObj = inMemoryStore.skills.find((s) => s.name === sm.name);
          return {
            skill: skObj ? skObj : { _id: `skill_${sm.name}`, name: sm.name, category: 'Core' },
            targetLevel: sm.level,
          };
        });

        return {
          _id: `career_${idx + 1}`,
          id: `career_${idx + 1}`,
          name: car.name,
          description: car.description,
          requiredSkills: reqSkills,
          createdAt: new Date(),
        };
      });

      console.log(`[Seed] In-memory store ready: ${inMemoryStore.careers.length} careers, ${inMemoryStore.skills.length} skills.`);
      return;
    }

    console.log('[Seed] Seeding MongoDB with initial careers & skills...');

    // Upsert Skills
    const skillMap = {};
    for (const skillItem of INITIAL_SKILLS) {
      const skillDoc = await Skill.findOneAndUpdate(
        { name: skillItem.name },
        { name: skillItem.name, category: skillItem.category, description: skillItem.description },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      skillMap[skillItem.name] = skillDoc;
    }

    // Upsert Careers
    for (const careerSpec of INITIAL_CAREERS_SPEC) {
      const requiredSkills = careerSpec.skillMapping
        .filter((sm) => skillMap[sm.name])
        .map((sm) => ({
          skill: skillMap[sm.name]._id,
          targetLevel: sm.level,
        }));

      await Career.findOneAndUpdate(
        { name: careerSpec.name },
        {
          name: careerSpec.name,
          description: careerSpec.description,
          requiredSkills,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log('[Seed] Database seeding completed successfully.');
  } catch (error) {
    console.error('[Seed Error] Database seeding encountered error:', error.message);
  }
};
