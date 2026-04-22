import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('http://localhost:5000/api/users');
    console.log("Users:", res.data.length);
    if (res.data.length > 0) {
      const user = res.data[0];
      console.log("Attempting to delete user:", user.id);
      const delRes = await axios.delete(`http://localhost:5000/api/users/${user.id}`);
      console.log("Delete result:", delRes.data);
    }
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

test();
