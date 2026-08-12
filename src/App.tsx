import { useState, useEffect } from 'react';

function App() {

  const [students, setStudents] = useState<{ name: string, email: string }[]>([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch('https://student-management-02vn.onrender.com/student')
      .then(response => response.json())
      .then(data => setStudents(data));
  }, []);

  function addStudent() {
    fetch('https://student-management-02vn.onrender.com/student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email }),
    })
      .then(response => response.json())
      .then(data => {
        setStudents([...students, data])
        setName('')
        setEmail('')
      });
  }

  return (
    <div>
      <h1>firsttyyyy</h1>
      
      <ul>
        {students.map((student, index) => (
          <li key={index}>{student.name} - {student.email}</li>
        ))}
      </ul>

      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <button onClick={addStudent}>Add</button>
    </div>
  );
}

export default App;