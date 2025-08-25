import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const DraftContext = createContext();

const initialState = {
  draftState: {
    currentRound: 1,
    currentPick: 1,
    totalPicks: 0,
    isComplete: false
  },
  teams: [],
  availablePlayers: [],
  draftBoard: [],
  userTeam: null,
  settings: null,
  loading: false,
  error: null
};

const draftReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_DRAFT_STATE':
      return { ...state, draftState: action.payload };
    
    case 'SET_TEAMS':
      return { ...state, teams: action.payload };
    
    case 'SET_AVAILABLE_PLAYERS':
      return { ...state, availablePlayers: action.payload };
    
    case 'SET_DRAFT_BOARD':
      return { ...state, draftBoard: action.payload };
    
    case 'SET_USER_TEAM':
      return { ...state, userTeam: action.payload };
    
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    
    case 'MAKE_PICK':
      return {
        ...state,
        draftState: action.payload.draftState,
        availablePlayers: state.availablePlayers.filter(p => p.id !== action.payload.player.id),
        teams: state.teams.map(team => 
          team.id === action.payload.teamId 
            ? { ...team, roster: [...team.roster, action.payload.player] }
            : team
        )
      };
    
    case 'RESET_DRAFT':
      return {
        ...state,
        draftState: initialState.draftState,
        teams: [],
        availablePlayers: [],
        draftBoard: [],
        userTeam: null
      };
    
    default:
      return state;
  }
};

export const DraftProvider = ({ children }) => {
  const [state, dispatch] = useReducer(draftReducer, initialState);

  // Load initial data
  useEffect(() => {
    loadDraftData();
    loadSettings();
  }, []);

  const loadDraftData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [draftStateRes, playersRes, boardRes] = await Promise.all([
        axios.get('/api/draft/state'),
        axios.get('/api/players'),
        axios.get('/api/draft/board')
      ]);

      dispatch({ type: 'SET_DRAFT_STATE', payload: draftStateRes.data });
      dispatch({ type: 'SET_TEAMS', payload: draftStateRes.data.teams });
      dispatch({ type: 'SET_AVAILABLE_PLAYERS', payload: playersRes.data });
      dispatch({ type: 'SET_DRAFT_BOARD', payload: boardRes.data });
      
      // Set user team (assuming team 1 is the user)
      if (draftStateRes.data.teams.length > 0) {
        dispatch({ type: 'SET_USER_TEAM', payload: draftStateRes.data.teams[0] });
      }
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      dispatch({ type: 'SET_SETTINGS', payload: response.data });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const makePick = async (playerId, teamId, round, pickNumber) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.post('/api/draft/pick', {
        playerId,
        teamId,
        round,
        pickNumber
      });

      dispatch({ type: 'MAKE_PICK', payload: response.data });
      
      // Refresh draft board
      const boardRes = await axios.get('/api/draft/board');
      dispatch({ type: 'SET_DRAFT_BOARD', payload: boardRes.data });
      
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getOptimalPick = async (teamId, currentRound) => {
    try {
      const response = await axios.get(`/api/draft/suggest?teamId=${teamId}&currentRound=${currentRound}`);
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const resetDraft = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await axios.post('/api/draft/reset');
      await loadDraftData();
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const response = await axios.put('/api/settings', newSettings);
      dispatch({ type: 'SET_SETTINGS', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const value = {
    ...state,
    makePick,
    getOptimalPick,
    resetDraft,
    updateSettings,
    loadDraftData
  };

  return (
    <DraftContext.Provider value={value}>
      {children}
    </DraftContext.Provider>
  );
};

export const useDraft = () => {
  const context = useContext(DraftContext);
  if (!context) {
    throw new Error('useDraft must be used within a DraftProvider');
  }
  return context;
};
