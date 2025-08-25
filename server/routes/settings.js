const express = require('express');
const router = express.Router();
const SettingsService = require('../services/SettingsService');

const settingsService = new SettingsService();

// Get current league settings
router.get('/', async (req, res) => {
  try {
    const settings = await settingsService.getLeagueSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update league settings
router.put('/', async (req, res) => {
  try {
    const settings = req.body;
    const updatedSettings = await settingsService.updateLeagueSettings(settings);
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available league types
router.get('/league-types', async (req, res) => {
  try {
    const leagueTypes = await settingsService.getLeagueTypes();
    res.json(leagueTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get scoring settings
router.get('/scoring', async (req, res) => {
  try {
    const scoringSettings = await settingsService.getScoringSettings();
    res.json(scoringSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update scoring settings
router.put('/scoring', async (req, res) => {
  try {
    const scoringSettings = req.body;
    const updatedScoring = await settingsService.updateScoringSettings(scoringSettings);
    res.json(updatedScoring);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get roster requirements
router.get('/roster', async (req, res) => {
  try {
    const rosterRequirements = await settingsService.getRosterRequirements();
    res.json(rosterRequirements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update roster requirements
router.put('/roster', async (req, res) => {
  try {
    const rosterRequirements = req.body;
    const updatedRoster = await settingsService.updateRosterRequirements(rosterRequirements);
    res.json(updatedRoster);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
