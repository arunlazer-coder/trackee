const { bodyParse, app, express, port } = require("./util/import"); //middleware
const {userRoute} = require("./routes/user");
const {categoryRouter} = require("./routes/category");
const {expenseRouter} = require("./routes/expense");
const {accountRouter} = require("./routes/account");
const cors = require('cors')

app.use(cors());
app.use(express.json());
app.use(bodyParse.urlencoded({ extended: true }));
app.use("/api/user", userRoute);
app.use("/api/category", categoryRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/account", accountRouter);

//testing api
app.get("/", (req, res) => {
  res.json({ message: "hello" });
});
const os = require('os');

app.listen(port, () => {
  const networkInterfaces = os.networkInterfaces();
  const addresses = [];
  // Iterate over network interfaces
  Object.keys(networkInterfaces).forEach(interfaceName => {
    networkInterfaces[interfaceName].forEach(interfaceInfo => {
      if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {
        addresses.push(interfaceInfo.address);
      }
    });
  });

  if (addresses.length > 0) {
    console.log(`Server is running on http://${addresses[0]}:${port}`);
  } else {
    console.log('Unable to determine server address.');
  }
});