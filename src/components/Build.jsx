import React, { useState, useMemo } from 'react';
import { useTable, useSortBy, useFilters, usePagination } from 'react-table';
import Papa from 'papaparse';
import { Link } from 'react-router-dom';
import './Build.css';

const Build = () => {
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true); // Sidebar toggle state

// Handle CSV Parsing
const fetchAndParseCsv = (csvData) => {
  const parsedCsv = Papa.parse(csvData, { header: true });
  const parsedColumns = Object.keys(parsedCsv.data[0]).map((col) => {
    if (!col || col === 'Column 0') {
      // Ensure the column order matches the original CSV file and avoid creating "Column 0"
      return {
        Header: col || 'Unknown',  // Prevent creating empty columns
        accessor: col || 'Unknown',
      };
    }
    return {
      Header: col,
      accessor: col,
    };
  });
  setColumns(parsedColumns);
  setData(parsedCsv.data);
};


  // Handle File Selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handle File Upload (Trigger Parsing)
  const handleUpload = () => {
    setError(null);
    if (!selectedFile) {
      setError('Please select a CSV file to upload.');
      return;
    }
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target.result;
      fetchAndParseCsv(csvData);
      setLoading(false);
    };
    reader.readAsText(selectedFile);
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  // Table columns and data setup for react-table
  const tableColumns = useMemo(() => columns, [columns]);
  const tableData = useMemo(() => data, [data]);

  // Use the useTable hook to create a table instance with sorting and filtering
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns: tableColumns,
      data: tableData,
    },
    useFilters,
    useSortBy,
    usePagination
  );

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

      <div className="upload-container">
        <h1>Upload Your CSV File</h1>

        {/* File Input Section */}
        <input type="file" onChange={handleFileChange} accept=".csv" className="file-input" />
        <div className="upload-btn-container">
          <button onClick={handleUpload} disabled={!selectedFile} className="upload-btn">
            Upload File
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading-message">Loading...</div>}
      </div>

      <div className="build-content">
        {/* Sidebar Section */}
        <div className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isSidebarExpanded ? '⬅' : '➡'}
          </button>
          <div className="sidebar-content">
            <button className="icon">
              📊 <span>{isSidebarExpanded && 'Table'}</span>
            </button>
            <button className="icon">
              📈 <span>{isSidebarExpanded && 'Bar Chart'}</span>
            </button>
            <button className="icon">
              🥧 <span>{isSidebarExpanded && 'Pie Chart'}</span>
            </button>
            <button className="icon">
              ⚫ <span>{isSidebarExpanded && 'Scatter Plot'}</span>
            </button>
            <button className="icon">
              🧊 <span>{isSidebarExpanded && 'Bubble Chart'}</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-container">
          {columns.length > 0 && (
            <>
              {/* Table Section */}
              <div className="table-section">
                <h2>Data Table</h2>
                <table {...getTableProps()} className="data-table">
                  <thead>
                    {headerGroups.map((headerGroup) => (
                      <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column) => (
                          <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                            {column.render('Header')}
                            <span>
                              {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                            </span>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody {...getTableBodyProps()}>
                    {page.map((row) => {
                      prepareRow(row);
                      return (
                        <tr {...row.getRowProps()}>
                          {row.cells.map((cell) => (
                            <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="pagination-controls button">
                  <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                    Previous
                  </button>
                  <button onClick={() => nextPage()} disabled={!canNextPage}>
                    Next
                  </button>
                  <span>
                    Page{' '}
                    <strong>
                      {pageIndex + 1} of {pageOptions.length}
                    </strong>{' '}
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    {[10, 20, 30, 40, 50].map((size) => (
                      <option key={size} value={size}>
                        Show {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Build;
