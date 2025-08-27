// dm/src/features/user/api.js
import { api } from '../../lib/apiClient';

export async function whoAmI() {
  return api.get('/whoami'); // -> { user: "<email>" }
}

export async function dmPing() {
  // returns { ok: true, role: "dm" } if you’re a DM, 403 otherwise
  return api.get('/dm/ping');
}
