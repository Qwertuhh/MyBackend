import connectDB from "./db/index.js";
import app from "./app.js";
import { PORT } from "./config.js";

connectDB()
  .then(() => {
    app.on("error", (error) => console.error("Application Error",error));
    app.listen(PORT, () => console.log(`Server is running on port http://localhost:${PORT}`));
  })
  .catch((error) => console.error("DB Connection Failed :: ", error));
