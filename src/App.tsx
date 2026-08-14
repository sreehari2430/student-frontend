import { useState, useEffect } from 'react';
import './App.css';
import AddStudentModal from './components/AddStudentModal';
import LoginModal from './components/LoginModal';
import EditStudentModal from './components/EditStudentModal';
import HeartbeatSurprise from './components/HeartbeatSurprise';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [students, setStudents] = useState<{ name: string; email: string }[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [editingStudent, setEditingStudent] = useState<{ name: string; email: string } | null>(null);
  const [showHeartbeat, setShowHeartbeat] = useState(false);
  const [heartbeatName, setHeartbeatName] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [justAddedEmail, setJustAddedEmail] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/student`)
      .then(response => response.json())
      .then(data => setStudents(Array.isArray(data) ? data : []))
      .catch(error => console.error('Error:', error));
  }, []);

  function addStudent() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail) {
      return;
    }

    fetch(`${API_URL}/student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmedName, email: trimmedEmail }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Failed to add student (${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        if (!data || typeof data !== 'object' || !data.email) {
          throw new Error('Invalid response from server');
        }
        setStudents((prev) => [...prev, data]);
        setName('');
        setEmail('');
        setShowAddModal(false);
        setJustAddedEmail(data.email);

        const addedName = String(data.name ?? '').trim();
        if (addedName.toLowerCase() === 'archana') {
          setToast('Wait… I have something for you, Archana.');
          window.setTimeout(() => {
            setToast(null);
            setHeartbeatName(addedName);
            setShowHeartbeat(true);
          }, 1400);
        } else {
          setToast(`${addedName} was added to the roster.`);
          window.setTimeout(() => setToast(null), 3500);
        }

        window.setTimeout(() => setJustAddedEmail(null), 3500);
      })
      .catch((error) => {
        console.error('Error:', error);
        window.alert(error instanceof Error ? error.message : 'Could not add student');
      });
  }

  function login() {
    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then(response => response.text())
      .then(data => {
        setToken(data);
        setShowLoginModal(false);
        setUsername('');
        setPassword('');
      });
  }

  function deleteStudent(email: string) {
    fetch(`${API_URL}/student?email=${email}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(() => {
        setStudents(students.filter(student => student.email !== email));
      });
  }

  function updateStudent(updated: { name: string; email: string }) {
    fetch(`${API_URL}/student`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updated),
    })
      .then(response => response.json())
      .then(data => {
        setStudents(students.map(s => (s.email === data.email ? data : s)));
        setEditingStudent(null);
      });
  }

  return (
    <div className="app">
      <div className="aurora aurora--a" aria-hidden="true" />
      <div className="aurora aurora--b" aria-hidden="true" />
      <div className="aurora aurora--c" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      <div className="shell">
        <div className="system-bar">
          <span className="system-bar__pulse" aria-hidden="true" />
          <span>Link // Active</span>
          <span className="system-bar__divider" aria-hidden="true" />
          <span>Node // Roster</span>
          <span className="system-bar__divider" aria-hidden="true" />
          <span>{token ? 'Auth // Granted' : 'Auth // Guest'}</span>
          <span className="system-bar__divider" aria-hidden="true" />
          <button
            type="button"
            className="system-bar__secret"
            onClick={() => setShowHeartbeat(true)}
          >
            Signal // Heartbeat
          </button>
        </div>

        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">Ops Console</div>
            <h1>Student Manager</h1>
            <p>Keep your roster clear — add people, then sign in to edit or remove them.</p>
          </div>

          {token ? (
            <button className="auth-btn is-out" onClick={() => setToken(null)}>
              Log out
            </button>
          ) : (
            <button className="auth-btn" onClick={() => setShowLoginModal(true)}>
              Log in
            </button>
          )}
        </header>

        <section
          className="panel"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
            e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
          }}
        >
          <div className="panel-corners" aria-hidden="true">
            <span />
            <span />
          </div>
          <div className="panel-head">
            <h2>
              Roster
              <span className="count" key={students.length}>{students.length}</span>
            </h2>
            <button
              type="button"
              className="primary-btn"
              onClick={() => setShowAddModal(true)}
            >
              Add student
            </button>
          </div>

          {students.length === 0 ? (
            <div className="empty">
              <span>Awaiting data</span>
              <strong>No students yet</strong>
              Add the first person to get the list started.
            </div>
          ) : (
            <ul className="student-list">
              {students.map((student, index) => (
                <li
                  className={`student-row${justAddedEmail === student.email ? ' is-new' : ''}`}
                  key={student.email}
                  style={{ animationDelay: `${80 + index * 55}ms` }}
                >
                  <span className="student-index">{String(index + 1).padStart(2, '0')}</span>
                  <div className="student-meta">
                    <span className="student-name">{student.name}</span>
                    <span className="student-email">{student.email}</span>
                  </div>
                  {token && (
                    <div className="row-actions">
                      <button className="ghost-btn" onClick={() => setEditingStudent(student)}>
                        Edit
                      </button>
                      <button className="danger-btn" onClick={() => deleteStudent(student.email)}>
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {showAddModal && (
        <AddStudentModal
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          addStudent={addStudent}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showLoginModal && (
        <LoginModal
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          login={login}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          updateStudent={updateStudent}
          onClose={() => setEditingStudent(null)}
        />
      )}

      {showHeartbeat && (
        <HeartbeatSurprise
          initialName={heartbeatName ?? undefined}
          onClose={() => {
            setShowHeartbeat(false);
            setHeartbeatName(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
