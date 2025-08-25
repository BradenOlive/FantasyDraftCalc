const express = require('express');
const router = express.Router();
const PlayerService = require('../services/PlayerService');

const playerService = new PlayerService();

// Get all available players
router.get('/', async (req, res) => {
  try {
    const players = await playerService.getAvailablePlayers();
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get players by position
router.get('/position/:position', async (req, res) => {
  try {
    const { position } = req.params;
    const players = await playerService.getPlayersByPosition(position);
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get player by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const player = await playerService.getPlayerById(id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search players
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const players = await playerService.searchPlayers(query);
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refresh player data from external source
router.post('/refresh', async (req, res) => {
  try {
    const { source } = req.body; // 'mock', 'csv', 'api'
    await playerService.refreshPlayerData(source);
    res.json({ message: 'Player data refreshed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
