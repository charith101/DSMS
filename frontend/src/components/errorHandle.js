import React from 'react'
import PropTypes from 'prop-types'

function errorHandle(props) {
  const getFieldError = (errorString, fieldName) => {
    if (!errorString || !fieldName) return null;
    
    const pattern = new RegExp(`${fieldName}:\\s*([^,]+)`, 'i');
    const match = errorString.match(pattern);
    
    return match ? match[1].trim() : null;
  };

  const specificError = getFieldError(props.error, props.for);
  
  if (!specificError) return null;
    
  return (
    <div><h6 className="text-danger ms-1">{specificError}</h6></div>
  )
}

errorHandle.propTypes = {
  for: PropTypes.string.isRequired,
  error: PropTypes.string
}

export default errorHandle
