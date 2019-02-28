const server = require("./api/server.js");

const port = 5000;
server.listen(5000, () => {
  console.log(`You are live on port ${port}!`);
});
