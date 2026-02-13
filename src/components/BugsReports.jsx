import React, { useState } from 'react';
import { Bug, Clock, CircleX , ArrowRight, ChevronDown, Info, Send, Check, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const devKey = import.meta.env.VITE_DEV_KEY;

const bugData = [
  {
    id: '99993286',
    status: 'To do',
    title: 'Images bug',
    desc: 'Thanks for this video! If it is possible next time show us how to work on the task just want to..',
    user: 'Melek Esseket',
    priority: 'High',
    date: 'Feb 5, 10:12 PM',
    comments: 3
  },
  {
    id: '99993287',
    status: 'In Progress',
    title: 'Login page crash',
    desc: 'The login page crashes when entering special characters in the email field.',
    user: 'John Doe',
    priority: 'Medium',
    date: 'Feb 4, 3:45 PM',
    comments: 7
  }
];

const PRIORITIES = [
  { id: 'low', label: 'Low', color: '#0ea5e9' },
  { id: 'medium', label: 'Medium', color: '#f59e0b' },
  { id: 'high', label: 'High', color: '#ef4444' },
  { id: 'critical', label: 'Critical', color: '#dc2626' },
];

const BugsReports = () => {
  const [selected, setSelected] = useState(PRIORITIES[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [showDevForm, setShowDevForm] = useState(false);
  const [showDevTasks, setShowDevTasks] = useState(false);
  const [key, setKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [descError, setDescError] = useState('');
  const isTitleInvalid = isSubmitted && (title.length < 5);
  const isDescInvalid = isSubmitted && (desc.length < 10);

  const handleAccess = (e) => {
    e.stopPropagation();
    
    // Debugging: check both values in console
    console.log("Input Key:", key);
    console.log("Environment Key:", devKey);

    if (key === devKey) {
      setShowDevForm(false);
      setShowDevTasks(true);
    } else {
      toast.error("Invalid Access Code");
    }
  };
  const sendBugReport = async () => {
    if (isLoading) return;

    setIsSubmitted(true);
    setTitleError('');
    setDescError('');

    if (!title || !desc) {
      return toast.error("All fields are required", { id: "bug-required" });
    }

    if (title.length < 5) {
      return setTitleError(<>Title too short <CircleX size={14} /></>);
    }

    if (desc.length < 10) {
      return setDescError(<>Description too short <CircleX size={14} /></>);
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/Admin/bug`,
        {
          title,
          description: desc,
          priority: selected.label,
        },
        { withCredentials: true }
      );

      if (res.status === 201) {
        toast.success("Bug report sent 🚀");

        setTitle('');
        setDesc('');
        setSelected(PRIORITIES[1]);
        setIsSubmitted(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send bug");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className='BugsReports-container' onClick={() => setShowDevForm(false)}>
      
      {/* Developer Toggle Button */}
      {!showDevTasks && (
        <div className='BugsReportsDevBt' onClick={(e) => { e.stopPropagation(); setShowDevForm(true); }}>
          <span style={{ color: "#F59E0B", fontSize: "12px", marginRight: '5px' }}>{'</>'}</span>
          Developer
        </div>
      )}

      {/* Access Form */}
      <AnimatePresence>
        {showDevForm && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className='BugsReportsDeForm' 
            onClick={(e) => e.stopPropagation()}
          >
            <div className='BugsReports-Header' style={{ width: "100%", color: "white", cursor: "default" }}>
              <div className='icon-container'>👨‍💻</div>
              <div>
                <h2 style={{ fontSize: "15px", margin: 0 }}>Dev Task Access</h2>
                <p style={{ fontSize: "10px", color: 'gray', margin: 0 }}>Enter your access code</p>
              </div>
            </div>
            <input className='input-glass' type="password" onChange={(e)=>setKey(e.target.value)} placeholder='Enter your access code' />
            <button className='btn-primary' onClick={handleAccess}>
              Access <ArrowRight size={19} />
            </button>
            <p style={{ margin: "0", color: "gray", fontSize: "11px" }}>Authorized developers only</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FORM SECTION (Standard User) --- */}
      {!showDevTasks && (
        <>
          <div className='BugsReports-Header'>
            <div className='icon-container'><Bug size={20} /></div>
            <div>
              <h2>Report a Bug</h2>
              <p>Found something wrong? Let us know!</p>
            </div>
          </div>

          <div className="bug-report-wrapper">
            <div className="bug-report-card">
              <div style={{ width: '46%' }}>
                <div className="form-field">
                  <label>Bug Title</label>
                  <input
                    type="text"
                    value={title}
                    placeholder="Brief description..."
                    className={`premium-input ${isTitleInvalid ? "input-error" : ""}`}
                    onChange={(e) => setTitle(e.target.value)}
                  />


                  <div className="field-footer">{title.length}/100</div>
                </div>

                <div className="form-field">
                  <label>Priority Level</label>
                  <div className="dropdown-container">
                    <div
                      className={`dropdown-trigger ${isOpen ? 'active-trigger' : ''}`}
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      <div className="selected-item">
                        <span className="prio-dot" style={{ background: selected.color }}></span>
                        <span style={{ color: selected.color }}>{selected.label}</span>
                      </div>
                      <ChevronDown size={18} className={`chevron ${isOpen ? 'rotate' : ''}`} />
                    </div>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="dropdown-menu"
                        >
                          {PRIORITIES.map((prio) => (
                            <div
                              key={prio.id}
                              className={`menu-item ${selected.id === prio.id ? 'is-selected' : ''}`}
                              onClick={() => { setSelected(prio); setIsOpen(false); }}
                            >
                              {selected.id === prio.id && <Check size={14} className="check-mark" />}
                              <span className="prio-dot" style={{ background: prio.color }}></span>
                              <span>{prio.label}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div style={{ width: '46%' }}>
                <div className="form-field">
                  <label>Description</label>
                  <textarea
                    value={desc}
                    placeholder="Describe the bug in detail..."
                    className={`premium-input textarea ${isDescInvalid ? "input-error" : ""}`}
                    onChange={(e) => setDesc(e.target.value)}
                  />


                  <div className="field-footer">{desc.length}/1000</div>
                </div>
              </div>

              <div style={{ width: "100%" }}>
                <div className="notification-hint">
                  <Info size={14} />
                  <span>The developer will receive an email notification.</span>
                </div>
                <motion.button
                  disabled={isLoading}
                  onClick={sendBugReport}
                  whileHover={{ scale: isLoading ? 1 : 1.01 }}
                  whileTap={{ scale: isLoading ? 1 : 0.99 }}
                  className="submit-button"
                >
                  <Send size={18} />
                  <span>{isLoading ? "Sending..." : "Submit Bug Report"}</span>
                </motion.button>

              </div>
            </div>
          </div>
        </>
      )}

      {/* --- TASK BOARD SECTION (Developer Only) --- */}
      {showDevTasks && (
        <div className="developer-dashboard">
           <button onClick={() => setShowDevTasks(false)} className="btn-back">← Back to Reporting</button>
          <div className='BugsReports-Header'>
            <div className='icon-container'>👨‍💻</div>
            <div>
              <h2>Dev Task Board</h2>
              <p>Manage and resolve reported issues</p>
            </div>
          </div>
          
          <div className='BugsReports-grid'>
            {bugData.map((bug, index) => (
              <motion.div
                key={bug.id}
                className='BugCard'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <span className={`StatusBadge ${bug.status.replace(/\s+/g, '').toLowerCase()}`}>
                  {bug.status}
                </span>

                <div className='CardTitle'>
                  <Code2 size={18} className="code-icon" />
                  <h3>{bug.title}</h3>
                </div>

                <p className='CardDesc'>{bug.desc}</p>

                <div className='CardUserInfo'>
                  <span className='UserName'>{bug.user}</span>
                  <span className='UserID'>#{bug.id}</span>
                </div>

                <div className={`PriorityBadge ${bug.priority.toLowerCase()}`}>
                  <div className='dot'></div>
                  {bug.priority}
                </div>

                <hr className='divider' />

                <div className='CardFooter'>
                  <div className='FooterItem'>
                    <Clock size={14} />
                    <span>{bug.date}</span>
                  </div>
                  <select className="status-select">
                    <option>In progress</option>
                    <option>Resolved</option>
                    <option>Closed</option>
                  </select>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BugsReports;