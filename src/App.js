import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please upload a file first');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'https://mockinterviewbackend.onrender.com/upload-resume',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setKeywords(response.data.keywords);
    } catch (err) {
      setError('Error uploading the file');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatMessage) return;

    const newChatHistory = [
      ...chatHistory,
      { role: 'user', content: chatMessage },
    ];
    setChatHistory(newChatHistory);

    try {
      const response = await axios.post(
        'https://mockinterviewbackend.onrender.com/chat',
        {
          message: chatMessage,
          resumeKeywords: keywords,
        }
      );

      setChatHistory([
        ...newChatHistory,
        {
          role: 'assistant',
          content: response.data.response,
        },
      ]);
      setChatMessage('');
    } catch (err) {
      console.error('Error during chat:', err);
    }
  };

  return (
    <div className='app-container'>
      <h1>
        Resume Keywords Extractor & Technical Interviewer
      </h1>
      <input
        type='file'
        accept='.pdf'
        onChange={handleFileChange}
      />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload Resume'}
      </button>
      {error && <div className='error'>{error}</div>}
      {keywords.length > 0 && (
        <div className='keywords-container'>
          <h2>Extracted Keywords</h2>
          <ul>
            {keywords.map((keyword, index) => (
              <li key={index}>{keyword}</li>
            ))}
          </ul>
        </div>
      )}

      {keywords.length > 0 && (
        <div className='chat-container'>
          <h2>Technical Interview Chat</h2>
          <div className='chat-history'>
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`chat-message ${chat.role}`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {chat.content}
                </ReactMarkdown>
              </div>
            ))}
          </div>
          <textarea
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder='Ask a question...'
          ></textarea>
          <button onClick={handleChatSubmit}>Send</button>
        </div>
      )}
    </div>
  );
}

export default App;
