import api from '..';

export async function GetAltDataSharing() {
  try {
    const response = await api.get('/alt-data-sharing');
    return response.data.data;
  } catch (error) {
    throw error;
  }
}
