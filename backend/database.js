const bcrypt = require('bcryptjs');

// In-memory database
const db = {
  users: [],
  resignations: [],
  exitInterviews: []
};

// Initialize with HR admin account and some sample employees
const initializeDatabase = async () => {
  const hashedPassword = await bcrypt.hash('admin', 10);
  
  // HR Admin account
  db.users.push({
    id: '1',
    username: 'admin',
    password: hashedPassword,
    email: 'admin@company.com',
    role: 'HR',
    name: 'Admin User',
    country: 'US'
  });

  // Sample employees
  const empPassword = await bcrypt.hash('password123', 10);
  
  db.users.push({
    id: '2',
    username: 'john.doe',
    password: empPassword,
    email: 'john.doe@company.com',
    role: 'Employee',
    name: 'John Doe',
    country: 'US'
  });

  db.users.push({
    id: '3',
    username: 'jane.smith',
    password: empPassword,
    email: 'jane.smith@company.com',
    role: 'Employee',
    name: 'Jane Smith',
    country: 'IN'
  });
};

// Database operations
const getUsers = () => db.users;
const getUserById = (id) => db.users.find(u => u.id === id);
const getUserByUsername = (username) => db.users.find(u => u.username === username);
const addUser = (user) => {
  db.users.push(user);
  return user;
};

const getResignations = () => db.resignations;
const getResignationById = (id) => db.resignations.find(r => r.id === id);
const getResignationsByEmployeeId = (employeeId) => db.resignations.filter(r => r.employeeId === employeeId);
const addResignation = (resignation) => {
  db.resignations.push(resignation);
  return resignation;
};
const updateResignation = (id, updates) => {
  const index = db.resignations.findIndex(r => r.id === id);
  if (index !== -1) {
    db.resignations[index] = { ...db.resignations[index], ...updates };
    return db.resignations[index];
  }
  return null;
};

const getExitInterviews = () => db.exitInterviews;
const getExitInterviewById = (id) => db.exitInterviews.find(e => e.id === id);
const getExitInterviewByResignationId = (resignationId) => db.exitInterviews.find(e => e.resignationId === resignationId);
const addExitInterview = (exitInterview) => {
  db.exitInterviews.push(exitInterview);
  return exitInterview;
};
const updateExitInterview = (id, updates) => {
  const index = db.exitInterviews.findIndex(e => e.id === id);
  if (index !== -1) {
    db.exitInterviews[index] = { ...db.exitInterviews[index], ...updates };
    return db.exitInterviews[index];
  }
  return null;
};

module.exports = {
  initializeDatabase,
  getUsers,
  getUserById,
  getUserByUsername,
  addUser,
  getResignations,
  getResignationById,
  getResignationsByEmployeeId,
  addResignation,
  updateResignation,
  getExitInterviews,
  getExitInterviewById,
  getExitInterviewByResignationId,
  addExitInterview,
  updateExitInterview
};
