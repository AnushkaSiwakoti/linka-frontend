// import React, { useState, useCallback, useEffect, useRef } from 'react';
// import { parseISO, isValid } from 'date-fns';

// // Data Processing Hook
// export const useDataProcessing = (data, columns) => {
//   // Detect date columns
//   const detectDateColumns = useCallback(() => {
//     if (!data || data.length === 0 || !columns) return [];
    
//     return columns.filter(column => {
//       const sampleValue = data[0]?.[column];
//       if (!sampleValue) return false;
      
//       try {
//         return isValid(parseISO(String(sampleValue)));
//       } catch {
//         return false;
//       }
//     });
//   }, [data, columns]);

//   //percentage change
//   const calculatePercentageChange = useCallback((column) => {
//     if (!data || data.length < 2) return [];
    
//     return data.map((row, index) => {
//       if (index === 0) return { ...row, [`${column}_pct_change`]: 0 };
      
//       const currentValue = parseFloat(row[column]);
//       const previousValue = parseFloat(data[index - 1][column]);
      
//       const percentageChange = previousValue !== 0 
//         ? ((currentValue - previousValue) / previousValue) * 100 
//         : 0;
        
//       return {
//         ...row,
//         [`${column}_pct_change`]: parseFloat(percentageChange.toFixed(2))
//       };
//     });
//   }, [data]);

//   // year-over-year change
//   const calculateYOYChange = useCallback((column, dateColumn) => {
//     if (!data || data.length < 12 || !dateColumn) return data;
    
//     // Sort data by date
//     const sortedData = [...data].sort((a, b) => {
//       return new Date(a[dateColumn]) - new Date(b[dateColumn]);
//     });
    
//     return sortedData.map((row, index) => {
//       if (index < 12) return { ...row, [`${column}_yoy_change`]: null };
      
//       const currentValue = parseFloat(row[column]);
//       const previousYearValue = parseFloat(sortedData[index - 12][column]);
      
//       const yoyChange = previousYearValue !== 0 
//         ? ((currentValue - previousYearValue) / previousYearValue) * 100 
//         : 0;
        
//       return {
//         ...row,
//         [`${column}_yoy_change`]: parseFloat(yoyChange.toFixed(2))
//       };
//     });
//   }, [data]);

//   // moving average
//   const calculateMovingAverage = useCallback((column, period = 3) => {
//     if (!data || data.length < period) return [];
    
//     return data.map((row, index) => {
//       if (index < period - 1) return { ...row, [`${column}_ma${period}`]: null };
      
//       const values = data
//         .slice(index - period + 1, index + 1)
//         .map(r => parseFloat(r[column]));
        
//       const average = values.reduce((a, b) => a + b, 0) / period;
      
//       return {
//         ...row,
//         [`${column}_ma${period}`]: parseFloat(average.toFixed(2))
//       };
//     });
//   }, [data]);

//   // growth rate
//   const calculateGrowthRate = useCallback((column) => {
//     if (!data || data.length < 2) return [];
    
//     const firstValue = parseFloat(data[0][column]);
//     const lastValue = parseFloat(data[data.length - 1][column]);
//     const periods = data.length - 1;
    
//     const growthRate = Math.pow(lastValue / firstValue, 1 / periods) - 1;
    
//     return data.map(row => ({
//       ...row,
//       [`${column}_growth_rate`]: parseFloat((growthRate * 100).toFixed(2))
//     }));
//   }, [data]);

//   //cumulative sum
//   const calculateCumulativeSum = useCallback((column) => {
//     if (!data || data.length === 0) return [];
    
//     let sum = 0;
//     return data.map(row => {
//       sum += parseFloat(row[column]) || 0;
//       return {
//         ...row,
//         [`${column}_cumsum`]: parseFloat(sum.toFixed(2))
//       };
//     });
//   }, [data]);

//   // Process chart data with selected options
//   const processChartData = useCallback((chartType, options) => {
//     let processedData = [...data];
    
//     if (options.showPercentageChange) {
//       processedData = calculatePercentageChange(chartType);
//     }
    
//     if (options.showYOYChange && options.dateColumn) {
//       processedData = calculateYOYChange(chartType, options.dateColumn);
//     }
    
//     if (options.showMovingAverage) {
//       processedData = calculateMovingAverage(chartType, options.movingAveragePeriod);
//     }

//     if (options.showGrowthRate) {
//       processedData = calculateGrowthRate(chartType);
//     }

//     if (options.showCumulativeSum) {
//       processedData = calculateCumulativeSum(chartType);
//     }
    
//     return processedData;
//   }, [data, calculatePercentageChange, calculateYOYChange, calculateMovingAverage, calculateGrowthRate, calculateCumulativeSum]);

//   return {
//     processChartData,
//     detectDateColumns,
//     calculatePercentageChange,
//     calculateYOYChange,
//     calculateMovingAverage,
//     calculateGrowthRate,
//     calculateCumulativeSum
//   };
// };

// // Table Filters Component
// export const TableFilters = ({ 
//   columns, 
//   data, 
//   filters, 
//   setFilters, 
//   setPageIndex,
//   numericalColumns,
//   categoricalColumns 
// }) => {
//   const [tempFilter, setTempFilter] = useState({
//     column: '',
//     operator: '=',
//     value: ''
//   });

//   const operators = {
//     numerical: ['=', '>', '<', '>=', '<=', 'between'],
//     categorical: ['=', 'contains', 'starts with', 'ends with'],
//   };

//   const handleAddFilter = () => {
//     if (!tempFilter.column || !tempFilter.value) return;
    
//     setFilters(prev => ({
//       ...prev,
//       activeFilters: [...prev.activeFilters, { ...tempFilter, id: Date.now() }],
//       columnFilters: {
//         ...prev.columnFilters,
//         [tempFilter.column]: [...(prev.columnFilters[tempFilter.column] || []), tempFilter]
//       }
//     }));
//     setTempFilter({ column: '', operator: '=', value: '' });
//     setPageIndex(0);
//   };

//   const handleRemoveFilter = (filterId) => {
//     setFilters(prev => ({
//       ...prev,
//       activeFilters: prev.activeFilters.filter(f => f.id !== filterId),
//       columnFilters: Object.fromEntries(
//         Object.entries(prev.columnFilters).map(([col, filters]) => [
//           col,
//           filters.filter(f => f.id !== filterId)
//         ])
//       )
//     }));
//     setPageIndex(0);
//   };

//   return (
//     <div className="table-filters">
//       <div className="filter-group">
//         <input
//           type="text"
//           placeholder="Search all columns..."
//           className="filter-input"
//           value={filters.searchText}
//           onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
//         />
        
//         <select
//           className="filter-select"
//           value={tempFilter.column}
//           onChange={(e) => setTempFilter(prev => ({ ...prev, column: e.target.value }))}
//         >
//           <option value="">Select Column</option>
//           {columns.map(col => (
//             <option key={col} value={col}>{col}</option>
//           ))}
//         </select>

//         <select
//           className="filter-select"
//           value={tempFilter.operator}
//           onChange={(e) => setTempFilter(prev => ({ ...prev, operator: e.target.value }))}
//         >
//           {tempFilter.column && (numericalColumns.includes(tempFilter.column) 
//             ? operators.numerical 
//             : operators.categorical
//           ).map(op => (
//             <option key={op} value={op}>{op}</option>
//           ))}
//         </select>

//         {tempFilter.operator === 'between' ? (
//           <>
//             <input
//               type="text"
//               placeholder="Min value"
//               className="filter-input"
//               value={tempFilter.value.split(',')[0] || ''}
//               onChange={(e) => setTempFilter(prev => ({
//                 ...prev,
//                 value: `${e.target.value},${prev.value.split(',')[1] || ''}`
//               }))}
//             />
//             <input
//               type="text"
//               placeholder="Max value"
//               className="filter-input"
//               value={tempFilter.value.split(',')[1] || ''}
//               onChange={(e) => setTempFilter(prev => ({
//                 ...prev,
//                 value: `${prev.value.split(',')[0] || ''},${e.target.value}`
//               }))}
//             />
//           </>
//         ) : (
//           <input
//             type="text"
//             placeholder="Filter value"
//             className="filter-input"
//             value={tempFilter.value}
//             onChange={(e) => setTempFilter(prev => ({ ...prev, value: e.target.value }))}
//           />
//         )}

//         <button className="filter-button" onClick={handleAddFilter}>
//           Add Filter
//         </button>
//       </div>

//       {filters.activeFilters.length > 0 && (
//         <div className="filter-group">
//           {filters.activeFilters.map(filter => (
//             <div key={filter.id} className="filter-tag">
//               {`${filter.column} ${filter.operator} ${filter.value}`}
//               <button onClick={() => handleRemoveFilter(filter.id)}>×</button>
//             </div>
//           ))}
//         </div>
//       )}

//       <div className="filter-group">
//         <select
//           className="filter-select"
//           value={filters.rowsPerPage}
//           onChange={(e) => setFilters(prev => ({ 
//             ...prev, 
//             rowsPerPage: Number(e.target.value) 
//           }))}
//         >
//           <option value={10}>10 rows</option>
//           <option value={25}>25 rows</option>
//           <option value={50}>50 rows</option>
//           <option value={100}>100 rows</option>
//         </select>
//       </div>
//     </div>
//   );
// };

// // Draggable Component
// export const DraggableComponent = ({ 
//   children, 
//   onActivate, 
//   isActive, 
//   onDelete,
//   defaultPosition = { x: 0, y: 0 },
//   defaultSize = { width: 500, height: 400 }
// }) => {
//   const [position, setPosition] = useState(defaultPosition);
//   const [size, setSize] = useState(defaultSize);
//   const [isDragging, setIsDragging] = useState(false);
//   const [isResizing, setIsResizing] = useState(false);
//   const componentRef = useRef(null);
//   const dragStartPos = useRef({ x: 0, y: 0 });

//   useEffect(() => {
//     const handleWindowResize = () => {
//       if (componentRef.current) {
//         const rect = componentRef.current.getBoundingClientRect();
//         const viewportWidth = window.innerWidth;
//         const viewportHeight = window.innerHeight;

//         if (rect.right > viewportWidth) {
//           setPosition(prev => ({ ...prev, x: viewportWidth - size.width - 20 }));
//         }
//         if (rect.bottom > viewportHeight) {
//           setPosition(prev => ({ ...prev, y: viewportHeight - size.height - 20 }));
//         }
//       }
//     };

//     window.addEventListener('resize', handleWindowResize);
//     return () => window.removeEventListener('resize', handleWindowResize);
//   }, [size]);

//   const handleMouseDown = (e) => {
//     if (e.target.className.includes('resize-handle')) {
//       handleResizeStart(e);
//     } else if (e.target.className.includes('drag-handle')) {
//       handleDragStart(e);
//     }
//     onActivate?.();
//   };

//   const handleDragStart = (e) => {
//     setIsDragging(true);
//     dragStartPos.current = {
//       x: e.clientX - position.x,
//       y: e.clientY - position.y
//     };
//   };

//   const handleResizeStart = (e) => {
//     setIsResizing(true);
//     dragStartPos.current = {
//       x: e.clientX,
//       y: e.clientY,
//       width: size.width,
//       height: size.height
//     };
//   };

//   const handleMouseMove = useCallback((e) => {
//     if (isDragging) {
//       const newX = e.clientX - dragStartPos.current.x;
//       const newY = e.clientY - dragStartPos.current.y;
      
//       const maxX = window.innerWidth - size.width;
//       const maxY = window.innerHeight - size.height;
      
//       setPosition({
//         x: Math.max(0, Math.min(newX, maxX)),
//         y: Math.max(0, Math.min(newY, maxY))
//       });
//     } else if (isResizing) {
//       const deltaX = e.clientX - dragStartPos.current.x;
//       const deltaY = e.clientY - dragStartPos.current.y;
      
//       const newWidth = Math.max(300, Math.min(dragStartPos.current.width + deltaX, 800));
//       const newHeight = Math.max(200, Math.min(dragStartPos.current.height + deltaY, 600));
      
//       setSize({ width: newWidth, height: newHeight });
//     }
//   }, [isDragging, isResizing, size.width, size.height]);

//   const handleMouseUp = useCallback(() => {
//     setIsDragging(false);
//     setIsResizing(false);
//   }, []);

//   useEffect(() => {
//     if (isDragging || isResizing) {
//       window.addEventListener('mousemove', handleMouseMove);
//       window.addEventListener('mouseup', handleMouseUp);
      
//       return () => {
//         window.removeEventListener('mousemove', handleMouseMove);
//         window.removeEventListener('mouseup', handleMouseUp);
//       };
//     }
//   }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

//   return (
//     <div
//       ref={componentRef}
//       className={`draggable-component ${isActive ? 'active' : ''}`}
//       style={{
//         position: 'absolute',
//         left: position.x,
//         top: position.y,
//         width: size.width,
//         height: size.height,
//         backgroundColor: '#1a1a1a',
//         border: isActive ? '2px solid #007bff' : '2px solid #333',
//         borderRadius: '8px',
//         overflow: 'hidden',
//         transition: 'border-color 0.2s',
//         zIndex: isActive ? 1000 : 1
//       }}
//       onMouseDown={handleMouseDown}
//     >
//       <div className="drag-handle" style={{
//         height: '30px',
//         background: '#333',
//         cursor: 'move',
//         display: 'flex',
//         alignItems: 'center',
//         padding: '0 10px',
//         justifyContent: 'space-between'
//       }}>
//         <span>⋮</span>
//         {isActive && onDelete && (
//           <button
//             onClick={onDelete}
//             style={{
//               background: 'none',
//               border: 'none',
//               color: '#ff4d4f',
//               cursor: 'pointer',
//               fontSize: '16px'
//             }}
//           >
//             🗑️
//           </button>
//         )}
//       </div>
      
//       <div style={{ padding: '10px', height: 'calc(100% - 50px)', overflow: 'auto' }}>
//         {children}
//       </div>
      
//       <div
//         className="resize-handle"
//         style={{
//           position: 'absolute',
//           bottom: 0,
//           right: 0,
//           width: '15px',
//           height: '15px',
//           cursor: 'se-resize',
//           background: 'transparent'
//         }}
//       />
//     </div>
//   );
// };

// // Chart Options Panel
// export const ChartOptionsPanel = ({ 
//   options, 
//   setOptions, 
//   dateColumns = [], 
//   onProcessData,
//   className = '' 
// }) => {
//   const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

//   return (
//     <div className={`chart-options-panel ${className}`}>
//       <div className="option-group">
//         <label className="option-checkbox">
//           <input
//             type="checkbox"
//             checked={options.showPercentageChange}
//             onChange={(e) => {
//               setOptions(prev => ({
//                 ...prev,
//                 showPercentageChange: e.target.checked
//               }));
//               onProcessData?.();
//             }}
//           />
//           <span>Show Percentage Change</span>
//         </label>
//       </div>

//       {dateColumns.length > 0 && (
//         <div className="option-group">
//           <label className="option-checkbox">
//             <input
//               type="checkbox"
//               checked={options.showYOYChange}
//               onChange={(e) => {
//                 setOptions(prev => ({
//                   ...prev,
//                   showYOYChange: e.target.checked
//                 }));
//                 onProcessData?.();
//               }}
//             />
//             <span>Show Year-over-Year Change</span>
//           </label>
//           {options.showYOYChange && (
//             <select
//               className="option-select"
//               value={options.dateColumn}
//               onChange={(e) => {
//                 setOptions(prev => ({
//                   ...prev,
//                   dateColumn: e.target.value
//                 }));
//                 onProcessData?.();
//               }}
//             >
//               <option value="">Select Date Column</option>
//               {dateColumns.map(col => (
//                 <option key={col} value={col}>{col}</option>
//               ))}
//             </select>
//           )}
//         </div>
//       )}

//       <div className="option-group">
//         <label className="option-checkbox">
//           <input
//             type="checkbox"
//             checked={options.showMovingAverage}
//             onChange={(e) => {
//               setOptions(prev => ({
//                 ...prev,
//                 showMovingAverage: e.target.checked
//               }));
//               onProcessData?.();
//             }}
//           />
//           <span>Show Moving Average</span>
//         </label>
//         {options.showMovingAverage && (
//           <select
//             className="option-select"
//             value={options.movingAveragePeriod}
//             onChange={(e) => {
//               setOptions(prev => ({
//                 ...prev,
//                 movingAveragePeriod: parseInt(e.target.value)
//               }));
//               onProcessData?.();
//             }}
//           >
//             <option value={3}>3 Period MA</option>
//             <option value={5}>5 Period MA</option>
//             <option value={7}>7 Period MA</option>
//             <option value={10}>10 Period MA</option>
//           </select>
//         )}
//       </div>

//       <button
//         className="advanced-options-toggle"
//         onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
//       >
//         {showAdvancedOptions ? '▼' : '▶'} Advanced Options
//       </button>

//       {showAdvancedOptions && (
//         <>
//           <div className="option-group">
//             <label className="option-checkbox">
//               <input
//                 type="checkbox"
//                 checked={options.showGrowthRate}
//                 onChange={(e) => {
//                   setOptions(prev => ({
//                     ...prev,
//                     showGrowthRate: e.target.checked
//                   }));
//                   onProcessData?.();
//                 }}
//               />
//               <span>Show Growth Rate</span>
//             </label>
//           </div>

//           <div className="option-group">
//             <label className="option-checkbox">
//               <input
//                 type="checkbox"
//                 checked={options.showCumulativeSum}
//                 onChange={(e) => {
//                   setOptions(prev => ({
//                     ...prev,
//                     showCumulativeSum: e.target.checked
//                   }));
//                   onProcessData?.();
//                 }}
//               />
//               <span>Show Cumulative Sum</span>
//             </label>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// // Data Aggregator Component
// export const DataAggregator = ({
//   data,
//   column,
//   groupByColumn,
//   aggregationType = 'sum'
// }) => {
//   const [aggregatedData, setAggregatedData] = useState([]);

//   useEffect(() => {
//     if (!data || !column || !groupByColumn) return;

//     const groupedData = data.reduce((acc, row) => {
//       const key = row[groupByColumn];
//       if (!acc[key]) {
//         acc[key] = [];
//       }
//       acc[key].push(parseFloat(row[column]) || 0);
//       return acc;
//     }, {});

//     const aggregated = Object.entries(groupedData).map(([key, values]) => {
//       let value;
//       switch (aggregationType) {
//         case 'sum':
//           value = values.reduce((a, b) => a + b, 0);
//           break;
//         case 'average':
//           value = values.reduce((a, b) => a + b, 0) / values.length;
//           break;
//         case 'max':
//           value = Math.max(...values);
//           break;
//         case 'min':
//           value = Math.min(...values);
//           break;
//         default:
//           value = values.reduce((a, b) => a + b, 0);
//       }

//       return {
//         [groupByColumn]: key,
//         [column]: value
//       };
//     });

//     setAggregatedData(aggregated);
//   }, [data, column, groupByColumn, aggregationType]);

//   return aggregatedData;
// };









import React, { useState, useCallback, useEffect, useRef } from 'react';
import { parseISO, isValid } from 'date-fns';

// Data Processing Hook
export const useDataProcessing = (data, columns) => {
  // Detect date columns with proper type checking
  const detectDateColumns = useCallback(() => {
    if (!Array.isArray(data) || data.length === 0 || !Array.isArray(columns)) return [];
    
    return columns.filter(column => {
      const sampleValue = data[0]?.[column];
      if (sampleValue == null) return false;
      
      try {
        return isValid(parseISO(String(sampleValue)));
      } catch {
        return false;
      }
    });
  }, [data, columns]);

  // Percentage change with error handling
  const calculatePercentageChange = useCallback((column) => {
    if (!Array.isArray(data) || data.length < 2 || !column) return [];
    
    return data.map((row, index) => {
      if (index === 0) return { ...row, [`${column}_pct_change`]: 0 };
      
      const currentValue = Number(row[column]);
      const previousValue = Number(data[index - 1][column]);
      
      if (isNaN(currentValue) || isNaN(previousValue)) {
        return { ...row, [`${column}_pct_change`]: null };
      }
      
      const percentageChange = previousValue !== 0 
        ? ((currentValue - previousValue) / previousValue) * 100 
        : 0;
        
      return {
        ...row,
        [`${column}_pct_change`]: parseFloat(percentageChange.toFixed(2))
      };
    });
  }, [data]);

  // Year-over-year change with improved date handling
  const calculateYOYChange = useCallback((column, dateColumn) => {
    if (!Array.isArray(data) || data.length < 12 || !column || !dateColumn) return data;
    
    try {
      const sortedData = [...data].sort((a, b) => {
        const dateA = new Date(a[dateColumn]);
        const dateB = new Date(b[dateColumn]);
        
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          throw new Error('Invalid date format');
        }
        
        return dateA - dateB;
      });
      
      return sortedData.map((row, index) => {
        if (index < 12) return { ...row, [`${column}_yoy_change`]: null };
        
        const currentValue = Number(row[column]);
        const previousYearValue = Number(sortedData[index - 12][column]);
        
        if (isNaN(currentValue) || isNaN(previousYearValue)) {
          return { ...row, [`${column}_yoy_change`]: null };
        }
        
        const yoyChange = previousYearValue !== 0 
          ? ((currentValue - previousYearValue) / previousYearValue) * 100 
          : 0;
          
        return {
          ...row,
          [`${column}_yoy_change`]: parseFloat(yoyChange.toFixed(2))
        };
      });
    } catch (error) {
      console.error('Error calculating YOY change:', error);
      return data;
    }
  }, [data]);

  // Moving average with validation
  const calculateMovingAverage = useCallback((column, period = 3) => {
    if (!Array.isArray(data) || data.length < period || !column || period < 1) return [];
    
    return data.map((row, index) => {
      if (index < period - 1) return { ...row, [`${column}_ma${period}`]: null };
      
      const values = data
        .slice(index - period + 1, index + 1)
        .map(r => Number(r[column]))
        .filter(val => !isNaN(val));
        
      if (values.length !== period) {
        return { ...row, [`${column}_ma${period}`]: null };
      }
      
      const average = values.reduce((a, b) => a + b, 0) / period;
      
      return {
        ...row,
        [`${column}_ma${period}`]: parseFloat(average.toFixed(2))
      };
    });
  }, [data]);

  // Growth rate with improved error handling
  const calculateGrowthRate = useCallback((column) => {
    if (!Array.isArray(data) || data.length < 2 || !column) return [];
    
    const firstValue = Number(data[0][column]);
    const lastValue = Number(data[data.length - 1][column]);
    
    if (isNaN(firstValue) || isNaN(lastValue) || firstValue <= 0) {
      return data.map(row => ({
        ...row,
        [`${column}_growth_rate`]: null
      }));
    }
    
    const periods = data.length - 1;
    const growthRate = Math.pow(lastValue / firstValue, 1 / periods) - 1;
    
    return data.map(row => ({
      ...row,
      [`${column}_growth_rate`]: parseFloat((growthRate * 100).toFixed(2))
    }));
  }, [data]);

  // Cumulative sum with type checking
  const calculateCumulativeSum = useCallback((column) => {
    if (!Array.isArray(data) || data.length === 0 || !column) return [];
    
    let sum = 0;
    return data.map(row => {
      const value = Number(row[column]);
      if (isNaN(value)) {
        return { ...row, [`${column}_cumsum`]: null };
      }
      
      sum += value;
      return {
        ...row,
        [`${column}_cumsum`]: parseFloat(sum.toFixed(2))
      };
    });
  }, [data]);

  // Process chart data with validation
  const processChartData = useCallback((chartType, options = {}) => {
    if (!chartType || !Array.isArray(data)) return [];
    
    let processedData = [...data];
    
    if (options.showPercentageChange) {
      processedData = calculatePercentageChange(chartType);
    }
    
    if (options.showYOYChange && options.dateColumn) {
      processedData = calculateYOYChange(chartType, options.dateColumn);
    }
    
    if (options.showMovingAverage) {
      processedData = calculateMovingAverage(chartType, options.movingAveragePeriod || 3);
    }

    if (options.showGrowthRate) {
      processedData = calculateGrowthRate(chartType);
    }

    if (options.showCumulativeSum) {
      processedData = calculateCumulativeSum(chartType);
    }
    
    return processedData;
  }, [data, calculatePercentageChange, calculateYOYChange, calculateMovingAverage, calculateGrowthRate, calculateCumulativeSum]);

  return {
    processChartData,
    detectDateColumns,
    calculatePercentageChange,
    calculateYOYChange,
    calculateMovingAverage,
    calculateGrowthRate,
    calculateCumulativeSum
  };
};

// Table Filters Component with improved validation
export const TableFilters = ({ 
  columns = [], 
  data = [], 
  filters = {},
  setFilters,
  setPageIndex,
  numericalColumns = [],
  categoricalColumns = []
}) => {
  const [tempFilter, setTempFilter] = useState({
    column: '',
    operator: '=',
    value: ''
  });

  const operators = {
    numerical: ['=', '>', '<', '>=', '<=', 'between'],
    categorical: ['=', 'contains', 'starts with', 'ends with'],
  };

  const handleAddFilter = () => {
    if (!tempFilter.column || !tempFilter.value) return;
    
    setFilters(prev => ({
      ...prev,
      activeFilters: [...(prev.activeFilters || []), { ...tempFilter, id: Date.now() }],
      columnFilters: {
        ...(prev.columnFilters || {}),
        [tempFilter.column]: [...(prev.columnFilters?.[tempFilter.column] || []), tempFilter]
      }
    }));
    setTempFilter({ column: '', operator: '=', value: '' });
    setPageIndex?.(0);
  };

  const handleRemoveFilter = (filterId) => {
    if (!filterId) return;
    
    setFilters(prev => ({
      ...prev,
      activeFilters: prev.activeFilters?.filter(f => f.id !== filterId) || [],
      columnFilters: Object.fromEntries(
        Object.entries(prev.columnFilters || {}).map(([col, filters]) => [
          col,
          filters.filter(f => f.id !== filterId)
        ])
      )
    }));
    setPageIndex?.(0);
  };

  return (
    <div className="table-filters">
      <div className="filter-group">
        <input
          type="text"
          placeholder="Search all columns..."
          className="filter-input"
          value={filters.searchText || ''}
          onChange={(e) => setFilters?.(prev => ({ ...prev, searchText: e.target.value }))}
        />
        
        <select
          className="filter-select"
          value={tempFilter.column}
          onChange={(e) => setTempFilter(prev => ({ ...prev, column: e.target.value }))}
        >
          <option value="">Select Column</option>
          {columns.map(col => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={tempFilter.operator}
          onChange={(e) => setTempFilter(prev => ({ ...prev, operator: e.target.value }))}
        >
          {tempFilter.column && (numericalColumns.includes(tempFilter.column) 
            ? operators.numerical 
            : operators.categorical
          ).map(op => (
            <option key={op} value={op}>{op}</option>
          ))}
        </select>

        {tempFilter.operator === 'between' ? (
          <>
            <input
              type="text"
              placeholder="Min value"
              className="filter-input"
              value={tempFilter.value.split(',')[0] || ''}
              onChange={(e) => setTempFilter(prev => ({
                ...prev,
                value: `${e.target.value},${prev.value.split(',')[1] || ''}`
              }))}
            />
            <input
              type="text"
              placeholder="Max value"
              className="filter-input"
              value={tempFilter.value.split(',')[1] || ''}
              onChange={(e) => setTempFilter(prev => ({
                ...prev,
                value: `${prev.value.split(',')[0] || ''},${e.target.value}`
              }))}
            />
          </>
        ) : (
          <input
            type="text"
            placeholder="Filter value"
            className="filter-input"
            value={tempFilter.value}
            onChange={(e) => setTempFilter(prev => ({ ...prev, value: e.target.value }))}
          />
        )}

        <button 
          className="filter-button" 
          onClick={handleAddFilter}
          disabled={!tempFilter.column || !tempFilter.value}
        >
          Add Filter
        </button>
      </div>

      {filters.activeFilters?.length > 0 && (
        <div className="filter-group">
          {filters.activeFilters.map(filter => (
            <div key={filter.id} className="filter-tag">
              {`${filter.column} ${filter.operator} ${filter.value}`}
              <button 
                onClick={() => handleRemoveFilter(filter.id)}
                className="remove-filter"
                aria-label="Remove filter"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="filter-group">
        <select
          className="filter-select"
          value={filters.rowsPerPage || 10}
          onChange={(e) => setFilters?.(prev => ({ 
            ...prev, 
            rowsPerPage: Number(e.target.value) 
          }))}
        >
          <option value={10}>10 rows</option>
          <option value={25}>25 rows</option>
          <option value={50}>50 rows</option>
          <option value={100}>100 rows</option>
        </select>
      </div>
    </div>
  );
};

// Draggable Component with improved boundary handling
export const DraggableComponent = ({ 
  children, 
  onActivate, 
  isActive, 
  onDelete,
  defaultPosition = { x: 0, y: 0 },
  defaultSize = { width: 500, height: 400 }
}) => {
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const componentRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const constrainPosition = useCallback((pos) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    return {
      x: Math.max(0, Math.min(pos.x, viewportWidth - size.width)),
      y: Math.max(0, Math.min(pos.y, viewportHeight - size.height))
    };
  }, [size.width, size.height]);

  useEffect(() => {
    const handleWindowResize = () => {
      if (componentRef.current) {
        setPosition(prev => constrainPosition(prev));
      }
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [constrainPosition]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only handle left click
    
    if (e.target.className.includes('resize-handle')) {
      handleResizeStart(e);
    } else if (e.target.className.includes('drag-handle')) {
      handleDragStart(e);
    }
    onActivate?.();
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleResizeStart = (e) => {
    setIsResizing(true);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    };
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y
      };
      setPosition(constrainPosition(newPosition));
    } else if (isResizing) {
      const deltaX = e.clientX - dragStartPos.current.x
        const deltaY = e.clientY - dragStartPos.current.y;
        
        const newWidth = Math.max(300, Math.min(dragStartPos.current.width + deltaX, window.innerWidth - position.x));
        const newHeight = Math.max(200, Math.min(dragStartPos.current.height + deltaY, window.innerHeight - position.y));
        
        setSize({ width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, position.x, position.y, constrainPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

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
      className={`draggable-component ${isActive ? 'active' : ''}`}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        backgroundColor: '#1a1a1a',
        border: isActive ? '2px solid #007bff' : '2px solid #333',
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        zIndex: isActive ? 1000 : 1,
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <div 
        className="drag-handle" 
        style={{
          height: '30px',
          background: '#333',
          cursor: 'move',
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          justifyContent: 'space-between'
        }}
      >
        <span>⋮</span>
        {isActive && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff4d4f',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px 8px'
            }}
            aria-label="Delete component"
          >
            🗑️
          </button>
        )}
      </div>
      
      <div style={{ 
        padding: '10px', 
        height: 'calc(100% - 50px)', 
        overflow: 'auto',
        position: 'relative'
      }}>
        {children}
      </div>
      
      <div
        className="resize-handle"
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '15px',
          height: '15px',
          cursor: 'se-resize',
          background: 'transparent'
        }}
      />
    </div>
  );
};

// Chart Options Panel with improved state management
export const ChartOptionsPanel = ({ 
  options = {}, 
  setOptions, 
  dateColumns = [], 
  onProcessData,
  className = '' 
}) => {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const handleOptionChange = useCallback((key, value) => {
    setOptions?.(prev => ({
      ...prev,
      [key]: value
    }));
    onProcessData?.();
  }, [setOptions, onProcessData]);

  return (
    <div className={`chart-options-panel ${className}`}>
      <div className="option-group">
        <label className="option-checkbox">
          <input
            type="checkbox"
            checked={options.showPercentageChange || false}
            onChange={(e) => handleOptionChange('showPercentageChange', e.target.checked)}
          />
          <span>Show Percentage Change</span>
        </label>
      </div>

      {dateColumns.length > 0 && (
        <div className="option-group">
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={options.showYOYChange || false}
              onChange={(e) => handleOptionChange('showYOYChange', e.target.checked)}
            />
            <span>Show Year-over-Year Change</span>
          </label>
          {options.showYOYChange && (
            <select
              className="option-select"
              value={options.dateColumn || ''}
              onChange={(e) => handleOptionChange('dateColumn', e.target.value)}
            >
              <option value="">Select Date Column</option>
              {dateColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="option-group">
        <label className="option-checkbox">
          <input
            type="checkbox"
            checked={options.showMovingAverage || false}
            onChange={(e) => handleOptionChange('showMovingAverage', e.target.checked)}
          />
          <span>Show Moving Average</span>
        </label>
        {options.showMovingAverage && (
          <select
            className="option-select"
            value={options.movingAveragePeriod || 3}
            onChange={(e) => handleOptionChange('movingAveragePeriod', parseInt(e.target.value))}
          >
            <option value={3}>3 Period MA</option>
            <option value={5}>5 Period MA</option>
            <option value={7}>7 Period MA</option>
            <option value={10}>10 Period MA</option>
          </select>
        )}
      </div>

      <button
        className="advanced-options-toggle"
        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
        aria-expanded={showAdvancedOptions}
      >
        {showAdvancedOptions ? '▼' : '▶'} Advanced Options
      </button>

      {showAdvancedOptions && (
        <>
          <div className="option-group">
            <label className="option-checkbox">
              <input
                type="checkbox"
                checked={options.showGrowthRate || false}
                onChange={(e) => handleOptionChange('showGrowthRate', e.target.checked)}
              />
              <span>Show Growth Rate</span>
            </label>
          </div>

          <div className="option-group">
            <label className="option-checkbox">
              <input
                type="checkbox"
                checked={options.showCumulativeSum || false}
                onChange={(e) => handleOptionChange('showCumulativeSum', e.target.checked)}
              />
              <span>Show Cumulative Sum</span>
            </label>
          </div>
        </>
      )}
    </div>
  );
};

// Data Aggregator Component with improved error handling
export const DataAggregator = ({
  data = [],
  column,
  groupByColumn,
  aggregationType = 'sum'
}) => {
  const [aggregatedData, setAggregatedData] = useState([]);

  useEffect(() => {
    if (!Array.isArray(data) || !column || !groupByColumn) {
      setAggregatedData([]);
      return;
    }

    try {
      const groupedData = data.reduce((acc, row) => {
        const key = row[groupByColumn];
        if (key == null) return acc;
        
        if (!acc[key]) {
          acc[key] = [];
        }
        
        const value = Number(row[column]);
        if (!isNaN(value)) {
          acc[key].push(value);
        }
        
        return acc;
      }, {});

      const aggregated = Object.entries(groupedData).map(([key, values]) => {
        let value;
        
        if (values.length === 0) {
          value = null;
        } else {
          switch (aggregationType) {
            case 'sum':
              value = values.reduce((a, b) => a + b, 0);
              break;
            case 'average':
              value = values.reduce((a, b) => a + b, 0) / values.length;
              break;
            case 'max':
              value = Math.max(...values);
              break;
            case 'min':
              value = Math.min(...values);
              break;
            default:
              value = values.reduce((a, b) => a + b, 0);
          }
        }

        return {
          [groupByColumn]: key,
          [column]: value != null ? parseFloat(value.toFixed(2)) : null
        };
      });

      setAggregatedData(aggregated);
    } catch (error) {
      console.error('Error aggregating data:', error);
      setAggregatedData([]);
    }
  }, [data, column, groupByColumn, aggregationType]);

  return aggregatedData;
};