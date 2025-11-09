# Job Listing Platform

A comprehensive backend application for job listing and recruitment management, powered by AI-driven resume matching and intelligent job recommendations.

## 🚀 Features

### 👥 User Management
- **Dual Role System**: Support for both regular users (job seekers) and companies (recruiters)
- **User Registration & Authentication**: Secure user registration and login system
- **Google OAuth Integration**: Social authentication via Google
- **User Profiles**: Manage user profiles with skills, location, bio, and profile pictures
- **Company Profiles**: Dedicated company profiles for recruiters

### 💼 Job Management
- **Job Posting**: Create detailed job listings with:
  - Job title, description, and company information
  - Skills requirements
  - Job type (Full-Time, Part-Time, Contract, Internship, Freelance, Temporary)
  - Location and salary range
  - Responsibilities, requirements, and benefits
  - Maximum applicant limits
- **Job Filtering & Search**: Advanced filtering by:
  - Job type
  - Location
  - Title/company name
  - Date posted
  - Custom filters
- **Job Management**: 
  - Update existing job postings
  - Close job listings
  - Archive jobs
  - View company-specific job listings
- **AI-Powered Embeddings**: Jobs are automatically embedded using Google Gemini for semantic search and matching

### 📄 Resume Management
- **Resume Upload**: Upload PDF resumes via file upload
- **PDF Parsing**: Automatic extraction of text content from PDF resumes using PDF.js
- **Resume Storage**: Secure storage of resumes on AWS S3
- **Resume Tracking**: Track all submitted resumes with application status

### 🤖 AI-Powered Features

#### Intelligent Job Matching
- **Resume-Job Matching**: AI-powered analysis comparing resumes against job descriptions
- **Match Analysis**: Provides:
  - Match percentage (0-100%)
  - Matched skills identification
  - Missing skills identification
  - Detailed summary explaining the match
- **Google Gemini Integration**: Uses Gemini 2.5 Flash for intelligent analysis
- **Vector Embeddings**: Semantic search using embedding vectors for better matching

#### AI Job Recommendations
- **Personalized Recommendations**: Get AI-powered job recommendations based on user profile and resume
- **Semantic Similarity**: Uses cosine similarity to find the most relevant jobs

### 📊 Application Tracking
- **Application Status Management**: Track applications through multiple stages:
  - Pending
  - ShortListed
  - Interview
  - Rejected
  - Accepted
- **Applicant Management**: 
  - Shortlist candidates
  - Accept/reject applicants
  - Schedule interviews with date and URL
- **Submitted Resumes View**: View all resumes submitted for a specific job

### 🔖 Bookmarking System
- **Save Jobs**: Bookmark interesting jobs for later review
- **Bookmark Management**: 
  - Add/remove bookmarks
  - View all bookmarked jobs
  - Check if a job is bookmarked

### 📅 Interview Management
- **Interview Scheduling**: Schedule interviews with candidates
- **Interview Details**: Store interview URL and date
- **Interview Tracking**: Track all scheduled interviews

### ⚙️ Technical Features

#### Background Processing
- **Queue System**: Uses BullMQ with Redis for background job processing
- **Asynchronous Matching**: Resume-job matching processed asynchronously
- **Worker System**: Dedicated workers for:
  - Job matching processing
  - Resume submission processing
- **Retry Logic**: Automatic retry with exponential backoff for failed jobs

#### File Management
- **AWS S3 Integration**: Secure file storage and retrieval
- **Presigned URLs**: Generate secure, time-limited URLs for file access
- **File Upload**: Support for multipart file uploads using Multer

#### Security & Performance
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Configurable CORS settings
- **Request Compression**: Response compression for better performance
- **Role-Based Authorization**: Middleware for role-based access control

#### Database & Caching
- **MongoDB**: NoSQL database using Prisma ORM
- **Redis**: Caching and queue management
- **Prisma ORM**: Type-safe database access with auto-generated types

#### Logging & Monitoring
- **Structured Logging**: Pino logger for application logging
- **Error Handling**: Comprehensive error handling and reporting

## 🛠️ Tech Stack

### Core Technologies
- **Node.js**: Runtime environment
- **TypeScript**: Type-safe JavaScript
- **Express.js**: Web framework
- **Prisma**: ORM for database management
- **MongoDB**: Database

### AI & ML
- **Google Gemini AI**: AI-powered analysis and embeddings
- **Vector Embeddings**: Semantic search capabilities
- **Cosine Similarity**: Similarity calculations

### Infrastructure
- **AWS S3**: File storage
- **Redis**: Caching and queue management
- **BullMQ**: Job queue management

### Libraries & Tools
- **PDF.js**: PDF parsing
- **Multer**: File upload handling
- **bcryptjs**: Password hashing
- **Zod**: Schema validation
- **Pino**: Logging

## 📁 Project Structure

```
backend/
├── src/
│   ├── ai/              # AI integration (Gemini)
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── libs/            # Utility libraries
│   ├── middleware/      # Express middleware
│   ├── queue/           # Queue definitions
│   ├── repository/      # Data access layer
│   ├── routes/          # API routes
│   ├── services/       # Business logic
│   ├── utils/           # Utility functions
│   └── workers/         # Background workers
├── prisma/              # Database schema
└── package.json
```

## 🔌 API Endpoints

### User Endpoints
- `POST /api/v1/users` - Create user
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/google-oauth` - Google OAuth
- `GET /api/v1/users/:id` - Get user
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/companies` - Get all companies
- `PUT /api/v1/users/:id` - Update user profile
- `POST /api/v1/users/upload-resume` - Upload resume
- `GET /api/v1/users/:id/applied-jobs` - Get applied jobs

### Job Endpoints
- `POST /api/v1/jobs` - Create job
- `GET /api/v1/jobs` - Get all jobs (with filters)
- `GET /api/v1/jobs/:id` - Get job by ID
- `GET /api/v1/jobs/company/:id` - Get company jobs
- `PUT /api/v1/jobs/:id` - Update job
- `PUT /api/v1/jobs/:id/close` - Close job
- `POST /api/v1/jobs/submit-resume` - Submit resume for job
- `GET /api/v1/jobs/:id/submitted-resumes` - Get submitted resumes
- `GET /api/v1/jobs/:id/ai-recommendations` - Get AI recommendations
- `PUT /api/v1/jobs/shortlist/:id` - Shortlist applicant
- `PUT /api/v1/jobs/accept/:id` - Accept applicant
- `POST /api/v1/jobs/interview` - Schedule interview

### Match Endpoints
- `POST /api/v1/match/:id` - Match resume with job
- `GET /api/v1/match/:id` - Get user matches

### Bookmark Endpoints
- `POST /api/v1/bookmarks` - Add bookmark
- `GET /api/v1/bookmarks/:id` - Get bookmark
- `GET /api/v1/bookmarks/user/:id` - Get user bookmarks
- `GET /api/v1/bookmarks/job/:id` - Get bookmarked jobs
- `DELETE /api/v1/bookmarks/:id` - Delete bookmark

## 🔐 Environment Variables

Required environment variables:
- `DATABASE_URL` - MongoDB connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region
- `AWS_S3_BUCKET` - S3 bucket name
- `REDIS_URL` - Redis connection string

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Redis
- AWS S3 account
- Google Gemini API key

### Installation

1. Clone the repository
2. Install dependencies:
```bash
cd backend
npm install
```

3. Set up environment variables in `.env` file

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Run database migrations:
```bash
npx prisma migrate dev
```

6. Start the server:
```bash
npm start
```

The server will run on port 5000 by default.

## 📝 Database Schema

### Models
- **User**: User accounts (both job seekers and companies)
- **Job**: Job listings
- **Resume**: Uploaded resumes
- **Match**: Resume-job matches with AI analysis
- **Bookmark**: Saved jobs
- **Interview**: Scheduled interviews

## 🔄 Background Workers

The application uses background workers for:
- **Job Matching**: Processes resume-job matching asynchronously
- **Resume Processing**: Handles resume parsing and analysis

Workers automatically retry failed jobs with exponential backoff.

## 🎯 Use Cases

1. **Job Seekers**:
   - Browse and search jobs
   - Upload resume
   - Get AI-powered job recommendations
   - Match resume with specific jobs
   - Track application status
   - Bookmark interesting jobs

2. **Companies/Recruiters**:
   - Post job listings
   - Receive applications
   - View AI-analyzed resume matches
   - Shortlist, accept, or reject candidates
   - Schedule interviews
   - Manage job postings

## 🔒 Security Features

- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Role-based access control
- Secure file storage with presigned URLs
- Input validation with Zod

## 📈 Performance Optimizations

- Response compression
- Background job processing
- Redis caching
- Efficient database queries with Prisma
- Asynchronous processing for heavy operations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC

---

Built with ❤️ using Node.js, TypeScript, and AI

