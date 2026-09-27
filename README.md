# SkillForge

AI-Powered Skill Assessment & Career Readiness Platform

SkillForge is a full-stack platform designed to guide students and aspiring professionals toward career readiness. By combining deterministic skill gap analysis with AI-assisted insights, SkillForge helps learners assess their skills, identify gaps against real-world target career profiles, and follow actionable personalized roadmaps.

---

## Stage 8: Resume Analyzer & AI Integration

The **Resume Analyzer** enables authenticated students to upload their resumes in PDF or Word (DOCX) formats, extract text safely in memory, detect technical proficiencies case-insensitively against the system's Skill database, and compute a deterministic Resume Match Score against their target career requirements.

### Key Features

1. **Secure File Upload**:
   - Supported Formats: **PDF (`.pdf`)** and **Word (`.docx`)**
   - Maximum File Size: **5 MB**
   - In-memory processing via `multer.memoryStorage()` — uploaded files are processed transiently and discarded without permanent filesystem storage.
   - Rejection of executable files, archives, and unsupported file types with clear validation messages.

2. **Text Extraction**:
   - Fast, resilient text extraction using `pdf-parse` (for PDF documents) and `mammoth` (for DOCX documents).
   - Text normalization standardizes line breaks, collapses excess whitespace, and validates that readable text exists.

3. **Deterministic Skill Detection**:
   - Extracted text is evaluated against the existing SkillForge `Skill` library.
   - Case-insensitive, boundary-aware matching handles alphanumeric keywords and complex tokens (e.g., `Node.js`, `Express.js`, `REST APIs`, `Power BI`, `SQL`, `Python`, `C#`).
   - Duplicate detections are automatically deduplicated.

4. **Target Career Comparison**:
   - Utilizes the logged-in student's active target career profile (e.g., `Data Analyst`, `Full Stack Developer`).
   - Identifies:
     - **Matched Skills**: Required career skills confirmed present in the resume.
     - **Missing Skills**: Required career skills absent from the resume.
     - **Detected Skills**: All recognized technical skills found in the document.

5. **Deterministic Resume Match Score Formula**:
   $$\text{matchScore} = \left(\frac{\text{matched required skills}}{\text{total required skills}}\right) \times 100$$
   - Rounded to one decimal place (e.g., $4 / 7 = 57.1\%$).
   - **Important Distinction**: The *Resume Match Score* measures keyword/skill presence in a resume document. It is strictly separate from the *Career Readiness Score* (Stage 5), which evaluates verified hands-on MCQ performance.

6. **AI Integration & Graceful Fallback**:
   - Optional integration with the OpenAI API for qualitative feedback:
     - Executive resume summary
     - Actionable bullet point rewrites using action verbs and impact metrics
     - Missing-skill remediation guidance
     - Target career job search recommendations
   - **Boundary Enforcement**: AI *never* calculates or alters the official match score, career readiness score, assessment level, or skill gap classification.
   - **Graceful Fallback**: If `OPENAI_API_KEY` is omitted, invalid, or temporarily unreachable, SkillForge automatically provides deterministic, structured improvement suggestions and displays a non-blocking notification:
     > *"AI suggestions are currently unavailable. Basic resume analysis is still available."*
     The application will never crash due to AI service unavailability.

7. **Student Data Isolation & History**:
   - Each analysis record is tied to the authenticated student's account.
   - Students can view their complete resume analysis history and retrieve previous reports via `GET /api/resume/history` and `GET /api/resume/:id`. Cross-student access is strictly forbidden (HTTP 403).

8. **Dashboard Integration**:
   - A dedicated Resume Match metric card on the Student Dashboard displays the student's latest match percentage, target career, and a direct link to re-analyze or upload a new resume.

---

## Environment Variable Setup

### Server (`server/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>/skillforge?retryWrites=true&w=majority
NODE_ENV=development
JWT_SECRET=skillforge_super_secret_jwt_key_2026
JWT_EXPIRE=30d

# Optional: OpenAI API Key for AI-Assisted Resume Feedback
OPENAI_API_KEY=
```

> **Security Note**: Never commit `.env` or any production secrets to Git. The `.env` file is included in `.gitignore`.

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## API Endpoints (Resume Analyzer)

| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `POST` | `/api/resume/analyze` | Bearer Token | Uploads (PDF/DOCX) and analyzes resume against student's target career |
| `GET` | `/api/resume/latest` | Bearer Token | Returns student's most recent resume analysis report |
| `GET` | `/api/resume/history` | Bearer Token | Returns historical list of student's resume analyses |
| `GET` | `/api/resume/:id` | Bearer Token | Returns a specific analysis document (isolated to owner student) |

---

## Stage 9: Admin Dashboard & Platform Management

SkillForge Stage 9 introduces a dedicated, high-security Admin Dashboard for platform management, analytics, and content moderation.

### 1. Admin Authorization Architecture
- **Role Verification**: Admin access relies directly on `User.role === 'admin'`.
- **Backend Security Boundary**: `requireAdmin` middleware enforces authentication and admin privileges on every administrative route. Unauthorized requests from students return `HTTP 403 Forbidden`. Unauthenticated requests return `HTTP 401 Unauthorized`.
- **Frontend Protection**: Handled via `AdminProtectedRoute`, which redirects non-admin or unauthenticated users to `/dashboard` or `/login`.

### 2. Admin Management Features
- **Platform Analytics (`/admin`)**: Aggregated metrics including total students, active careers, skill catalog count, question bank size, total and completed assessments, average assessment scores, average resume match scores, and student career distribution charts using Recharts.
- **Student Management (`/admin/students`)**: Search, filter by career track, and view registered students. Sensitive fields such as passwords, password hashes, JWTs, and private resume contents are completely sanitized and never exposed.
- **Career Management (`/admin/careers`)**: Create, edit, and delete career tracks. Includes data integrity safeguards that reject deletion if a career is actively referenced by students, assessments, results, roadmaps, or resume analyses.
- **Skill Management (`/admin/skills`)**: Create, edit, and delete technical skills with duplicate name prevention and career relationship tracking.
- **Question Bank Management (`/admin/questions`)**: Filter by career, skill, and difficulty (Easy/Medium/Hard). Create and edit 4-option multiple-choice questions with answer keys and explanations. Students continue to receive questions without exposing `correctAnswer`.

### 3. Admin API Endpoints

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Admin Only | Aggregated platform metrics and distribution statistics |
| `GET` | `/api/admin/students` | Admin Only | Paginated list of registered students with search and career filters |
| `GET` | `/api/admin/careers` | Admin Only | Full careers catalog with populated required skills |
| `POST` | `/api/admin/careers` | Admin Only | Create a new career track |
| `PUT` | `/api/admin/careers/:id` | Admin Only | Update an existing career track |
| `DELETE` | `/api/admin/careers/:id` | Admin Only | Safely delete career (blocked if active dependencies exist) |
| `GET` | `/api/admin/skills` | Admin Only | Full skills catalog enriched with associated careers |
| `POST` | `/api/admin/skills` | Admin Only | Create a new technical skill (duplicate names rejected) |
| `PUT` | `/api/admin/skills/:id` | Admin Only | Update skill name, category, or description |
| `DELETE` | `/api/admin/skills/:id` | Admin Only | Safely delete skill (blocked if linked to careers or questions) |
| `GET` | `/api/admin/questions` | Admin Only | Question bank with full details and correct answers |
| `POST` | `/api/admin/questions` | Admin Only | Create a new 4-option question |
| `PUT` | `/api/admin/questions/:id` | Admin Only | Update existing question prompt, options, or explanation |
| `DELETE` | `/api/admin/questions/:id` | Admin Only | Delete question from question bank |

### 4. Development Admin Setup
To create an administrative user locally or in MongoDB Atlas without hardcoding credentials in source control:

```bash
cd server
ADMIN_EMAIL="admin@skillforge.test" ADMIN_PASSWORD="YourSecurePassword123!" node create-admin.js
```
The script securely hashes the password using bcrypt and assigns `role: "admin"`.

---

## Running the Application

### 1. Backend Server
```bash
cd server
npm install
npm run dev    # Starts server on http://localhost:5000
```

### 2. Frontend Client
```bash
cd client
npm install
npm run dev    # Starts Vite dev server on http://localhost:5173
```

### 3. Running Automated Tests
```bash
cd server
node test-stage9.js              # Stage 9 Admin Dashboard + Platform Management suite (28 tests)
node test-stage8.js              # Stage 8 Resume Analyzer + AI test suite (17 tests)
node test-atlas-persistence.js   # MongoDB Atlas persistence verification (17 checks)
node test-mvp-fixes.js           # MVP UX + Functionality test suite (46 tests)
node test-stage7.js              # Stage 7 Dashboard regression tests (30 tests)
node test-stage6.js              # Stage 6 Roadmap regression tests
node test-stage5.js              # Stage 5 Skill Gap regression tests
node test-stage4.js              # Stage 4 Assessment regression tests
node test-stage3.js              # Stage 3 Careers & Skills regression tests
```

### 4. Building the Frontend for Production
```bash
cd client
npm run build
```

