import api from '..';

export async function GetDataSharing() {
  try {
    const response = await api.get('/data-sharing');
    return response.data.data;
  } catch (error) {
    throw error;
  }
}
