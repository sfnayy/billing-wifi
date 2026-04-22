import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('http://localhost:5000/api/users');
    if (res.data.length > 0) {
      const user = res.data[0];
      console.log("Attempting to update user:", user.id);
      const putRes = await axios.put(`http://localhost:5000/api/users/${user.id}`, { name: 'Test Edit' });
      console.log("Update result:", putRes.data);
    }
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

test();
