const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace("T", " ").substring(0, 19);
};

const log = (level, category, message) => {
  console.log(`${getTimestamp()} [${level}] [${category}]  ${message}`);
};

module.exports = {
  info: (category, message) => log("info", category, message),
  error: (category, message) => log("error", category, message),
  warn: (category, message) => log("warn", category, message),
};