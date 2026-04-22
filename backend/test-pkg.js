import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('http://localhost:5000/api/packages');
    if (res.data.length > 0) {
      const pkg = res.data[0];
      console.log("Attempting to update package:", pkg.id);
      const putRes = await axios.put(`http://localhost:5000/api/packages/${pkg.id}`, { packageName: 'Test Edit' });
      console.log("Update result:", putRes.data);
      
      console.log("Attempting to delete package:", pkg.id);
      const delRes = await axios.delete(`http://localhost:5000/api/packages/${pkg.id}`);
      console.log("Delete result:", delRes.data);
    }
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

test();
