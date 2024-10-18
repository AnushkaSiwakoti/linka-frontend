import React, { useState, useRef, useEffect } from 'react';
import { Chart } from 'chart.js';
import { Link } from 'react-router-dom'; 
import Papa from 'papaparse'; 
import './Build.css';

const Build = () => {
  const [visualizations, setVisualizations] = useState([]);
  const [columns, setColumns] = useState([]);
  const [sampleData, setSampleData] = useState([]);
  const [dashboard, setDashboard] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const chartRefs = useRef([]);
  const fileInput = useRef(null);

  // Show sidebar if visualizations are available
  useEffect(() => {
    if (visualizations.length > 0) {
      setSidebarVisible(true);
    }
  }, [visualizations]);

  const fetchAndParseCsv = (csvUrl) => {
    fetch(csvUrl)
      .then((response) => {
        console.log("Fetching CSV file from URL:", csvUrl);
        return response.text();
      })
      .then((csvText) => {
        console.log("CSV Text received:", csvText);
        // Parse CSV
        const parsedCsv = Papa.parse(csvText, { header: true });
        const parsedColumns = parsedCsv.meta.fields;
        const parsedData = parsedCsv.data;
  
        console.log("Parsed Columns:", parsedColumns);
        console.log("Parsed Data:", parsedData);
  
        // Set state with parsed columns and data
        setColumns(parsedColumns);
        setSampleData(parsedData);
  
        // Generate visualizations
        const generatedVisualizations = parsedColumns.map((col) => {
          const isNumeric = !isNaN(parsedData[0][col]);
          return {
            column: col,
            suggested_visualizations: isNumeric ? ['BarChart', 'LineChart'] : ['Table'],
          };
        });
  
        setVisualizations(generatedVisualizations);
      })
      .catch((error) => console.error('Error fetching or parsing CSV:', error));
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      console.log("File selected:", e.target.files[0].name);
    }
  };

  const handleUploadClick = () => {
    const formData = new FormData();
    if (fileInput.current && fileInput.current.files[0]) {
      formData.append('file', fileInput.current.files[0]);

      fetch('http://127.0.0.1:8000/file/upload/', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === 'success') {
            console.log("Processing file from URL:", data.file_url);
            fetchAndParseCsv(data.file_url);  // Fetch and parse the CSV file directly for visualization
          } else {
            console.error("Error from backend:", data.message);
          }
        })
        .catch((error) => {
          console.error('Error during file upload:', error);
        });
    }
  };

  const handleAddToDashboard = (viz) => {
    setDashboard([...dashboard, viz]);
  };

  // Render the charts after the dashboard is updated
  useEffect(() => {
    dashboard.forEach((viz, idx) => {
      const ctx = chartRefs.current[idx];
      if (ctx && ctx.getContext) {
        const context = ctx.getContext('2d');

        if (viz.suggested_visualizations.includes('BarChart')) {
          new Chart(context, {
            type: 'bar',
            data: {
              labels: columns.length ? columns : [],
              datasets: [
                {
                  label: viz.column,
                  data: sampleData.map((row) => row[viz.column]),
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1,
                },
              ],
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            },
          });
        } else if (viz.suggested_visualizations.includes('LineChart')) {
          new Chart(context, {
            type: 'line',
            data: {
              labels: columns.length ? columns : [],
              datasets: [
                {
                  label: viz.column,
                  data: sampleData.map((row) => row[viz.column]),
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1,
                },
              ],
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            },
          });
        }
      }
    });
  }, [dashboard, columns, sampleData]);

  const renderVisualization = (viz, idx) => {
    if (viz.suggested_visualizations.includes('Table')) {
      return (
        <div className="dashboard-table">
          <h3>{viz.column}</h3>
          <table className="data-table">
            <thead>
              <tr>{columns.length ? columns.map((col, colIdx) => <th key={colIdx}>{col}</th>) : null}</tr>
            </thead>
            <tbody>
              {sampleData.length ? sampleData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.length ? columns.map((col, colIndex) => (
                    <td key={colIndex}>{row[col]}</td>
                  )) : null}
                </tr>
              )) : null}
            </tbody>
          </table>
        </div>
      );
    } else if (viz.suggested_visualizations.includes('BarChart')) {
      return <canvas id={`bar-chart-${viz.column}`} ref={(el) => (chartRefs.current[idx] = el)}></canvas>;
    } else if (viz.suggested_visualizations.includes('LineChart')) {
      return <canvas id={`line-chart-${viz.column}`} ref={(el) => (chartRefs.current[idx] = el)}></canvas>;
    }
    return null;
  };

  return (
    <div className="build-page">
      <header className="header">
        <img src="logo.png" alt="Linka Logo" className="logo" />
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/dashboards" className="nav-link">My Dashboards</Link>
          <Link to="/build" className="nav-link">Build</Link>
        </nav>
      </header>

      <div className="main-content">
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

          {/* Sample Data Section */}
          {sampleData.length > 0 && (
            <div className="sample-data-section">
              <h2>Sample Data Preview</h2>
              <table className="sample-data-table">
                <thead>
                  <tr>{columns.length ? columns.map((col, idx) => <th key={idx}>{col}</th>) : null}</tr>
                </thead>
                <tbody>
                  {sampleData.length ? sampleData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {columns.length ? columns.map((col, colIndex) => (
                        <td key={colIndex}>{row[col]}</td>
                      )) : null}
                    </tr>
                  )) : null}
                </tbody>
              </table>
            </div>
          )}

          {/* Dashboard Layout */}
          <div className="dashboard-layout">
            {dashboard.map((viz, idx) => (
              <div key={idx} className="dashboard-item">
                {renderVisualization(viz, idx)}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        {sidebarVisible && (
          <div className={`sidebar ${sidebarVisible ? 'visible' : 'hidden'}`}>
            <h2>Visualization Tools</h2>
            <ul className="tool-list">
              {visualizations.length ? visualizations.map((viz, idx) => (
                <li 
                  key={idx} 
                  className="tool-item" 
                  onClick={() => handleAddToDashboard(viz)}
                >
                  <span className="tool-icon">📊</span> {viz.column} - {viz.suggested_visualizations.join(', ')}
                </li>
              )) : null}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Build;
