import axios from 'axios';

const API_BASE = (process.env.API_BASE_URL || 'http://localhost:3000/api').replace(/\/+$/, '');

async function test() {
  try {
    const res = await axios.get(`${API_BASE}/packages`);
    if (res.data.length > 0) {
      const pkg = res.data[0];
      console.log("Attempting to update package:", pkg.id);
      const putRes = await axios.put(`${API_BASE}/packages/${pkg.id}`, { packageName: 'Test Edit' });
      console.log("Update result:", putRes.data);
      
      console.log("Attempting to delete package:", pkg.id);
      const delRes = await axios.delete(`${API_BASE}/packages/${pkg.id}`);
      console.log("Delete result:", delRes.data);
    }
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

test();
