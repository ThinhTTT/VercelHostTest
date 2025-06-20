import express from 'express';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import http from 'http'
import compression from 'compression';
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { meetingMap } from './map.js';
import items from './items.js';
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express(),
  port = process.env.PORT || 3002,
  server = http.createServer(app),
  io = new Server(server, {
    maxHttpBufferSize: 1e8, // 100MB for IFC files
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['polling', 'websocket']
  });

// Start the server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Socket.IO server initialized`);
});

console.log(path.join(__dirname, 'dist'))

// compress all requests
app.use(compression());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: port
  });
});

app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res) => res.sendFile(__dirname + '/dist/index.html'));
// app.use(favicon('./dist/favicon.ico'));
// Switch off the default 'X-Powered-By: Express' header
app.disable('x-powered-by');

const characters = [];
const charsAnimation = [];
const charsTransform = [];
const charsInfo = []
const MEETING_ROOM = 'general-metting-room';

const permission = {}

const rooms = {};
function createRoom(roomName) {
  rooms[roomName] = {
    id: roomName,
    characters: [],
    charsTransform: [],
    charsAnimation: [],
    charsInfo: [],
    MEETING_ROOM: MEETING_ROOM,
    map: { ...meetingMap },
    ifcModel: null,
    ifcModelVisible: true // Add visibility state
  };
}

function getRoomData(roomName) {
  return rooms[roomName];
}

function isRoomCreated(roomName) {
  return rooms.hasOwnProperty(roomName);
}



const generateRamdomPosition = () => {
  const possibleSpawnPosition = [
    // [3, 0, 2.5], [3, 0, 4.5],
    // [5, 0, 2.5], [5, 0, 4.5],
    // [7, 0, 2.5], [7, 0, 4.5],
    // [9, 0, 2.5], [9, 0, 4.5],
    [4.5, 0, 3]
  ]
  const randomIndex = Math.floor(Math.random() * possibleSpawnPosition.length);
  const randomSpawnPosition = possibleSpawnPosition[randomIndex];
  return randomSpawnPosition
}

io.on('connection', (socket) => {
  // Handle client joining a room
  function setup(ID, name, type, color) {
    if (isRoomCreated(ID)) {
      const roomData = getRoomData(ID);
      roomData.characters.push({
        id: socket.id,
        type: type,
        color: color,
      });

      roomData.charsTransform.push({
        id: socket.id,
        position: generateRamdomPosition(),
        quaternion: [0, 0, 0, 1],
      });

      roomData.charsAnimation.push({
        id: socket.id,
        base: null,
        addictive: null
      });

      roomData.charsInfo.push({
        id: socket.id,
        name: name,
      });

      socket.emit("hello", {
        id: socket.id,
        map: roomData.map,
        items,
      });
      permission[socket.id] = ID
      //console.log("char new: ",type, roomData.characters)
      io.in(ID).emit('syncCharsTransform', roomData.charsTransform);
      io.in(ID).emit('syncCharsAnimation', roomData.charsAnimation);
      io.in(ID).emit('characters', roomData.characters);

      io.to(ID).emit('charsInfo', rooms[ID].charsInfo)
      io.to(socket.id).emit('setname', {name, ID})
      // io.to(socket.id).emit('generatedUrl', { url: ID });
    } else {
      io.to(socket.id).emit('roomNotExist', ID);
    }
  }

  function makeID(length) {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  socket.on('transform', ({ position, quaternion }) => {
    var ID = permission[socket.id]
    const char = rooms[ID].charsTransform.find((c) => c.id === socket.id);
    char.position = position;
    char.quaternion = quaternion;
    io.in(ID).emit('syncCharsTransform', rooms[ID].charsTransform);
  });

  socket.on('message', ({ id, content }) => {
    var ID = permission[socket.id]
    if (!ID || !rooms[ID]) {
      return;
    }
    console.log("server receive message", { id, content })
    io.in(ID).emit('message', { id, content });
  });

  socket.on("itemsUpdate", ({ items, data }) => {
    var ID = permission[socket.id]
    if (!ID || !rooms[ID]) {  
      return;
    }
    //console.log("itemsUpdate");

    console.log("---map.items: " ,items);
    rooms[ID].map.items = items;
    rooms[ID].map.data = data;
    //console.log("data",data.length);
    // upateMapData(map.items);
    //console.log("mapUpdate", items);
    io.in(ID).emit("mapUpdate", {
      map: rooms[ID].map,
      characters: rooms[ID].characters,
    });
  });

  socket.on('emoji', ({ id, emojiId }) => {
    var ID = permission[socket.id]
    if (!ID || !rooms[ID]) {
      return;
    }
    io.in(ID).emit('emoji', { id, emojiId });
  })

  socket.on('animation', ({ base, addictive }) => {
    var ID = permission[socket.id]
    if (!ID || !rooms[ID]) {
      return;
    }
    const char = rooms[ID].charsAnimation.find((c) => c.id === socket.id);
    char.base = base;
    char.addictive = addictive;
    io.in(ID).emit('syncCharsAnimation', rooms[ID].charsAnimation);
  })

  socket.on('login', ({ name, roomId, type, color }) => {
    if (roomId === '') {
      //make new rooms if emty
      let ID = makeID(6)
      //check if room already exists
      while (io.sockets.adapter.rooms.has(ID)) {
        ID = makeID(6)
      }
      socket.join(ID);
      socket.emit('setID', ID);
      createRoom(ID);
      setup(ID, name, type, color);
    }
    else {
      //check if room already exists
      let ID = roomId
      if(ID.length < 6) {
        io.to(socket.id).emit('setname', { name, ID:'' }) // send to this socket only, dupplicate name
      }
      else if (io.sockets.adapter.rooms.has(ID)) {
        const found = rooms[ID].charsInfo.find(c => c.name === name);
        if (found)
          io.to(socket.id).emit('setname', { name:'', ID }) // send to this socket only, dupplicate name
        else {
          socket.join(ID)
          setup(ID, name, type, color);
        }
      }
      else {
        //or make new room base on the room id
        socket.join(ID)
        createRoom(ID);
        setup(ID, name, type, color);
      }
    }
  })


  socket.on('offer', (d) => {
    // console.log('offer', d);
    var ID = permission[socket.id]
    if (!ID || !rooms[ID]) {
      return;
    }
    const meetingRoom = MEETING_ROOM + ID
    socket.in(meetingRoom).emit('offer', { ...d, from: socket.id })
  })
  socket.on('candidate', (d) => {
    // console.log('candidate',d);
    var ID = permission[socket.id]
    if (!ID || !rooms[ID]) {
      return;
    }
    const meetingRoom = MEETING_ROOM + ID
    socket.in(meetingRoom).emit('candidate', { ...d, from: socket.id })
  })
  socket.on('answer', (d) => {
    // console.log('answer', d);
    var ID = permission[socket.id]
    if (!ID || !rooms[ID]) {
      return;
    }
    const meetingRoom = MEETING_ROOM + ID
    socket.in(ID).emit('answer', { ...d, from: socket.id })
  })
  socket.on('joinCall', () => {
    var ID = permission[socket.id]
    if (!ID || !rooms[ID]) {
      return;
    }
    const meetingRoom = MEETING_ROOM + ID
    socket.join(meetingRoom);
    socket.in(meetingRoom).emit('joinCall', socket.id)
  })
  socket.on('connectCall', ({ host, id }) => {
    console.log('connectCall', host, id);
    var ID = permission[socket.id]
    if (!ID || !rooms[ID]) {
      return;
    }
    const meetingRoom = MEETING_ROOM + ID
    io.to(meetingRoom).emit('initCall', { host, id })
  })
  socket.on('reInitCall', ({ host, id }) => {
    console.log('reInitCall', host, id);
    var ID = permission[socket.id]
    if (!ID || !rooms[ID]) {
      return;
    }
    const meetingRoom = MEETING_ROOM + ID
    io.to(meetingRoom).emit('reInitCall', { host, id })
  })
  socket.on('hangup', () => {
    var ID = permission[socket.id]
    if (!ID || !rooms[ID]) {
      return;
    }
    const meetingRoom = MEETING_ROOM + ID
    socket.in(meetingRoom).emit('hangup', { id: socket.id })
    socket.leave(meetingRoom);
  })

  socket.on('startShareScreen', (data) => {
    var ID = permission[socket.id]
    if (!ID || !rooms[ID]) {
      return;
    }
    const meetingRoom = MEETING_ROOM + ID
    socket.in(meetingRoom).emit('startShareScreen', data)
  })
  socket.on('stopShareScreen', (data) => {
    var ID = permission[socket.id]
    if (!ID || !rooms[ID]) {
      return;
    }
    const meetingRoom = MEETING_ROOM + ID
    socket.in(meetingRoom).emit('stopShareScreen', data)
  })

  // Handle IFC model sharing
  socket.on('shareIFC', (data) => {
    const ID = permission[socket.id];
    if (!ID || !rooms[ID]) return;

    console.log(`User ${socket.id} shared an IFC model in room ${ID}`);
    
    // Store the IFC data in the room
    rooms[ID].ifcModel = data;
    rooms[ID].ifcModelVisible = true; // Reset visibility when new model is shared
    
    // Broadcast to all other users in the room
    socket.to(ID).emit('receiveIFC', data);
  });

  // Send IFC model to newly joined users
  socket.on('requestIFC', () => {
    const ID = permission[socket.id];
    if (!ID || !rooms[ID]) return;
    
    // Send existing IFC model and its visibility state to the new user
    if (rooms[ID].ifcModel) {
      socket.emit('receiveIFC', rooms[ID].ifcModel);
      socket.emit('ifcVisibilityUpdate', rooms[ID].ifcModelVisible);
    }
  });

  // Handle IFC model visibility toggle
  socket.on('toggleIfcVisibility', (isVisible) => {
    const ID = permission[socket.id];
    if (!ID || !rooms[ID]) return;

    console.log(`User ${socket.id} toggled IFC model visibility to ${isVisible} in room ${ID}`);
    
    // Update visibility state in room
    rooms[ID].ifcModelVisible = isVisible;
    
    // Broadcast to all other users in the room
    socket.to(ID).emit('ifcVisibilityUpdate', isVisible);
  });


  // Handle IFC model sharing
  socket.on('shareIFC2', (data) => {
    const ID = permission[socket.id];
    if (!ID || !rooms[ID]) return;

    console.log(`User ${socket.id} shared an IFC model in room ${ID}`);
    
    // Store the IFC data in the room
    rooms[ID].ifcModel = data;
    rooms[ID].ifcModelVisible = true; // Reset visibility when new model is shared
    
    // Broadcast to all other users in the room
    socket.to(ID).emit('receiveIFC2', data);
  });

  // Send IFC model to newly joined users
  socket.on('requestIFC2', () => {
    const ID = permission[socket.id];
    if (!ID || !rooms[ID]) return;
    
    // Send existing IFC model and its visibility state to the new user
    if (rooms[ID].ifcModel) {
      socket.emit('receiveIFC2', rooms[ID].ifcModel);
      socket.emit('ifcVisibilityUpdate2', rooms[ID].ifcModelVisible);
    }
  });

  // Handle IFC model visibility toggle
  socket.on('toggleIfcVisibility2', (isVisible) => {
    const ID = permission[socket.id];
    if (!ID || !rooms[ID]) return;

    console.log(`User ${socket.id} toggled IFC model visibility to ${isVisible} in room ${ID}`);
    
    // Update visibility state in room
    rooms[ID].ifcModelVisible = isVisible;
    
    // Broadcast to all other users in the room
    socket.to(ID).emit('ifcVisibilityUpdate2', isVisible);
  });


  socket.on('disconnect', () => {
    console.log('A user disconnected');
    var ID = permission[socket.id]
    if (!ID || !rooms[ID]) {
      return;
    }
    rooms[ID].characters.splice(
      rooms[ID].characters.findIndex(c => c.id === socket.id),
      1);
    rooms[ID].charsTransform.splice(
      rooms[ID].charsTransform.findIndex(c => c.id === socket.id),
      1);
    rooms[ID].charsAnimation.splice(
      rooms[ID].charsAnimation.findIndex(c => c.id === socket.id),
      1);
    rooms[ID].charsInfo.splice(
      rooms[ID].charsInfo.findIndex(c => c.id === socket.id),
      1);
    io.in(ID).emit('characters', rooms[ID].characters);
    io.in(ID).emit('charsInfo', rooms[ID].charsInfo);
    io.in(ID).emit('syncCharsTransform', rooms[ID].charsTransform);
    io.in(ID).emit('syncCharsAnimation', rooms[ID].charsAnimation);
    if (socket.rooms && socket.rooms.has(MEETING_ROOM + ID) >= 0) {
      socket.in(MEETING_ROOM + ID).emit('hangup', { id: socket.id })
      socket.in(MEETING_ROOM + ID).emit('leaveShareScreen', { id: socket.id })
      socket.in(MEETING_ROOM + ID);
    }

    delete permission[socket.id];
    if (rooms[ID].characters.length === 0) {
      delete rooms[ID];
    }
    console.log('Number of room:', Object.keys(rooms).length, 'Number of permission:', Object.keys(permission).length);
  });
});

