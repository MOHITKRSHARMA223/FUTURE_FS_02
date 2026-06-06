import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Kanban, DollarSign, GripVertical } from 'lucide-react';
import Card from '../components/ui/Card';
import api from '../services/api';
import { PIPELINE_COLORS, PRIORITY_COLORS } from '../utils/constants';
import './PipelinePage.css';

const STAGES = ['New', 'Contacted', 'Proposal Sent', 'Negotiation', 'Converted', 'Lost'];

const PipelinePage = () => {
  const [pipeline, setPipeline] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPipeline = async () => {
    try {
      const res = await api.get('/pipeline');
      setPipeline(res.data.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchPipeline(); }, []);

  const onDragEnd = async (result) => {
    const { draggableId, source, destination } = result;
    if (!destination || (source.droppableId === destination.droppableId)) return;

    // Optimistic update
    const oldPipeline = { ...pipeline };
    const newStage = destination.droppableId;
    const oldStage = source.droppableId;

    const leadToMove = pipeline[oldStage]?.leads.find(l => l._id === draggableId);
    if (!leadToMove) return;

    setPipeline(prev => {
      const updated = { ...prev };
      updated[oldStage] = {
        ...updated[oldStage],
        leads: updated[oldStage].leads.filter(l => l._id !== draggableId),
        count: updated[oldStage].count - 1,
        totalValue: updated[oldStage].totalValue - (leadToMove.value || 0),
      };
      updated[newStage] = {
        ...updated[newStage],
        leads: [...updated[newStage].leads, { ...leadToMove, pipelineStage: newStage }],
        count: updated[newStage].count + 1,
        totalValue: updated[newStage].totalValue + (leadToMove.value || 0),
      };
      return updated;
    });

    try {
      await api.put(`/pipeline/${draggableId}/move`, { stage: newStage });
    } catch {
      setPipeline(oldPipeline);
    }
  };

  if (loading) {
    return (
      <div className="pipeline-loading">
        {STAGES.map(s => <div key={s} className="skeleton pipeline-skeleton-col" />)}
      </div>
    );
  }

  return (
    <div className="pipeline-page">
      <div className="pipeline-header">
        <h2 className="pipeline-title"><Kanban size={22} /> Sales Pipeline</h2>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="pipeline-board">
          {STAGES.map((stage) => {
            const col = pipeline[stage] || { leads: [], count: 0, totalValue: 0 };
            return (
              <Droppable key={stage} droppableId={stage}>
                {(provided, snapshot) => (
                  <div
                    className={`pipeline-column ${snapshot.isDraggingOver ? 'pipeline-column-over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <div className="pipeline-col-header">
                      <div className="pipeline-col-title-wrap">
                        <span className="pipeline-col-dot" style={{ background: PIPELINE_COLORS[stage] }} />
                        <span className="pipeline-col-name">{stage}</span>
                        <span className="pipeline-col-count">{col.count}</span>
                      </div>
                      {col.totalValue > 0 && (
                        <span className="pipeline-col-value">
                          <DollarSign size={12} />{(col.totalValue / 1000).toFixed(0)}K
                        </span>
                      )}
                    </div>

                    <div className="pipeline-col-cards">
                      {col.leads.map((lead, index) => (
                        <Draggable key={lead._id} draggableId={lead._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`pipeline-card glass ${snapshot.isDragging ? 'pipeline-card-dragging' : ''}`}
                            >
                              <div className="pipeline-card-drag" {...provided.dragHandleProps}>
                                <GripVertical size={14} />
                              </div>
                              <div className="pipeline-card-content" onClick={() => navigate(`/leads/${lead._id}`)}>
                                <div className="pipeline-card-name">{lead.name}</div>
                                <div className="pipeline-card-company">{lead.company}</div>
                                <div className="pipeline-card-meta">
                                  {lead.value > 0 && (
                                    <span className="pipeline-card-value">${lead.value.toLocaleString()}</span>
                                  )}
                                  {lead.priority && (
                                    <span
                                      className="pipeline-card-priority"
                                      style={{ color: PRIORITY_COLORS[lead.priority]?.hex, background: PRIORITY_COLORS[lead.priority]?.bg }}
                                    >
                                      {lead.priority}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default PipelinePage;
