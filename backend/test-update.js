import axios from 'axios';

const API_BASE = (process.env.API_BASE_URL || 'http://localhost:3000/api').replace(/\/+$/, '');

async function test() {
  try {
    const res = await axios.get(`${API_BASE}/users`);
    if (res.data.length > 0) {
      const user = res.data[0];
      console.log("Attempting to update user:", user.id);
      const putRes = await axios.put(`${API_BASE}/users/${user.id}`, { name: 'Test Edit' });
      console.log("Update result:", putRes.data);
    }
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

test();
