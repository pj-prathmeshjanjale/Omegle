const express = require("express");
const app = express();
const indexRouter = require("./routes")
const path =require("path");

const http = require("http");
const socketIO= require("socket.io");
const { disconnect } = require("process");
const server = http.createServer(app);
const io = socketIO(server)

app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")))
app.use('/',indexRouter);

let waitingusers = []
let rooms={

}
io.on("connection",function (socket){
    socket.on("joinroom",function(){
        if(waitingusers.length>0){
            let partner = waitingusers.shift();
            const roomname = `${socket.id}-${partner.id}`;

            socket.join(roomname)
            partner.join(roomname)

            io.to(roomname).emit("joined",roomname);
        }else{
            waitingusers.push(socket);
        }
    })
    socket.on("disconnect",function(){
        let index = ((waitingUsers) => waitingUsers.id===socket.id);
        waitingusers.splice(index,1)
    })

    socket.on("message",function(data){
        socket.broadcast.to(data.room).emit('message',data.message);
    })
    
    socket.on("signalingMessage",function(data){
        socket.broadcast.to(data.room).emit("signalingMessage",data.message); 
    })
    socket.on("startVideoCall",function({room}){
        socket.broadcast.to(room).emit("incomingCall");
    })
    socket.on("acceptCall",function({room}){
        socket.broadcast.to(room).emit("callAccepted")
    })
    socket.on("rejectCall",function({room}){
        socket.broadcast.to(room).emit("callRejected")
    })
})

server.listen(3000);

