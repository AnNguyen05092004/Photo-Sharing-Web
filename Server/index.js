// const express = require("express");
// const app = express();
// const cors = require("cors");
// const dbConnect = require("./db/dbConnect");
// const UserRouter = require("./routes/UserRouter");
// const PhotoRouter = require("./routes/PhotoRouter");
// const AdminRouter = require("./routes/AdminRouter");

// dbConnect();

// app.use(cors());
// app.use(express.json());
// app.use("/api/user", UserRouter);
// app.use("/api/photo", PhotoRouter);
// app.use("/api/admin", AdminRouter);

// //express-session để quản lý phiên làm việc của người dùng
// const session = require("express-session");
// app.use(
//   session({
//     secret: "your_secret_key",
//     resave: false,
//     saveUninitialized: false,
//   })
// );

// app.get("/", (request, response) => {
//   response.send({ message: "Hello from photo-sharing app API!" });
// });

// router.get("/api/session", (req, res) => {
//   if (!req.session.user) {
//     return res.status(401).json({ message: "Not logged in" });
//   }
//   res.status(200).json(req.session.user);
// });


// app.listen(8081, () => {
//   console.log("server listening on port 8081");
// });


const express = require("express");
const app = express();
const cors = require("cors");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const AdminRouter = require("./routes/AdminRouter");
const NewPhotoRouter = require("./routes/NewPhotoRouter"); // Thêm router mới

const session = require("express-session");

dbConnect();

app.use(cors({
  origin: "http://localhost:3000", // hoặc domain frontend của bạn
  credentials: true, // cần để gửi cookie kèm theo request
}));
app.use(express.json());

// Cấu hình session
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // nên để true nếu dùng HTTPS
      sameSite: "lax", // hoặc "none" nếu frontend và backend khác domain
    },
  })
);

// Routers
app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);
app.use("/api/admin", AdminRouter);
app.use("/api", NewPhotoRouter); // Sử dụng router mới

const path = require("path");
app.use("/images", express.static(path.join(__dirname, "./images")));

//  Thêm route kiểm tra session đúng cách:
app.get("/api/session", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }
  res.status(200).json(req.session.user);
});

app.get("/", (request, response) => {
  console.log("session:", request.session);
  console.log(request.session.id);
  //request.session.visited = true; // Đặt một giá trị vào session để kiểm tra
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8081, () => {
  console.log("server listening on port 8081");
});
