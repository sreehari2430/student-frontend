import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [students, setStudents] = useState<
    { name: string; email: string }[]
  >([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const HER_NAME = 'archana';

  const isHer = name.trim().toLowerCase() === HER_NAME;

  useEffect(() => {
    fetch('https://student-management-02vn.onrender.com/student')
      .then(response => response.json())
      .then(data => setStudents(data))
      .catch(error => console.error('Error:', error));
  }, []);

  function addStudent() {
    fetch('https://student-management-02vn.onrender.com/student', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        email: email,
      }),
    })
      .then(response => response.json())
      .then(data => {
        setStudents([...students, data]);
        setName('');
        setEmail('');
      })
      .catch(error => console.error('Error:', error));
  }

  return (
    <div className="container">
      <h1>Student Manager</h1>

      <ul>
        {students.map((student, index) => (
          <li className="list-item" key={index}>
            {student.name} - {student.email}
          </li>
        ))}
      </ul>

      <div className="form">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />

        <button onClick={addStudent} disabled={isHer}>
          Add
        </button>
      </div>

      {isHer && (
        <div className="hearts-container">
          <div className="love-message">
            You're already in etta's heart, so you can't be added here 💕
          </div>

          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="heart"
              style={{
                left: `${Math.random() * 90}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            >
              ❤️
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;