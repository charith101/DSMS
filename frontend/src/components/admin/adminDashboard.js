import React from 'react'
import { Link } from 'react-router-dom'

function adminDashboard() {
  return (
    <div>
        <p>adminDashboard(dulaj)</p>
        <Link to="/vehicle-dashboard">Vehicle Dashboard(Lithira)</Link>
    </div>
    
  )
}

export default adminDashboard