import React from 'react';
import { useDraft } from '../context/DraftContext';
import { FaLightbulb, FaUsers, FaChartLine, FaCog } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { 
    draftState, 
    userTeam, 
    availablePlayers, 
    settings, 
    loading, 
    error,
    getOptimalPick 
  } = useDraft();

  const [optimalPick, setOptimalPick] = React.useState(null);
  const [loadingSuggestion, setLoadingSuggestion] = React.useState(false);

  React.useEffect(() => {
    if (userTeam && draftState.currentRound) {
      loadOptimalPick();
    }
  }, [userTeam, draftState.currentRound]);

  const loadOptimalPick = async () => {
    if (!userTeam) return;
    
    setLoadingSuggestion(true);
    try {
      const suggestion = await getOptimalPick(userTeam.id, draftState.currentRound);
      setOptimalPick(suggestion);
    } catch (error) {
      console.error('Failed to load optimal pick:', error);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  const totalProjectedPoints = userTeam?.roster.reduce((sum, player) => sum + player.projectedPoints, 0) || 0;
  const averageTier = userTeam?.roster.length > 0 
    ? userTeam.roster.reduce((sum, player) => sum + player.tier, 0) / userTeam.roster.length 
    : 0;

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Fantasy Draft Dashboard</h1>
        <p className="page-subtitle">Track your draft progress and get AI-powered suggestions</p>
      </div>

      <div className="dashboard-grid">
        {/* Draft Status */}
        <div className="card dashboard-card">
          <h3>Draft Status</h3>
          <div className="draft-status">
            <div className="status-item">
              <span className="status-label">Current Round:</span>
              <span className="status-value">{draftState.currentRound}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Current Pick:</span>
              <span className="status-value">{draftState.currentPick}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Available Players:</span>
              <span className="status-value">{availablePlayers.length}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Draft Complete:</span>
              <span className="status-value">{draftState.isComplete ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Team Summary */}
        <div className="card dashboard-card">
          <h3>Your Team Summary</h3>
          <div className="team-summary">
            <div className="summary-item">
              <span className="summary-label">Players Drafted:</span>
              <span className="summary-value">{userTeam?.roster.length || 0}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Projected Points:</span>
              <span className="summary-value">{Math.round(totalProjectedPoints)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Average Tier:</span>
              <span className="summary-value">{averageTier.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Optimal Pick Suggestion */}
        <div className="card dashboard-card">
          <h3>
            <FaLightbulb className="card-icon" />
            Optimal Pick Suggestion
          </h3>
          {loadingSuggestion ? (
            <div className="loading">Calculating optimal pick...</div>
          ) : optimalPick?.optimalPick ? (
            <div className="optimal-pick">
              <div className="player-info">
                <div className="player-name">{optimalPick.optimalPick.name}</div>
                <div className="player-details">
                  <span className={`position-badge ${optimalPick.optimalPick.position.toLowerCase()}`}>
                    {optimalPick.optimalPick.position}
                  </span>
                  <span className="player-team">{optimalPick.optimalPick.team}</span>
                </div>
              </div>
              <div className="pick-reasoning">
                <strong>Why this pick:</strong>
                <p>{optimalPick.reasoning}</p>
              </div>
            </div>
          ) : (
            <p>No optimal pick available</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card dashboard-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button className="btn btn-primary action-btn">
              <FaChartLine />
              View Draft Board
            </button>
            <button className="btn btn-success action-btn">
              <FaLightbulb />
              Get Suggestions
            </button>
            <button className="btn btn-primary action-btn">
              <FaUsers />
              View My Team
            </button>
            <button className="btn btn-primary action-btn">
              <FaCog />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {userTeam?.roster.length > 0 && (
        <div className="card">
          <h3>Recent Picks</h3>
          <div className="recent-picks">
            {userTeam.roster.slice(-3).map((player, index) => (
              <div key={player.id} className="recent-pick">
                <div className="pick-player">
                  <span className={`position-badge ${player.position.toLowerCase()}`}>
                    {player.position}
                  </span>
                  <span className="player-name">{player.name}</span>
                  <span className="player-team">{player.team}</span>
                </div>
                <div className="pick-stats">
                  <span className="projected-points">{Math.round(player.projectedPoints)} pts</span>
                  <span className="adp">ADP: {player.adp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
