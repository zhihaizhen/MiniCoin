import crypto from 'crypto';
// import TraceParent from 'traceparent';

export const traceParent = () => {
  const version = Buffer.alloc(1).toString('hex');
  const traceId = crypto.randomBytes(16).toString('hex');
  const id = crypto.randomBytes(8).toString('hex');
  const flags = '01';
  const header = `${version}-${traceId}-${id}-${flags}`;
  // return TraceParent.fromString(header);
  return '';
};
