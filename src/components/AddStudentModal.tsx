import { useState } from 'react';

type Props = {
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  addStudent: () => void;
  onClose: () => void;
};

function AddStudentModal({ name, setName, email, setEmail, addStudent, onClose }: Props) {
  const [triedSubmit, setTriedSubmit] = useState(false);
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const canSubmit = trimmedName.length > 0 && trimmedEmail.length > 0;

  function handleAdd() {
    setTriedSubmit(true);
    if (!canSubmit) return;
    addStudent();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="add-title">
        <h2 id="add-title">Add student</h2>

        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Archana"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
          />
        </label>
        {triedSubmit && !trimmedName && (
          <p className="field-error">Name is required</p>
        )}

        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="archana@email.com"
            type="email"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
          />
        </label>
        {triedSubmit && !trimmedEmail && (
          <p className="field-error">Email is required — fill this to add</p>
        )}

        <div className="modal-actions">
          <button type="button" className="ghost-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="primary-btn" onClick={handleAdd}>
            Add
          </button>
        </div>

        {!canSubmit && (
          <p className="field-hint">Enter both name and email, then press Add</p>
        )}
      </div>
    </div>
  );
}

export default AddStudentModal;
