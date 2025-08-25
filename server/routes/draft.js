const express = require('express');
const router = express.Router();
const DraftService = require('../services/DraftService');

const draftService = new DraftService();

// Get current draft state
router.get('/state', async (req, res) => {
  try {
    const draftState = await draftService.getDraftState();
    res.json(draftState);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Make a draft pick
router.post('/pick', async (req, res) => {
  try {
    const { playerId, teamId, round, pickNumber } = req.body;
    const result = await draftService.makePick(playerId, teamId, round, pickNumber);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get optimal pick suggestion
router.get('/suggest', async (req, res) => {
  try {
    const { teamId, currentRound } = req.query;
    const suggestion = await draftService.getOptimalPick(teamId, parseInt(currentRound));
    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get draft board
router.get('/board', async (req, res) => {
  try {
    const draftBoard = await draftService.getDraftBoard();
    res.json(draftBoard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get team roster
router.get('/team/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const roster = await draftService.getTeamRoster(teamId);
    res.json(roster);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset draft
router.post('/reset', async (req, res) => {
  try {
    await draftService.resetDraft();
    res.json({ message: 'Draft reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get draft history
router.get('/history', async (req, res) => {
  try {
    const history = await draftService.getDraftHistory();
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
