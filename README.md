# Attendance Management System (AMS) - Contact Center Portal

A modern, light-themed, and human-centered **Attendance & Shift Management Dashboard** tailored specifically for Contact Center operations, agents, and team leaders.

---

## 🚀 Key Modules & Features

- **Role-Based Portals**:
  - **Agent Workspace**: Personal duty schedules, live shift tracker, glanceable remaining hours, break interval allocations, and shift swap proposals.
  - **Team Leader Portal**: Master roster oversight, live team radar (Active On-Duty tracking), and 1-click clearance for shift swaps.
- **Master Contact Center Roster**:
  - **Weekly View (Master Matrix)**: Complete staff duty grid (`7:00 AM - 3:00 PM`, `8:00 AM - 4:00 PM`, `1:00 PM - 10:00 PM`, `4:00 PM - 8:00 AM`, `Off`, `Night Off`).
  - **Daily View (Break Intervals)**: Detailed daily allocations with exact interval timings (`Tea 1`, `Tea 2`, `Lunch / Dinner`, `Night Rest`, `Morning Break`).
  - **Interactive Controls**: Live search by name or SVN, filter by Center (`CO`, `KY`, `MH`, `PR`, `BW`, `BC`, `KE`, `KT`), and 1-click CSV export.
- **Shift Swap Hub**:
  - **Available Swaps**: Colleague trade proposals with 1-click Accept / Decline.
  - **My Swap Requests**: 3-step progress tracker (*Sent to Colleague* → *Colleague Response* → *Team Leader Sign-off*).
  - **Smart Swap Modal**: Colleague search by name with automated 11-Hour Rest Window conflict check.
- **"What's Your Excuse?" (Downtime Logger)**:
  - 4-Category chips: `System / PC Issue`, `Training / Exam`, `Meeting`, `Break Issue`.
  - Preset duration chips (`+15 mins`, `+30 mins`, `+45 mins`, `+1 hour`) with custom minute inputs.
  - Category-based filterable activity timeline recorded directly for supervisor visibility.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Soft Slate Neutral Palette, `#F8FAFC`)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State & Data**: REST APIs (`/api/users`, `/api/shifts`, `/api/swaps`, `/api/excuses`, `/api/notifications`)

---

## 🏁 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/kudagama/AMS.git
cd AMS
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📄 License
Internal Contact Center Operations System.
