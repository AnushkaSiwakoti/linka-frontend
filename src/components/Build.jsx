import React, { useState, useEffect, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { useLocation } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Build.css';
import Navbar from './Navbar';
import Footer from './Footer';
import { 
  useDataProcessing, 
  ChartOptionsPanel, 
  TableFilters, 
  DraggableComponent 
} from './ComponentProcessing';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Chart colors array
const chartColors = [
  'rgba(54, 162, 235, 0.8)',   // blue
  'rgba(255, 99, 132, 0.8)',   // red
  'rgba(75, 192, 192, 0.8)',   // green
  'rgba(153, 102, 255, 0.8)',  // purple
  'rgba(255, 159, 64, 0.8)',   // orange
  'rgba(255, 206, 86, 0.8)',   // yellow
  'rgba(199, 199, 199, 0.8)',  // gray
  'rgba(83, 102, 255, 0.8)',   // indigo
  'rgba(255, 99, 255, 0.8)',   // pink
  'rgba(159, 159, 64, 0.8)',   // olive
];


// Data filtering function
const getFilteredData = (data, filters) => {
  let filteredData = [...data];

  // Apply search filter
  if (filters.searchText) {
    const searchLower = filters.searchText.toLowerCase();
    filteredData = filteredData.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchLower)
      )
    );
  }

  // Apply column filters
  filters.activeFilters.forEach(filter => {
    filteredData = filteredData.filter(row => {
      const value = row[filter.column];
      const filterValue = filter.value;

      switch (filter.operator) {
        case '=':
          return String(value) === filterValue;
        case '>':
          return Number(value) > Number(filterValue);
        case '<':
          return Number(value) < Number(filterValue);
        case '>=':
          return Number(value) >= Number(filterValue);
        case '<=':
          return Number(value) <= Number(filterValue);
        case 'between':
          const [min, max] = filterValue.split(',').map(Number);
          return Number(value) >= min && Number(value) <= max;
        case 'contains':
          return String(value).toLowerCase().includes(filterValue.toLowerCase());
        case 'starts with':
          return String(value).toLowerCase().startsWith(filterValue.toLowerCase());
        case 'ends with':
          return String(value).toLowerCase().endsWith(filterValue.toLowerCase());
        default:
          return true;
      }
    });
  });

  // Apply sorting
  if (filters.sortColumn) {
    filteredData.sort((a, b) => {
      const aVal = a[filters.sortColumn];
      const bVal = b[filters.sortColumn];
      
      if (!isNaN(aVal) && !isNaN(bVal)) {
        return filters.sortDirection === 'asc' 
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      }
      
      return filters.sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }

  return filteredData;
};

// Common chart options
const commonChartOptions = {
  maintainAspectRatio: false,
  responsive: true,
  animation: false,
  plugins: {
    legend: {
      position: 'top',
      labels: { color: '#fff' }
    }
  }
};

const barChartOptions = {
  ...commonChartOptions,
  plugins: {
    ...commonChartOptions.plugins,
    title: { display: true, text: 'Bar Chart', color: '#fff' }
  },
  scales: {
    x: { 
      ticks: { color: '#fff' },
      grid: { color: 'rgba(255,255,255,0.1)' }
    },
    y: { 
      ticks: { color: '#fff' },
      grid: { color: 'rgba(255,255,255,0.1)' }
    }
  }
};

const lineChartOptions = {
  ...commonChartOptions,
  plugins: {
    ...commonChartOptions.plugins,
    title: { display: true, text: 'Line Chart', color: '#fff' }
  },
  scales: {
    x: { 
      ticks: { color: '#fff' },
      grid: { color: 'rgba(255,255,255,0.1)' }
    },
    y: { 
      ticks: { color: '#fff' },
      grid: { color: 'rgba(255,255,255,0.1)' }
    }
  }
};

const Build = () => {
  // State variables
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [charts, setCharts] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [classification, setClassification] = useState({
    numericalColumns: [],
    categoricalColumns: [],
    dateColumns: []
  });
  const [filterRanges, setFilterRanges] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeComponentId, setActiveComponentId] = useState(null);
  const [tableFilters, setTableFilters] = useState({
    searchText: '',
    columnFilters: {},
    sortColumn: null,
    sortDirection: 'asc',
    activeFilters: [],
    rowsPerPage: 10,
  });
  const [chartOptions, setChartOptions] = useState({
    showPercentageChange: false,
    showYOYChange: false,
    showMovingAverage: false,
    showGrowthRate: false,
    showCumulativeSum: false,
    dateColumn: '',
    movingAveragePeriod: 3
  });

  const containerRef = useRef(null);
  const { processChartData, detectDateColumns } = useDataProcessing(data, columns);

  // Initial setup and auth check
  useEffect(() => {
    const loggedInUser = localStorage.getItem('username');
    if (loggedInUser) {
      setIsLoggedIn(true);
    }
  }, []);

  // Column classification
  const classifyColumns = useCallback(() => {
    const numericalColumns = columns.filter((column) =>
      data.every((row) => !isNaN(parseFloat(row[column])))
    );
    const dateColumns = detectDateColumns();
    const categoricalColumns = columns.filter(
      (column) => !numericalColumns.includes(column) && !dateColumns.includes(column)
    );
    
    setClassification({ numericalColumns, categoricalColumns, dateColumns });
  }, [columns, data, detectDateColumns]);

  useEffect(() => {
    if (columns.length > 0) {
      classifyColumns();
    }
  }, [columns, classifyColumns]);

  // File handling
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


const [dashboardName, setDashboardName] = useState(''); // State for the dashboard name

// Modified save function with conflict resolution
const saveDashboard = async () => {
  try {
    // Create dashboard data object
    const dashboardData = {
      name: dashboardName, // Use the user-provided dashboard name
      state: {
        charts,
        filterRanges,
        pageIndex,
        showTable,
        columns,
        data,
        tableFilters,
        chartOptions,
        classification,
      },
    };
    if (!dashboardName) {
      alert('Please enter a name for the dashboard before saving.');
      return;
    }

    // Convert dashboard data to JSON string
    const jsonData = JSON.stringify(dashboardData);
    const contentLength = new Blob([jsonData]).size;
    

    // Make API call to save the dashboard
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/dashboards/save/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': contentLength, // Adding content length to the headers
      },
      credentials: 'include', // Crucial for sending and receiving cookies
      body: jsonData,
    });

    // Handle response
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to save dashboard: ${errorMessage}`);
    }

    const responseData = await response.json(); // renamed variable
    alert('Dashboard saved successfully!');
  } catch (error) {
    console.error('Error:', error);
    alert(`Error saving dashboard: ${error.message}`);
  }
};

 // Modified Chart Generation
const handleShowBarChart = (chartType) => {
  if (charts.some((chart) => chart.type === 'bar' && chart.chartType === chartType)) {
    return;
  }

  const processedData = processChartData(chartType, chartOptions);
  
  const barChartData = {
    labels: processedData.map((row) => row[classification.categoricalColumns[0]] || 'Unknown'),
    datasets: [
      {
        label: chartType,
        data: processedData.map((row) => parseFloat(row[chartType]) || 0),
        backgroundColor: chartColors[0],
        borderColor: chartColors[0].replace('0.8', '1'),
        borderWidth: 1,
        barThickness: 40,  // Makes bars thicker for better visibility
        maxBarThickness: 60, // Ensures bars can expand but not excessively
      },
      ...(chartOptions.showPercentageChange ? [{
        label: `${chartType} % Change`,
        data: processedData.map((row) => row[`${chartType}_pct_change`] || 0),
        type: 'line',
        borderColor: chartColors[1],
        borderWidth: 2,
        fill: false,
      }] : []),
      ...(chartOptions.showYOYChange ? [{
        label: `${chartType} YoY Change`,
        data: processedData.map((row) => row[`${chartType}_yoy_change`] || 0),
        type: 'line',
        borderColor: chartColors[2],
        borderWidth: 2,
        fill: false,
      }] : []),
      ...(chartOptions.showMovingAverage ? [{
        label: `${chartType} ${chartOptions.movingAveragePeriod} Period MA`,
        data: processedData.map((row) => 
          row[`${chartType}_ma${chartOptions.movingAveragePeriod}`] || 0
        ),
        type: 'line',
        borderColor: chartColors[3],
        borderWidth: 2,
        fill: false,
      }] : []),
      ...(chartOptions.showGrowthRate ? [{
        label: `${chartType} Growth Rate`,
        data: processedData.map((row) => row[`${chartType}_growth_rate`] || 0),
        type: 'line',
        borderColor: chartColors[4],
        borderWidth: 2,
        fill: false,
      }] : []),
      ...(chartOptions.showCumulativeSum ? [{
        label: `${chartType} Cumulative Sum`,
        data: processedData.map((row) => row[`${chartType}_cumsum`] || 0),
        type: 'line',
        borderColor: chartColors[5],
        borderWidth: 2,
        fill: false,
      }] : []),
    ],
  };

  const enhancedBarChartOptions = {
    ...barChartOptions,
    layout: {
      padding: {
        top: 20,
        bottom: 20,
      },
    },
    scales: {
      x: {
        ...barChartOptions.scales.x,
        title: {
          display: true,
          text: 'Categories',
          color: '#fff',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        ticks: {
          font: {
            size: 10, // Smaller font size for category names to fit better
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        ...barChartOptions.scales.y,
        title: {
          display: true,
          text: chartType,
          color: '#fff',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        beginAtZero: true, // Starts Y-axis from zero for better clarity
        max: Math.max(...processedData.map((row) => parseFloat(row[chartType]) || 0)) * 1.2, // Adds vertical space to make the chart bigger
      },
    },
    plugins: {
      ...barChartOptions.plugins,
      tooltip: {
        mode: 'index',
        intersect: false, // Makes tooltips easier to see by activating them for all elements at that index
      },
      legend: {
        ...barChartOptions.plugins.legend,
        position: 'bottom',
      },
    },
    maintainAspectRatio: false, // Makes the chart larger within its container
    responsive: true,
  };

  setCharts((prevCharts) => [
    ...prevCharts,
    { type: 'bar', chartType, data: barChartData, options: enhancedBarChartOptions },
  ]);
};

  const handleShowLineChart = (chartType) => {
    if (charts.some((chart) => chart.type === 'line' && chart.chartType === chartType)) {
      return;
    }

    const processedData = processChartData(chartType, chartOptions);

    const lineChartData = {
      labels: processedData.map((row) => row[classification.categoricalColumns[0]] || 'Unknown'),
      datasets: [
        {
          label: chartType,
          data: processedData.map((row) => parseFloat(row[chartType]) || 0),
          borderColor: chartColors[0],
          backgroundColor: chartColors[0].replace('0.8', '0.1'),
          borderWidth: 2,
          fill: true,
        },
        // Add similar datasets as in handleShowBarChart for other options
      ],
    };

    const enhancedLineChartOptions = {
      ...lineChartOptions,
      maintainAspectRatio: false,
      responsive: true,
    };

    setCharts((prevCharts) => [
      ...prevCharts,
      { type: 'line', chartType, data: lineChartData, options: enhancedLineChartOptions },
    ]);
  };

  const handleShowPieChart = () => {
    if (charts.some((chart) => chart.type === 'pie')) {
      return;
    }

    const categories = Array.from(
      new Set(data.map((row) => row[classification.categoricalColumns[0]] || 'Unknown'))
    );

    const pieChartData = {
      labels: categories,
      datasets: [
        {
          data: categories.map(
            (category) =>
              data.filter(
                (row) => (row[classification.categoricalColumns[0]] || 'Unknown') === category
              ).length
          ),
          backgroundColor: chartColors.slice(0, categories.length),
          borderColor: '#fff',
          borderWidth: 1,
        },
      ],
    };

    const enhancedPieChartOptions = {
      ...commonChartOptions,
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        ...commonChartOptions.plugins,
        title: { 
          display: true, 
          text: 'Distribution',
          color: '#fff'
        }
      }
    };

    setCharts((prevCharts) => [
      ...prevCharts,
      { type: 'pie', chartType: 'Category Distribution', data: pieChartData, options: enhancedPieChartOptions },
    ]);
  };

  const handleFilterRangeChange = (chartType, values) => {
    setFilterRanges(prev => ({ ...prev, [chartType]: values }));
    
    const start = values[0];
    const end = values[1] + 1;
    
    setCharts(prevCharts => 
      prevCharts.map(chart => {
        if (chart.chartType === chartType) {
          const processedData = processChartData(chartType, chartOptions);
          const filteredProcessedData = processedData.slice(start, end);
          
          const updatedData = {
            ...chart.data,
            labels: filteredProcessedData.map(
              row => row[classification.categoricalColumns[0]] || 'Unknown'
            ),
            datasets: chart.data.datasets.map(dataset => ({
              ...dataset,
              data: filteredProcessedData.map(row => 
                parseFloat(row[dataset.label.split(' ')[0]]) || 0
              ),
            })),
          };
  
          return {
            ...chart,
            data: updatedData,
          };
        }
        return chart;
      })
    );
  };

  
  // Component handlers
  const handleDeleteComponent = (type, index = null) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === 'table') {
        setShowTable(false);
      } else if (type === 'chart' && index !== null) {
        setCharts((prevCharts) => prevCharts.filter((_, i) => i !== index));
      }
      setActiveComponentId(null);
    }
  };

  return (
    <div className="build-page">
      <Navbar 
        isLoggedIn={isLoggedIn} 
        handleLogout={() => {
          localStorage.removeItem('username');
          setIsLoggedIn(false);
        }} 
      />

      <div className="build-content" ref={containerRef}>
        <img src="/shapes.png" alt="background shapes" className="background-image" />

        {fileUploaded && (
          <div className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}>

            <button 
              className="toggle-btn" 
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            >
              {isSidebarExpanded ? '⬅' : '➡'}
            </button>
            <div className="sidebar-content">
            <div className="dashboard-name-input">
              <input
                type="text"
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                placeholder="Enter Dashboard Name"
                className="dashboard-name-field"
              />
            </div>
              <button 
                className="sidebar-button" 
                onClick={() => window.location.reload()}
              >
                🔄 <span className="sidebar-label">
                  {isSidebarExpanded && 'Upload New File'}
                </span>
              </button>
              
              <button 
                className="sidebar-button" 
                onClick={() => setShowTable(true)}
              >
                📋 <span className="sidebar-label">
                  {isSidebarExpanded && 'Show Table'}
                </span>
              </button>

              {classification.numericalColumns.map((column) => (
                <React.Fragment key={column}>
                  <button
                    className="sidebar-button"
                    onClick={() => handleShowBarChart(column)}
                  >
                    📊 <span className="sidebar-label">
                      {isSidebarExpanded && `${column} Bar Chart`}
                    </span>
                  </button>
                  <button
                    className="sidebar-button"
                    onClick={() => handleShowLineChart(column)}
                  >
                    📈 <span className="sidebar-label">
                      {isSidebarExpanded && `${column} Line Chart`}
                    </span>
                  </button>
                </React.Fragment>
              ))}
              
              {classification.categoricalColumns.length > 0 && (
                <button 
                  className="sidebar-button" 
                  onClick={handleShowPieChart}
                >
                  🥧 <span className="sidebar-label">
                    {isSidebarExpanded && 'Category Distribution'}
                  </span>
                </button>
              )}
              <button 
                className="sidebar-button" 
                onClick={saveDashboard}
              >
                💾 <span className="sidebar-label">
                  {isSidebarExpanded && 'Save Dashboard'}
                </span>
              </button>
            </div>
          </div>
        )}

        <div className={`main-container ${isSidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
          {!fileUploaded ? (
            <div className="upload-container">
              <h1>Upload Your CSV File</h1>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".csv"
                className="file-input"
              />
              <div className="upload-btn-container">
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || loading}
                  className="upload-btn"
                >
                  {loading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
              {error && <div className="error-message">{error}</div>}
              {loading && <div className="loading-message">Processing file...</div>}
            </div>
          ) : (
            <div 
              className="chart-and-table-container" 
              onClick={() => setActiveComponentId(null)}
            >
              {showTable && (
                <DraggableComponent
                  isActive={activeComponentId === 'table'}
                  onActivate={() => setActiveComponentId('table')}
                  onDelete={() => handleDeleteComponent('table')}
                  defaultSize={{ width: 700, height: 800 }}
                >
                  <div className="table-section">
                    <TableFilters
                      columns={columns}
                      data={data}
                      filters={tableFilters}
                      setFilters={setTableFilters}
                      setPageIndex={setPageIndex}
                      numericalColumns={classification.numericalColumns}
                      categoricalColumns={classification.categoricalColumns}
                    />
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            {columns.map((column, index) => (
                              <th 
                                key={index}
                                onClick={() => setTableFilters(prev => ({
                                  ...prev,
                                  sortColumn: column,
                                  sortDirection: prev.sortColumn === column && 
                                    prev.sortDirection === 'asc' ? 'desc' : 'asc'
                                }))}
                                className="sortable-header"
                              >
                                {column}
                                {tableFilters.sortColumn === column && (
                                  <span className="sort-indicator">
                                    {tableFilters.sortDirection === 'asc' ? ' ↑' : ' ↓'}
                                  </span>
                                )}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredData(data, tableFilters)
                            .slice(
                              pageIndex * tableFilters.rowsPerPage,
                              (pageIndex + 1) * tableFilters.rowsPerPage
                            )
                            .map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                {columns.map((column, colIndex) => (
                                  <td key={colIndex}>{row[column]}</td>
                                ))}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="pagination-controls">
                      <button
                        onClick={() => setPageIndex(prev => Math.max(0, prev - 1))}
                        disabled={pageIndex === 0}
                      >
                        Previous
                      </button>
                      <span>
                        Page {pageIndex + 1} of {
                          Math.ceil(getFilteredData(data, tableFilters).length / 
                          tableFilters.rowsPerPage)
                        }
                      </span>
                      <button
                        onClick={() => setPageIndex(prev => 
                          Math.min(prev + 1, 
                            Math.floor(getFilteredData(data, tableFilters).length / 
                            tableFilters.rowsPerPage))
                        )}
                        disabled={pageIndex >= 
                          Math.floor(getFilteredData(data, tableFilters).length / 
                          tableFilters.rowsPerPage)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </DraggableComponent>
              )}

              {charts.map((chart, index) => (
                <DraggableComponent
                  key={`chart-${index}`}
                  isActive={activeComponentId === `chart-${index}`}
                  onActivate={() => setActiveComponentId(`chart-${index}`)}
                  onDelete={() => handleDeleteComponent('chart', index)}
                  defaultPosition={{ x: 50 + (index * 30), y: 50 + (index * 30) }}
                  defaultSize={{ width: 700, height: 800 }} // Ensure charts expand vertically with the container
                >
                  <div className="chart-container">
                    <h2 className="chart-title">{chart.chartType}</h2>
                    
                    <ChartOptionsPanel
                      options={chartOptions}
                      setOptions={setChartOptions}
                      dateColumns={classification.dateColumns}
                      onProcessData={() => {
                        const processedData = processChartData(chart.chartType, chartOptions);
                        setCharts(prevCharts => 
                          prevCharts.map(c => 
                            c.chartType === chart.chartType 
                              ? { ...c, data: processedData }
                              : c
                          )
                        );
                      }}
                    />

                    <div className="chart-wrapper" style={{ height: '100%' }}> {/* Ensure charts expand vertically */}
                      {chart.type === 'bar' && (
                        <Bar data={chart.data} options={chart.options} />
                      )}
                      {chart.type === 'line' && (
                        <Line data={chart.data} options={chart.options} />
                      )}
                      {chart.type === 'pie' && (
                        <Pie
                          data={chart.data}
                          options={chart.options}
                        />
                      )}
                    </div>

                    {chart.type !== 'pie' && (
                      <div className="filter-controls">
                      <div className="filter-label">Filter Data Range:</div>
                      <input
                        type="range"
                        min={0}
                        max={data.length - 1}
                        defaultValue={data.length - 1}
                        value={filterRanges[chart.chartType]?.[1] || data.length - 1}
                        onChange={(e) => handleFilterRangeChange(chart.chartType, [0, parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                        <div className="filter-values">
                          <span>
                            {filterRanges[chart.chartType]
                              ? `Showing ${filterRanges[chart.chartType][0] + 1} to ${
                                  filterRanges[chart.chartType][1] + 1
                                } of ${data.length} records`
                              : `Showing all ${data.length} records`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </DraggableComponent>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Build;
