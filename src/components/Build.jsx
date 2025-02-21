import React, { useState, useCallback, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { Bar, Line } from 'react-chartjs-2';
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
import { Upload, Filter, X, Loader } from 'lucide-react';
import './Build.css';
import Navbar from './Navbar';
import Footer from './Footer';
import { 
  useDataProcessing, 
  ChartFilters,
  DraggableComponent,
  TableFilters,
  processFilteredData,
  calculatePieMetrics,
  chartColors,
  PieChartContent
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
  // Core state
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [dashboardName, setDashboardName] = useState('');
  const [fileId, setFileId] = useState(null);
  const [fileType, setFileType] = useState(null); 

  // Layout state
  const [charts, setCharts] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [activeComponentId, setActiveComponentId] = useState(null);
  const [componentOrder, setComponentOrder] = useState([]);
  const [componentPositions, setComponentPositions] = useState({});
  const [showFilters, setShowFilters] = useState({});
  const [chartFilters, setChartFilters] = useState({});

  
  // Table state
  const [pageIndex, setPageIndex] = useState(0);
  const [tableFilters, setTableFilters] = useState({
    searchText: '',
    sortColumn: null,
    sortDirection: 'asc',
    rowsPerPage: 10,
    columnFilters: {},
    activeFilters: []
  });

  
  // Classification state
  const [classification, setClassification] = useState({
    numericalColumns: [],
    categoricalColumns: [],
    dateColumns: []
  });

  const classifyColumns = useCallback((headers, parsedData, currentFileType) => {
    const numerical = [];
    const categorical = [];
    const dates = [];
    const sampleSize = Math.min(100, parsedData.length);
  
    headers.forEach(column => {
  
      const samples = parsedData.slice(0, sampleSize).map(row => row[column]);
      const numberCount = samples.filter(val => !isNaN(parseFloat(val))).length;
      const dateCount = samples.filter(val => !isNaN(Date.parse(val))).length;
  
      if (numberCount > sampleSize * 0.8) {
        numerical.push(column);
      } else if (dateCount > sampleSize * 0.8) {
        dates.push(column);
      } else {
        categorical.push(column);
      }
    });
  
    setClassification({ numericalColumns: numerical, categoricalColumns: categorical, dateColumns: dates });
  }, []);
  
  // Refs and hooks
  const containerRef = useRef(null);
  const { processChartData } = useDataProcessing(data, columns);
 
  
  const cleanupFileProcessing = useCallback(() => {
    setData([]);
    setColumns([]);
    setClassification({
      numericalColumns: [],
      categoricalColumns: [],
      dateColumns: []
    });
    setFileUploaded(false);
    setFileType(null);
    localStorage.removeItem('lastUploadedFileUrl');
    localStorage.removeItem('lastUploadedFileType');
  }, []);

  const handleNewFileUpload = useCallback(() => {
    cleanupFileProcessing();
    setSelectedFile(null);
    setError(null);
    setCharts([]);
    setShowTable(false);
    setComponentOrder([]);
    setComponentPositions({});
  }, [cleanupFileProcessing]);

  const onUploadSuccess = useCallback((fileUrl) => {
    console.log('File uploaded successfully:', fileUrl);
  }, []);

  const onUploadError = useCallback((error) => {
    console.error('File upload error:', error);
  }, []);


  // Add this useEffect to check authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        setAuthToken(token);
        setIsLoggedIn(true);
      }
    };

    checkAuthStatus();
  }, []);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  
  // Filter handlers
  const toggleFilters = useCallback((componentId) => {
    setShowFilters(prev => ({
      ...prev,
      [componentId]: !prev[componentId]
    }));
  }, []);

  const [filterRanges, setFilterRanges] = useState({});
  const [chartOptions, setChartOptions] = useState({
    showPercentageChange: false,
    showYOYChange: false,
    showMovingAverage: false,
    showGrowthRate: false,
    showCumulativeSum: false,
    dateColumn: '',
    movingAveragePeriod: 3
  });

  const getFileTypeError = (fileType) => {
    switch (fileType) {
      case 'csv':
        return 'The CSV file appears to be invalid or empty.';
      case 'json':
        return 'There was an error processing the JSON file. Please ensure it contains valid data.';
      case 'xml':
        return 'The XML file appears to be invalid or cannot be converted to tabular data.';
      case 'txt':
        return 'The text file must contain structured data with consistent delimiters.';
      default:
        return 'Invalid file format.';
    }
  };
  
  const handleSort = useCallback((column) => {
    setTableFilters(prev => ({
      ...prev,
      sortColumn: column,
      sortDirection: prev.sortColumn === column 
        ? (prev.sortDirection === 'asc' ? 'desc' : 'asc')
        : 'asc'
    }));
  }, []);

  // Layout management
  const updateComponentPositions = useCallback(() => {
    const newPositions = {};
    let currentY = 20;

    componentOrder.forEach(id => {
      newPositions[id] = {
        x: 20,
        y: currentY
      };
      currentY += (id === 'table' ? 800 : 400) + 20;
    });

    setComponentPositions(newPositions);
  }, [componentOrder]);
  
  const calculateNextYPosition = useCallback(() => {
    return componentOrder.reduce((totalHeight, currentId) => {
      const height = currentId === 'table' ? 800 : 400;
      return totalHeight + height - 100;
    }, 20);
  }, [componentOrder]);

  
  const handleDeleteComponent = useCallback((type, component) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === 'table') {
        setShowTable(false);
        setComponentOrder(prev => prev.filter(id => id !== 'table'));
        setComponentPositions(prev => {
          const { table, ...rest } = prev;
          return rest;
        });
      } else if (type === 'chart' && component) {
        setCharts(prev => prev.filter(c => c.id !== component.id));
        setComponentOrder(prev => prev.filter(id => id !== component.id));
        setComponentPositions(prev => {
          const { [component.id]: removed, ...rest } = prev;
          return rest;
        });
      }
      updateComponentPositions();
    }
  }, [updateComponentPositions]);
  
 

  const handleSaveDashboard = async () => {
    try {
      // Check that a dashboard name is provided
      console.log("Dashboard name:", dashboardName);
      if (!dashboardName.trim()) {
        alert('Please enter a name for the dashboard before saving.');
        return;
      }
  
      setLoading(true);
  
      // Build the dashboard payload. This object must match what your Django view expects.
      // Your Django view looks for a JSON payload with a "name" and a "state" key.
      const dashboardData = {
        name: dashboardName.trim(),
        state: {
          // Convert component positions to a simplified format
          componentPositions: Object.fromEntries(
            Object.entries(componentPositions).map(([id, pos]) => [
              id,
              {
                x: Math.round(pos.x),
                y: Math.round(pos.y),
                width: Math.round(pos.width || 700),
                height: Math.round(pos.height || (id === 'table' ? 800 : 400))
              }
            ])
          ),
          componentOrder, // Array of component IDs in the order they appear
          charts: charts.map(chart => ({
            ...chart,
            // Include the chart data and options that were created on the frontend
            data: chart.data,
            options: chart.options
          })),
          showTable,
          columns,
          data,
          tableFilters,
          filterRanges,
          chartFilters,
          classification,
          chartOptions,
          pageIndex,
          fileType,
          fileId
        }
      };
      // Log the prepared data
      console.log("Saving dashboard data:", JSON.stringify(dashboardData, null, 2));
  
      // Convert to JSON and get content length
      const jsonData = JSON.stringify(dashboardData);
      const contentLength = new Blob([jsonData]).size
      
      // Make API call to save the dashboard
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/dashboards/save/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': contentLength
        },
        credentials: 'include',
        body: jsonData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save dashboard');
      }
      // Parse the JSON response from the server.
      const responseData = await response.json();
      console.log('Dashboard Save Response:', responseData);
  
      // Check if the response indicates success (your view returns a dashboard_id on success)
      if (response.ok && responseData.dashboard_id) {
        alert('Dashboard saved successfully!');
      } else {
        throw new Error(responseData.error || 'Failed to save dashboard.');
      }
    } catch (error) {
      console.error('Error saving dashboard:', error);
      alert(`Error saving dashboard: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };  
  
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/+$/, ''); 

const acceptedFileTypes = {
  'text/csv': '.csv',
  'application/xml': '.xml',
  'application/json': '.json'
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const fileExtension = file.name.split('.').pop().toLowerCase();
  const acceptedExtensions = Object.values(acceptedFileTypes).map(ext => ext.replace('.', ''));
  
  if (!acceptedExtensions.includes(fileExtension)) {
    setError(`Invalid file type. Please upload one of these types: ${Object.values(acceptedFileTypes).join(', ')}`);
    return;
  }

  setFileType(fileExtension);
  setSelectedFile(file);
  setError(null);
};

const handleFileUpload = async () => {
  if (!selectedFile) {
    setError('Please select a file to upload.');
    return;
  }

  setLoading(true);
  setError(null);

  const formData = new FormData();
  formData.append('file', selectedFile);
  formData.append('fileType', fileType);
  formData.append('username', localStorage.getItem('username'));


  try {
    const response = await fetch(`${apiBaseUrl}/file/upload/`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed.');
    }

    const result = await response.json();
    console.log('Upload response:', result);

    if (result.status === 'success') {
      if (result.file_url) {
        setFileId(result.file_url);
        localStorage.setItem('lastUploadedFileUrl', result.file_url);
        localStorage.setItem('lastUploadedFileType', fileType);
        
        await fetchFileData(result.file_url);
      } else {
        throw new Error('No file URL in upload response');
      }
    } else {
      throw new Error(result.message || 'Invalid response from server');
    }
  } catch (err) {
    console.error('Upload error:', err);
    setError(`Error uploading file: ${err.message}`);
  } finally {
    setLoading(false);
  }
};

const fetchFileData = async (fileUrl) => {
  if (!fileUrl) return;

  setLoading(true);
  setError(null);

  try {
    const fileExtension = localStorage.getItem('lastUploadedFileType') || fileType;
    if (!fileExtension) {
      throw new Error('File type not specified');
    }

    const requestBody = { 
      file_url: fileUrl,
      file_type: fileExtension
    };

    console.log('Fetching file data:', requestBody);

    const response = await fetch(`${apiBaseUrl}/file/fetch_files/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fetch error response:', errorText);
      throw new Error(`Failed to fetch file data: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Fetch response:', result);
    
    if (result.status === 'success') {
      const contentKey = `${fileExtension}_content`;
      const content = result[contentKey];

      if (!content) {
        throw new Error(`No ${fileExtension} content in response`);
      }

      // Use processIncomingData to handle all file types
      const processedResults = processIncomingData(content, fileExtension);
      if (!processedResults) {
        throw new Error(`Failed to process ${fileExtension} data`);
      }

      setData(processedResults.processedData);
      setColumns(processedResults.processedColumns);

      if (processedResults.processedColumns.length > 0 && 
          processedResults.processedData.length > 0) {
        classifyColumns(
          processedResults.processedColumns,
          processedResults.processedData,
          fileExtension
        );
      }

      setFileUploaded(true);
    } else {
      throw new Error(result.message || 'Failed to fetch file data');
    }
  } catch (err) {
    console.error('Fetch error:', err);
    setError(`Error fetching file data: ${err.message}`);
    setFileUploaded(false);
  } finally {
    setLoading(false);
  }
};

const processIncomingData = useCallback((data, fileType) => {
  try {
    let processedData = [];
    let processedColumns = [];

    switch (fileType) {
      case 'csv': {
        if (Array.isArray(data)) {
          const headers = data[0].map(h => h.trim());
          processedData = data.slice(1).map(row => {
            const rowData = {};
            headers.forEach((header, index) => {
              rowData[header] = row[index] !== undefined ? row[index].trim() : '';
            });
            return rowData;
          });
          processedColumns = headers;
        } else {
          throw new Error('Invalid CSV format');
        }
        break;
      }
      case 'json': {
        let jsonData = typeof data === 'string' ? JSON.parse(data) : data;
        if (typeof jsonData === 'object' && !Array.isArray(jsonData)) {
          if (Array.isArray(jsonData.data)) {
            jsonData = jsonData.data;
          } else {
            const arrayKeys = Object.keys(jsonData).filter(
              key => Array.isArray(jsonData[key]) && jsonData[key].length > 0 && typeof jsonData[key][0] === 'object'
            );
            jsonData = arrayKeys.length === 1 ? jsonData[arrayKeys[0]] : [jsonData];
          }
        }
        if (!Array.isArray(jsonData)) {
          jsonData = [jsonData];
        }
        const flattenObject = (obj, parentKey = '', sep = '_') =>
          Object.keys(obj).reduce((acc, key) => {
            const value = obj[key];
            const newKey = parentKey ? `${parentKey}${sep}${key}` : key;
            if (value && typeof value === 'object' && !Array.isArray(value)) {
              Object.assign(acc, flattenObject(value, newKey, sep));
            } else {
              acc[newKey] = value;
            }
            return acc;
          }, {});
        processedData = jsonData.map(item =>
          typeof item === 'object' && item !== null ? flattenObject(item) : item
        );
        const allColumns = new Set();
        processedData.forEach(row => {
          if (typeof row === 'object' && row !== null) {
            Object.keys(row).forEach(key => allColumns.add(key));
          }
        });
        processedColumns = Array.from(allColumns);
        processedData = processedData.map(row => {
          const standardized = {};
          processedColumns.forEach(col => {
            standardized[col] = row[col] !== undefined ? row[col] : '';
          });
          return standardized;
        });
        break;
      }
      case 'xml': {
        // 1. Parse the XML string into a DOM structure
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'application/xml');
      
        // Check for parsing errors
        if (xmlDoc.getElementsByTagName('parsererror').length) {
          throw new Error('Invalid XML data');
        }
      
        // 2. Locate the root element  and its child nodes 
        const root = xmlDoc.documentElement;
        const items = Array.from(root.children); // each <x> becomes one row
      
        // 3. If no repeated child elements found, fall back to a single "content" field
        if (!items.length) {
          processedData = [{ content: data }];
          processedColumns = ['content'];
        } else {
          // 4. build a row object by reading its child tags
          processedData = items.map((item) => {
            const row = {};
            Array.from(item.children).forEach((child) => {
              row[child.tagName] = child.textContent.trim();
            });
            return row;
          });
      
          // 5. convert values to numeric
          processedData = processedData.map((row) => {
            Object.keys(row).forEach((key) => {
              // Remove leading '$' (or other symbols) if present
              const stripped = row[key].replace(/^\$/, '').trim();
              // If it parses as a float, store it as a number
              const maybeNum = parseFloat(stripped.replace(/[^\d.-]/g, ''));
              if (!isNaN(maybeNum)) {
                row[key] = maybeNum;
              } else {
                row[key] = row[key]; // Keep as text if it isn't numeric
              }
            });
            return row;
          });
      
          // 6. Gather all unique columns across the rows
          const allColumns = new Set();
          processedData.forEach((row) => {
            Object.keys(row).forEach((col) => allColumns.add(col));
          });
          processedColumns = Array.from(allColumns);
        }
        break;
      }      
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }

    setData(processedData);
    setColumns(processedColumns);
    setFileUploaded(true);

    if (processedColumns.length > 0 && processedData.length > 0) {
      classifyColumns(processedColumns, processedData, fileType);
    }

    return { processedData, processedColumns };
  } catch (error) {
    console.error('Error processing data:', error);
    setError(`Error processing ${fileType} data: ${error.message}`);
    return null;
  }
}, [classifyColumns]);

// having it be commented out just in case we need it later
// useEffect(() => {
//   let isMounted = true;
  
//   const fetchData = async () => {
//     if (fileId && !fileUploaded) {
//       try {
//         await fetchFileData(fileId);
//         if (isMounted) {
//           setFileUploaded(true);
//         }
//       } catch (error) {
//         console.error('Error fetching file:', error);
//       }
//     }
//   };

//   fetchData();

//   return () => {
//     isMounted = false;
//   };
// }, [fileId]);
    
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
  const handleChartFilters = useCallback((chartId, newFilters) => {
    setChartFilters(prev => ({
      ...prev,
      [chartId]: {
        ...prev[chartId],
        ...newFilters
      }
    }));
  
    setCharts(prevCharts => 
      prevCharts.map(chart => {
        if (chart.id === chartId) {
          let filteredData = { ...chart.data };
          
          if (chart.type === 'pie') {
            // Handle pie chart filters
            if (newFilters.categoryLimit) {
              const limit = parseInt(newFilters.categoryLimit);
              filteredData.labels = chart.data.labels.slice(0, limit);
              filteredData.datasets = [{
                ...chart.data.datasets[0],
                data: chart.data.datasets[0].data.slice(0, limit)
              }];
            }
  
            if (newFilters.metric === 'percentage') {
              const total = chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
              filteredData.datasets[0].data = chart.data.datasets[0].data.map(val => 
                ((val / total) * 100).toFixed(1)
              );
            }
  
            if (newFilters.metric === 'count') {
              filteredData.datasets[0].data = Object.values(chart.metrics).map(m => m.count);
            }
          } else {
            // Handle bar/line chart filters
            if (newFilters.dataPoints) {
              const points = Math.min(newFilters.dataPoints, chart.data.labels.length);
              filteredData.labels = chart.data.labels.slice(0, points);
              filteredData.datasets = chart.data.datasets.map(dataset => ({
                ...dataset,
                data: dataset.data.slice(0, points)
              }));
            }
  
            if (newFilters.minValue !== undefined || newFilters.maxValue !== undefined) {
              const min = newFilters.minValue ? parseFloat(newFilters.minValue) : -Infinity;
              const max = newFilters.maxValue ? parseFloat(newFilters.maxValue) : Infinity;
              
              const validIndices = chart.data.datasets[0].data
                .map((val, idx) => ({ val: parseFloat(val), idx }))
                .filter(({ val }) => val >= min && val <= max)
                .map(({ idx }) => idx);
  
              filteredData.labels = validIndices.map(i => chart.data.labels[i]);
              filteredData.datasets = chart.data.datasets.map(dataset => ({
                ...dataset,
                data: validIndices.map(i => dataset.data[i])
              }));
            }
  
            if (newFilters.sortOrder && newFilters.sortOrder !== 'original') {
              const indices = [...Array(filteredData.datasets[0].data.length).keys()];
              indices.sort((a, b) => {
                const valA = parseFloat(filteredData.datasets[0].data[a]);
                const valB = parseFloat(filteredData.datasets[0].data[b]);
                return newFilters.sortOrder === 'ascending' ? valA - valB : valB - valA;
              });
  
              filteredData.labels = indices.map(i => filteredData.labels[i]);
              filteredData.datasets = filteredData.datasets.map(dataset => ({
                ...dataset,
                data: indices.map(i => dataset.data[i])
              }));
            }
  
            if (newFilters.lineType) {
              filteredData.datasets = filteredData.datasets.map(dataset => ({
                ...dataset,
                tension: newFilters.lineType === 'curved' ? 0.4 : 0,
                stepped: newFilters.lineType === 'stepped'
              }));
            }
  
            if (typeof newFilters.showPoints === 'boolean') {
              filteredData.datasets = filteredData.datasets.map(dataset => ({
                ...dataset,
                pointRadius: newFilters.showPoints ? 4 : 0,
                pointHoverRadius: newFilters.showPoints ? 6 : 0
              }));
            }
          }
  
          return {
            ...chart,
            data: filteredData
          };
        }
        return chart;
      })
    );
  }, []);

  // And add the helper function right after
  const getFilteredChartData = (chart, filters) => {
    if (!filters) return chart.data;
    
    let filteredData = { ...chart.data };
    
    if (chart.type === 'pie') {
      if (filters.categoryLimit) {
        const limit = parseInt(filters.categoryLimit);
        filteredData.labels = chart.data.labels.slice(0, limit);
        filteredData.datasets = [{
          ...chart.data.datasets[0],
          data: chart.data.datasets[0].data.slice(0, limit)
        }];
      }

      if (filters.metric === 'percentage') {
        const total = chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
        filteredData.datasets[0].data = chart.data.datasets[0].data.map(val => 
          ((val / total) * 100).toFixed(1)
        );
      }
    } else {
      if (filters.dataPoints) {
        const points = Math.min(filters.dataPoints, chart.data.labels.length);
        filteredData.labels = chart.data.labels.slice(0, points);
        filteredData.datasets = chart.data.datasets.map(dataset => ({
          ...dataset,
          data: dataset.data.slice(0, points)
        }));
      }

      if (filters.minValue || filters.maxValue) {
        const min = filters.minValue ? parseFloat(filters.minValue) : -Infinity;
        const max = filters.maxValue ? parseFloat(filters.maxValue) : Infinity;
        
        const validIndices = chart.data.datasets[0].data
          .map((val, idx) => ({ val, idx }))
          .filter(({ val }) => val >= min && val <= max)
          .map(({ idx }) => idx);

        filteredData.labels = validIndices.map(i => chart.data.labels[i]);
        filteredData.datasets = chart.data.datasets.map(dataset => ({
          ...dataset,
          data: validIndices.map(i => dataset.data[i])
        }));
      }

      if (filters.sortOrder && filters.sortOrder !== 'original') {
        const indices = [...Array(filteredData.datasets[0].data.length).keys()];
        indices.sort((a, b) => {
          const valA = filteredData.datasets[0].data[a];
          const valB = filteredData.datasets[0].data[b];
          return filters.sortOrder === 'ascending' ? valA - valB : valB - valA;
        });

        filteredData.labels = indices.map(i => filteredData.labels[i]);
        filteredData.datasets = filteredData.datasets.map(dataset => ({
          ...dataset,
          data: indices.map(i => dataset.data[i])
        }));
      }
    }
    
    return filteredData;
  };
 
  
  // Chart creation handlers
  const handleShowBarChart = useCallback((chartType) => {
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
          barThickness: 40,
          maxBarThickness: 60,
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
              size: 10,
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
          beginAtZero: true,
          max: Math.max(...processedData.map((row) => parseFloat(row[chartType]) || 0)) * 1.2,
        },
      },
    };
  
    const chartId = `bar-${chartType}-${Date.now()}`;
    setCharts(prev => [...prev, { 
      id: chartId,
      type: 'bar', 
      chartType, 
      data: barChartData, 
      options: enhancedBarChartOptions 
    }]);
    
    setComponentOrder(prev => [...prev, chartId]);
    const yPosition = calculateNextYPosition();
    setComponentPositions(prev => ({
      ...prev,
      [chartId]: {
        x: 20,
        y: yPosition,
        width: 700,  // Set default width
        height: 400  // Set default height
      }
    }));
  }, [charts, processChartData, calculateNextYPosition, classification, chartOptions]);
  
  const handleShowLineChart = useCallback((chartType) => {
    if (charts.some(c => c.type === 'line' && c.chartType === chartType)) return;
  
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
          tension: 0.3,
        },
        ...(chartOptions.showPercentageChange ? [{
          label: `${chartType} % Change`,
          data: processedData.map((row) => row[`${chartType}_pct_change`] || 0),
          borderColor: chartColors[1],
          borderWidth: 2,
          fill: false,
        }] : []),
        ...(chartOptions.showMovingAverage ? [{
          label: `${chartOptions.movingAveragePeriod} Period MA`,
          data: processedData.map((row) => 
            row[`${chartType}_ma${chartOptions.movingAveragePeriod}`] || 0
          ),
          borderColor: chartColors[2],
          borderWidth: 2,
          fill: false,
          borderDash: [5, 5],
        }] : [])
      ],
    };
  
    const chartId = `line-${chartType}-${Date.now()}`;
    setCharts(prev => [...prev, {
      id: chartId,
      type: 'line',
      chartType,
      data: lineChartData,
      options: {
        ...lineChartOptions,
        plugins: {
          ...lineChartOptions.plugins,
          title: { 
            display: true, 
            text: `${chartType} Trend`,
            color: '#fff'
          }
        }
      }
    }]);
  
    setComponentOrder(prev => [...prev, chartId]);
    const yPosition = calculateNextYPosition();
    setComponentPositions(prev => ({
      ...prev,
      [chartId]: {
        x: 20,
        y: yPosition,
        width: 700,  // Set default width
        height: 400  // Set default height
      }
    }));
  }, [charts, processChartData, calculateNextYPosition, classification, chartOptions]);
  
  const handleShowPieChart = useCallback(() => {
    if (charts.some(c => c.type === 'pie')) return;
  
    const chartId = `pie-${Date.now()}`;
    const categoryColumn = classification.categoricalColumns[0];
    const metricColumn = classification.numericalColumns[0];
  
    if (!categoryColumn || !metricColumn) {
      setError('Need both categorical and numerical columns for pie chart');
      return;
    }
  
    // Use the calculatePieMetrics function from ComponentProcessing
    const metrics = calculatePieMetrics(data, categoryColumn, metricColumn);
    
    // Process the metrics for chart data
    const sortedMetrics = Object.entries(metrics)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 10);
  
    const total = sortedMetrics.reduce((sum, [, data]) => sum + data.total, 0);
  
    const pieChartData = {
      labels: sortedMetrics.map(([category, data]) => 
        `${category} (${((data.total / total) * 100).toFixed(1)}%)`
      ),
      datasets: [{
        data: sortedMetrics.map(([, data]) => data.total),
        backgroundColor: chartColors.slice(0, sortedMetrics.length),
        borderColor: chartColors.map(color => color.replace('0.8', '1')),
        borderWidth: 1
      }]
    };
  
    const pieChartOptions = {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#fff' }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const category = sortedMetrics[context.dataIndex][0];
              const data = metrics[category];
              return [
                `Total: ${data.total.toLocaleString()}`,
                `Count: ${data.count}`,
                `Average: ${(data.total / data.count).toFixed(2)}`
              ];
            }
          }
        }
      }
    };
  
    setCharts(prev => [...prev, {
      id: chartId,
      type: 'pie',
      categoryColumn,
      metricColumn,
      data: pieChartData,
      options: pieChartOptions,
      metrics // Store the metrics for PieChartContent
    }]);
  
    setComponentOrder(prev => [...prev, chartId]);
    const yPosition = calculateNextYPosition();
    setComponentPositions(prev => ({
      ...prev,
      [chartId]: {
        x: 20,
        y: yPosition,
        width: 700,  // Default width for new components
        height: 400  // Default height for new components
      }
    }));
    
  }, [charts, data, classification, calculateNextYPosition]);


  
  // Table rendering
  const applyFilter = (value, filter, columnType) => {
    const testValue = String(value).toLowerCase();
    const filterValue = String(filter.value).toLowerCase();
    
    switch (filter.operator) {
      case 'contains':
        return testValue.includes(filterValue);
      case 'equals':
        return testValue === filterValue;
      case 'starts with':
        return testValue.startsWith(filterValue);
      case 'ends with':
        return testValue.endsWith(filterValue);
      case 'is empty':
        return !value || value.toString().trim() === '';
      case 'is not empty':
        return value && value.toString().trim() !== '';
      case '=':
        return columnType === 'number' 
          ? Number(value) === Number(filter.value)
          : testValue === filterValue;
      case '>':
        return Number(value) > Number(filter.value);
      case '<':
        return Number(value) < Number(filter.value);
      case '>=':
        return Number(value) >= Number(filter.value);
      case '<=':
        return Number(value) <= Number(filter.value);
      case 'between':
        if (columnType === 'number') {
          const num = Number(value);
          return num >= Number(filter.value) && num <= Number(filter.value2);
        } else if (columnType === 'date') {
          const date = new Date(value);
          return date >= new Date(filter.value) && date <= new Date(filter.value2);
        }
        return testValue >= filterValue && testValue <= filter.value2.toLowerCase();
      case 'before':
        return new Date(value) < new Date(filter.value);
      case 'after':
        return new Date(value) > new Date(filter.value);
      default:
        return true;
    }
  };
  
  const applyTableFilters = useCallback((tableData) => {
    let filteredData = [...tableData];
  
    // Apply column filters
    if (Object.keys(tableFilters.columnFilters).length > 0) {
      filteredData = filteredData.filter(row => {
        return Object.entries(tableFilters.columnFilters).every(([column, filter]) => {
          if (!filter || !filter.operator) return true;
          
          const columnType = classification.numericalColumns.includes(column) 
            ? 'number' 
            : classification.dateColumns.includes(column) 
              ? 'date' 
              : 'text';
  
          return applyFilter(row[column], filter, columnType);
        });
      });
    }
  
    // Apply global search
    if (tableFilters.searchText) {
      const searchLower = tableFilters.searchText.toLowerCase();
      filteredData = filteredData.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }
  
    // Apply sorting
    if (tableFilters.sortColumn) {
      const column = tableFilters.sortColumn;
      const direction = tableFilters.sortDirection;
      
      filteredData.sort((a, b) => {
        let valueA = a[column];
        let valueB = b[column];
  
        if (classification.numericalColumns.includes(column)) {
          valueA = parseFloat(valueA) || 0;
          valueB = parseFloat(valueB) || 0;
        } else if (classification.dateColumns.includes(column)) {
          valueA = new Date(valueA).getTime();
          valueB = new Date(valueB).getTime();
        } else {
          valueA = String(valueA).toLowerCase();
          valueB = String(valueB).toLowerCase();
        }
  
        return direction === 'asc'
          ? (valueA < valueB ? -1 : valueA > valueB ? 1 : 0)
          : (valueA > valueB ? -1 : valueA < valueB ? 1 : 0);
      });
    }
  
    return filteredData;
  }, [tableFilters, classification]);
  
  const renderTableCell = useCallback((value, column) => {
    if (value === null || value === undefined) {
      return '';
    }
  
    // Handle different types of values
    if (typeof value === 'object' && !Array.isArray(value)) {
      const formatted = JSON.stringify(value, null, 2);
      return (
        <div className="table-cell-content">
          {formatted.length > 50 ? (
            <div className="truncated-cell" title={formatted}>
              {formatted.substring(0, 50)}...
            </div>
          ) : formatted}
        </div>
      );
    }
  
    if (Array.isArray(value)) {
      const displayValue = value.map(item => 
        typeof item === 'object' ? JSON.stringify(item) : item.toString()
      ).join(', ');
      
      return (
        <div className="table-cell-content">
          {displayValue.length > 50 ? (
            <div className="truncated-cell" title={displayValue}>
              {displayValue.substring(0, 50)}...
            </div>
          ) : displayValue}
        </div>
      );
    }
  
    // Handle primitive values
    return <div className="table-cell-content">{value.toString()}</div>;
  }, []);

  const renderTable = useCallback(() => {
    const filteredData = applyTableFilters(data);
    const startIndex = pageIndex * tableFilters.rowsPerPage;
    const endIndex = startIndex + tableFilters.rowsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);
  
   const handleNewFileUpload = () => {
    cleanupFileProcessing();
    setSelectedFile(null);
    setError(null);
    setCharts([]);
    setShowTable(false);
    setComponentOrder([]);
    setComponentPositions({});
  };

    return (
      <div className="table-section">
        {showFilters.table && (
          <TableFilters
            columns={columns}
            filters={tableFilters}
            setFilters={setTableFilters}
            setPageIndex={setPageIndex}
            classification={classification}
          />
        )}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map(column => (
                  <th 
                    key={column} 
                    onClick={() => handleSort(column)}
                    className={`sortable-header ${
                      tableFilters.sortColumn === column ? 'active' : ''
                    }`}
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
              {pageData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map(column => (
                    <td key={column}>
                      {typeof row[column] === 'object' 
                        ? JSON.stringify(row[column]) 
                        : String(row[column] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button
              onClick={() => setPageIndex(prev => Math.max(0, prev - 1))}
              disabled={pageIndex === 0}
            >
              Previous
            </button>
            <span>
              Page {pageIndex + 1} of {Math.ceil(filteredData.length / tableFilters.rowsPerPage)}
            </span>
            <button
              onClick={() => setPageIndex(prev => 
                prev + 1 < Math.ceil(filteredData.length / tableFilters.rowsPerPage) 
                  ? prev + 1 
                  : prev
              )}
              disabled={endIndex >= filteredData.length}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }, [
    data,
    columns,
    pageIndex,
    tableFilters,
    applyTableFilters,
    handleSort,
    showFilters.table,
    classification,
    setTableFilters,
    setPageIndex
  ]);
  

  const renderComponent = useCallback((componentId) => {
    const chart = charts.find(c => c.id === componentId);
    const isTable = componentId === 'table';
  
    return (
      <DraggableComponent
      key={componentId}
      id={componentId}
      isActive={activeComponentId === componentId}
      onActivate={() => setActiveComponentId(componentId)}
      defaultPosition={componentPositions[componentId]}
      defaultSize={{
        width: 700,
        height: isTable ? 800 : 400,
      }}
      onDragStop={(e, data) => {
        console.log('Drag stopped:', data);
        setComponentPositions((prev) => ({
          ...prev,
          [componentId]: {
            ...prev[componentId],
            x: data.x,
            y: data.y,
          },
        }));
      }}
      onResize={(newSize) => {
        console.log('Drag resize stopped:', newSize);
        setComponentPositions((prev) => ({
          ...prev,
          [componentId]: {
            ...prev[componentId],
            width: newSize.width ,
            height: newSize.height 
          }
          }));
        }}
        onDelete={() => handleDeleteComponent(isTable ? 'table' : 'chart', chart)}
      >
        <div className="component-container">
          <div className="component-header">
            <h3>{isTable ? 'Data Table' : `${chart?.type === 'pie' ? 'Category' : chart?.chartType} Distribution`}</h3>
            <button onClick={() => toggleFilters(componentId)} className="filter-button">
              <Filter size={20} />
            </button>
          </div>
          
          {isTable ? (
            renderTable()
          ) : (
            <>
              {showFilters[componentId] && (
                <ChartFilters
                  chartType={chart.type}
                  chartId={chart.id}
                  data={data}
                  filters={chartFilters[chart.id] || {}}
                  onFilterChange={(newFilters) => handleChartFilters(chart.id, newFilters)}
                  numericalColumns={classification.numericalColumns}
                  categoricalColumns={classification.categoricalColumns}
                />
              )}
              <div className="chart-wrapper" style={{ height: '100%' }}>
              {chart.type === 'pie' ? (
              <div className="chart-wrapper" style={{ height: '100%', minHeight: 0 }}>
                <PieChartContent 
                  data={processFilteredData(chart.data, chartFilters[chart.id])}
                  metrics={chart.metrics} 
                  options={chart.options}
                />
              </div>
            ) : chart.type === 'bar' ? (
                  <Bar 
                    data={processFilteredData(chart.data, chartFilters[chart.id])} 
                    options={chart.options} 
                  />
                ) : (
                  <Line 
                    data={processFilteredData(chart.data, chartFilters[chart.id])} 
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
            </>
          )}
        </div>
      </DraggableComponent>
    );
  }, [
    charts,
    activeComponentId,
    componentPositions,
    showFilters,
    chartFilters,
    filterRanges,
    data,
    handleChartFilters,
    handleFilterRangeChange,
    renderTable,
    handleDeleteComponent,
    toggleFilters,
    classification
  ]);


 // Main render
 return (
  <div className="build-page">
    <Navbar />

    <div className="build-content" ref={containerRef}>
      <div className="background-decoration">
        <img src="/shapes.png" alt="Background Decoration" className="background-image" />
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

{!fileUploaded ? (
  <div className="upload-container">
    <div className="upload-header">
      <h1>Upload Your Data</h1>
      <p>Upload your data file (CSV, JSON, XML, or TXT ) to create interactive visualizations and analyze your data</p>
    </div>

    <div className="upload-area">
    <input
      type="file"
      onChange={handleFileChange}
      accept={Object.values(acceptedFileTypes).join(',')}
      className="file-input"
      id="csv-file-input"
    />
      
    <label htmlFor="csv-file-input" className="file-input-label">
      <Upload className="upload-icon" />
      <div className="upload-text">
        <span className="upload-text-primary">
          {selectedFile ? 'Change file' : 'Choose a file'}
        </span>
        <span className="upload-text-secondary">
          or drag and drop it here
        </span>
      </div>
    </label>

      {selectedFile && (
        <div className="file-info">
          <Upload className="file-info-icon" />
          <span className="file-name">{selectedFile.name}</span>
          <button 
            className="remove-file"
            onClick={() => setSelectedFile(null)}
            type="button"
            aria-label="Remove file"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
        </div>
      )}
    </div>

    {error && (
      <div className="error-message">
        <span>{error}</span>
        <button 
          onClick={() => setError(null)} 
          type="button"
          aria-label="Close error message"
        >
          <X size={16} />
        </button>
      </div>
    )}

    <button
      className="upload-button"
      onClick={handleFileUpload}
      disabled={!selectedFile || loading}
    >
      {loading ? (
        <>
          <Loader className="animate-spin" size={16} />
          <span>Uploading...</span>
        </>
      ) : (
        <>
          <Upload size={16} />
          <span>Upload File</span>
        </>
      )}
    </button>
  </div>
) : (
        <>
          {/* Sidebar */}
          <div className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}>
            <button 
              className="toggle-sidebar"
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            >
              {isSidebarExpanded ? '⬅' : '➡'}
            </button>

            <div className="sidebar-content">
              <div className="dashboard-name-section">
                <input
                  type="text"
                  value={dashboardName}
                  onChange={(e) => setDashboardName(e.target.value)}
                  placeholder="Enter Dashboard Name"
                  className="dashboard-name-input"
                />
              </div>

              <button 
                className="sidebar-button"
                onClick={() => {
                  setFileUploaded(false);
                  setSelectedFile(null);
                  setError(null);
                  setData([]);
                  setColumns([]);
                  setCharts([]);
                  setShowTable(false);
                  setComponentOrder([]);
                  setComponentPositions({});
                }}
              >
                📤 {isSidebarExpanded && 'Upload New File'}
              </button>

              <button 
                className="sidebar-button"
                onClick={() => {
                  setShowTable(true);
                  const componentId = 'table';
                  if (!componentOrder.includes(componentId)) {
                    setComponentOrder((prev) => [...prev, componentId]);
                    const yPosition = calculateNextYPosition();
                    setComponentPositions((prev) => ({
                      ...prev,
                      [componentId]: { x: 20, y: yPosition },
                    }));
                  }
                }}
                disabled={showTable}
              >
                📋 {isSidebarExpanded && 'Show Table'}
              </button>


              {classification.numericalColumns.map((column) => (
                <React.Fragment key={column}>
                  <button
                    className="sidebar-button"
                    onClick={() => handleShowBarChart(column)}
                  >
                    📊 {isSidebarExpanded && `${column} Bar Chart`}
                  </button>
                  <button
                    className="sidebar-button"
                    onClick={() => handleShowLineChart(column)}
                  >
                    📈 {isSidebarExpanded && `${column} Line Chart`}
                  </button>
                </React.Fragment>
              ))}

              {classification.categoricalColumns.length > 0 && (
                <button 
                  className="sidebar-button"
                  onClick={handleShowPieChart}
                >
                  🥧 {isSidebarExpanded && 'Category Distribution'}
                </button>
              )}

              <button 
                className="sidebar-button"
                onClick={(e) => {
                  e.preventDefault(); // Prevent default form submission
                  handleSaveDashboard();
                }}
                disabled={!dashboardName.trim() || loading}
              >
                💾 {isSidebarExpanded && 'Save Dashboard'}
              </button>

              <div className="data-info">
                <p>Rows: {data.length}</p>
                <p>Columns: {columns.length}</p>
                <p>Numerical: {classification.numericalColumns.length}</p>
                <p>Categorical: {classification.categoricalColumns.length}</p>
                <p>Dates: {classification.dateColumns.length}</p>
              </div>
            </div>
          </div>

          {/* Main Dashboard */}
          <div className={`main-container ${isSidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
            <div className="components-container" style={{ minHeight: `${calculateNextYPosition()}px` }}>
              {componentOrder.map((componentId) => renderComponent(componentId))}
            </div>
          </div>
        </>
      )}
    </div>

    <Footer />
  </div>
);
};

export default Build; 