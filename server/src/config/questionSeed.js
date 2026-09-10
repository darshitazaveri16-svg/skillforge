import mongoose from 'mongoose';
import Question from '../models/Question.js';
import Skill from '../models/Skill.js';
import { inMemoryStore } from './seedData.js';

export const RAW_QUESTIONS_DATA = [
  // React
  {
    skillName: 'React',
    difficulty: 'easy',
    question: 'Which Hook is used in React to manage local component state?',
    options: ['useEffect', 'useState', 'useContext', 'useReducer'],
    correctAnswer: 1,
    explanation: 'useState is the primary React hook for declaring and managing state within functional components.',
  },
  {
    skillName: 'React',
    difficulty: 'medium',
    question: 'What is the purpose of the dependency array in React useEffect Hook?',
    options: [
      'To specify CSS classes applied to the component',
      'To define which state or prop changes should re-trigger the effect',
      'To pass props down to child components',
      'To optimize JSX rendering speed automatically',
    ],
    correctAnswer: 1,
    explanation: 'The dependency array controls when useEffect runs. The effect re-executes only when values inside the array change.',
  },
  {
    skillName: 'React',
    difficulty: 'hard',
    question: 'How does React Virtual DOM reconciliation algorithm optimize DOM updates?',
    options: [
      'By replacing the entire real DOM tree on every render',
      'By using a heuristic diffing algorithm that compares fiber trees and batches minimal real DOM mutations',
      'By compiling React JSX directly into C++ binary web workers',
      'By bypassing browser reflow and executing directly on GPU memory',
    ],
    correctAnswer: 1,
    explanation: 'React uses Fiber reconciliation to diff the current and new virtual DOM trees, identifying the minimal set of real DOM mutations required.',
  },

  // JavaScript
  {
    skillName: 'JavaScript',
    difficulty: 'easy',
    question: 'Which operator checks both value and type equality in JavaScript?',
    options: ['==', '===', '=', '!='],
    correctAnswer: 1,
    explanation: 'The strict equality operator (===) checks both value and data type without performing implicit type coercion.',
  },
  {
    skillName: 'JavaScript',
    difficulty: 'medium',
    question: 'What is a JavaScript closure?',
    options: [
      'A method used to close database connections',
      'A function bundled together with references to its surrounding lexical environment',
      'An event listener attached to the window object',
      'A syntax feature for defining private class fields',
    ],
    correctAnswer: 1,
    explanation: 'A closure gives an inner function access to an outer function scope even after the outer function has finished executing.',
  },
  {
    skillName: 'JavaScript',
    difficulty: 'hard',
    question: 'In the JavaScript Event Loop, what executes first after the currently running call stack clears?',
    options: [
      'Tasks in the Macrotask queue (setTimeout)',
      'All pending jobs in the Microtask queue (Promises & process.nextTick)',
      'DOM mutation render repaints',
      'Web Worker message events',
    ],
    correctAnswer: 1,
    explanation: 'Microtasks (Promises, process.nextTick) have higher priority and are processed completely before the Event Loop moves to the next Macrotask.',
  },

  // Node.js
  {
    skillName: 'Node.js',
    difficulty: 'easy',
    question: 'Which global object in Node.js provides environment variables?',
    options: ['window.env', 'process.env', 'global.env', 'env.config'],
    correctAnswer: 1,
    explanation: 'process.env is the global object containing current user environment variables in Node.js.',
  },
  {
    skillName: 'Node.js',
    difficulty: 'medium',
    question: 'How does Node.js handle non-blocking asynchronous I/O operations?',
    options: [
      'By creating a new OS thread for every incoming HTTP request',
      'By utilizing an event-driven single-threaded event loop backed by libuv thread pool',
      'By freezing execution until file reads complete',
      'By delegating routing directly to Nginx',
    ],
    correctAnswer: 1,
    explanation: 'Node.js uses a single-threaded event loop paired with libuv to offload blocking I/O operations asynchronously.',
  },
  {
    skillName: 'Node.js',
    difficulty: 'hard',
    question: 'Which stream method in Node.js prevents overwhelming consumer memory buffer (backpressure)?',
    options: ['stream.pipe()', 'stream.concat()', 'stream.flush()', 'stream.sync()'],
    correctAnswer: 0,
    explanation: 'stream.pipe() automatically manages backpressure by pausing the readable stream when the writable destination buffer is full.',
  },

  // Python
  {
    skillName: 'Python',
    difficulty: 'easy',
    question: 'Which built-in Python data structure is immutable?',
    options: ['List', 'Dictionary', 'Set', 'Tuple'],
    correctAnswer: 3,
    explanation: 'Tuples in Python are immutable sequences; their elements cannot be modified or reassigned after creation.',
  },
  {
    skillName: 'Python',
    difficulty: 'medium',
    question: 'What is a Python decorator?',
    options: [
      'A comment tag used for generating documentation',
      'A function that takes another function as an argument and extends its behavior without modifying it explicitly',
      'A CSS module for styling Python web apps',
      'A special class method used for garbage collection',
    ],
    correctAnswer: 1,
    explanation: 'Decorators wrap a function to modify or enhance its behavior dynamically using the @decorator syntax.',
  },
  {
    skillName: 'Python',
    difficulty: 'hard',
    question: 'What impact does the Global Interpreter Lock (GIL) have on CPython multithreading?',
    options: [
      'It prevents multiple Python processes from running on the OS',
      'It restricts execution to one native thread per process at a time, limiting CPU-bound speedup across multiple CPU cores',
      'It disables asynchronous file reading',
      'It automatically compiles Python byte code to ARM machine code',
    ],
    correctAnswer: 1,
    explanation: 'The GIL prevents multi-threaded CPython execution from using multiple CPU cores simultaneously for CPU-bound tasks.',
  },

  // SQL
  {
    skillName: 'SQL',
    difficulty: 'easy',
    question: 'Which SQL clause is used to filter records before grouping?',
    options: ['HAVING', 'WHERE', 'GROUP BY', 'ORDER BY'],
    correctAnswer: 1,
    explanation: 'WHERE filters rows before any aggregation, whereas HAVING filters groups created by GROUP BY.',
  },
  {
    skillName: 'SQL',
    difficulty: 'medium',
    question: 'What is the difference between INNER JOIN and LEFT JOIN in SQL?',
    options: [
      'INNER JOIN returns all rows from left table; LEFT JOIN returns matching rows only',
      'INNER JOIN returns only matching rows in both tables; LEFT JOIN returns all rows from left table plus matching rows from right',
      'INNER JOIN works on strings; LEFT JOIN works on numbers',
      'LEFT JOIN requires primary key constraints',
    ],
    correctAnswer: 1,
    explanation: 'LEFT JOIN retains all records from the left table regardless of whether a matching key exists in the right table.',
  },
  {
    skillName: 'SQL',
    difficulty: 'hard',
    question: 'Which SQL window function assigns a unique sequential integer to rows partition by a column?',
    options: ['ROW_NUMBER()', 'RANK()', 'DENSE_RANK()', 'LEAD()'],
    correctAnswer: 0,
    explanation: 'ROW_NUMBER() assigns a unique continuous sequence (1, 2, 3...) to every row within a window partition.',
  },

  // MongoDB
  {
    skillName: 'MongoDB',
    difficulty: 'easy',
    question: 'What format does MongoDB use natively to store document data internally?',
    options: ['XML', 'BSON', 'CSV', 'YAML'],
    correctAnswer: 1,
    explanation: 'MongoDB stores data as BSON (Binary JSON), extending JSON with additional data types like Date and ObjectId.',
  },
  {
    skillName: 'MongoDB',
    difficulty: 'medium',
    question: 'Which aggregation pipeline stage in MongoDB is used to filter documents?',
    options: ['$project', '$match', '$group', '$unwind'],
    correctAnswer: 1,
    explanation: 'The $match pipeline stage filters incoming documents according to query conditions, similar to SQL WHERE.',
  },

  // Networking
  {
    skillName: 'Networking',
    difficulty: 'easy',
    question: 'Which OSI layer does the IP protocol operate on?',
    options: ['Layer 2 (Data Link)', 'Layer 3 (Network)', 'Layer 4 (Transport)', 'Layer 7 (Application)'],
    correctAnswer: 1,
    explanation: 'IP (Internet Protocol) is the fundamental protocol operating on Layer 3 (Network Layer) of the OSI model.',
  },
  {
    skillName: 'Networking',
    difficulty: 'medium',
    question: 'What is the main difference between TCP and UDP?',
    options: [
      'UDP is connection-oriented and reliable; TCP is connectionless',
      'TCP is connection-oriented, reliable, and ordered; UDP is connectionless and lightweight without guaranteed delivery',
      'TCP operates on Layer 2; UDP operates on Layer 7',
      'UDP encrypts packets automatically',
    ],
    correctAnswer: 1,
    explanation: 'TCP guarantees packet delivery and ordering via handshake, whereas UDP prioritizes speed without connection overhead.',
  },

  // Linux
  {
    skillName: 'Linux',
    difficulty: 'easy',
    question: 'Which command changes file permissions in Linux?',
    options: ['chown', 'chmod', 'chgrp', 'ls -l'],
    correctAnswer: 1,
    explanation: 'chmod (change mode) is used to modify read, write, and execute permissions on Linux files and directories.',
  },
  {
    skillName: 'Linux',
    difficulty: 'medium',
    question: 'What does a permission mode of 755 mean for a Linux file?',
    options: [
      'Owner read/write/execute; Group and Others read/execute',
      'Owner read only; Group execute; Others write',
      'Owner write; Group read; Others no access',
      'Full control for all users',
    ],
    correctAnswer: 0,
    explanation: '755 translates to rwxr-xr-x: Owner=7 (rwx), Group=5 (r-x), Others=5 (r-x).',
  },

  // Cybersecurity Fundamentals
  {
    skillName: 'Cybersecurity Fundamentals',
    difficulty: 'easy',
    question: 'What are the three core principles of the CIA Triad in information security?',
    options: [
      'Control, Inspection, Authorization',
      'Confidentiality, Integrity, Availability',
      'Cryptanalysis, Identity, Authentication',
      'Compliance, Isolation, Audit',
    ],
    correctAnswer: 1,
    explanation: 'The CIA Triad stands for Confidentiality, Integrity, and Availability—the baseline model for security systems.',
  },
  {
    skillName: 'Cybersecurity Fundamentals',
    difficulty: 'medium',
    question: 'What type of attack involves an adversary inserting themselves into communications between two parties?',
    options: ['SQL Injection', 'Man-in-the-Middle (MitM)', 'Buffer Overflow', 'Cross-Site Scripting (XSS)'],
    correctAnswer: 1,
    explanation: 'In a Man-in-the-Middle (MitM) attack, the attacker secretly intercepts and relays communications between two victims.',
  },

  // Pandas
  {
    skillName: 'Pandas',
    difficulty: 'easy',
    question: 'Which Pandas method is used to inspect the first 5 rows of a DataFrame?',
    options: ['df.tail()', 'df.head()', 'df.show()', 'df.info()'],
    correctAnswer: 1,
    explanation: 'df.head() returns the first 5 rows of a Pandas DataFrame by default.',
  },
  {
    skillName: 'Pandas',
    difficulty: 'medium',
    question: 'How do you handle missing values in a Pandas DataFrame by replacing them with a specific value?',
    options: ['df.dropna()', 'df.fillna(value)', 'df.replace_null()', 'df.clean()'],
    correctAnswer: 1,
    explanation: 'df.fillna() fills NA/NaN values using the specified value or interpolation method.',
  },
];

export const seedQuestions = async () => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (!isDbConnected) {
      console.log('[QuestionSeed] DB offline. Preparing in-memory question pool...');
      
      inMemoryStore.questions = RAW_QUESTIONS_DATA.map((q, idx) => {
        const skillObj = inMemoryStore.skills.find((s) => s.name === q.skillName) || {
          _id: `skill_${q.skillName}`,
          name: q.skillName,
          category: 'Core',
        };

        return {
          _id: `q_${idx + 1}`,
          id: `q_${idx + 1}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          skill: skillObj,
          skillName: q.skillName,
          difficulty: q.difficulty,
          explanation: q.explanation,
        };
      });

      console.log(`[QuestionSeed] In-memory pool ready: ${inMemoryStore.questions.length} questions.`);
      return;
    }

    console.log('[QuestionSeed] Seeding MongoDB with technical question bank...');

    const skillDocs = await Skill.find();
    const skillMap = {};
    skillDocs.forEach((s) => {
      skillMap[s.name] = s._id;
    });

    for (const qData of RAW_QUESTIONS_DATA) {
      const skillId = skillMap[qData.skillName];
      if (!skillId) continue;

      await Question.findOneAndUpdate(
        { question: qData.question },
        {
          question: qData.question,
          options: qData.options,
          correctAnswer: qData.correctAnswer,
          skill: skillId,
          difficulty: qData.difficulty,
          explanation: qData.explanation,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log('[QuestionSeed] Question bank seeding completed.');
  } catch (error) {
    console.error('[QuestionSeed Error] Question seeding error:', error.message);
  }
};
