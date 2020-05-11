import express from "express";
import bodyParser from "body-parser";
import * as http from "http";
import socketio from "socket.io";
import mongoose from "mongoose";

const port = process.env.PORT || 5000;

const app = express();
const http2 = http.Server(app);
const io = socketio(http2);

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const dburl = "mongodb+srv://@chathistory-v9wv3.mongodb.net/test?retryWrites=true&w=majority";

var Message = mongoose.model("Message", {
    name: String,
    message: String
});

app.get("/messages", (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages);
    });
});

app.post("/messages", (req, res) => {
    let message = new Message(req.body);
    message.save((err) => {
        if (err) {
            sendStatus(500);
        }
        io.emit("message", req.body);
        res.sendStatus(200);

    });

});

io.on("connection", (socket) => {
    console.log("user connected");
});

mongoose.connect(dburl, { useNewUrlParser: true });
var db = mongoose.connection;

db.on("error", () => {
    console.log("> error occurred from the database");
});
db.once("open", () => {
    console.log("> successfully opened the database");
});

const server = http2.listen(port, () =>
    console.log("Server is listening on port %d", port)
);