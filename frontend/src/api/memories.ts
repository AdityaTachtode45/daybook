import api from './axios';
import { MediaGroupDto } from '../types';

export const getMediaMemories = async (): Promise<MediaGroupDto[]> => {
  const res = await api.get<MediaGroupDto[]>('/media/memories');
  return res.data;
};
