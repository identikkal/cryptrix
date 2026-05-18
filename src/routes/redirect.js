const express = require('express');
const urlModel = require('../models/url');
const { isValidShortCode } = require('../utils/shortCode');

const router = express.Router();

router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;

    if (!isValidShortCode(code)) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const urlData = await urlModel.getUrlByShortCode(code);
    if (!urlData) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    if (urlData.expires_at && new Date(urlData.expires_at) < new Date()) {
      return res.status(410).json({ error: 'This short URL has expired' });
    }

    await urlModel.recordClick(
      urlData.id,
      req.headers['user-agent'],
      req.ip
    );

    res.redirect(301, urlData.original_url);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
