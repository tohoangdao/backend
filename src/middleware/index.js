import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    const data = req.headers["authorization"];
    const token = data?.split(" ")[1];
    if (!token) return sendError(res, "jwt must be provided.", 401);

    const { payload } = jwt.verify(token, process.env.JWT_SECRET, {
      complete: true,
    });

    if (!payload.user) return sendError(res, "Unauthorized.", 401);

    req.verifyToken = token;
    req.user = payload.user;
    next();
  } catch (error) {
    return sendError(res, "jwt expired.", 401);
  }
};
