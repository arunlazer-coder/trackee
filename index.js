const { bodyParse, app, express, port } = require("./util/import"); //middleware
const {userRoute} = require("./routes/user");
const {categoryRouter} = require("./routes/category");
const {expenseRouter} = require("./routes/expense");
// app.use(cors({ origin: "http://localhost:5001/" }));
app.use(express.json());
app.use(bodyParse.urlencoded({ extended: true }));
app.use("/api/user", userRoute);
app.use("/api/category", categoryRouter);
app.use("/api/expense", expenseRouter);
//testing api
app.get("/", (req, res) => {
  res.json({ message: "hello" });
});

app.listen(port, () => {
  console.log(`
  -------------------------------------------------
  server is running on port http://${process.env.DB_HOST}:${port}
  --------------------------------------------------
  `);
});
