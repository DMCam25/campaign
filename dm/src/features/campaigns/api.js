import { api } from '../../lib/apiClient';

export async function listCampaigns() {
  return api.get('/campaigns'); // -> [{ id, name, owner, role }]
}

export async function createCampaign({ name }) {
  return api.post('/campaigns', { name }); // -> { id, name, owner, role }
}

export async function deleteCampaign(id) {
  return api.del(`/campaigns/${encodeURIComponent(id)}`);
}