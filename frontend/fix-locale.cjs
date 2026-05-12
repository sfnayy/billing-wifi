const fs = require('fs');
const files = [
  'src/pages/user/UserDashboard.jsx',
  'src/pages/admin/UserManagement.jsx',
  'src/pages/admin/SubscriptionManagement.jsx',
  'src/pages/admin/PackageManagement.jsx',
  'src/pages/admin/AdminReports.jsx',
  'src/pages/admin/AdminDashboard.jsx',
  'src/components/Reports.jsx'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/toLocaleString\('id-ID', \{ day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' \}\)/g, "toLocaleString('id-ID')");
    fs.writeFileSync(f, content);
    console.log('Fixed toLocaleString ' + f);
  }
});
