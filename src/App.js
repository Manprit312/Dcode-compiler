// App.js

import React, { useState } from 'react';
import axios from 'axios';
import GoogleMapReact from 'google-map-react';

const AnyReactComponent = ({ text }) => <div className='red' style={{
  color: 'white', 
  background: 'red',
  padding: '15px 10px',
  display: 'inline-flex',
  textAlign: 'center',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '100%',
  transform: 'translate(-50%, -50%)'
}}>{text}</div>;
function App() {
    const [language, setLanguage] = useState('solidity');
    const [code, setCode] = useState('');
    const [difficulty, setDifficulty] = useState('easy');
    const [result, setResult] = useState(null);

    const handleSubmit = async () => {
        try {
            const response = await axios.post('http://localhost:5000/submit_code', { language, code, difficulty });
            setResult(response.data);
        } catch (error) {
            console.error('Error submitting code:', error);
            
        }
    };
    const defaultProps = {
      center: {
        lat: 10.99835602,
        lng: 77.01502627
      },
      zoom: 11
    };
  
    return (
      <div className="code-submission-container">
      <h1>{language.toLocaleUpperCase() +" " + "COMPILER"}</h1>
      <div className="input-container">
          <label htmlFor="language-select">Select Language:</label>
          <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="solidity">Solidity</option>
              <option value="rust">Rust</option>
         
          </select>
          <label htmlFor="difficulty-select">Select Difficulty:</label>
          <select id="difficulty-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
          </select>
      </div>

      <div >
          <label htmlFor="code-textarea">Enter Code:</label>
          <textarea id="code-textarea" value={code} onChange={(e) => setCode(e.target.value)} rows={10} cols={50}></textarea>
      </div>
     
      <button  className="submitbut" onClick={handleSubmit}>Submit</button>
      {result && (
          <div className="result-container">
              <p>Status: {result.status}</p>
              {result.points && <p>Points: {result.points}</p>}
              {result.error && <p>Error: {result.error}</p>}
          </div>
          
      )}
       
  </div>
  
    );
}

export default App;
