const mongoose = require('mongoose');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');

let mongodProcess = null;

const checkPort = (port, host = '127.0.0.1') => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
};

const ensureMongodRunning = async () => {
  const isRunning = await checkPort(27017);
  if (isRunning) {
    console.log('MongoDB server is already reachable on port 27017.');
    return;
  }

  const mongodCandidatePaths = [
    'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe',
    'mongod'
  ];

  let mongodBin = null;
  for (const candidate of mongodCandidatePaths) {
    if (candidate === 'mongod') {
      mongodBin = 'mongod';
      break;
    }
    if (fs.existsSync(candidate)) {
      mongodBin = candidate;
      break;
    }
  }

  const dbPath = path.resolve(__dirname, '../data/db');
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }

  console.log(`Starting local MongoDB instance using: ${mongodBin} ...`);
  try {
    mongodProcess = spawn(mongodBin, ['--dbpath', dbPath, '--bind_ip', '127.0.0.1', '--port', '27017'], {
      detached: false,
      stdio: 'ignore'
    });

    mongodProcess.on('error', (err) => {
      console.warn('Could not launch local mongod process:', err.message);
    });

    // Wait up to 5 seconds for mongod to initialize
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 500));
      if (await checkPort(27017)) {
        console.log('Local MongoDB successfully started on port 27017.');
        return;
      }
    }
  } catch (err) {
    console.warn('Error attempting to start local MongoDB:', err.message);
  }
};

const connectDB = async () => {
  try {
    await ensureMongodRunning();
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finance_flow', {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Notice: MongoDB is required for persistence. Please ensure mongod service is running.');
  }
};

process.on('exit', () => {
  if (mongodProcess && !mongodProcess.killed) {
    mongodProcess.kill();
  }
});

module.exports = connectDB;

