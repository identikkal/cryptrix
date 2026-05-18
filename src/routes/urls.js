const express = require('express');
const Joi = require('joi');
const urlModel = require('../models/url');

const router = express.Router();

const urlSchema = Joi.object({
  url: Joi.string().uri().required(),
  expires_at: Joi.date().iso().optional(),
});

router.post('/', async (req, res, next) => {
  try {
    const { error, value } = urlSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const urlData = await urlModel.createShortUrl(value.url, value.expires_at);
    const shortUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/${urlData.short_code}`;

    res.status(201).json({
      success: true,
      data: {
        short_code: urlData.short_code,
        short_url: shortUrl,
        original_url: urlData.original_url,
        created_at: urlData.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const urlData = await urlModel.getUrlByShortCode(code);

    if (!urlData) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.json({
      success: true,
      data: urlData,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:code/stats', async (req, res, next) => {
  try {
    const { code } = req.params;
    const stats = await urlModel.getUrlStats(code);

    if (!stats) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const deleted = await urlModel.deleteUrl(code);

    if (!deleted) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.json({ success: true, message: 'Short URL deleted' });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const urls = await urlModel.listUrls(limit, offset);

    res.json({
      success: true,
      data: urls,
      pagination: { page, limit },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
