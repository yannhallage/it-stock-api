const reset = '\x1b[0m';
const dim = '\x1b[2m';
const bold = '\x1b[1m';
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const red = '\x1b[31m';
const magenta = '\x1b[35m';
const gray = '\x1b[90m';

const methodColor = (method: string): string => {
  switch (method) {
    case 'GET':
      return cyan;
    case 'POST':
      return green;
    case 'PUT':
    case 'PATCH':
      return yellow;
    case 'DELETE':
      return red;
    default:
      return magenta;
  }
};

const statusColor = (status: number): string => {
  if (status >= 500) return red;
  if (status >= 400) return yellow;
  if (status >= 300) return cyan;
  return green;
};

export const logger = {
  info: (message: string) => {
    console.log(`${gray}[${new Date().toISOString()}]${reset} ${message}`);
  },
  error: (message: string) => {
    console.error(`${gray}[${new Date().toISOString()}]${reset} ${red}${message}${reset}`);
  },
  http: (method: string, url: string, status: number, durationMs: number) => {
    const timestamp = `${gray}[${new Date().toISOString()}]${reset}`;
    const methodPart = `${methodColor(method)}${bold}${method}${reset}`;
    const statusPart = `${statusColor(status)}${bold}${status}${reset}`;
    const durationPart = `${dim}${durationMs}ms${reset}`;

    console.log(`${timestamp} ${methodPart} ${url} ${statusPart} ${durationPart}`);
  },
};
