# Employee Resignation Management System

A full-stack application for managing employee resignations and exit interviews with separate interfaces for HR and Employees.

## Features

### For Employees:
- Submit resignation requests with intended last working day and reason
- View status of resignation requests (Pending, Approved, Rejected)
- Complete exit interview questionnaires after resignation approval
- Receive email notifications for resignation status updates

### For HR:
- View all resignation requests
- Approve or reject resignation requests
- Set exit dates for approved resignations
- Review exit interview responses
- Dashboard with statistics and pending actions

## Technology Stack

### Backend:
- Node.js & Express
- JWT Authentication
- Nodemailer for email notifications
- Calendarific API for holiday validation
- In-memory database (can be replaced with real database)

### Frontend:
- React 18
- React Router for navigation
- Axios for API calls
- Context API for state management

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Calendarific API key (free tier available at https://calendarific.com/)

## Installation & Setup

### 1. Clone/Navigate to Project Directory

```bash
cd resignation-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory with the following:

```env
PORT=3001
JWT_SECRET=your_jwt_secret_key_here_change_in_production
CALENDARIFIC_API_KEY=your_calendarific_api_key

# Nodemailer Configuration (Update with real credentials)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
EMAIL_FROM=noreply@company.com
```

**Important:** To use Gmail for sending emails:
1. Enable 2-factor authentication on your Google account
2. Generate an "App Password" from Google Account settings
3. Use the app password (not your regular password) in EMAIL_PASSWORD

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Get Calendarific API Key

1. Visit https://calendarific.com/
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to the backend `.env` file

## Running the Application

### Start Backend Server (Terminal 1)

```bash
cd backend
npm start
```

Backend will run on http://localhost:3001

### Start Frontend Development Server (Terminal 2)

```bash
cd frontend
npm start
```

Frontend will run on http://localhost:3000

## Default Login Credentials

### HR Account:
- Username: `admin`
- Password: `admin`

### Employee Accounts:
- Username: `john.doe`, Password: `password123`
- Username: `jane.smith`, Password: `password123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Resignations
- `POST /api/resignations` - Submit resignation (Employee)
- `GET /api/resignations` - Get all resignations (HR) or own resignations (Employee)
- `GET /api/resignations/:id` - Get specific resignation
- `PATCH /api/resignations/:id/approve` - Approve resignation (HR)
- `PATCH /api/resignations/:id/reject` - Reject resignation (HR)

### Exit Interviews
- `POST /api/exit-interviews` - Submit exit interview (Employee)
- `GET /api/exit-interviews` - Get all exit interviews (HR) or own (Employee)
- `GET /api/exit-interviews/:id` - Get specific exit interview
- `GET /api/exit-interviews/resignation/:resignationId` - Get by resignation ID
- `PATCH /api/exit-interviews/:id/review` - Mark as reviewed (HR)

## Application Flow

1. **Employee** logs in and submits a resignation request with:
   - Intended last working day (must be a weekday, not a holiday)
   - Reason for resignation

2. **HR** receives notification and reviews the request in the system

3. **HR** can either:
   - Approve the resignation and set an exit date
   - Reject the resignation with a reason

4. **Employee** receives email notification about the decision

5. If approved, **Employee** can access and complete the exit interview questionnaire

6. **HR** can review completed exit interviews and mark them as reviewed

## Business Rules

- Last working day cannot be on weekends (Saturday/Sunday)
- Last working day cannot be on public holidays (validated via Calendarific API)
- Employee can only have one pending resignation at a time
- Exit interview can only be completed for approved resignations
- Only one exit interview per resignation

## Testing

To run Cypress tests (if available):

```bash
cd assessment
npm install
npx cypress run
```

## Project Structure

```
resignation-app/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── resignations.js
│   │   └── exitInterviews.js
│   ├── services/
│   │   ├── emailService.js
│   │   └── holidayService.js
│   ├── database.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Login.js
    │   │   ├── Dashboard.js
    │   │   ├── EmployeeHome.js
    │   │   ├── HRHome.js
    │   │   ├── SubmitResignation.js
    │   │   ├── MyResignations.js
    │   │   ├── ExitInterview.js
    │   │   ├── AllResignations.js
    │   │   └── AllExitInterviews.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## Notes

- This application uses an in-memory database. All data will be lost when the server restarts.
- For production use, integrate with a real database (MongoDB, PostgreSQL, etc.)
- Email functionality requires valid SMTP credentials
- The Calendarific API has rate limits on the free tier

## Troubleshooting

### Backend won't start
- Check if port 3001 is already in use
- Verify all environment variables are set correctly
- Ensure npm packages are installed

### Frontend won't start
- Check if port 3000 is already in use
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Email notifications not working
- Verify SMTP credentials in .env
- For Gmail, ensure you're using an App Password, not your regular password
- Check if less secure app access is enabled (or use App Password)

### Holiday validation failing
- Verify Calendarific API key is valid
- Check API rate limits
- Ensure internet connection is available

## License

This project is for educational/assessment purposes.
