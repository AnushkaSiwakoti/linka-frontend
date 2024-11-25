import React, { useState, useCallback, useEffect, useRef } from 'react';
import { parseISO, isValid } from 'date-fns';
import { Pie } from 'react-chartjs-2';
import { X } from 'lucide-react';
export const chartColors = [
  'rgba(54, 162, 235, 0.8)',   // blue
  'rgba(255, 99, 132, 0.8)',   // red
  'rgba(75, 192, 192, 0.8)',   // green
  'rgba(153, 102, 255, 0.8)',  // purple
  'rgba(255, 159, 64, 0.8)',   // orange
  'rgba(255, 206, 86, 0.8)',   // yellow
];

// Data Processing Hook - Simplified and focused
export const useDataProcessing = (data, columns) => {
  const detectDateColumns = useCallback(() => {
    if (!Array.isArray(data) || data.length === 0 || !Array.isArray(columns)) return [];
    return columns.filter(column => {
      try {
        return isValid(parseISO(String(data[0]?.[column])));
      } catch {
        return false;
      }
    });
  }, [data, columns]);

  const processChartData = useCallback((chartType, filters = {}) => {
    if (!chartType || !Array.isArray(data)) return [];
    
    let processedData = [...data];
    if (filters.range) {
      processedData = processedData.slice(filters.range[0], filters.range[1] + 1);
    }
    
    return processedData;
  }, [data]);

  return { processChartData, detectDateColumns };
};

export const ChartFilters = ({
  chartType,
  chartId,
  data = [],
  filters = {},
  onFilterChange,
  numericalColumns = [],
  categoricalColumns = []
}) => {
  const handleFilterChange = (changes) => {
    onFilterChange({
      ...filters,
      ...changes
    });
  };

  const clearAllFilters = () => {
    const defaultFilters = {
      dataPoints: data.length,
      minValue: '',
      maxValue: '',
      sortOrder: 'original',
      showPoints: true,
      showValues: true,
      showPercentages: true,
      categoryLimit: 10,
      metric: 'value',
      lineType: 'linear',
      showMA: false,
      maPeriod: 5
    };
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters = () => {
    return (
      (filters.dataPoints && filters.dataPoints !== data.length) ||
      filters.minValue ||
      filters.maxValue ||
      filters.sortOrder !== 'original' ||
      filters.categoryLimit !== 10 ||
      filters.metric !== 'value' ||
      filters.lineType !== 'linear' ||
      filters.showMA ||
      !filters.showPoints ||
      !filters.showValues ||
      !filters.showPercentages
    );
  };

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <h4>Chart Filters</h4>
        {hasActiveFilters() && (
          <button 
            onClick={clearAllFilters}
            className="clear-filters-btn"
            title="Clear all filters"
          >
            <X size={16} />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Common filters for all charts */}
      <div className="filter-section">
        <label className="filter-label">
          Data Points
          <div className="filter-input-group">
            <input
              type="range"
              min={5}
              max={data.length}
              value={filters.dataPoints || data.length}
              onChange={(e) => handleFilterChange({ dataPoints: parseInt(e.target.value) })}
              className="range-input"
            />
            <span className="range-value">{filters.dataPoints || data.length} points</span>
          </div>
        </label>
      </div>

      {/* Chart specific filters */}
      {chartType === 'bar' && (
        <>
          <div className="filter-section">
            <label className="filter-label">Value Range</label>
            <div className="range-inputs">
              <input
                type="number"
                value={filters.minValue || ''}
                onChange={(e) => handleFilterChange({ minValue: e.target.value })}
                placeholder="Min"
                className="number-input"
              />
              <span>to</span>
              <input
                type="number"
                value={filters.maxValue || ''}
                onChange={(e) => handleFilterChange({ maxValue: e.target.value })}
                placeholder="Max"
                className="number-input"
              />
              {(filters.minValue || filters.maxValue) && (
                <button
                  onClick={() => handleFilterChange({ minValue: '', maxValue: '' })}
                  className="clear-input-btn"
                  title="Clear range"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="filter-section">
            <label className="filter-label">
              Sort Order
              <select
                value={filters.sortOrder || 'original'}
                onChange={(e) => handleFilterChange({ sortOrder: e.target.value })}
                className="select-input"
              >
                <option value="original">Original</option>
                <option value="ascending">Ascending</option>
                <option value="descending">Descending</option>
              </select>
            </label>
          </div>
        </>
      )}

      {chartType === 'pie' && (
        <>
          <div className="filter-section">
            <label className="filter-label">
              Category Limit
              <div className="filter-input-group">
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={filters.categoryLimit || 10}
                  onChange={(e) => handleFilterChange({ categoryLimit: parseInt(e.target.value) })}
                  className="number-input"
                />
                {filters.categoryLimit !== 10 && (
                  <button
                    onClick={() => handleFilterChange({ categoryLimit: 10 })}
                    className="clear-input-btn"
                    title="Reset to default"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </label>
          </div>
          <div className="filter-section">
            <label className="filter-label">
              Display Metric
              <select
                value={filters.metric || 'value'}
                onChange={(e) => handleFilterChange({ metric: e.target.value })}
                className="select-input"
              >
                <option value="value">Value</option>
                <option value="percentage">Percentage</option>
                <option value="count">Count</option>
              </select>
            </label>
          </div>
          <div className="filter-section">
            <label className="filter-label">Show Labels</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.showValues ?? true}
                  onChange={(e) => handleFilterChange({ showValues: e.target.checked })}
                />
                Values
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.showPercentages ?? true}
                  onChange={(e) => handleFilterChange({ showPercentages: e.target.checked })}
                />
                Percentages
              </label>
            </div>
          </div>
        </>
      )}

      {chartType === 'line' && (
        <>
          <div className="filter-section">
            <label className="filter-label">
              Line Type
              <select
                value={filters.lineType || 'linear'}
                onChange={(e) => handleFilterChange({ lineType: e.target.value })}
                className="select-input"
              >
                <option value="linear">Linear</option>
                <option value="curved">Curved</option>
                <option value="stepped">Stepped</option>
              </select>
            </label>
          </div>
          <div className="filter-section">
            <label className="filter-label">Moving Average</label>
            <div className="ma-controls">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.showMA ?? false}
                  onChange={(e) => handleFilterChange({ showMA: e.target.checked })}
                />
                Show MA
              </label>
              <input
                type="number"
                min={2}
                max={20}
                value={filters.maPeriod || 5}
                onChange={(e) => handleFilterChange({ maPeriod: parseInt(e.target.value) })}
                disabled={!filters.showMA}
                className="number-input"
              />
              <span>periods</span>
            </div>
          </div>
          <div className="filter-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.showPoints ?? true}
                onChange={(e) => handleFilterChange({ showPoints: e.target.checked })}
              />
              Show Points
            </label>
          </div>
        </>
      )}
    </div>
  );
};
// Improved Pie Chart
export const PieChartContent = ({ data, metrics }) => {
  return (
    <div className="pie-chart-wrapper">
      <div className="chart-area">
        <Pie data={data} />
      </div>
      <div className="metrics-summary">
        {Object.entries(metrics).slice(0, 5).map(([category, value]) => (
          <div key={category} className="metric-item">
            <span className="category">{category}</span>
            <span className="value">{value.count}</span>
            <span className="percentage">
              {((value.count / Object.values(metrics).reduce((sum, m) => sum + m.count, 0)) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DraggableComponent = ({ 
  children, 
  onActivate, 
  isActive, 
  onDelete,
  defaultPosition,
  defaultSize,
  onDragStop,
  onResize
}) => {
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const componentRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 0, height: 0 });

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('resize-handle')) {
      startResize(e);
    } else if (e.target.classList.contains('drag-handle')) {
      startDrag(e);
    }
    onActivate?.();
  };

  const startDrag = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    if (componentRef.current) {
      componentRef.current.style.transition = 'none';
    }
  };

  const startResize = (e) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY
    };
    resizeStartSize.current = {
      width: size.width,
      height: size.height
    };
    if (componentRef.current) {
      componentRef.current.style.transition = 'none';
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y
      };
      setPosition(newPosition);
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStartPos.current.x;
      const deltaY = e.clientY - resizeStartPos.current.y;
      
      const newWidth = Math.max(300, resizeStartSize.current.width + deltaX);
      const newHeight = Math.max(200, resizeStartSize.current.height + deltaY);
      
      setSize({
        width: newWidth,
        height: newHeight
      });
    }
  }, [isDragging, isResizing]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onDragStop?.(null, position);
    }
    if (isResizing) {
      setIsResizing(false);
      onResize?.(size);
    }
    
    if (componentRef.current) {
      componentRef.current.style.transition = 'transform 0.2s ease';
    }
  }, [isDragging, isResizing, position, size, onDragStop, onResize]);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={componentRef}
      className={`relative bg-white rounded-lg shadow-lg border ${isActive ? 'border-blue-500' : 'border-gray-200'}`}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        // width: `${size.width}px`,
        // height: `${size.height}px`,
        width: size.width,
        height: size.height,
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.2s ease'
      }}
    >
      <div 
        className="drag-handle cursor-move p-2 border-b flex justify-between items-center" 
        onMouseDown={handleMouseDown}
      >
        <h3 className="font-medium">{children.props.title}</h3>
        <button 
          onClick={onDelete}
          className="p-1 hover:bg-gray-100 rounded-full"
          title="Delete component"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="component-content p-4 overflow-auto" style={{ height: 'calc(100% - 45px)' }}>
        {children}
      </div>
      
      <div
        className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={handleMouseDown}
        style={{
          background: 'linear-gradient(135deg, transparent 50%, #cbd5e0 50%)'
        }}
      />
    </div>
  );
};
// Utility function for filtered data
export const processFilteredData = (data, filters) => {
  if (!filters || !data) return data;
  
  let filteredData = { ...data };
  if (filters.range) {
    filteredData.datasets = filteredData.datasets.map(dataset => ({
      ...dataset,
      data: dataset.data.slice(filters.range[0], filters.range[1] + 1)
    }));
    filteredData.labels = filteredData.labels.slice(filters.range[0], filters.range[1] + 1);
  }
  
  return filteredData;
};







export const TableFilters = ({ 
  columns = [], 
  filters = {}, 
  setFilters, 
  setPageIndex,
  classification = {
    numericalColumns: [],
    categoricalColumns: [],
    dateColumns: []
  }
}) => {
  const defaultOperators = {
    text: ['contains', 'equals', 'starts with', 'ends with', 'is empty', 'is not empty'],
    number: ['=', '>', '<', '>=', '<=', 'between', 'is empty', 'is not empty'],
    date: ['=', 'before', 'after', 'between', 'last 7 days', 'last 30 days', 'this month', 'this year']
  };

  const getColumnType = (column) => {
    if (classification.numericalColumns?.includes(column)) return 'number';
    if (classification.dateColumns?.includes(column)) return 'date';
    return 'text';
  };

  const getOperatorsForColumn = (column) => {
    const type = getColumnType(column);
    return defaultOperators[type] || defaultOperators.text;
  };

  const addColumnFilter = (column) => {
    if (!column) return;
    const type = getColumnType(column);
    setFilters(prev => ({
      ...prev,
      columnFilters: {
        ...prev.columnFilters,
        [column]: {
          operator: defaultOperators[type][0],
          value: '',
          value2: ''
        }
      }
    }));
  };

  const removeColumnFilter = (column) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters.columnFilters[column];
      return newFilters;
    });
  };

  return (
    <div className="table-filters-container">
      <div className="filter-group">
        <input
          type="text"
          value={filters.searchText || ''}
          onChange={(e) => {
            setFilters(prev => ({ ...prev, searchText: e.target.value }));
            setPageIndex(0);
          }}
          placeholder="Search across all columns..."
          className="search-input"
        />
      </div>

      <div className="filter-group">
        <select
          value={filters.rowsPerPage || 10}
          onChange={(e) => {
            setFilters(prev => ({ ...prev, rowsPerPage: Number(e.target.value) }));
            setPageIndex(0);
          }}
          className="rows-select"
        >
          {[10, 25, 50, 100].map(n => (
            <option key={n} value={n}>{n} rows per page</option>
          ))}
        </select>

        <select
          value=""
          onChange={(e) => addColumnFilter(e.target.value)}
          className="column-select"
        >
          <option value="">Add column filter...</option>
          {columns.map(column => (
            <option key={column} value={column}>{column}</option>
          ))}
        </select>
      </div>

      <div className="active-filters">
        {Object.entries(filters.columnFilters || {}).map(([column, filter]) => (
          <div key={column} className="filter-item">
            <div className="filter-header">
              <span>{column}</span>
              <button onClick={() => removeColumnFilter(column)}>×</button>
            </div>
            <div className="filter-controls">
              <select
                value={filter.operator}
                onChange={(e) => {
                  setFilters(prev => ({
                    ...prev,
                    columnFilters: {
                      ...prev.columnFilters,
                      [column]: {
                        ...filter,
                        operator: e.target.value,
                        value: '',
                        value2: ''
                      }
                    }
                  }));
                }}
              >
                {getOperatorsForColumn(column).map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>

              {!['is empty', 'is not empty', 'last 7 days', 'last 30 days', 'this month', 'this year'].includes(filter.operator) && (
                <>
                  <input
                    type={getColumnType(column) === 'number' ? 'number' : 'text'}
                    value={filter.value}
                    onChange={(e) => {
                      setFilters(prev => ({
                        ...prev,
                        columnFilters: {
                          ...prev.columnFilters,
                          [column]: {
                            ...filter,
                            value: e.target.value
                          }
                        }
                      }));
                    }}
                    placeholder="Value"
                  />
                  {filter.operator === 'between' && (
                    <input
                      type={getColumnType(column) === 'number' ? 'number' : 'text'}
                      value={filter.value2}
                      onChange={(e) => {
                        setFilters(prev => ({
                          ...prev,
                          columnFilters: {
                            ...prev.columnFilters,
                            [column]: {
                              ...filter,
                              value2: e.target.value
                            }
                          }
                        }));
                      }}
                      placeholder="To value"
                    />
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {(filters.searchText || Object.keys(filters.columnFilters || {}).length > 0) && (
        <button
          onClick={() => {
            setFilters(prev => ({
              ...prev,
              searchText: '',
              columnFilters: {}
            }));
            setPageIndex(0);
          }}
          className="clear-filters"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
};







// Calculate pie metrics - simplified
export const calculatePieMetrics = (data, categoryColumn, metricColumn) => {
  return data.reduce((acc, row) => {
    const category = row[categoryColumn] || 'Unknown';
    const value = parseFloat(row[metricColumn] || 0);
    
    if (!acc[category]) {
      acc[category] = { count: 0, total: value };
    }
    
    acc[category].count++;
    acc[category].total += value;
    
    return acc;
  }, {});
};