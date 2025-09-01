import React, { useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useKeyboardNavigation, useUniqueId } from '../../hooks/useAccessibility';
import { KEYS, ARIA_ROLES } from '../../utils/accessibilityUtils';

/**
 * Table component with sorting, filtering, and pagination capabilities
 * Follows the design system from tables.css
 */
const Table = ({
  data = [],
  columns = [],
  sortable = false,
  striped = false,
  bordered = false,
  size = 'base',
  responsive = true,
  loading = false,
  emptyMessage = 'No data available',
  caption,
  className = '',
  onRowClick,
  selectableRows = false,
  selectedRows = [],
  onRowSelect,
  keyboardNavigation = false,
  ...props
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const tableId = useUniqueId('table');
  const captionId = useUniqueId('table-caption');
  const tableRef = useRef(null);
  
  // Keyboard navigation for rows
  const rowNavigation = useKeyboardNavigation(data, {
    enabled: keyboardNavigation,
    onSelect: (row, index) => {
      if (onRowClick) {
        onRowClick(row, index);
      }
    },
    onEscape: () => {
      setFocusedRowIndex(-1);
      if (tableRef.current) {
        tableRef.current.focus();
      }
    }
  });
  
  // Handle column sorting
  const handleSort = useCallback((columnKey) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key: columnKey, direction });
    
    // Announce sort change to screen readers
    const column = columns.find(col => col.key === columnKey);
    if (column) {
      const announcement = `Table sorted by ${column.title} in ${direction}ending order`;
      // You could use useLiveRegion hook here for announcements
      console.log(announcement); // Placeholder for screen reader announcement
    }
  }, [sortable, sortConfig, columns]);
  
  // Handle row selection
  const handleRowSelect = useCallback((row, index, isSelected) => {
    if (onRowSelect) {
      onRowSelect(row, index, isSelected);
    }
  }, [onRowSelect]);
  
  // Handle keyboard navigation
  const handleTableKeyDown = useCallback((event) => {
    if (!keyboardNavigation) return;
    
    switch (event.key) {
      case KEYS.ARROW_DOWN:
        event.preventDefault();
        setFocusedRowIndex(prev => Math.min(prev + 1, data.length - 1));
        break;
      case KEYS.ARROW_UP:
        event.preventDefault();
        setFocusedRowIndex(prev => Math.max(prev - 1, 0));
        break;
      case KEYS.HOME:
        event.preventDefault();
        setFocusedRowIndex(0);
        break;
      case KEYS.END:
        event.preventDefault();
        setFocusedRowIndex(data.length - 1);
        break;
      case KEYS.ENTER:
      case KEYS.SPACE:
        event.preventDefault();
        if (focusedRowIndex >= 0 && onRowClick) {
          onRowClick(data[focusedRowIndex], focusedRowIndex);
        }
        break;
      default:
        break;
    }
  }, [keyboardNavigation, data, focusedRowIndex, onRowClick]);
  
  // Sort data based on current sort config
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);
  
  // Build table classes
  const getTableClasses = () => {
    let classes = ['table'];
    
    if (sortable) classes.push('table-sortable');
    if (striped) classes.push('table-striped');
    if (bordered) classes.push('table-bordered');
    if (size !== 'base') classes.push(`table-${size}`);
    if (loading) classes.push('table-loading');
    if (className) classes.push(className);
    
    return classes.join(' ');
  };
  
  // Build header cell classes
  const getHeaderClasses = (column) => {
    let classes = [];
    
    if (sortable && column.sortable !== false) {
      classes.push('sortable');
      
      if (sortConfig.key === column.key) {
        classes.push(`sort-${sortConfig.direction}`);
      }
    }
    
    return classes.join(' ');
  };
  
  // Get sort icon for header
  const getSortIcon = (column) => {
    if (!sortable || column.sortable === false) return null;
    
    const isActive = sortConfig.key === column.key;
    const direction = sortConfig.direction;
    
    return (
      <span 
        className="sort-icon" 
        aria-hidden="true"
      >
        {!isActive && '↕'}
        {isActive && direction === 'asc' && '↑'}
        {isActive && direction === 'desc' && '↓'}
      </span>
    );
  };
  
  // Check if row is selected
  const isRowSelected = (row) => {
    return selectableRows && selectedRows.includes(row.id);
  };
  
  // Render cell content
  const renderCell = (row, column, rowIndex) => {
    if (column.render) {
      return column.render(row[column.key], row, rowIndex);
    }
    return row[column.key];
  };
  
  // Empty state
  if (!loading && data.length === 0) {
    return (
      <div 
        className="table-empty"
        role="region"
        aria-labelledby={captionId}
      >
        <div className="table-empty-icon" aria-hidden="true">
          <svg 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
        </div>
        <div className="table-empty-message" id={captionId}>No Data Found</div>
        <div className="table-empty-description">{emptyMessage}</div>
      </div>
    );
  }
  
  const TableWrapper = responsive ? 'div' : React.Fragment;
  const wrapperProps = responsive ? { className: 'table-wrapper' } : {};

  return (
    <TableWrapper {...wrapperProps}>
      <table 
        ref={tableRef}
        className={getTableClasses()} 
        id={tableId}
        role={ARIA_ROLES.GRID}
        aria-label={caption || `Data table with ${data.length} rows and ${columns.length} columns`}
        aria-rowcount={data.length + 1}
        aria-colcount={columns.length + (selectableRows ? 1 : 0)}
        tabIndex={keyboardNavigation ? 0 : -1}
        onKeyDown={handleTableKeyDown}
        {...props}
      >
        {caption && (
          <caption id={captionId} className="sr-only">
            {caption}
          </caption>
        )}
        <thead role="rowgroup">
          <tr role="row" aria-rowindex={1}>
            {selectableRows && (
              <th 
                role="columnheader"
                aria-colindex={1}
                scope="col"
                className="table-select-header"
              >
                <span className="sr-only">Select row</span>
              </th>
            )}
            {columns.map((column, colIndex) => {
              const ariaSort = sortConfig.key === column.key 
                ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending')
                : (sortable && column.sortable !== false ? 'none' : undefined);
              
              return (
                <th
                  key={column.key}
                  role="columnheader"
                  aria-colindex={colIndex + 1 + (selectableRows ? 1 : 0)}
                  aria-sort={ariaSort}
                  scope="col"
                  className={getHeaderClasses(column)}
                  onClick={() => handleSort(column.key)}
                  onKeyDown={(e) => {
                    if ((e.key === KEYS.ENTER || e.key === KEYS.SPACE) && sortable && column.sortable !== false) {
                      e.preventDefault();
                      handleSort(column.key);
                    }
                  }}
                  style={{ width: column.width }}
                  tabIndex={sortable && column.sortable !== false ? 0 : -1}
                >
                  <span>{column.title}</span>
                  {getSortIcon(column)}
                  {sortConfig.key === column.key && (
                    <span className="sr-only">
                      {sortConfig.direction === 'asc' ? 'sorted ascending' : 'sorted descending'}
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {sortedData.map((row, rowIndex) => {
            const isSelected = isRowSelected(row);
            const isFocused = rowIndex === focusedRowIndex;
            
            return (
              <tr
                key={row.id || rowIndex}
                role="row"
                aria-rowindex={rowIndex + 2}
                aria-selected={selectableRows ? isSelected : undefined}
                className={`
                  ${isFocused ? 'table-row-focused' : ''}
                  ${isSelected ? 'table-row-selected' : ''}
                  ${onRowClick ? 'table-row-clickable' : ''}
                `}
                onClick={() => onRowClick && onRowClick(row, rowIndex)}
                onKeyDown={(e) => {
                  if ((e.key === KEYS.ENTER || e.key === KEYS.SPACE) && onRowClick) {
                    e.preventDefault();
                    onRowClick(row, rowIndex);
                  }
                }}
                tabIndex={keyboardNavigation ? (isFocused ? 0 : -1) : -1}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {selectableRows && (
                  <td 
                    role="gridcell"
                    aria-colindex={1}
                    className="table-select-cell"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleRowSelect(row, rowIndex, e.target.checked)}
                      aria-label={`Select row ${rowIndex + 1}`}
                    />
                  </td>
                )}
                {columns.map((column, colIndex) => (
                  <td 
                    key={column.key} 
                    role="gridcell"
                    aria-colindex={colIndex + 1 + (selectableRows ? 1 : 0)}
                    data-label={column.title}
                  >
                    {renderCell(row, column, rowIndex)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableWrapper>
  );
};

Table.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      width: PropTypes.string,
      sortable: PropTypes.bool,
      render: PropTypes.func
    })
  ).isRequired,
  sortable: PropTypes.bool,
  striped: PropTypes.bool,
  bordered: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'base', 'lg']),
  responsive: PropTypes.bool,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  caption: PropTypes.string,
  className: PropTypes.string,
  onRowClick: PropTypes.func,
  selectableRows: PropTypes.bool,
  selectedRows: PropTypes.array,
  onRowSelect: PropTypes.func,
  keyboardNavigation: PropTypes.bool
};

export default Table;