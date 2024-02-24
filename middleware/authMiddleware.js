const jwt = require("jsonwebtoken");
const secrete = process.env.JWT_SUPER_SEACRETE || "superGupthKey";
const requireAuth = (req, res, next) => {
  const { timeframe } = req.query;
  const authHeader = req.get("Authorization");
  const clientDatenTime = req.get("x-client-datetime");
  // const jobId = req.query || null;
  const token = authHeader ? authHeader.split(" ")[1] : null;
  if (token) {
    jwt.verify(token, secrete, (err, decoadedToken) => {
      if (err) {
        // console.log(err.message);
        return res.status(401).json({ msg: err.message, status: "Error" });
      } else {
        // console.log("auth middleware decode", decoadedToken);
        res.locals.tokenData = decoadedToken;
        res.locals.clientTime = clientDatenTime;
        res.locals.timefilter = timeframe;
        next();
      }
    });
  } else {
    res.status(401).json({
      msg: "token not found",
      status: "Error",
    });
  }
};
module.exports = { requireAuth };
