import { useState } from 'react';

type Props = {
  student: { name: string; email: string };
  updateStudent: (updated: { name: string; email: string }) => void;
  onClose: () => void;
};

function EditStudentModal({ student, updateStudent, onClose }: Props) {
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="edit-title">
        <h2 id="edit-title">Edit student</h2>

        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" autoFocus />
        </label>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
        </label>

        <div className="modal-actions">
          <button className="ghost-btn" onClick={onClose}>Cancel</button>
          <button className="primary-btn" onClick={() => updateStudent({ name, email })}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default EditStudentModal;
