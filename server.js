const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

// মামা, cPanel-এ সরাসরি false করে দেওয়া নিরাপদ যাতে সব সময় প্রোডাকশন বিল্ড ধরে
const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(process.env.PORT || 3000, (err) => {
      if (err) throw err;
      console.log("> Ready on port " + (process.env.PORT || 3000));
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
