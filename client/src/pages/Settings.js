import React, { useState, useEffect } from 'react';
import { useDraft } from '../context/DraftContext';
import { FaCog, FaSave, FaUndo, FaRefresh } from 'react-icons/fa';
import './Settings.css';

const Settings = () => {
  const { settings, updateSettings, resetDraft, loading, error } = useDraft();
  
  const [formData, setFormData] = useState({
    leagueType: 'PPR',
    numberOfTeams: 12,
    draftPosition: 1,
    snakeDraft: true,
    rosterSpots: {
      QB: 1,
      RB: 2,
      WR: 2,
      TE: 1,
      K: 1,
      DST: 1
    },
    scoringSettings: {
      passingYards: 0.04,
      passingTouchdowns: 4.0,
      interceptions: -2.0,
      rushingYards: 0.1,
      rushingTouchdowns: 6.0,
      receivingYards: 0.1,
      receivingTouchdowns: 6.0,
      receptions: 1.0,
      fumblesLost: -2.0,
      fieldGoals: 3.0,
      extraPoints: 1.0,
      sacks: 1.0,
      interceptionsDefense: 2.0,
      fumbleRecoveries: 2.0,
      defensiveTouchdowns: 6.0,
      safety: 2.0
    }
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleLeagueTypeChange = (leagueType) => {
    let newRosterSpots = { ...formData.rosterSpots };
    let newScoringSettings = { ...formData.scoringSettings };

    switch (leagueType) {
      case 'Standard':
        newScoringSettings.receptions = 0.0;
        break;
      case 'PPR':
        newScoringSettings.receptions = 1.0;
        break;
      case 'HalfPPR':
        newScoringSettings.receptions = 0.5;
        break;
      case 'Superflex':
        newScoringSettings.receptions = 1.0;
        newRosterSpots.QB = 2;
        break;
      case 'Dynasty':
        newScoringSettings.receptions = 1.0;
        newRosterSpots = {
          QB: 2,
          RB: 4,
          WR: 6,
          TE: 2,
          K: 1,
          DST: 1
        };
        break;
    }

    setFormData(prev => ({
      ...prev,
      leagueType,
      rosterSpots: newRosterSpots,
      scoringSettings: newScoringSettings
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(formData);
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setShowResetConfirm(false);
    try {
      await resetDraft();
      alert('Draft reset successfully!');
    } catch (error) {
      alert('Failed to reset draft: ' + error.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="settings">
      <div className="page-header">
        <h1 className="page-title">League Settings</h1>
        <p className="page-subtitle">Configure your fantasy football league</p>
      </div>

      <div className="settings-container">
        {/* League Configuration */}
        <div className="card settings-card">
          <div className="card-header">
            <FaCog className="card-icon" />
            <h3>League Configuration</h3>
          </div>
          
          <div className="settings-section">
            <div className="setting-group">
              <label className="setting-label">League Type</label>
              <select
                value={formData.leagueType}
                onChange={(e) => handleLeagueTypeChange(e.target.value)}
                className="setting-input"
              >
                <option value="Standard">Standard</option>
                <option value="PPR">PPR</option>
                <option value="HalfPPR">Half PPR</option>
                <option value="Superflex">Superflex</option>
                <option value="Dynasty">Dynasty</option>
              </select>
            </div>

            <div className="setting-group">
              <label className="setting-label">Number of Teams</label>
              <input
                type="number"
                min="8"
                max="16"
                value={formData.numberOfTeams}
                onChange={(e) => handleInputChange(null, 'numberOfTeams', parseInt(e.target.value))}
                className="setting-input"
              />
            </div>

            <div className="setting-group">
              <label className="setting-label">Draft Position</label>
              <input
                type="number"
                min="1"
                max={formData.numberOfTeams}
                value={formData.draftPosition}
                onChange={(e) => handleInputChange(null, 'draftPosition', parseInt(e.target.value))}
                className="setting-input"
              />
            </div>

            <div className="setting-group">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={formData.snakeDraft}
                  onChange={(e) => handleInputChange(null, 'snakeDraft', e.target.checked)}
                  className="setting-checkbox"
                />
                Snake Draft
              </label>
            </div>
          </div>
        </div>

        {/* Roster Requirements */}
        <div className="card settings-card">
          <div className="card-header">
            <FaCog className="card-icon" />
            <h3>Roster Requirements</h3>
          </div>
          
          <div className="settings-section">
            <div className="roster-grid">
              {Object.entries(formData.rosterSpots).map(([position, spots]) => (
                <div key={position} className="roster-setting">
                  <label className="setting-label">{position}</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={spots}
                    onChange={(e) => handleInputChange('rosterSpots', position, parseInt(e.target.value))}
                    className="setting-input"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scoring Settings */}
        <div className="card settings-card">
          <div className="card-header">
            <FaCog className="card-icon" />
            <h3>Scoring Settings</h3>
          </div>
          
          <div className="settings-section">
            <div className="scoring-grid">
              <div className="scoring-category">
                <h4>Passing</h4>
                <div className="scoring-row">
                  <label>Passing Yards</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.scoringSettings.passingYards}
                    onChange={(e) => handleInputChange('scoringSettings', 'passingYards', parseFloat(e.target.value))}
                    className="setting-input"
                  />
                </div>
                <div className="scoring-row">
                  <label>Passing TDs</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.scoringSettings.passingTouchdowns}
                    onChange={(e) => handleInputChange('scoringSettings', 'passingTouchdowns', parseFloat(e.target.value))}
                    className="setting-input"
                  />
                </div>
                <div className="scoring-row">
                  <label>Interceptions</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.scoringSettings.interceptions}
                    onChange={(e) => handleInputChange('scoringSettings', 'interceptions', parseFloat(e.target.value))}
                    className="setting-input"
                  />
                </div>
              </div>

              <div className="scoring-category">
                <h4>Rushing</h4>
                <div className="scoring-row">
                  <label>Rushing Yards</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.scoringSettings.rushingYards}
                    onChange={(e) => handleInputChange('scoringSettings', 'rushingYards', parseFloat(e.target.value))}
                    className="setting-input"
                  />
                </div>
                <div className="scoring-row">
                  <label>Rushing TDs</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.scoringSettings.rushingTouchdowns}
                    onChange={(e) => handleInputChange('scoringSettings', 'rushingTouchdowns', parseFloat(e.target.value))}
                    className="setting-input"
                  />
                </div>
              </div>

              <div className="scoring-category">
                <h4>Receiving</h4>
                <div className="scoring-row">
                  <label>Receiving Yards</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.scoringSettings.receivingYards}
                    onChange={(e) => handleInputChange('scoringSettings', 'receivingYards', parseFloat(e.target.value))}
                    className="setting-input"
                  />
                </div>
                <div className="scoring-row">
                  <label>Receiving TDs</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.scoringSettings.receivingTouchdowns}
                    onChange={(e) => handleInputChange('scoringSettings', 'receivingTouchdowns', parseFloat(e.target.value))}
                    className="setting-input"
                  />
                </div>
                <div className="scoring-row">
                  <label>Receptions</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.scoringSettings.receptions}
                    onChange={(e) => handleInputChange('scoringSettings', 'receptions', parseFloat(e.target.value))}
                    className="setting-input"
                  />
                </div>
              </div>

              <div className="scoring-category">
                <h4>Kicking</h4>
                <div className="scoring-row">
                  <label>Field Goals</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.scoringSettings.fieldGoals}
                    onChange={(e) => handleInputChange('scoringSettings', 'fieldGoals', parseFloat(e.target.value))}
                    className="setting-input"
                  />
                </div>
                <div className="scoring-row">
                  <label>Extra Points</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.scoringSettings.extraPoints}
                    onChange={(e) => handleInputChange('scoringSettings', 'extraPoints', parseFloat(e.target.value))}
                    className="setting-input"
                  />
                </div>
              </div>

              <div className="scoring-category">
                <h4>Defense</h4>
                <div className="scoring-row">
                  <label>Sacks</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.scoringSettings.sacks}
                    onChange={(e) => handleInputChange('scoringSettings', 'sacks', parseFloat(e.target.value))}
                    className="setting-input"
                  />
                </div>
                <div className="scoring-row">
                  <label>Interceptions</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.scoringSettings.interceptionsDefense}
                    onChange={(e) => handleInputChange('scoringSettings', 'interceptionsDefense', parseFloat(e.target.value))}
                    className="setting-input"
                  />
                </div>
                <div className="scoring-row">
                  <label>Defensive TDs</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.scoringSettings.defensiveTouchdowns}
                    onChange={(e) => handleInputChange('scoringSettings', 'defensiveTouchdowns', parseFloat(e.target.value))}
                    className="setting-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="card actions-card">
          <div className="actions-grid">
            <button
              className="btn btn-success action-btn"
              onClick={handleSave}
              disabled={saving}
            >
              <FaSave />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            
            <button
              className="btn btn-warning action-btn"
              onClick={() => setShowResetConfirm(true)}
            >
              <FaUndo />
              Reset Draft
            </button>
            
            <button
              className="btn btn-primary action-btn"
              onClick={() => window.location.reload()}
            >
              <FaRefresh />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reset Draft</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to reset the draft? This will:</p>
              <ul>
                <li>Clear all drafted players</li>
                <li>Reset draft progress</li>
                <li>Return all players to available pool</li>
              </ul>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-danger"
                onClick={handleReset}
              >
                Reset Draft
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
