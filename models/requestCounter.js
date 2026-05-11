let requestCount = 0;

const getTimestamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const requestCounter = (req, res, next) => {
  requestCount++;
  const start = Date.now();

  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const method = req.method;
    const url = req.originalUrl;
    const statusText = status >= 200 && status < 300 ? "OK" : "ERROR";

    console.log(
      `${getTimestamp()} [INFO] [request]  [${method} ${url}] - Total requests: ${requestCount} - ${duration}ms - ${status} ${statusText}`
    );

    originalEnd.apply(res, args);
  };

  next();
};

module.exports = requestCounter;