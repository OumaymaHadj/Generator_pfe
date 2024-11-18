import help from './help.js';
import path from 'path';
import fs from 'fs';
import util from 'util';
import { configMyDb, connectToDataBase } from '../db/myDB.js';
import network from 'network';
import { welcomeMessage } from '../../public/data-modal.js'

let scriptPath = path.join(process.cwd(), './config.json');
let config = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
let mac_address;
let connection;
let queryAsync;

export { mac_address, queryAsync }

export default async function handler() {

  await verifyMacAdress();

  if (!config.welcomeShown) {
    console.log(welcomeMessage);
    config.welcomeShown = true;
    help();
  }
  else {
    help();
  }
}

async function verifyMacAdress() {

  connection = await connectToDataBase(configMyDb)
  queryAsync = util.promisify(connection.query).bind(connection);

  network.get_active_interface(async function (err, obj) {
    if (err) {
        console.error("Error: ", err);
        return;
    }
    mac_address = obj.mac_address
    try {     
      let user = await queryAsync('SELECT * FROM user WHERE mac_address = ?',  [obj.mac_address]);
      if (user.length === 0) {
        await queryAsync('INSERT INTO user (mac_address) VALUES (?)', [obj.mac_address]);
      }
    } catch (error) {
      console.error('Error executing SQL query:', error);
    }

  });
}