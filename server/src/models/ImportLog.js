const mongoose = require('mongoose');

const failedJobSchema = new mongoose.Schema(
  {
    externalId: String,
    reason: String,
  },
  { _id: false }
);

const importLogSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    totalFetched: { type: Number, default: 0 },
    totalImported: { type: Number, default: 0 },
    newJobs: { type: Number, default: 0 },
    updatedJobs: { type: Number, default: 0 },
    failedJobs: { type: Number, default: 0 },
    failures: [failedJobSchema],
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

importLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ImportLog', importLogSchema);


