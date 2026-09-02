import api from '..';

export async function GetUsers() {
  try {
    const response = await api.get('/users');
    return response.data.data;
  } catch (error) {
    throw error;
  }
}
