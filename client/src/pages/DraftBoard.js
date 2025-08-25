import React, { useState } from 'react';
import { useDraft } from '../context/DraftContext';
import { FaSearch, FaFilter } from 'react-icons/fa';
import './DraftBoard.css';

const DraftBoard = () => {
  const { 
    draftBoard, 
    draftState, 
    availablePlayers, 
    makePick, 
    loading, 
    error 
  } = useDraft();

  const [selectedPosition, setSelectedPosition] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const handleMakePick = async (player, round, pickNumber) => {
    try {
      await makePick(player.id, 1, round, pickNumber); // Assuming team 1 is user
      setSelectedPlayer(null);
    } catch (error) {
      console.error('Failed to make pick:', error);
    }
  };

  const filteredPlayers = availablePlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = !selectedPosition || player.position === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  if (loading) {
    return <div className="loading">Loading draft board...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="draft-board">
      <div className="page-header">
        <h1 className="page-title">Draft Board</h1>
        <p className="page-subtitle">
          Round {draftState.currentRound}, Pick {draftState.currentPick}
        </p>
      </div>

      {/* Draft Status */}
      <div className="card draft-status-card">
        <div className="draft-status-grid">
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

      <div className="draft-board-container">
        {/* Draft Board Grid */}
        <div className="draft-board-grid">
          <div className="board-header">
            <h3>Draft Board</h3>
          </div>
          
          <div className="board-content">
            {draftBoard.map((round, roundIndex) => (
              <div key={roundIndex} className="round-row">
                <div className="round-header">Round {roundIndex + 1}</div>
                <div className="picks-container">
                  {round.map((pick, pickIndex) => (
                    <div key={pickIndex} className="pick-cell">
                      {pick.player ? (
                        <div className="drafted-player">
                          <div className="player-name">{pick.player.name}</div>
                          <div className="player-details">
                            <span className={`position-badge ${pick.player.position.toLowerCase()}`}>
                              {pick.player.position}
                            </span>
                            <span className="player-team">{pick.player.team}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="empty-pick">
                          <span className="pick-number">#{pick.pickNumber}</span>
                          <span className="team-name">{pick.teamId}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Players */}
        <div className="available-players">
          <div className="players-header">
            <h3>Available Players</h3>
            
            {/* Search and Filter */}
            <div className="search-filter">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="position-filter">
                <FaFilter className="filter-icon" />
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
          </div>

          <div className="players-list">
            {filteredPlayers.length === 0 ? (
              <div className="no-players">No players found</div>
            ) : (
              filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  className="player-card"
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className="player-info">
                    <div className="player-name">{player.name}</div>
                    <div className="player-details">
                      <span className={`position-badge ${player.position.toLowerCase()}`}>
                        {player.position}
                      </span>
                      <span className="player-team">{player.team}</span>
                      <span className="player-tier">Tier {player.tier}</span>
                    </div>
                  </div>
                  <div className="player-stats">
                    <div className="projected-points">{Math.round(player.projectedPoints)} pts</div>
                    <div className="adp">ADP: {player.adp}</div>
                    <div className="rank">Rank: #{player.rank}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Player Selection Modal */}
      {selectedPlayer && (
        <div className="modal-overlay" onClick={() => setSelectedPlayer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Draft {selectedPlayer.name}</h3>
              <button 
                className="modal-close"
                onClick={() => setSelectedPlayer(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="selected-player-info">
                <div className="player-name">{selectedPlayer.name}</div>
                <div className="player-details">
                  <span className={`position-badge ${selectedPlayer.position.toLowerCase()}`}>
                    {selectedPlayer.position}
                  </span>
                  <span className="player-team">{selectedPlayer.team}</span>
                </div>
                <div className="player-stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Projected Points:</span>
                    <span className="stat-value">{Math.round(selectedPlayer.projectedPoints)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">ADP:</span>
                    <span className="stat-value">{selectedPlayer.adp}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Tier:</span>
                    <span className="stat-value">{selectedPlayer.tier}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Bye Week:</span>
                    <span className="stat-value">{selectedPlayer.byeWeek}</span>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button
                  className="btn btn-success"
                  onClick={() => handleMakePick(selectedPlayer, draftState.currentRound, draftState.currentPick)}
                >
                  Draft Player
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setSelectedPlayer(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftBoard;
