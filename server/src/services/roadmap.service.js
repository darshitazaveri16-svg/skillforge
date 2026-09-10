/**
 * Personalized Learning Roadmap Generation Service
 *
 * Deterministically prioritizes skill gaps identified by the Skill Gap Engine
 * and maps them to structured learning topics and educational resources.
 */

// Legitimate free educational resource & topic mapping table
export const SKILL_RESOURCE_MAPPINGS = {
  SQL: {
    topic: 'Advanced SQL Queries & Relational Database Design',
    description: 'Master SELECT, WHERE filters, INNER/LEFT JOINs, GROUP BY aggregations, CTEs, and window functions.',
    resourceTitle: 'W3Schools SQL Tutorial & Exercises',
    resourceUrl: 'https://www.w3schools.com/sql/',
    estimatedDuration: '6 hours',
  },
  Python: {
    topic: 'Core Python Syntax, Data Structures & Scripting',
    description: 'Build core Python proficiency in functions, list comprehensions, exception handling, and object-oriented programming.',
    resourceTitle: 'Real Python Tutorials & Guides',
    resourceUrl: 'https://realpython.com/',
    estimatedDuration: '8 hours',
  },
  React: {
    topic: 'React Components, Hooks & State Management',
    description: 'Learn functional components, useState, useEffect, custom hooks, React Router navigation, and API integration.',
    resourceTitle: 'Official React Documentation & Interactive Course',
    resourceUrl: 'https://react.dev/learn',
    estimatedDuration: '10 hours',
  },
  'Node.js': {
    topic: 'Node.js Event Loop, Express Routing & Middleware',
    description: 'Master server-side JavaScript execution, async I/O handling, REST API routing, and HTTP middleware chaining.',
    resourceTitle: 'Node.js Official Documentation & Learn Guides',
    resourceUrl: 'https://nodejs.org/en/learn',
    estimatedDuration: '8 hours',
  },
  'Express.js': {
    topic: 'RESTful API Architecture & Express Middleware',
    description: 'Design robust HTTP APIs, request validation, error handling middleware, and route modularization.',
    resourceTitle: 'Express.js Framework Guide',
    resourceUrl: 'https://expressjs.com/en/starter/installing.html',
    estimatedDuration: '6 hours',
  },
  MongoDB: {
    topic: 'NoSQL Document Modeling & Mongoose Schemas',
    description: 'Learn document CRUD operations, indexing, aggregation pipelines, and Mongoose ODM integration.',
    resourceTitle: 'MongoDB University & Manual',
    resourceUrl: 'https://www.mongodb.com/docs/',
    estimatedDuration: '7 hours',
  },
  JavaScript: {
    topic: 'Modern ES6+ JavaScript & Asynchronous Programming',
    description: 'Understand closures, promises, async/await, DOM manipulation, ES modules, and event loop mechanics.',
    resourceTitle: 'MDN Web Docs - JavaScript Guide',
    resourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    estimatedDuration: '10 hours',
  },
  HTML: {
    topic: 'Semantic HTML5, Forms & Web Accessibility (a11y)',
    description: 'Structure web documents using semantic elements, accessible form controls, and ARIA attributes.',
    resourceTitle: 'MDN Web Docs - HTML Structured Guide',
    resourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
    estimatedDuration: '4 hours',
  },
  CSS: {
    topic: 'Responsive Layouts with Flexbox & CSS Grid',
    description: 'Create responsive web designs using Flexbox, CSS Grid, media queries, and modern utility styling.',
    resourceTitle: 'CSS-Tricks Complete Guides to Flexbox & Grid',
    resourceUrl: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/',
    estimatedDuration: '6 hours',
  },
  'REST APIs': {
    topic: 'REST API Design, HTTP Methods & Authentication',
    description: 'Understand HTTP request/response lifecycles, status codes, JSON payloads, and JWT bearer security.',
    resourceTitle: 'RESTful API Design Best Practices (RedHat)',
    resourceUrl: 'https://www.redhat.com/en/topics/api/what-is-a-rest-api',
    estimatedDuration: '5 hours',
  },
  Git: {
    topic: 'Git Version Control & GitHub Workflows',
    description: 'Master branching strategies, merging, pull requests, resolving merge conflicts, and GitHub collaboration.',
    resourceTitle: 'Atlassian Git Tutorials & Command Reference',
    resourceUrl: 'https://www.atlassian.com/git/tutorials',
    estimatedDuration: '4 hours',
  },
  Excel: {
    topic: 'Advanced Excel Formulas, Pivot Tables & Data Analysis',
    description: 'Master VLOOKUP, XLOOKUP, INDEX/MATCH, Pivot Tables, conditional formatting, and data visualization.',
    resourceTitle: 'Microsoft Learn - Excel Data Analysis Training',
    resourceUrl: 'https://learn.microsoft.com/en-us/excel/',
    estimatedDuration: '6 hours',
  },
  Statistics: {
    topic: 'Descriptive & Inferential Statistics for Analytics',
    description: 'Understand mean, median, standard deviation, probability distributions, correlation, and hypothesis testing.',
    resourceTitle: 'Khan Academy Statistics & Probability',
    resourceUrl: 'https://www.khanacademy.org/math/statistics-probability',
    estimatedDuration: '8 hours',
  },
  Pandas: {
    topic: 'Pandas DataFrames, Data Cleaning & Manipulation',
    description: 'Manipulate tabular data, clean missing values, merge datasets, and perform grouped aggregations.',
    resourceTitle: 'Pandas Official User Guide & Tutorials',
    resourceUrl: 'https://pandas.pydata.org/docs/user_guide/index.html',
    estimatedDuration: '7 hours',
  },
  NumPy: {
    topic: 'NumPy Array Processing & Numerical Computing',
    description: 'Work with multidimensional ndarrays, vectorization, linear algebra operations, and mathematical calculations.',
    resourceTitle: 'NumPy Quickstart & Fundamentals Guide',
    resourceUrl: 'https://numpy.org/doc/stable/user/quickstart.html',
    estimatedDuration: '5 hours',
  },
  'Data Visualization': {
    topic: 'Visual Data Representation & Charting Best Practices',
    description: 'Design informative plots, bar charts, scatter plots, and dashboards using Matplotlib, Seaborn, or Chart.js.',
    resourceTitle: 'Python Data Visualization Society Guide',
    resourceUrl: 'https://seaborn.pydata.org/tutorial.html',
    estimatedDuration: '5 hours',
  },
  'Power BI': {
    topic: 'Power BI Dashboards, DAX Modeling & Business Intelligence',
    description: 'Build interactive business dashboards, write DAX formulas, connect data sources, and publish reports.',
    resourceTitle: 'Microsoft Power BI Official Guided Learning',
    resourceUrl: 'https://learn.microsoft.com/en-us/power-bi/',
    estimatedDuration: '8 hours',
  },
  Networking: {
    topic: 'Network Fundamentals, TCP/IP, OSI Model & Routing',
    description: 'Understand TCP/IP layers, IP addressing, subnetting, DNS, HTTP/HTTPS, firewalls, and packet analysis.',
    resourceTitle: 'Cisco Networking Essentials & Tutorials',
    resourceUrl: 'https://www.netacad.com/',
    estimatedDuration: '8 hours',
  },
  Linux: {
    topic: 'Linux Command Line Navigation & Shell Scripting',
    description: 'Master terminal navigation, file permissions (chmod/chown), process management, and bash automation.',
    resourceTitle: 'Linux Journey Interactive Guide',
    resourceUrl: 'https://linuxjourney.com/',
    estimatedDuration: '6 hours',
  },
  'Cybersecurity Fundamentals': {
    topic: 'CIA Triad, Threat Landscapes & Security Compliance',
    description: 'Understand confidentiality, integrity, availability, threat vectors, risk mitigation, and security policies.',
    resourceTitle: 'CISA Security Basics & Cyber Essentials',
    resourceUrl: 'https://www.cisa.gov/cyber-essentials',
    estimatedDuration: '6 hours',
  },
  SIEM: {
    topic: 'Security Event Monitoring & Log Analysis with SIEM',
    description: 'Analyze security logs, monitor real-time incident alerts, write correlation rules, and inspect threats.',
    resourceTitle: 'Elastic Security & SIEM Fundamentals',
    resourceUrl: 'https://www.elastic.co/security/siem',
    estimatedDuration: '7 hours',
  },
  'Threat Detection': {
    topic: 'Intrusion Detection, Threat Hunting & Incident Response',
    description: 'Detect malicious activity, configure IDS/IPS sensors, investigate indicators of compromise (IOCs).',
    resourceTitle: 'SANS Institute Reading Room & Incident Response Guide',
    resourceUrl: 'https://www.sans.org/information-security-policy/',
    estimatedDuration: '8 hours',
  },
  Cryptography: {
    topic: 'Symmetric/Asymmetric Encryption & PKI Infrastructure',
    description: 'Understand AES, RSA, SHA hashing, SSL/TLS certificates, public key infrastructure, and digital signatures.',
    resourceTitle: 'Cryptographic Protocols Overview (MDN)',
    resourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/Security',
    estimatedDuration: '6 hours',
  },
  'Vulnerability Assessment': {
    topic: 'Vulnerability Scanning, OWASP Top 10 & Risk Remediation',
    description: 'Identify system vulnerabilities, evaluate CVSS severity scores, scan networks, and patch security risks.',
    resourceTitle: 'OWASP Top 10 Security Project',
    resourceUrl: 'https://owasp.org/www-project-top-ten/',
    estimatedDuration: '7 hours',
  },
  OOP: {
    topic: 'Object-Oriented Programming Principles & Architecture',
    description: 'Implement encapsulation, inheritance, polymorphism, abstraction, and software design patterns.',
    resourceTitle: 'OOP Principles in Software Engineering Guide',
    resourceUrl: 'https://refactoring.guru/design-patterns',
    estimatedDuration: '6 hours',
  },
  Flask: {
    topic: 'Lightweight Web Services with Python Flask',
    description: 'Build web applications, HTTP routes, JSON APIs, and SQL alchemy database bindings with Flask.',
    resourceTitle: 'Flask Framework Official Documentation',
    resourceUrl: 'https://flask.palletsprojects.com/',
    estimatedDuration: '6 hours',
  },
  Django: {
    topic: 'Django Web Framework, ORM & Admin Console',
    description: 'Build robust web backends using Django ORM models, migration workflows, views, and template engines.',
    resourceTitle: 'Django Project Official Tutorials',
    resourceUrl: 'https://docs.djangoproject.com/en/stable/intro/tutorial01/',
    estimatedDuration: '9 hours',
  },
  Testing: {
    topic: 'Unit Testing, Integration Testing & Test Automation',
    description: 'Write unit tests, assertion suites, mock dependencies, and automate test suites using Jest or PyTest.',
    resourceTitle: 'Jest JavaScript Testing Documentation',
    resourceUrl: 'https://jestjs.io/docs/getting-started',
    estimatedDuration: '5 hours',
  },
};

/**
 * Maps a gap classification status to numeric priority tier.
 * Critical Gap (41+) -> 1
 * Needs Improvement (26-40) -> 2
 * Moderate (11-25) -> 3
 * Strong (0-10) -> 4
 */
const getStatusPriorityWeight = (status) => {
  switch (status) {
    case 'Critical Gap':
      return 1;
    case 'Needs Improvement':
      return 2;
    case 'Moderate':
      return 3;
    case 'Strong':
      return 4;
    default:
      return 3;
  }
};

const getPriorityLabel = (status) => {
  switch (status) {
    case 'Critical Gap':
      return 'Critical';
    case 'Needs Improvement':
      return 'High';
    case 'Moderate':
      return 'Medium';
    case 'Strong':
      return 'Low';
    default:
      return 'Medium';
  }
};

/**
 * Generates a personalized array of learning roadmap items from skill-gap analysis.
 *
 * Sorting Rules:
 * 1. Status Priority (Critical Gap -> Needs Improvement -> Moderate -> Strong)
 * 2. Gap Descending (largest skill gap first within same classification)
 *
 * @param {Array} skillAnalysis - Array of skill gap objects from calculateSkillGapAndReadiness
 * @returns {Array} List of prioritized roadmap items (4-8 items)
 */
export const generateRoadmapItems = (skillAnalysis) => {
  if (!Array.isArray(skillAnalysis) || skillAnalysis.length === 0) {
    return [];
  }

  // Sort skills deterministically by priority tier and gap descending
  const sortedSkills = [...skillAnalysis].sort((a, b) => {
    const priorityA = getStatusPriorityWeight(a.status);
    const priorityB = getStatusPriorityWeight(b.status);

    if (priorityA !== priorityB) {
      return priorityA - priorityB; // Lower weight number = higher priority
    }

    // Tie-breaker: largest gap first
    if (b.gap !== a.gap) {
      return b.gap - a.gap;
    }

    // Secondary tie-breaker: alphabetical skill name
    return a.skill.localeCompare(b.skill);
  });

  // Select top skills (target between 4 and 8 items)
  // Exclude Strong skills if we have enough higher priority gaps, but include if total skills is small
  let selectedSkills = sortedSkills.filter((s) => s.status !== 'Strong');
  if (selectedSkills.length < 4) {
    selectedSkills = sortedSkills; // Fallback to include all available skills
  }
  selectedSkills = selectedSkills.slice(0, 8);

  // Map to structured roadmap items
  return selectedSkills.map((skItem, idx) => {
    const mappedResource = SKILL_RESOURCE_MAPPINGS[skItem.skill] || {
      topic: `${skItem.skill} Technical Competency & Practice`,
      description: `Comprehensive training and hands-on exercises to build proficiency in ${skItem.skill}.`,
      resourceTitle: `${skItem.skill} Official Documentation & Tutorials`,
      resourceUrl: `https://www.google.com/search?q=${encodeURIComponent(skItem.skill + ' tutorial documentation')}`,
      estimatedDuration: '5 hours',
    };

    return {
      itemId: `item_${idx + 1}_${skItem.skill.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      order: idx + 1,
      skill: skItem.skill,
      category: skItem.category || 'Core',
      topic: mappedResource.topic,
      priority: getPriorityLabel(skItem.status),
      gap: skItem.gap,
      status: skItem.status,
      estimatedDuration: mappedResource.estimatedDuration,
      description: mappedResource.description,
      resourceTitle: mappedResource.resourceTitle,
      resourceUrl: mappedResource.resourceUrl,
      completed: false,
    };
  });
};
