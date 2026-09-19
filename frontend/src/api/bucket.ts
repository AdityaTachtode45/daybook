import api from './axios';
import {
  BucketItem,
  BucketStep,
  BucketReorderItem,
  BucketCompleteRequest,
  BucketCompletedDateCount,
  BucketStats,
  BucketByDateItem,
} from '../types';

export const getBucketItems = async (params?: {
  status?: string;
  category?: string;
  q?: string;
  sort?: string;
}): Promise<BucketItem[]> => {
  const res = await api.get<BucketItem[]>('/bucket', { params });
  return res.data;
};

export const createBucketItem = async (data: Partial<BucketItem>): Promise<BucketItem> => {
  const res = await api.post<BucketItem>('/bucket', data);
  return res.data;
};

export const getBucketItemById = async (id: number): Promise<BucketItem> => {
  const res = await api.get<BucketItem>(`/bucket/${id}`);
  return res.data;
};

export const updateBucketItem = async (id: number, data: Partial<BucketItem>): Promise<BucketItem> => {
  const res = await api.put<BucketItem>(`/bucket/${id}`, data);
  return res.data;
};

export const deleteBucketItem = async (id: number): Promise<void> => {
  await api.delete(`/bucket/${id}`);
};

export const reorderBucketItems = async (items: BucketReorderItem[]): Promise<void> => {
  await api.post('/bucket/reorder', items);
};

export const completeBucketItem = async (
  id: number,
  request?: BucketCompleteRequest
): Promise<BucketItem> => {
  const res = await api.post<BucketItem>(`/bucket/${id}/complete`, request || {});
  return res.data;
};

export const reopenBucketItem = async (id: number): Promise<BucketItem> => {
  const res = await api.post<BucketItem>(`/bucket/${id}/reopen`);
  return res.data;
};

export const addBucketStep = async (itemId: number, text: string): Promise<BucketStep> => {
  const res = await api.post<BucketStep>(`/bucket/${itemId}/steps`, { text });
  return res.data;
};

export const updateBucketStep = async (
  stepId: number,
  data: { text?: string; done?: boolean; sortOrder?: number }
): Promise<BucketStep> => {
  const res = await api.put<BucketStep>(`/bucket/steps/${stepId}`, data);
  return res.data;
};

export const deleteBucketStep = async (stepId: number): Promise<void> => {
  await api.delete(`/bucket/steps/${stepId}`);
};

export const getBucketItemsByDate = async (date: string): Promise<BucketByDateItem[]> => {
  const res = await api.get<BucketByDateItem[]>(`/bucket/by-date/${date}`);
  return res.data;
};

export const getBucketCompletedDates = async (
  year: number,
  month: number
): Promise<BucketCompletedDateCount[]> => {
  const res = await api.get<BucketCompletedDateCount[]>('/bucket/completed-dates', {
    params: { year, month },
  });
  return res.data;
};

export const getBucketStats = async (): Promise<BucketStats> => {
  const res = await api.get<BucketStats>('/bucket/stats');
  return res.data;
};
