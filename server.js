const path = require('path');
const express = require('express');

const app = express();

const dist = path.join(__dirname, 'dist');

app.use(express.static(dist));
// app.set('port', process.env.PORT || 5000);
const PORT = process.env.PORT || 5000;
// console.log(`Listening on ${ PORT }`);

app.get('/*', (req, res) => {
  res.sendFile(`${dist}/index.html`);
})

// app.listen(PORT, function() {
//   console.log('listening on port ', process.env.PORT || 5000);
// });
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))