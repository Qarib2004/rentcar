import { apiClient } from '@/lib/api/axios'

export async function getMyRequest() {
  const response = await apiClient.get('/owner-requests/my-request')
  return response.data
}

export async function createRequest(data: { message?: string }) {
  const response = await apiClient.post('/owner-requests', data)
  return response.data
}

export async function cancelRequest() {
  const response = await apiClient.delete('/owner-requests/my-request')
  return response.data
}

export const getAllRequests = async (status?: string) => {
  const params = status ? { status } : {};
  return await apiClient.get('/owner-requests', { params });
};

export async function reviewRequest(data: {
  id: string
  status: 'APPROVED' | 'REJECTED'
  adminNote?: string
}) {
  const { id, ...payload } = data 
  const response = await apiClient.patch(`/owner-requests/${id}/review`, payload)
  return response.data
}