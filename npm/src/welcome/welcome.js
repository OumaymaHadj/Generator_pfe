import help from './help.js';
import path from 'path';
import fs from 'fs';
import { welcomeMessage } from '../../public/data-modal.js'



export default async function handler() {
  let welcomeShownMessage = false
  if (welcomeShownMessage) {
    console.log(welcomeMessage);
    welcomeShownMessage = true;
    help();
  }
  else {
    help();
  }
}
