import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './Build.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Build = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [showBarChart, setShowBarChart] = useState(false);
  const [activeChart, setActiveChart] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [classification, setClassification] = useState({ numericalColumns: [], categoricalColumns: [] });
  const [barChartSize, setBarChartSize] = useState({ width: '50%', height: '300px' });

  useEffect(() => {
    if (columns.length > 0) {
      classifyColumns();
    }
  }, [columns]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setError(null);
  };

  const parseCSV = (file) => {
    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: handleParseComplete,
      error: handleParseError,
    });
  };

  const handleParseComplete = (result) => {
    setLoading(false);
    if (result.errors.length) {
      setError('Error parsing CSV file. Please check the file format.');
      return;
    }
    const parsedData = result.data;
    if (parsedData.length > 0) {
      const columnHeaders = Object.keys(parsedData[0]);
      setColumns(columnHeaders);
      setData(parsedData);
    } else {
      setError('No data found in the uploaded CSV file.');
    }
  };

  const handleParseError = (error) => {
    setLoading(false);
    setError('Error reading file: ' + error.message);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    parseCSV(selectedFile);
  };

  const handleShowBarChart = (chartType) => {
    setShowBarChart(true);
    setActiveChart(chartType);
  };

  const handleNewFileUpload = () => {
    setSelectedFile(null);
    setColumns([]);
    setData([]);
    setShowBarChart(false);
    setError(null);
    setActiveChart(null);
  };

  const classifyColumns = () => {
    const numericalColumns = columns.filter((column) => {
      return data.every((row) => !isNaN(parseFloat(row[column])));
    });
    const categoricalColumns = columns.filter((column) => !numericalColumns.includes(column));
    setClassification({ numericalColumns, categoricalColumns });
  };

  const { numericalColumns, categoricalColumns } = classification;

  const barChartData = activeChart && numericalColumns.includes(activeChart) ? {
    labels: data.map((row) => row[categoricalColumns[0]] || 'Unknown'),
    datasets: [
      {
        label: activeChart,
        data: data.map((row) => parseFloat(row[activeChart]) || 0),
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
      },
    ],
  } : null;

  const barChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: activeChart ? `${activeChart} Chart` : '',
      },
    },
  };

  const handleNextPage = () => {
    setPageIndex((prev) => Math.min(prev + 1, Math.floor(data.length / pageSize)));
  };

  const handlePreviousPage = () => {
    setPageIndex((prev) => Math.max(prev - 1, 0));
  };

  const currentPageData = data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  const handleBarChartSizeChange = (e) => {
    const { name, value } = e.target;
    setBarChartSize((prevSize) => ({ ...prevSize, [name]: value }));
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

      <div className="build-content">
        {/* Sidebar Section */}
        <div className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`} style={{ marginRight: '50px' }}>
          <button className="toggle-btn" onClick={toggleSidebar}>{isSidebarExpanded ? '⬅' : '➡'}</button>
          <div className="sidebar-content">
            <button className="sidebar-button" onClick={handleNewFileUpload}>
              🔄 <span className="sidebar-label">{isSidebarExpanded && 'Upload New File - Upload a different CSV file'}</span>
            </button>
            {numericalColumns.map((column) => (
              <button key={column} className="sidebar-button" onClick={() => handleShowBarChart(column)}>📊 <span className="sidebar-label">{isSidebarExpanded && `${column} Bar Chart - Visualize ${column} data distribution`}</span></button>
            ))}
            {categoricalColumns.length > 0 && (
              <button className="sidebar-button" disabled>🥧 <span className="sidebar-label">{isSidebarExpanded && 'Pie Chart (Coming Soon) - Visualize categorical data'}</span></button>
            )}
            <button className="sidebar-button" disabled>📉 <span className="sidebar-label">{isSidebarExpanded && 'Metrics (Coming Soon) - Analyze key metrics'}</span></button>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-container" style={{ marginLeft: '60px' }}>
          {!showBarChart ? (
            <>
              <div className="upload-container">
                <h1>Upload Your CSV File</h1>
                <input type="file" onChange={handleFileChange} accept=".csv" className="file-input" />
                <div className="upload-btn-container">
                  <button onClick={handleUpload} disabled={!selectedFile} className="upload-btn">
                    Upload File
                  </button>
                </div>
                {error && <div className="error-message">{error}</div>}
                {loading && <div className="loading-message">Loading...</div>}
              </div>
              {columns.length > 0 && (
                <div className="table-section" style={{ marginTop: '80px', marginBottom: '80px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        {columns.map((column, index) => (
                          <th key={index}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentPageData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {columns.map((column, colIndex) => (
                            <td key={colIndex}>{row[column]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pagination-controls" style={{ marginTop: '40px' }}>
                    <button onClick={handlePreviousPage} disabled={pageIndex === 0} className="pagination-button">
                      Previous
                    </button>
                    <span className="pagination-span">
                      Page {pageIndex + 1} of {Math.ceil(data.length / pageSize)}
                    </span>
                    <button onClick={handleNextPage} disabled={(pageIndex + 1) * pageSize >= data.length} className="pagination-button">
                      Next
                    </button>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="pagination-select"
                    >
                      {[10, 20, 30, 40, 50].map((size) => (
                        <option key={size} value={size}>
                          Show {size}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="chart-box-small" style={{ width: barChartSize.width, height: barChartSize.height, margin: '80px auto 80px 60px' }}>
                <h2 className="chart-box-title">{activeChart} Bar Chart</h2>
                {activeChart && barChartData && <Bar data={barChartData} options={barChartOptions} />}
                <div className="chart-size-controls" style={{ marginTop: '40px' }}>
                  <label>
                    Width:
                    <input
                      type="text"
                      name="width"
                      value={barChartSize.width}
                      onChange={handleBarChartSizeChange}
                    />
                  </label>
                  <label>
                    Height:
                    <input
                      type="text"
                      name="height"
                      value={barChartSize.height}
                      onChange={handleBarChartSizeChange}
                    />
                  </label>
                </div>
              </div>
              {columns.length > 0 && (
                <div className="table-section" style={{ marginTop: '80px', marginBottom: '80px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        {columns.map((column, index) => (
                          <th key={index}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentPageData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {columns.map((column, colIndex) => (
                            <td key={colIndex}>{row[column]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pagination-controls" style={{ marginTop: '40px' }}>
                    <button onClick={handlePreviousPage} disabled={pageIndex === 0} className="pagination-button">
                      Previous
                    </button>
                    <span className="pagination-span">
                      Page {pageIndex + 1} of {Math.ceil(data.length / pageSize)}
                    </span>
                    <button onClick={handleNextPage} disabled={(pageIndex + 1) * pageSize >= data.length} className="pagination-button">
                      Next
                    </button>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="pagination-select"
                    >
                      {[10, 20, 30, 40, 50].map((size) => (
                        <option key={size} value={size}>
                          Show {size}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Build;
