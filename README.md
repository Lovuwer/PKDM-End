# Pallikoodam Teacher Portal

A comprehensive portal for Pallikoodam faculty and administrators to manage class assignments, generate AI-powered yearly lesson plans, and track weekly academic progress.

## Features

- **Teacher Dashboard**: Monitor class assignments and view the status of weekly/yearly plans.
- **Yearly Plans & AI Syllabus Parsing**: Upload ICSE syllabus PDFs and use Gemini-powered AI to automatically parse chapters and map them across academic weeks.
- **Weekly Plans (Google Calendar-style)**: Visual, drag-and-drop planning interface for submitting weekly learning objectives and teaching methodologies.
- **Administrator Dashboard**: Overview of all faculty completions. Assign multiple faculty members to specific subjects and batches seamlessly.
- **Bulk Import**: Ability to import hundreds of Teacher/Subject assignments via CSV or XLSX.

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

1. **Node.js** (v18 or higher recommended)
2. **PostgreSQL** (Or simply rely on the provided Railway cloud database URL)
3. **Environment Setup** (Create a `.env` file at the root)

---

### Environment Variables

Your `.env` file should include the following. Modify the database URL if you are connecting to a local instance rather than the production database.

```bash
# Prisma Database Connection
DATABASE_URL="postgres://<YOUR_POSTGRES_USER>:<YOUR_POSTGRES_PASS>@<HOST>:<PORT>/<DATABASE_NAME>"

# Admin Portal Credentials
ADMIN_USERNAME="Administrator"
ADMIN_PASSWORD="BEIN1801"

# Gemini AI API Key (Required for PDF Syllabus Parsing)
GEMINI_API_KEY="AIzaSyB07px2slJzCoMPA9ODTwuGUFl34xJDY_U"
```

---

### Installation & Setup

1. **Clone the repository and install dependencies:**

   ```bash
   npm install
   ```

2. **Generate the Prisma Client:**

   This ensures your local Prisma client syncs with the Database Schema:

   ```bash
   npx prisma generate
   ```

3. **Push the Schema to Database:**
   
   If you have a fresh database and want to push the tables:

   ```bash
   npx prisma db push
   ```

4. **Seed the Database (Optional):**

   Seed classes, admins, and some default teachers.

   ```bash
   npm run seed
   # or
   npx prisma db seed
   ```

5. **Run the Development Server:**

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the portal.

---

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Directory)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL (Hosted on Railway)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI Integration**: [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) (Gemini 3 Fast)

---

## Deployment (Railway)

We highly recommend deploying this via [Railway](https://railway.app/).

1. Connect your GitHub repository to Railway.
2. Ensure you provision a PostgreSQL DB on Railway and link it.
3. Add the aforementioned Environment Variables into Railway.
4. Set the Build Command: `npm run build`
5. Set the Start Command: `npm start` (or `npx prisma db push && next start` for auto-migrations).

Your deployment will be live instantly!
