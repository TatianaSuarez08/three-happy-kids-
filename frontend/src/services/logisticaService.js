import { request } from './httpClient';

export const getLogistica = async () => {
  const data = await request('/logistica');
  return {
    summary: data?.summary || null,
    tasks: data?.tasks || []
  };
};
