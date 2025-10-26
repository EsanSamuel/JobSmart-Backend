const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];

const corsOptions = {
  origin: (origin: string | undefined, callback: any) => {
    if (allowedOrigins.indexOf(origin!) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

export default corsOptions;
