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
  {
    skillName: 'Pandas',
    difficulty: 'hard',
    question: 'In Pandas, what is the key difference between the .loc[] and .iloc[] indexers?',
    options: [
      '.loc uses label-based indexing; .iloc uses zero-based integer positional indexing',
      '.loc is for rows only; .iloc is for columns only',
      '.loc modifies data in-place; .iloc returns a read-only copy',
      '.loc requires numpy arrays; .iloc accepts python lists',
    ],
    correctAnswer: 0,
    explanation: '.loc is label/name-based (inclusive of bounds), while .iloc is integer position-based (exclusive of upper bound).',
  },

  // HTML
  {
    skillName: 'HTML',
    difficulty: 'easy',
    question: 'Which HTML5 semantic element should be used to define introductory content or navigational links?',
    options: ['<section>', '<header>', '<article>', '<aside>'],
    correctAnswer: 1,
    explanation: '<header> represents introductory content, typically containing headings, logos, or navigational aids.',
  },
  {
    skillName: 'HTML',
    difficulty: 'medium',
    question: 'What is the security purpose of using rel="noopener" with target="_blank" in HTML anchor tags?',
    options: [
      'It speeds up browser rendering of new tabs',
      'It prevents the newly opened page from accessing window.opener, protecting against tabnabbing attacks',
      'It forces HTTPS encryption on the linked URL',
      'It allows passing localStorage credentials to the external page',
    ],
    correctAnswer: 1,
    explanation: 'rel="noopener" prevents the new page from accessing window.opener, mitigating reverse tabnabbing vulnerabilities.',
  },
  {
    skillName: 'HTML',
    difficulty: 'hard',
    question: 'Which attribute in HTML5 script tags executes the script asynchronously as soon as it is downloaded without blocking parsing?',
    options: ['defer', 'async', 'preload', 'blocking="render"'],
    correctAnswer: 1,
    explanation: 'The async attribute downloads scripts in parallel and executes them immediately when ready, independent of document order.',
  },

  // CSS
  {
    skillName: 'CSS',
    difficulty: 'easy',
    question: "Which CSS property is used to create space inside an element's border?",
    options: ['margin', 'padding', 'spacing', 'outline'],
    correctAnswer: 1,
    explanation: 'padding generates space around an element\'s content, inside of any defined borders.',
  },
  {
    skillName: 'CSS',
    difficulty: 'medium',
    question: 'In CSS Flexbox, what is the default value of the flex-shrink property on flex items?',
    options: ['0', '1', 'auto', 'none'],
    correctAnswer: 1,
    explanation: 'The default flex-shrink value is 1, which means items shrink proportionately when the container cannot fit all items.',
  },
  {
    skillName: 'CSS',
    difficulty: 'hard',
    question: 'In the CSS Cascade and Specificity algorithm, which selector has the highest specificity score?',
    options: ['div.container ul.list li', 'div#main nav a', '#sidebar.nav-item', 'div:hover'],
    correctAnswer: 2,
    explanation: '#sidebar.nav-item has specificity (1, 1, 0) — 1 ID and 1 class, which outweighs selectors with only classes and elements or fewer IDs.',
  },

  // Express.js
  {
    skillName: 'Express.js',
    difficulty: 'easy',
    question: 'Which built-in Express middleware is used to parse incoming JSON payloads?',
    options: ['express.static()', 'express.json()', 'express.urlencoded()', 'express.router()'],
    correctAnswer: 1,
    explanation: 'express.json() is built-in middleware that parses incoming requests with JSON payloads and populates req.body.',
  },
  {
    skillName: 'Express.js',
    difficulty: 'medium',
    question: 'How do you define error-handling middleware in Express.js?',
    options: [
      'By passing an object with { onError: true }',
      'By defining a middleware function with 4 parameters: (err, req, res, next)',
      'By attaching a .catch() handler to app.listen()',
      'By using the express-error npm package exclusively',
    ],
    correctAnswer: 1,
    explanation: 'Express identifies error-handling middleware specifically by having 4 arguments: (err, req, res, next).',
  },
  {
    skillName: 'Express.js',
    difficulty: 'hard',
    question: 'What happens in Express if next(new Error("Database error")) is called inside a route handler?',
    options: [
      'The server crashes immediately',
      'Express skips all remaining non-error handling middleware and invokes registered error middleware',
      'The error is logged to console and next non-error route executes',
      'The HTTP response is sent with status 200 by default',
    ],
    correctAnswer: 1,
    explanation: 'Passing any argument to next() (except "route") tells Express an error occurred, skipping standard middleware and invoking error handlers.',
  },

  // REST APIs
  {
    skillName: 'REST APIs',
    difficulty: 'easy',
    question: 'Which HTTP method should be used to partially update an existing resource according to REST conventions?',
    options: ['GET', 'POST', 'PATCH', 'DELETE'],
    correctAnswer: 2,
    explanation: 'PATCH applies partial modifications to a resource, whereas PUT typically replaces the entire resource.',
  },
  {
    skillName: 'REST APIs',
    difficulty: 'medium',
    question: 'What does the HTTP 409 Conflict status code indicate?',
    options: [
      'The client supplied an invalid JWT bearer token',
      'The request could not be completed due to a conflict with the current state of the target resource',
      'The resource was permanently deleted and no forwarding address exists',
      'The API gateway timed out waiting for microservice response',
    ],
    correctAnswer: 1,
    explanation: '409 Conflict indicates the request cannot be processed because of a state conflict, such as duplicate unique constraint violation.',
  },
  {
    skillName: 'REST APIs',
    difficulty: 'hard',
    question: 'Which architectural property of REST dictates that an operation can be performed multiple times yielding the same result as a single invocation?',
    options: ['Statelessness', 'Idempotence', 'Cacheability', 'Layered system'],
    correctAnswer: 1,
    explanation: 'Idempotency means that making identical requests multiple times has the same effect as making a single request (e.g. GET, PUT, DELETE).',
  },

  // Git
  {
    skillName: 'Git',
    difficulty: 'easy',
    question: 'Which Git command stages modified files in the working directory for commit?',
    options: ['git commit', 'git add', 'git push', 'git checkout'],
    correctAnswer: 1,
    explanation: 'git add updates the index using the current content found in the working tree, preparing files for commit.',
  },
  {
    skillName: 'Git',
    difficulty: 'medium',
    question: 'What is the primary difference between "git merge" and "git rebase"?',
    options: [
      'Merge creates a new commit preserving history branch structure; rebase rewrites project history by moving base commit',
      'Merge deletes the feature branch automatically',
      'Rebase can only be performed on the remote server',
      'Merge cannot handle conflict resolution',
    ],
    correctAnswer: 0,
    explanation: 'git merge joins two branch histories with a merge commit, while rebase reapplies commits on top of another base, creating a linear history.',
  },
  {
    skillName: 'Git',
    difficulty: 'hard',
    question: 'Which Git command allows recovering orphaned commits that are not reachable from any branch or tag?',
    options: ['git reflog and git fsck --lost-found', 'git reset --hard HEAD', 'git clean -fd', 'git pull --force'],
    correctAnswer: 0,
    explanation: 'git reflog records updates to HEAD, and git fsck --lost-found recovers dangling/orphaned commits not pointed to by any reference.',
  },

  // MongoDB (hard)
  {
    skillName: 'MongoDB',
    difficulty: 'hard',
    question: 'Which index type in MongoDB should be created to optimize queries that sort by field A ascending and field B descending?',
    options: [
      'Compound index with { A: 1, B: -1 }',
      'Single field text index',
      'Hashed index on field A',
      'Geospatial 2dsphere index',
    ],
    correctAnswer: 0,
    explanation: 'A compound index with matching sort directions ({ A: 1, B: -1 } or its inverse) allows MongoDB to satisfy the bidirectional sort without in-memory sort operations.',
  },

  // Excel
  {
    skillName: 'Excel',
    difficulty: 'easy',
    question: 'Which Excel formula is used to find the arithmetic mean of numbers in cells A1 through A10?',
    options: ['=SUM(A1:A10)', '=AVERAGE(A1:A10)', '=MEDIAN(A1:A10)', '=MEAN(A1:A10)'],
    correctAnswer: 1,
    explanation: '=AVERAGE(A1:A10) calculates the arithmetic mean of the specified range in Excel.',
  },
  {
    skillName: 'Excel',
    difficulty: 'medium',
    question: 'Why is XLOOKUP generally preferred over VLOOKUP in modern Excel?',
    options: [
      'XLOOKUP only works on sorted data',
      'XLOOKUP looks both left and right, defaults to exact match, and does not break when columns are inserted',
      'VLOOKUP can search multiple sheets simultaneously while XLOOKUP cannot',
      'XLOOKUP does not support approximate matches',
    ],
    correctAnswer: 1,
    explanation: 'XLOOKUP searches in any direction (left or right), does not require column index numbers, and defaults to exact match.',
  },
  {
    skillName: 'Excel',
    difficulty: 'hard',
    question: 'In an Excel PivotTable, what feature allows interactive visual filtering of data across multiple connected pivot tables simultaneously?',
    options: ['Flash Fill', 'Slicers', 'Goal Seek', 'Data Validation'],
    correctAnswer: 1,
    explanation: 'Slicers provide visual buttons for interactive filtering and can be connected to multiple PivotTables sharing the same data model.',
  },

  // Statistics
  {
    skillName: 'Statistics',
    difficulty: 'easy',
    question: 'Which measure of central tendency represents the middle value of a sorted dataset?',
    options: ['Mean', 'Median', 'Mode', 'Variance'],
    correctAnswer: 1,
    explanation: 'The median is the middle score in a sorted distribution of values, dividing the upper half from the lower half.',
  },
  {
    skillName: 'Statistics',
    difficulty: 'medium',
    question: 'In hypothesis testing, what is a Type I error?',
    options: [
      'Failing to reject a false null hypothesis (false negative)',
      'Rejecting a true null hypothesis (false positive)',
      'Calculating standard deviation with N instead of N-1',
      'Using a two-tailed test instead of a one-tailed test',
    ],
    correctAnswer: 1,
    explanation: 'A Type I error occurs when the researcher rejects the null hypothesis when it is actually true (a false positive).',
  },
  {
    skillName: 'Statistics',
    difficulty: 'hard',
    question: 'According to the Central Limit Theorem (CLT), as sample size increases, what distribution does the sample mean approach?',
    options: ['Uniform distribution', 'Normal (Gaussian) distribution', 'Exponential distribution', 'Poisson distribution'],
    correctAnswer: 1,
    explanation: 'The Central Limit Theorem states that the distribution of sample means approaches a normal distribution as sample size grows.',
  },

  // NumPy
  {
    skillName: 'NumPy',
    difficulty: 'easy',
    question: 'Which NumPy function is used to create a 1D array with values from 0 to 9?',
    options: ['np.zeros(10)', 'np.arange(10)', 'np.ones(10)', 'np.linspace(0, 9, 1)'],
    correctAnswer: 1,
    explanation: 'np.arange(10) returns evenly spaced values within a given interval, creating an array of integers from 0 to 9.',
  },
  {
    skillName: 'NumPy',
    difficulty: 'medium',
    question: 'What is NumPy broadcasting?',
    options: [
      'Sending array data across a local network socket',
      'The mechanism that allows arithmetic operations between arrays of different shapes under specific dimension rules',
      'Converting floating point arrays to 8-bit integers',
      'Iterating over multidimensional arrays using parallel threads',
    ],
    correctAnswer: 1,
    explanation: 'Broadcasting describes how NumPy treats arrays with different shapes during arithmetic operations without making unnecessary copies of data.',
  },
  {
    skillName: 'NumPy',
    difficulty: 'hard',
    question: 'What is the primary architectural performance advantage of a NumPy array over a standard Python list?',
    options: [
      'NumPy arrays are stored in contiguous memory blocks with homogeneous data types, enabling vectorized C-level execution',
      'NumPy arrays automatically compress data using gzip algorithms',
      'NumPy arrays run exclusively on the GPU',
      'Python lists do not support indexing or slicing',
    ],
    correctAnswer: 0,
    explanation: 'NumPy arrays store elements contiguously with homogeneous datatypes, minimizing pointer overhead and enabling SIMD vectorized instructions.',
  },

  // Data Visualization
  {
    skillName: 'Data Visualization',
    difficulty: 'easy',
    question: 'Which chart type is most suitable for displaying the distribution, median, and quartiles of numerical data?',
    options: ['Pie Chart', 'Box Plot (Box-and-Whisker)', 'Line Chart', 'Radar Chart'],
    correctAnswer: 1,
    explanation: 'A Box Plot visually summarizes five summary statistics: minimum, first quartile, median, third quartile, and maximum.',
  },
  {
    skillName: 'Data Visualization',
    difficulty: 'medium',
    question: 'In data visualization best practices, why are bar charts preferred over pie charts for categorical comparison?',
    options: [
      'Web browsers cannot render circular SVG elements',
      'Human visual perception evaluates lengths on a common baseline more accurately than angles and 2D slice areas',
      'Pie charts cannot display percentages',
      'Color scales cannot be applied to pie slices',
    ],
    correctAnswer: 1,
    explanation: 'Human perception is far better at comparing lengths on a common scale (bar charts) than comparing angles and 2D areas (pie charts).',
  },
  {
    skillName: 'Data Visualization',
    difficulty: 'hard',
    question: 'In statistical visualization, what is a heatmap primarily used to represent?',
    options: [
      'Geographic latitude and longitude coordinates exclusively',
      'A 2D matrix where individual values are represented by color variations, frequently used for correlation matrices',
      'Server memory usage over a 24-hour timeline',
      'Hierarchical tree relationships',
    ],
    correctAnswer: 1,
    explanation: 'A heatmap displays values of a 2D matrix as colors, making it ideal for visualizing correlation matrices and cross-tabulations.',
  },

  // Power BI
  {
    skillName: 'Power BI',
    difficulty: 'easy',
    question: 'What is the formula language used to create custom calculated columns and measures in Power BI?',
    options: ['SQL', 'DAX (Data Analysis Expressions)', 'M Code', 'VBA'],
    correctAnswer: 1,
    explanation: 'DAX (Data Analysis Expressions) is the formula language used in Power BI and Analysis Services for defining custom calculations.',
  },
  {
    skillName: 'Power BI',
    difficulty: 'medium',
    question: 'In Power BI DAX, what is the fundamental difference between a Calculated Column and a Measure?',
    options: [
      'Calculated columns are computed at data refresh and stored in the model; measures are calculated on-the-fly based on report filter context',
      'Measures consume disk space while calculated columns do not',
      'Calculated columns cannot use mathematical formulas',
      'Measures can only return text values',
    ],
    correctAnswer: 0,
    explanation: 'Calculated columns evaluate in row context and persist to memory/disk; measures evaluate dynamically based on user filter context.',
  },
  {
    skillName: 'Power BI',
    difficulty: 'hard',
    question: 'In Power BI data modeling, which schema design is recommended for optimal query performance and DAX simplicity?',
    options: [
      'Flat Denormalized Single Table',
      'Star Schema with central Fact tables and related Dimension tables',
      'Deeply normalized Snowflake Schema',
      'Graph network schema',
    ],
    correctAnswer: 1,
    explanation: 'Star schema (with central fact tables and related dimension tables) is the optimal architecture for Power BI vertipaq engine.',
  },

  // OOP
  {
    skillName: 'OOP',
    difficulty: 'easy',
    question: 'Which OOP pillar describes bundling data and methods within a class while restricting direct external access to internal state?',
    options: ['Inheritance', 'Encapsulation', 'Polymorphism', 'Composition'],
    correctAnswer: 1,
    explanation: 'Encapsulation bundles fields and methods together while hiding internal details and protecting object state from outside interference.',
  },
  {
    skillName: 'OOP',
    difficulty: 'medium',
    question: 'What is method overriding in Object-Oriented Programming?',
    options: [
      'Defining multiple methods with the same name but different argument types in the same class',
      'A subclass providing a specific implementation of a method already defined in its parent class',
      'Calling private methods through reflection',
      'Converting an object instance to a string',
    ],
    correctAnswer: 1,
    explanation: 'Method overriding allows a subclass to provide its own implementation of a method defined in its superclass.',
  },
  {
    skillName: 'OOP',
    difficulty: 'hard',
    question: 'In the SOLID design principles, what does the Liskov Substitution Principle (LSP) state?',
    options: [
      'Classes should be open for extension but closed for modification',
      'Subtypes must be substitutable for their base types without altering program correctness',
      'Clients should not be forced to depend on interfaces they do not use',
      'High-level modules should not depend on low-level modules',
    ],
    correctAnswer: 1,
    explanation: 'LSP states that objects of a superclass should be replaceable with objects of a subclass without breaking application behavior.',
  },

  // Flask
  {
    skillName: 'Flask',
    difficulty: 'easy',
    question: 'Which decorator in Flask is used to bind a Python function to an HTTP URL endpoint?',
    options: ['@app.route()', '@app.endpoint()', '@app.url()', '@app.handler()'],
    correctAnswer: 0,
    explanation: '@app.route() is the standard Flask decorator that maps URL paths to view functions.',
  },
  {
    skillName: 'Flask',
    difficulty: 'medium',
    question: 'In Flask, how do you parse JSON payload data sent in a POST request?',
    options: ['request.args', 'request.get_json()', 'request.form', 'request.files'],
    correctAnswer: 1,
    explanation: 'request.get_json() parses incoming JSON request data into a Python dictionary.',
  },
  {
    skillName: 'Flask',
    difficulty: 'hard',
    question: 'What is the function of the Application Context and Request Context in Flask?',
    options: [
      'Thread-local proxies that make current_app, g, request, and session accessible without passing them through every function',
      'Built-in database connection pool instances',
      'CSS themes bundled into Jinja templates',
      'System daemon processes managed by systemd',
    ],
    correctAnswer: 0,
    explanation: 'Flask contexts isolate request-specific (request, session) and app-specific (current_app, g) variables per thread during execution.',
  },

  // Django
  {
    skillName: 'Django',
    difficulty: 'easy',
    question: 'Which manage.py command in Django generates database migration scripts based on model changes?',
    options: ['python manage.py migrate', 'python manage.py makemigrations', 'python manage.py syncdb', 'python manage.py collectstatic'],
    correctAnswer: 1,
    explanation: 'makemigrations inspects model definitions and generates migration files that describe database schema alterations.',
  },
  {
    skillName: 'Django',
    difficulty: 'medium',
    question: 'How does Django ORM prevent SQL Injection vulnerabilities in queries?',
    options: [
      'By disabling all user input parameters',
      'By using parameterized SQL queries where query structure and parameter values are sent separately to the database driver',
      'By compiling queries to binary WebAssembly',
      'By enforcing regex filtering on all character fields',
    ],
    correctAnswer: 1,
    explanation: 'Django ORM uses parameterized queries (prepared statements), ensuring user parameters are treated strictly as data, not executable SQL.',
  },
  {
    skillName: 'Django',
    difficulty: 'hard',
    question: 'In Django ORM, what is the primary distinction between .select_related() and .prefetch_related()?',
    options: [
      'select_related uses SQL JOIN for single-valued relationships (ForeignKey, OneToOne); prefetch_related uses separate queries with Python joining for multi-valued relationships (ManyToMany, Reverse FK)',
      'select_related works on PostgreSQL only; prefetch_related works on SQLite only',
      'select_related caches queries in Redis; prefetch_related stores queries in memcached',
      'select_related is deprecated in Django 5',
    ],
    correctAnswer: 0,
    explanation: 'select_related performs a SQL JOIN to eagerly load 1-to-1 or foreign keys; prefetch_related executes a batch query in Python for many-to-many or reverse foreign keys.',
  },

  // Testing
  {
    skillName: 'Testing',
    difficulty: 'easy',
    question: 'What type of software test focuses on verifying individual functions or classes in complete isolation?',
    options: ['Unit Test', 'Integration Test', 'End-to-End (E2E) Test', 'Load Test'],
    correctAnswer: 0,
    explanation: 'Unit testing verifies the smallest testable units of code, such as individual functions or methods, isolated from external dependencies.',
  },
  {
    skillName: 'Testing',
    difficulty: 'medium',
    question: 'In automated testing, what is the primary role of a "mock" object?',
    options: [
      'An invalid string left in test code',
      'A simulated object that mimics external dependencies (like databases or third-party APIs) to test code in isolation',
      'A production server replica used for staging',
      'A test that intentionally fails to verify alert systems',
    ],
    correctAnswer: 1,
    explanation: 'Mocks simulate external systems, allowing developers to test business logic without live network or database dependencies.',
  },
  {
    skillName: 'Testing',
    difficulty: 'hard',
    question: 'What does Code Coverage measure in test engineering?',
    options: [
      'The speed at which tests execute on CPU cores',
      'The proportion of source code lines, branches, and statements executed during automated test runs',
      'The total size of the test files on disk',
      'The number of open GitHub issues',
    ],
    correctAnswer: 1,
    explanation: 'Code coverage quantifies the percentage of codebase executed by automated tests, highlighting untested branches and edge cases.',
  },

  // Networking (hard)
  {
    skillName: 'Networking',
    difficulty: 'hard',
    question: 'In the TCP 3-way handshake, what sequence of flag packets establishes a reliable connection?',
    options: ['SYN -> SYN-ACK -> ACK', 'ACK -> SYN -> FIN', 'RST -> SYN -> PSH', 'SYN -> ACK -> DATA'],
    correctAnswer: 0,
    explanation: 'The client sends SYN, the server replies with SYN-ACK, and the client sends ACK to complete the 3-way handshake.',
  },

  // Linux (hard)
  {
    skillName: 'Linux',
    difficulty: 'hard',
    question: 'In Linux system administration, which file maps usernames, user IDs (UID), and default login shells?',
    options: ['/etc/shadow', '/etc/passwd', '/etc/group', '/etc/hosts'],
    correctAnswer: 1,
    explanation: '/etc/passwd contains user account attributes including username, UID, primary GID, home directory, and default shell.',
  },

  // Cybersecurity Fundamentals (hard)
  {
    skillName: 'Cybersecurity Fundamentals',
    difficulty: 'hard',
    question: 'Which fundamental security principle states that users and processes should be granted only the minimum access rights necessary?',
    options: ['Defense in Depth', 'Principle of Least Privilege (PoLP)', 'Security through Obscurity', 'Separation of Environments'],
    correctAnswer: 1,
    explanation: 'The Principle of Least Privilege (PoLP) minimizes attack surface and lateral movement by granting only minimal required privileges.',
  },

  // SIEM
  {
    skillName: 'SIEM',
    difficulty: 'easy',
    question: 'What does the cybersecurity acronym SIEM stand for?',
    options: [
      'Security Information and Event Management',
      'System Internet and Encryption Module',
      'Standard Incident and Threat Evaluation Model',
      'System Intrusion and Exploit Mitigation',
    ],
    correctAnswer: 0,
    explanation: 'SIEM stands for Security Information and Event Management, combining SIM (security information management) and SEM (security event management).',
  },
  {
    skillName: 'SIEM',
    difficulty: 'medium',
    question: 'What is the primary role of a SIEM correlation engine?',
    options: [
      'To automatically format and beautify JSON logs',
      'To analyze normalized events from multiple log sources and detect multi-stage attack patterns using rules and anomalies',
      'To delete duplicate log entries to conserve disk space',
      'To encrypt server hard drives during malware outbreaks',
    ],
    correctAnswer: 1,
    explanation: 'Correlation engines aggregate events across different systems (firewalls, active directory, endpoints) to detect complex security incidents in real time.',
  },
  {
    skillName: 'SIEM',
    difficulty: 'hard',
    question: 'Which specialized query languages are widely used in enterprise SIEM platforms like Splunk and Microsoft Sentinel?',
    options: [
      'SPL (Search Processing Language) / KQL (Kusto Query Language)',
      'HTML5 DOM selectors',
      'CSS Grid queries',
      'XPath 1.0 solely',
    ],
    correctAnswer: 0,
    explanation: 'Enterprise SIEMs rely on specialized query languages like Splunk SPL or Microsoft Sentinel KQL to filter, aggregate, and alert on massive log datasets.',
  },

  // Threat Detection
  {
    skillName: 'Threat Detection',
    difficulty: 'easy',
    question: 'What is the operational difference between an Intrusion Detection System (IDS) and an Intrusion Prevention System (IPS)?',
    options: [
      'IDS alerts on suspicious activity passively; IPS actively blocks and drops malicious traffic in-line',
      'IDS is hardware only; IPS is software only',
      'IDS works only on Wi-Fi networks; IPS works on Ethernet',
      'IPS cannot inspect packet payloads',
    ],
    correctAnswer: 0,
    explanation: 'An IDS monitors traffic and generates alerts upon finding anomalies, whereas an IPS is placed in-line to actively block detected threats.',
  },
  {
    skillName: 'Threat Detection',
    difficulty: 'medium',
    question: 'What is an "Indicator of Compromise" (IoC) in cybersecurity incident response?',
    options: [
      'A digital certificate required to operate a web server',
      'Forensic evidence on a network or operating system indicating that a security breach has occurred',
      'A metric measuring software deployment velocity',
      'A hardware error causing system restarts',
    ],
    correctAnswer: 1,
    explanation: 'IoCs are forensic artifacts (malicious hashes, suspicious IP addresses, C2 domain traffic) indicating unauthorized system compromise.',
  },
  {
    skillName: 'Threat Detection',
    difficulty: 'hard',
    question: 'Which globally accessible cybersecurity framework catalogs adversary tactics, techniques, and procedures (TTPs)?',
    options: ['MITRE ATT&CK Framework', 'OWASP Top 10 solely', 'ISO 9001 Quality Framework', 'IEEE 802.11 Protocol'],
    correctAnswer: 0,
    explanation: 'The MITRE ATT&CK framework provides a matrix of real-world adversary tactics and techniques used by threat hunters and detection engineers.',
  },

  // Cryptography
  {
    skillName: 'Cryptography',
    difficulty: 'easy',
    question: 'What is the main difference between symmetric and asymmetric encryption?',
    options: [
      'Symmetric uses one shared key for encryption and decryption; asymmetric uses a public/private key pair',
      'Symmetric encryption can only encrypt text; asymmetric encrypts video',
      'Symmetric keys never expire; asymmetric keys expire in 24 hours',
      'Asymmetric encryption does not use mathematical algorithms',
    ],
    correctAnswer: 0,
    explanation: 'Symmetric cryptography uses the same secret key for both encrypting and decrypting data, while asymmetric cryptography uses mathematically paired public and private keys.',
  },
  {
    skillName: 'Cryptography',
    difficulty: 'medium',
    question: 'What essential property distinguishes a cryptographic hash function (like SHA-256) from symmetric encryption?',
    options: [
      'Hashing is a one-way deterministic mathematical function with no decryption key; encryption is reversible with the key',
      'Hashing requires internet connectivity to compute',
      'Hashes can be decrypted using the recipient private key',
      'Hashing produces variable output lengths depending on input size',
    ],
    correctAnswer: 0,
    explanation: 'A cryptographic hash is a one-way function that maps arbitrary data to a fixed-length digest, designed to be computationally infeasible to invert.',
  },
  {
    skillName: 'Cryptography',
    difficulty: 'hard',
    question: 'In TLS/HTTPS, what prevents a Man-in-the-Middle attacker from substituting a fake server public key certificate?',
    options: [
      'The Public Key Infrastructure (PKI) digital signature hierarchy verified against trusted root Certificate Authorities (CAs)',
      'The client web browser IP address',
      'The length of the HTML document',
      'DNS port randomization alone',
    ],
    correctAnswer: 0,
    explanation: 'Digital certificates are cryptographically signed by trusted Certificate Authorities whose root certificates are embedded in client operating systems and browsers.',
  },

  // Vulnerability Assessment
  {
    skillName: 'Vulnerability Assessment',
    difficulty: 'easy',
    question: 'What does the security acronym CVE stand for in vulnerability management?',
    options: ['Common Vulnerabilities and Exposures', 'Central Virtual Environment', 'Cyber Verification Engine', 'Certified Vulnerability Exploit'],
    correctAnswer: 0,
    explanation: 'CVE (Common Vulnerabilities and Exposures) is a standardized dictionary of publicly known cybersecurity vulnerabilities.',
  },
  {
    skillName: 'Vulnerability Assessment',
    difficulty: 'medium',
    question: 'What standard scoring system evaluates vulnerability severity on a numerical scale from 0.0 to 10.0?',
    options: ['CVSS (Common Vulnerability Scoring System)', 'NIST Metric Rank', 'OWASP Level', 'ISO Risk Score'],
    correctAnswer: 0,
    explanation: 'CVSS (Common Vulnerability Scoring System) produces a numerical score from 0.0 to 10.0 reflecting vulnerability severity based on attack vector, complexity, and impact.',
  },
  {
    skillName: 'Vulnerability Assessment',
    difficulty: 'hard',
    question: 'What is the operational distinction between a Vulnerability Scan and a Penetration Test?',
    options: [
      'A vulnerability scan automatedly identifies known weaknesses; a penetration test actively attempts exploitation to assess real-world business impact',
      'Vulnerability scanning requires human hackers; penetration testing is 100% automated',
      'Penetration tests are illegal without military authorization',
      'Vulnerability scans only inspect physical hardware routers',
    ],
    correctAnswer: 0,
    explanation: 'Vulnerability assessments use automated tools to catalog potential weaknesses, whereas penetration tests simulate real-world attacks by attempting exploitation.',
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
