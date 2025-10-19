import React, { useState, useEffect } from 'react';
import { ReadingGoal } from '../types';
import { goalService } from '../services/goalService';

interface ReadingGoalsProps {
  onGoalUpdate?: () => void;
}

const ReadingGoals: React.FC<ReadingGoalsProps> = ({ onGoalUpdate }) => {
  const [goals, setGoals] = useState<ReadingGoal[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<ReadingGoal | null>(null);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    const goalsData = await goalService.getAllGoals();
    setGoals(goalsData);
  };

  const handleAddGoal = async (goalData: Omit<ReadingGoal, 'id' | 'currentProgress'>) => {
    await goalService.addGoal(goalData);
    await loadGoals();
    setShowAddForm(false);
    onGoalUpdate?.();
  };

  const handleUpdateGoal = async (id: string, updates: Partial<ReadingGoal>) => {
    await goalService.updateGoal(id, updates);
    await loadGoals();
    onGoalUpdate?.();
  };

  const handleDeleteGoal = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      await goalService.deleteGoal(id);
      await loadGoals();
      onGoalUpdate?.();
    }
  };

  const handleToggleActive = async (goal: ReadingGoal) => {
    await handleUpdateGoal(goal.id, { isActive: !goal.isActive });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'on-track':
        return '#2196F3';
      case 'behind':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'on-track':
        return 'On Track';
      case 'behind':
        return 'Behind';
      default:
        return 'Not Started';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const activeGoals = goals.filter(goal => goal.isActive);
  const completedGoals = goals.filter(goal => goalService.isGoalCompleted(goal));

  return (
    <div className="reading-goals">
      <div className="goals-header">
        <h3>🎯 Reading Goals</h3>
        <button 
          className="btn btn-primary btn-small"
          onClick={() => setShowAddForm(true)}
        >
          Add Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="empty-state">
          <p>No reading goals set yet. Create your first goal to start tracking your progress!</p>
        </div>
      ) : (
        <>
          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div className="goals-section">
              <h4>Active Goals ({activeGoals.length})</h4>
              <div className="goals-grid">
                {activeGoals.map(goal => {
                  const progress = goalService.getGoalProgress(goal);
                  const status = goalService.getGoalStatus(goal);
                  const daysRemaining = goalService.getDaysRemaining(goal);
                  
                  return (
                    <div key={goal.id} className="goal-card">
                      <div className="goal-header">
                        <div className="goal-info">
                          <h5>{goal.description || `${goal.type === 'books' ? 'Books' : 'Pages'} Goal`}</h5>
                          <div className="goal-meta">
                            <span className="goal-target">
                              {goal.currentProgress} / {goal.target} {goal.type}
                            </span>
                            <span className="goal-period">
                              {goal.period === 'month' ? 'This Month' : 'This Year'}
                            </span>
                          </div>
                        </div>
                        <div className="goal-actions">
                          <button 
                            className="btn-icon"
                            onClick={() => setEditingGoal(goal)}
                            title="Edit goal"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-icon"
                            onClick={() => handleToggleActive(goal)}
                            title="Toggle active"
                          >
                            {goal.isActive ? '⏸️' : '▶️'}
                          </button>
                          <button 
                            className="btn-icon"
                            onClick={() => handleDeleteGoal(goal.id)}
                            title="Delete goal"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      <div className="goal-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="progress-info">
                          <span className="progress-percentage">{progress}%</span>
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(status) }}
                          >
                            {getStatusText(status)}
                          </span>
                        </div>
                      </div>

                      <div className="goal-dates">
                        <small>
                          {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Goal period ended'}
                        </small>
                        <small>
                          {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
                        </small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div className="goals-section">
              <h4>Completed Goals ({completedGoals.length})</h4>
              <div className="goals-grid">
                {completedGoals.map(goal => (
                  <div key={goal.id} className="goal-card completed">
                    <div className="goal-header">
                      <div className="goal-info">
                        <h5>{goal.description || `${goal.type === 'books' ? 'Books' : 'Pages'} Goal`}</h5>
                        <div className="goal-meta">
                          <span className="goal-target">
                            {goal.currentProgress} / {goal.target} {goal.type}
                          </span>
                          <span className="goal-period">
                            {goal.period === 'month' ? 'This Month' : 'This Year'}
                          </span>
                        </div>
                      </div>
                      <div className="goal-actions">
                        <button 
                          className="btn-icon"
                          onClick={() => handleDeleteGoal(goal.id)}
                          title="Delete goal"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="goal-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill completed"
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                      <div className="progress-info">
                        <span className="progress-percentage">100%</span>
                        <span className="status-badge completed">Completed</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Goal Form */}
      {(showAddForm || editingGoal) && (
        <GoalForm
          goal={editingGoal}
          onSubmit={handleAddGoal}
          onCancel={() => {
            setShowAddForm(false);
            setEditingGoal(null);
          }}
        />
      )}
    </div>
  );
};

interface GoalFormProps {
  goal?: ReadingGoal | null;
  onSubmit: (goalData: Omit<ReadingGoal, 'id' | 'currentProgress'>) => void;
  onCancel: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ goal, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: goal?.type || 'books' as 'books' | 'pages',
    target: goal?.target || 0,
    period: goal?.period || 'month' as 'month' | 'year',
    startDate: goal?.startDate ? new Date(goal.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: goal?.endDate ? new Date(goal.endDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: goal?.description || '',
    isActive: goal?.isActive ?? true
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (formData.target <= 0) {
      newErrors.target = 'Target must be greater than 0';
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      });
    }
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{goal ? 'Edit Goal' : 'Add New Goal'}</h2>
          <button className="btn-icon" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="goal-form">
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              type="text"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="e.g., Read 12 books this year"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Goal Type</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                <option value="books">Books</option>
                <option value="pages">Pages</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="target">Target</label>
              <input
                id="target"
                type="number"
                value={formData.target}
                onChange={(e) => handleChange('target', Number(e.target.value))}
                className={errors.target ? 'error' : ''}
                min="1"
                placeholder="0"
              />
              {errors.target && <span className="error-message">{errors.target}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="period">Period</label>
              <select
                id="period"
                value={formData.period}
                onChange={(e) => handleChange('period', e.target.value)}
              >
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                />
                Active Goal
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className={errors.endDate ? 'error' : ''}
              />
              {errors.endDate && <span className="error-message">{errors.endDate}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {goal ? 'Update Goal' : 'Add Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReadingGoals;
