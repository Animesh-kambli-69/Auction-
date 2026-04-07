// src/controllers/activityController.js - Activity Feed Logic

import Activity from '../models/Activity.js';
import { asyncHandler } from '../utils/errorHandler.js';

export const getActivity = asyncHandler(async (req, res, next) => {
  const { limit = 20, offset = 0, type } = req.query;

  let filter = { isPublic: true };
  if (type) filter.type = type;

  const activity = await Activity.find(filter)
    .populate('user', 'name avatar')
    .populate('auction', 'title images')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  const total = await Activity.countDocuments(filter);

  res.status(200).json({
    success: true,
    activity,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    },
  });
});

export const getMyActivity = asyncHandler(async (req, res, next) => {
  const { limit = 20, offset = 0 } = req.query;

  const activity = await Activity.find({ user: req.user._id })
    .populate('auction', 'title')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  const total = await Activity.countDocuments({ user: req.user._id });

  res.status(200).json({
    success: true,
    activity,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    },
  });
});

export const getAuctionActivity = asyncHandler(async (req, res, next) => {
  const { auctionId } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  const activity = await Activity.find({ auction: auctionId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  res.status(200).json({
    success: true,
    activity,
  });
});
