import { getServiceStatus } from '../repositories/health.repository.js';

export const checkHealth = () => getServiceStatus();
