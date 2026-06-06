import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Clock, AlertTriangle } from 'lucide-react';
import Card from '../components/ui/Card';
import api from '../services/api';
import { PRIORITY_COLORS } from '../utils/constants';
import './CalendarPage.css';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leads, setLeads] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/leads?limit=100');
        setLeads(res.data.data || []);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const getFollowUps = (day) => {
    if (!day) return [];
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return leads.filter(l => {
      if (!l.nextFollowUp) return false;
      const fu = new Date(l.nextFollowUp);
      fu.setHours(0, 0, 0, 0);
      return fu.getTime() === date.getTime();
    });
  };

  const isToday = (day) => {
    return day && year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
  };

  const isPast = (day) => {
    if (!day) return false;
    const date = new Date(year, month, day);
    return date < today;
  };

  // Due today and overdue
  const dueToday = leads.filter(l => {
    if (!l.nextFollowUp) return false;
    const fu = new Date(l.nextFollowUp);
    fu.setHours(0, 0, 0, 0);
    return fu.getTime() === today.getTime();
  });

  const overdue = leads.filter(l => {
    if (!l.nextFollowUp) return false;
    const fu = new Date(l.nextFollowUp);
    fu.setHours(0, 0, 0, 0);
    return fu < today;
  });

  const selectedFollowUps = selectedDate ? getFollowUps(selectedDate) : [];

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <h2 className="calendar-title"><CalIcon size={22} /> Calendar</h2>
      </div>

      {/* Summary cards */}
      <div className="cal-summary">
        <Card className="cal-summary-card" variant="glow">
          <Clock size={18} className="cal-summary-icon" />
          <div>
            <div className="cal-summary-count">{dueToday.length}</div>
            <div className="cal-summary-label">Due Today</div>
          </div>
        </Card>
        <Card className="cal-summary-card cal-overdue" variant="glow">
          <AlertTriangle size={18} className="cal-summary-icon" />
          <div>
            <div className="cal-summary-count">{overdue.length}</div>
            <div className="cal-summary-label">Overdue</div>
          </div>
        </Card>
      </div>

      <div className="cal-layout">
        {/* Calendar Grid */}
        <Card className="cal-grid-card">
          <div className="cal-nav">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="cal-nav-btn"><ChevronLeft size={18} /></button>
            <h3 className="cal-month">{monthName}</h3>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="cal-nav-btn"><ChevronRight size={18} /></button>
          </div>

          <div className="cal-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="cal-weekday">{d}</div>
            ))}
          </div>

          <div className="cal-days">
            {days.map((day, i) => {
              const followUps = getFollowUps(day);
              return (
                <div
                  key={i}
                  className={`cal-day ${!day ? 'cal-day-empty' : ''} ${isToday(day) ? 'cal-day-today' : ''} ${selectedDate === day ? 'cal-day-selected' : ''} ${isPast(day) && followUps.length > 0 ? 'cal-day-overdue' : ''}`}
                  onClick={() => day && setSelectedDate(day)}
                >
                  {day && (
                    <>
                      <span className="cal-day-num">{day}</span>
                      {followUps.length > 0 && (
                        <div className="cal-day-dots">
                          {followUps.slice(0, 3).map((l, j) => (
                            <span key={j} className="cal-day-dot" style={{ background: PRIORITY_COLORS[l.priority]?.hex || '#6366f1' }} />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Sidebar: selected day */}
        <Card className="cal-sidebar-card">
          <h3 className="cal-sidebar-title">
            {selectedDate
              ? new Date(year, month, selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
              : 'Select a Date'}
          </h3>
          {selectedFollowUps.length > 0 ? (
            <div className="cal-events">
              {selectedFollowUps.map((l) => (
                <div key={l._id} className="cal-event" onClick={() => navigate(`/leads/${l._id}`)}>
                  <div className="cal-event-dot" style={{ background: PRIORITY_COLORS[l.priority]?.hex || '#6366f1' }} />
                  <div>
                    <div className="cal-event-name">{l.name}</div>
                    <div className="cal-event-company">{l.company}</div>
                    <span className="cal-event-priority" style={{ color: PRIORITY_COLORS[l.priority]?.hex }}>{l.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="cal-no-events">{selectedDate ? 'No follow-ups scheduled' : 'Click a date to view follow-ups'}</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
