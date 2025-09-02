import React, { useEffect, useState } from 'react';
import axios from 'axios';


export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState('');

  // useEffect(() => {
  //   axios.get('/api/receptionist/announcement')
  //     .then(res => setAnnouncement(res.data?.message));
  // }, []);

  return announcement ? (
    <div className="alert alert-warning text-center m-0 py-2" role="alert">
      🔔 {announcement}
    </div>
  ) : null;
}
