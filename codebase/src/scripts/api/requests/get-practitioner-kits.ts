import api from '..';

export async function GetPractitionerKits() {
  try {
    const response = await api.get('/practitioner-kits');
    return response.data.data;
  } catch (error) {
    throw error;
  }
}
