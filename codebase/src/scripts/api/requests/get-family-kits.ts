import api from '..';

export async function GetFamilyKits() {
  try {
    const response = await api.get('/family-kits');
    return response.data.data;
  } catch (error) {
    throw error;
  }
}
