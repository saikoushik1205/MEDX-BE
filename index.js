import app from "../server.js";

export default function handler(req, res) {
  return app(req, res); // pass request into Express app
}
