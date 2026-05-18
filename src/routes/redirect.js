const express = require('express');
const urlModel = require('../models/url');
const { isValidShortCode } = require('../utils/shortCode');

const router = express.Router();

/**
 * GET /:code - Redirect to original URL
 */
router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;

    // Validate code format
    if (!isValidShortCode(code)) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const urlData = await urlModel.getUrlByShortCode(code);
    if (!urlData) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Check if expired
    if (urlData.expires_at && new Date(urlData.expires_at) < new Date()) {
      return res.status(410).json({ error: 'This short URL has expired' });
    }

    // Record the click
    await urlModel.recordClick(
      urlData.id,
      req.headers['user-agent'],
      req.ip
    );

    // Redirect to original URL
    res.redirect(301, urlData.original_url);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
