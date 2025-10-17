const axios = require('axios');
const xml2js = require('xml2js');

const FEEDS = [
  'https://jobicy.com/?feed=job_feed',
  'https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time',
  'https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france',
  'https://jobicy.com/?feed=job_feed&job_categories=design-multimedia',
  'https://jobicy.com/?feed=job_feed&job_categories=data-science',
  'https://jobicy.com/?feed=job_feed&job_categories=copywriting',
  'https://jobicy.com/?feed=job_feed&job_categories=business',
  'https://jobicy.com/?feed=job_feed&job_categories=management',
  'https://www.higheredjobs.com/rss/articleFeed.cfm',
];

async function fetchXml(url) {
  const response = await axios.get(url, { timeout: 20000 });
  return response.data;
}

async function xmlToJson(xml) {
  const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
  return parser.parseStringPromise(xml);
}

function normalizeItems(feedUrl, json) {
  // Supports typical RSS 2.0 format
  const items = json?.rss?.channel?.item || json?.feed?.entry || [];
  const itemArray = Array.isArray(items) ? items : [items];
  return itemArray
    .filter(Boolean)
    .map((item) => {
      const externalId = item.guid?.toString?.() || item.id || item.link || item.title;
      const title = item.title?._ || item.title || '';
      const description = item['content:encoded'] || item.description || item.summary || '';
      const url = item.link?.href || item.link || '';
      const publishedAt = item.pubDate || item.published || item.updated || null;
      const company = item['dc:creator'] || item.author?.name || '';
      return {
        externalId: externalId?.toString?.() || null,
        sourceUrl: feedUrl,
        title,
        company,
        location: item.category || '',
        type: item.category || '',
        url,
        description,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        raw: item,
      };
    });
}

async function fetchAllFeeds() {
  const urls = process.env.FEEDS ? process.env.FEEDS.split(',') : FEEDS;
  const results = [];
  for (const url of urls) {
    try {
      const xml = await fetchXml(url);
      const json = await xmlToJson(xml);
      const items = normalizeItems(url, json);
      results.push({ url, items });
    } catch (err) {
      results.push({ url, items: [], error: err.message });
    }
  }
  return results;
}

module.exports = {
  fetchAllFeeds,
};


