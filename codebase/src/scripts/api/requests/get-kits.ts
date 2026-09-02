import api from '..';

export async function GetKits() {
  try {
    const response = await api.get('/kits');
    return response.data.data;
  } catch (error) {
    throw error;
  }
}
