import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema(
  {
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for the dispute'],
      enum: ['item_not_received', 'not_as_described', 'damaged', 'other'],
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['open', 'seller_responded', 'admin_mediating', 'resolved_buyer_refunded', 'resolved_seller_paid', 'dismissed'],
      default: 'open',
    },
    sellerResponse: {
      type: String,
      default: '',
    },
    sellerRespondedAt: {
      type: Date,
      default: null,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        senderModel: {
          type: String,
          default: 'User',
        },
        role: {
          type: String,
          enum: ['buyer', 'seller', 'admin', 'superadmin'],
        },
        message: {
          type: String,
          required: true,
        },
        attachmentUrl: {
          type: String,
          default: null,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Dispute', disputeSchema);
