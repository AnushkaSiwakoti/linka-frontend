import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import Papa from 'papaparse';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './Build.css';
import Navbar from './Navbar';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const Build = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [charts, setCharts] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [tableSize, setTableSize] = useState({ width: '70%', height: '400px' });
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
      setFileUploaded(true);
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
    if (charts.some((chart) => chart.type === 'bar' && chart.chartType === chartType)) {
      return;
    }

    const barChartData = {
      labels: data.map((row) => row[classification.categoricalColumns[0]] || 'Unknown'),
      datasets: [
        {
          label: chartType,
          data: data.map((row) => parseFloat(row[chartType]) || 0),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
    setCharts((prevCharts) => [...prevCharts, { type: 'bar', chartType, data: barChartData }]);
  };

  const handleShowPieChart = () => {
    if (charts.some((chart) => chart.type === 'pie')) {
      return;
    }

    const pieChartData = {
      labels: Array.from(new Set(data.map((row) => row[classification.categoricalColumns[0]] || 'Unknown'))),
      datasets: [
        {
          label: 'Pie Chart',
          data: Array.from(new Set(data.map((row) => row[classification.categoricalColumns[0]] || 'Unknown'))).map((category) =>
            data.filter((row) => (row[classification.categoricalColumns[0]] || 'Unknown') === category).length
          ),
          backgroundColor: ['rgba(255,99,132,0.6)', 'rgba(54,162,235,0.6)', 'rgba(255,206,86,0.6)', 'rgba(75,192,192,0.6)', 'rgba(153,102,255,0.6)', 'rgba(255,159,64,0.6)'],
          borderColor: 'rgba(255,255,255,1)',
          borderWidth: 1,
        },
      ],
    };
    setCharts((prevCharts) => [...prevCharts, { type: 'pie', chartType: 'Pie Chart', data: pieChartData }]);
  };

  const handleShowLineChart = (chartType) => {
    if (charts.some((chart) => chart.type === 'line' && chart.chartType === chartType)) {
      return;
    }

    const lineChartData = {
      labels: data.map((row) => row[classification.categoricalColumns[0]] || 'Unknown'),
      datasets: [
        {
          label: chartType,
          data: data.map((row) => parseFloat(row[chartType]) || 0),
          borderColor: 'rgba(75,192,192,1)',
          borderWidth: 2,
          fill: false,
        },
      ],
    };
    setCharts((prevCharts) => [...prevCharts, { type: 'line', chartType, data: lineChartData }]);
  };

  const handleShowTable = () => {
    setShowTable(true);
  };

  const handleTableSizeChange = (e) => {
    const { name, value } = e.target;
    setTableSize((prevSize) => ({ ...prevSize, [name]: value }));
  };

  const handleNewFileUpload = () => {
    setSelectedFile(null);
    setColumns([]);
    setData([]);
    setCharts([]);
    setError(null);
    setFileUploaded(false);
    setShowTable(false);
  };

  const classifyColumns = () => {
    const numericalColumns = columns.filter((column) => {
      return data.every((row) => !isNaN(parseFloat(row[column])));
    });
    const categoricalColumns = columns.filter((column) => !numericalColumns.includes(column));
    setClassification({ numericalColumns, categoricalColumns });
  };

  const handleNextPage = () => {
    setPageIndex((prev) => Math.min(prev + 1, Math.floor(data.length / pageSize)));
  };

  const handlePreviousPage = () => {
    setPageIndex((prev) => Math.max(prev - 1, 0));
  };

  const currentPageData = data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  return (
    <div className="build-page">
      <Navbar isLoggedIn={true} handleLogout={() => {}} />

      <div className="build-content">
        {/* Sidebar Section */}
        <div className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`} style={{ marginRight: '50px' }}>
          <button className="toggle-btn" onClick={toggleSidebar}>{isSidebarExpanded ? '⬅' : '➡'}</button>
          <div className="sidebar-content">
            <button className="sidebar-button" onClick={handleNewFileUpload}>
              🔄 <span className="sidebar-label">{isSidebarExpanded && 'Upload New File'}</span>
            </button>
            <button className="sidebar-button" onClick={handleShowTable}>
              📋 <span className="sidebar-label">{isSidebarExpanded && 'Show Table'}</span>
            </button>
            {classification.numericalColumns.map((column) => (
              <React.Fragment key={column}>
                <button className="sidebar-button" onClick={() => handleShowBarChart(column)}>📊 <span className="sidebar-label">{isSidebarExpanded && `${column} Bar Chart`}</span></button>
                <button className="sidebar-button" onClick={() => handleShowLineChart(column)}>📈 <span className="sidebar-label">{isSidebarExpanded && `${column} Line Chart`}</span></button>
              </React.Fragment>
            ))}
            {classification.categoricalColumns.length > 0 && (
              <button className="sidebar-button" onClick={handleShowPieChart}>🥧 <span className="sidebar-label">{isSidebarExpanded && 'Pie Chart'}</span></button>
            )}
            <button className="sidebar-button" disabled>📉 <span className="sidebar-label">{isSidebarExpanded && 'Metrics (Coming Soon)'}</span></button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`main-container ${isSidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
          {!fileUploaded && (
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
          )}

          <div className="chart-and-table-container" style={{ position: 'relative', height: '100%', padding: '0' }}>
            {/* Draggable Table */}
            {showTable && (
              <Draggable bounds=".chart-and-table-container" defaultPosition={{ x: 0, y: 0 }}>
                <div className="table-draggable" style={{ width: tableSize.width, height: tableSize.height }}>
                  <div className="table-section">
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
                    <div className="pagination-controls">
                      <label htmlFor="pageSize">Rows per page:</label>
                      <select id="pageSize" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                      <button onClick={handlePreviousPage} disabled={pageIndex === 0}>
                        Previous
                      </button>
                      <button onClick={handleNextPage} disabled={(pageIndex + 1) * pageSize >= data.length}>
                        Next
                      </button>
                    </div>
                    <div className="table-resize-controls">
                      <label>Width:</label>
                      <input type="range" name="width" min="30%" max="100%" value={tableSize.width} onChange={handleTableSizeChange} />
                      <label>Height:</label>
                      <input type="range" name="height" min="200px" max="600px" value={tableSize.height} onChange={handleTableSizeChange} />
                    </div>
                  </div>
                </div>
              </Draggable>
            )}

            {/* Draggable Charts */}
            {charts.length > 0 && charts.map((chart, index) => (
              <Draggable key={index} bounds=".chart-and-table-container" defaultPosition={{ x: 20 * index, y: 100 + 20 * index }}>
                <div className="chart-box-small" style={{ width: barChartSize.width, height: barChartSize.height }}>
                  <h2 className="chart-box-title">{chart.chartType}</h2>
                  {chart.type === 'bar' && <Bar data={chart.data} options={barChartOptions} />}
                  {chart.type === 'pie' && <Pie data={chart.data} />}
                  {chart.type === 'line' && <Line data={chart.data} options={lineChartOptions} />}
                </div>
              </Draggable>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const barChartOptions = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Bar Chart',
    },
  },
};

const lineChartOptions = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Line Chart',
    },
  },
};

export default Build;
