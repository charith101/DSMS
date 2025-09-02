import React, { useState } from 'react';

export default function ChatBot({ onCommand }) {
  const [input, setInput] = useState('');

  const handleCommand = () => {
    const cmd = input.toLowerCase();
    if (cmd.includes('book') || cmd.includes('appointment')) onCommand('appointments');
    else if (cmd.includes('timetable') || cmd.includes('schedule')) onCommand('timetable');
    else if (cmd.includes('reschedule')) onCommand('reschedule');
    else if (cmd.includes('attendance')) onCommand('attendance');
    else if (cmd.includes('notification')) onCommand('notifications');
    else if (cmd.includes('history')) onCommand('studentHistory');
    setInput('');
  };

  return (
    <div className="container mt-3">
      <div className="input-group">
        <input
          value={input}
          placeholder="Type a command e.g. 'book class'"
          onChange={(e) => setInput(e.target.value)}
          className="form-control"
        />
        <button onClick={handleCommand} className="btn btn-primary">
          Go
        </button>
      </div>
    </div>
  );
}
