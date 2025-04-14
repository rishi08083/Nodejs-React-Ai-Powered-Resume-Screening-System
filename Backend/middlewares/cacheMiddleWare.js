const LRUCacheOptimized = require("../utils/lruCache");
const cache = new LRUCacheOptimized({
  maxSize: 100,
  maxAge: 60 * 60 * 1000,
});

exports.checkCache = (req, res, next) => {
  const value = cache.get("adminAnalytics");
  if (value) {
    console.log("Serving from cache");
    return res.status(200).json(value);
  }
  console.log("Cache miss - proceeding to handler");
  next();
};

exports.checkRecruiterCache = (req, res, next) => {
  const value = cache.get("recruiterAnalytics");
  if (value) {
    console.log("Serving from cache");
    return res.status(200).json(value);
  }
  console.log("Cache miss - proceeding to handler");
  next();
}
exports.cache = cache;
