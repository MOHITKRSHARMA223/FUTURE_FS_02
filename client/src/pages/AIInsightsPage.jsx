import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Mail, FileText, Zap, Copy, Check } from 'lucide-react';
import Card from '../components/ui/Card';
import api from '../services/api';
import './AIInsightsPage.css';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const EMAIL_TEMPLATES = [
  { id: 'follow_up', label: 'Follow-up', icon: '📧' },
  { id: 'cold_email', label: 'Cold Email', icon: '❄️' },
  { id: 'proposal', label: 'Proposal', icon: '📋' },
  { id: 'meeting_reminder', label: 'Meeting Reminder', icon: '📅' },
];

const AIInsightsPage = () => {
  const [leads, setLeads] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('follow_up');
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/leads?limit=50');
        const l = res.data.data || [];
        setLeads(l);
        if (l.length > 0) setSelectedLead(l[0]._id);

        // Fetch scores for top leads
        const scoreMap = {};
        for (const lead of l.slice(0, 10)) {
          try {
            const s = await api.get(`/ai/lead-score/${lead._id}`);
            scoreMap[lead._id] = s.data.data;
          } catch {}
        }
        setScores(scoreMap);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  const generateEmail = async () => {
    if (!selectedLead) return;
    setEmailLoading(true);
    try {
      const res = await api.post('/ai/generate-email', { leadId: selectedLead, template: selectedTemplate });
      setGeneratedEmail(res.data.data);
    } catch {} finally { setEmailLoading(false); }
  };

  const summarizeNotes = async () => {
    if (!selectedLead) return;
    setSummaryLoading(true);
    try {
      const res = await api.post('/ai/summarize-notes', { leadId: selectedLead });
      setSummary(res.data.data);
    } catch {} finally { setSummaryLoading(false); }
  };

  const copyEmail = () => {
    if (generatedEmail) {
      navigator.clipboard.writeText(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Sort leads by score
  const scoredLeads = leads.map(l => ({ ...l, score: scores[l._id]?.score || 0 }))
    .sort((a, b) => b.score - a.score);

  const getGradeColor = (grade) => {
    const colors = { A: '#10b981', B: '#6366f1', C: '#f59e0b', D: '#ef4444' };
    return colors[grade] || '#64748b';
  };

  if (loading) {
    return <div className="ai-loading">{[...Array(4)].map((_, i) => <div key={i} className="skeleton ai-skeleton" />)}</div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="ai-page">
      <div className="ai-header">
        <h2 className="ai-title"><Brain size={22} /> AI Insights</h2>
        <p className="ai-subtitle">AI-powered lead analysis, email generation, and notes summarization</p>
      </div>

      <div className="ai-grid">
        {/* Lead Scoring Panel */}
        <motion.div variants={item}>
          <Card className="ai-scoring-card" variant="glow">
            <h3 className="ai-card-title"><Sparkles size={18} /> Lead Scoring</h3>
            <div className="ai-leads-list">
              {scoredLeads.slice(0, 8).map((l) => {
                const s = scores[l._id];
                return (
                  <div
                    key={l._id}
                    className={`ai-lead-row ${selectedLead === l._id ? 'ai-lead-selected' : ''}`}
                    onClick={() => setSelectedLead(l._id)}
                  >
                    <div className="ai-lead-info">
                      <span className="ai-lead-name">{l.name}</span>
                      <span className="ai-lead-company">{l.company}</span>
                    </div>
                    {s && (
                      <div className="ai-score-wrap">
                        <div className="ai-score-bar">
                          <motion.div
                            className="ai-score-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${s.score}%` }}
                            style={{ background: getGradeColor(s.grade) }}
                          />
                        </div>
                        <span className="ai-score-badge" style={{ color: getGradeColor(s.grade) }}>
                          {s.score}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* AI Details for selected lead */}
        <motion.div variants={item}>
          <Card className="ai-details-card" variant="glow">
            {selectedLead && scores[selectedLead] ? (
              <>
                <h3 className="ai-card-title"><Zap size={18} /> Insights for {leads.find(l => l._id === selectedLead)?.name}</h3>
                <div className="ai-insights-grid">
                  <div className="ai-insight-item">
                    <span className="ai-insight-label">Quality Score</span>
                    <span className="ai-insight-value" style={{ color: getGradeColor(scores[selectedLead].grade) }}>
                      {scores[selectedLead].score}/100 ({scores[selectedLead].grade})
                    </span>
                  </div>
                  <div className="ai-insight-item">
                    <span className="ai-insight-label">Conversion Probability</span>
                    <span className="ai-insight-value">{scores[selectedLead].conversionProbability}%</span>
                  </div>
                  <div className="ai-insight-item">
                    <span className="ai-insight-label">Engagement</span>
                    <span className="ai-insight-value">{scores[selectedLead].insights?.engagement}</span>
                  </div>
                  <div className="ai-insight-item">
                    <span className="ai-insight-label">Data Completeness</span>
                    <span className="ai-insight-value">{scores[selectedLead].insights?.dataCompleteness}%</span>
                  </div>
                </div>

                <h4 className="ai-actions-title">Suggested Actions</h4>
                <div className="ai-actions-list">
                  {scores[selectedLead].suggestedActions?.map((a, i) => (
                    <div key={i} className="ai-action-item">
                      <span className="ai-action-impact" data-impact={a.impact.toLowerCase()}>{a.impact}</span>
                      <div>
                        <span className="ai-action-text">{a.action}</span>
                        <span className="ai-action-reason">{a.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="ai-empty">Select a lead to view AI insights</div>
            )}
          </Card>
        </motion.div>

        {/* Email Generator */}
        <motion.div variants={item}>
          <Card className="ai-email-card" variant="glow">
            <h3 className="ai-card-title"><Mail size={18} /> AI Email Generator</h3>
            <div className="ai-email-templates">
              {EMAIL_TEMPLATES.map(t => (
                <button
                  key={t.id}
                  className={`ai-template-btn ${selectedTemplate === t.id ? 'ai-template-active' : ''}`}
                  onClick={() => setSelectedTemplate(t.id)}
                >
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>
            <button className="ai-generate-btn" onClick={generateEmail} disabled={emailLoading || !selectedLead}>
              {emailLoading ? 'Generating...' : '✨ Generate Email'}
            </button>

            {generatedEmail && (
              <div className="ai-email-output">
                <div className="ai-email-subject">
                  <strong>Subject:</strong> {generatedEmail.subject}
                </div>
                <pre className="ai-email-body">{generatedEmail.body}</pre>
                <button className="ai-copy-btn" onClick={copyEmail}>
                  {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Notes Summarizer */}
        <motion.div variants={item}>
          <Card className="ai-summary-card" variant="glow">
            <h3 className="ai-card-title"><FileText size={18} /> Notes Summarizer</h3>
            <button className="ai-generate-btn" onClick={summarizeNotes} disabled={summaryLoading || !selectedLead}>
              {summaryLoading ? 'Summarizing...' : '🧠 Summarize Notes'}
            </button>

            {summary && (
              <div className="ai-summary-output">
                <p className="ai-summary-text">{summary.summary}</p>
                {summary.keyPoints?.length > 0 && (
                  <div className="ai-key-points">
                    <h4>Key Points</h4>
                    <ul>
                      {summary.keyPoints.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}
                <div className="ai-summary-meta">
                  {summary.noteCount} notes · {summary.wordCount} words · {summary.timespan}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AIInsightsPage;
