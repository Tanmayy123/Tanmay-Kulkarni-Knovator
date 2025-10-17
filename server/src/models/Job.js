const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    externalId: { type: String, index: true },
    sourceUrl: { type: String, required: true, index: true },
    title: String,
    company: String,
    location: String,
    type: String,
    url: String,
    description: String,
    publishedAt: Date,
    raw: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

jobSchema.index({ sourceUrl: 1, externalId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Job', jobSchema);


