import axios from 'axios';

const API_BASE = (process.env.API_BASE_URL || 'http://localhost:3000/api').replace(/\/+$/, '');

async function test() {
  try {
    const res = await axios.get(`${API_BASE}/users`);
    console.log("Users:", res.data.length);
    if (res.data.length > 0) {
      const user = res.data[0];
      console.log("Attempting to delete user:", user.id);
      const delRes = await axios.delete(`${API_BASE}/users/${user.id}`);
      console.log("Delete result:", delRes.data);
    }
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

test();
