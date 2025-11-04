const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'students.json');

//students from file
function readStudents() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
}

// students to file
function saveStudents(students) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
}

// GET students 
app.get('/students', (req, res) => {
  const { course } = req.query;
  let students = readStudents();

  if (course) {
    students = students.filter(s => s.course.toLowerCase() === course.toLowerCase());
  }

  students.sort((a, b) => a.name.localeCompare(b.name));

  res.json(students);
});

// GET get a single student
app.get('/students/:id', (req, res) => {
  const students = readStudents();
  const student = students.find(s => s.id === parseInt(req.params.id));

  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  res.json(student);
});

// POST add a new student
app.post('/students', (req, res) => {
  const { name, age, course } = req.body;

  if (!name || !course) {
    return res.status(400).json({ error: 'Name and course are required' });
  }

  const students = readStudents();
  const newId = students.length ? Math.max(...students.map(s => s.id)) + 1 : 1;

  const newStudent = { id: newId, name, age: age || null, course };
  students.push(newStudent);
  saveStudents(students);

  res.status(201).json(newStudent);
});

// PUT update student info
app.put('/students/:id', (req, res) => {
  const { name, age, course } = req.body;

  if (!name || !course) {
    return res.status(400).json({ error: 'Name and course are required' });
  }

  const students = readStudents();
  const index = students.findIndex(s => s.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }

  students[index] = { ...students[index], name, age, course };
  saveStudents(students);

  res.json(students[index]);
});

// DELETE remove a student
app.delete('/students/:id', (req, res) => {
  const students = readStudents();
  const index = students.findIndex(s => s.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const removed = students.splice(index, 1)[0];
  saveStudents(students);

  res.json({ message: 'Student deleted successfully', student: removed });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
