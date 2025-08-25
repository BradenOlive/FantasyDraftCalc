import React, { useState } from 'react';
import { useDraft } from '../context/DraftContext';
import { FaUsers, FaChartBar, FaHistory } from 'react-icons/fa';
import './Roster.css';

const Roster = () => {
  const { userTeam, draftState, loading, error } = useDraft();
  const [selectedPosition, setSelectedPosition] = useState('');

  if (loading) {
    return <div className="loading">Loading roster...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!userTeam) {
    return <div className="no-team">No team data available</div>;
  }

  const totalProjectedPoints = userTeam.roster.reduce((sum, player) => sum + player.projectedPoints, 0);
  const averageTier = userTeam.roster.length > 0 
    ? userTeam.roster.reduce((sum, player) => sum + player.tier, 0) / userTeam.roster.length 
    : 0;

  const positionCounts = {};
  ['QB', 'RB', 'WR', 'TE', 'K', 'DST'].forEach(pos => {
    positionCounts[pos] = userTeam.roster.filter(p => p.position === pos).length;
  });

  const filteredRoster = selectedPosition 
    ? userTeam.roster.filter(player => player.position === selectedPosition)
    : userTeam.roster;

  return (
    <div className="roster">
      <div className="page-header">
        <h1 className="page-title">My Team</h1>
        <p className="page-subtitle">
          {userTeam.name} - {userTeam.roster.length} players drafted
        </p>
      </div>

      <div className="roster-container">
        {/* Team Summary */}
        <div className="card team-summary-card">
          <div className="summary-header">
            <FaUsers className="summary-icon" />
            <h3>Team Summary</h3>
          </div>
          
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Total Projected Points:</span>
              <span className="stat-value">{Math.round(totalProjectedPoints)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average Tier:</span>
              <span className="stat-value">{averageTier.toFixed(1)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Players Drafted:</span>
              <span className="stat-value">{userTeam.roster.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Draft Round:</span>
              <span className="stat-value">{draftState.currentRound}</span>
            </div>
          </div>
        </div>

        {/* Position Distribution */}
        <div className="card position-distribution-card">
          <div className="distribution-header">
            <FaChartBar className="distribution-icon" />
            <h3>Position Distribution</h3>
          </div>
          
          <div className="position-grid">
            {Object.entries(positionCounts).map(([position, count]) => (
              <div key={position} className="position-item">
                <div className="position-header">
                  <span className={`position-badge ${position.toLowerCase()}`}>
                    {position}
                  </span>
                  <span className="position-count">{count}</span>
                </div>
                <div className="position-bar">
                  <div 
                    className="position-fill"
                    style={{ 
                      width: `${(count / Math.max(...Object.values(positionCounts))) * 100}%`,
                      backgroundColor: getPositionColor(position)
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roster by Position */}
        <div className="card roster-card">
          <div className="roster-header">
            <h3>Roster by Position</h3>
            
            <div className="position-filter">
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="filter-select"
              >
                <option value="">All Positions</option>
                <option value="QB">QB</option>
                <option value="RB">RB</option>
                <option value="WR">WR</option>
                <option value="TE">TE</option>
                <option value="K">K</option>
                <option value="DST">DST</option>
              </select>
            </div>
          </div>

          <div className="roster-list">
            {filteredRoster.length === 0 ? (
              <div className="no-players">
                {selectedPosition ? `No ${selectedPosition} players drafted` : 'No players drafted yet'}
              </div>
            ) : (
              <div className="players-grid">
                {filteredRoster.map((player) => (
                  <div key={player.id} className="roster-player-card">
                    <div className="player-header">
                      <div className="player-name">{player.name}</div>
                      <span className={`position-badge ${player.position.toLowerCase()}`}>
                        {player.position}
                      </span>
                    </div>
                    
                    <div className="player-details">
                      <div className="detail-item">
                        <span className="detail-label">Team:</span>
                        <span className="detail-value">{player.team}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Tier:</span>
                        <span className="detail-value">{player.tier}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Bye Week:</span>
                        <span className="detail-value">{player.byeWeek}</span>
                      </div>
                    </div>
                    
                    <div className="player-stats">
                      <div className="stat-item">
                        <span className="stat-label">Projected Points:</span>
                        <span className="stat-value">{Math.round(player.projectedPoints)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">ADP:</span>
                        <span className="stat-value">{player.adp}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Rank:</span>
                        <span className="stat-value">#{player.rank}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Draft History */}
        {userTeam.picks && userTeam.picks.length > 0 && (
          <div className="card draft-history-card">
            <div className="history-header">
              <FaHistory className="history-icon" />
              <h3>Draft History</h3>
            </div>
            
            <div className="history-list">
              {userTeam.picks.map((pick, index) => (
                <div key={index} className="history-item">
                  <div className="pick-info">
                    <div className="pick-round">Round {pick.round}, Pick {pick.pickNumber}</div>
                    <div className="pick-timestamp">
                      {new Date(pick.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="picked-player">
                    <div className="player-name">{pick.player.name}</div>
                    <div className="player-details">
                      <span className={`position-badge ${pick.player.position.toLowerCase()}`}>
                        {pick.player.position}
                      </span>
                      <span className="player-team">{pick.player.team}</span>
                    </div>
                  </div>
                  
                  <div className="pick-stats">
                    <span className="projected-points">{Math.round(pick.player.projectedPoints)} pts</span>
                    <span className="adp">ADP: {pick.player.adp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getPositionColor = (position) => {
  const colors = {
    QB: '#007bff',
    RB: '#28a745',
    WR: '#ffc107',
    TE: '#6f42c1',
    K: '#6c757d',
    DST: '#dc3545'
  };
  return colors[position] || '#6c757d';
};

export default Roster;
