import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Build.css';

const Build = () => {
  const [fileName, setFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');  // State to track upload status
  const fileInput = useRef(null);  // this is for the file input reference

  //file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName('');
    }
  };

  // Handle file upload to the backend
  const handleUploadClick = () => {
    const formData = new FormData();
    if (fileInput.current && fileInput.current.files[0]) {
      formData.append('file', fileInput.current.files[0]);

      console.log('Uploading file:', fileInput.current.files[0]);  // Debugging stuff

      // fetch('http://127.0.0.1:8000/file/upload/', {//for the cloud replace with 'http://137.184.141.237/api/file/upload/'
      fetch('http://137.184.141.237/api/file/upload/', {
        method: 'POST',
        body: formData,
      })
      .then(response => {
        console.log('Full response:', response);  // Log the full response for debugging
        return response.json();
      })
      .then(data => {
        console.log('Parsed data:', data);  // Log the parsed data
        if (data.status === 'success') {
          setUploadStatus('File uploaded and processed successfully!');
        } else {
          setUploadStatus(`Error: ${data.message}`);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setUploadStatus('Error occurred while uploading the file.');
      });
    } else {
      console.error('No file selected');
      setUploadStatus('No file selected');
    }
  };

  return (
    <div className="home-container">
      <header className="header">
        <img src="logo.png" alt="Linka Logo" className="logo" />
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/dashboards" className="nav-link">My Dashboards</Link>
          <Link to="/build" className="nav-link">Build</Link>
        </nav>
      </header>

      <div className="build-container">
        <h1>Upload Your CSV File</h1>
        <div className="upload-section">
          <input 
            type="file" 
            ref={fileInput} 
            onChange={handleFileChange} 
            accept=".csv"
            className="file-input"
          />
        </div>

        <button onClick={handleUploadClick} className="upload-button">
          Upload File
        </button>

        {/* Success/Error message*/}
        {uploadStatus && (
          <div className={`upload-status ${uploadStatus.includes('successfully') ? 'success' : 'error'}`}>
            {uploadStatus}
          </div>
        )}
      </div>

      {fileName && (
        <div className="file-info">
          <h3>Uploaded file: {fileName}</h3>
        </div>
      )}
    </div>
  );
};

export default Build;
