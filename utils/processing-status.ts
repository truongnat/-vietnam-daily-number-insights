// Simple in-memory status tracking
const processingStatus = new Map<string, {
  type: 'analysis' | 'lottery';
  status: 'processing' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  error?: string;
}>();

export function setProcessingStatus(
  dateKey: string, 
  type: 'analysis' | 'lottery', 
  status: 'processing' | 'completed' | 'failed',
  error?: string
) {
  const key = `${dateKey}-${type}`;
  const existing = processingStatus.get(key);
  
  processingStatus.set(key, {
    type,
    status,
    startTime: existing?.startTime || new Date(),
    endTime: status !== 'processing' ? new Date() : undefined,
    error
  });
}

export function getProcessingStatus(dateKey: string, type: 'analysis' | 'lottery') {
  const key = `${dateKey}-${type}`;
  return processingStatus.get(key);
}

export function getAllProcessingStatus() {
  return Object.fromEntries(processingStatus.entries());
}
