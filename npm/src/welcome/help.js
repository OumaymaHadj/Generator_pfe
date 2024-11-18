import inquirer from 'inquirer';
import createProjectAnswers from './createAnswers.js';
import gatherDatabaseInfo from '../databaseInfo.js'
// import createComponent from '../npm/createComponents.js';
import { purpleText } from '../../public/data-modal.js';

export default async function help() {

  console.log(purpleText,'The HELP');
  const commands = [
    { name: 'Create a new project', value: 'createProject' },
    { name: 'Establish database connection', value: 'connectDB' },
    { name: 'Create Model, Service and Component for a spesific table', value: 'createComp' },
  ];

  try {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'command',
        message: 'Choose a command:',
        choices: commands
      }
    ]);

    executeCommand(answers.command);
  } catch (error) {
    console.error('Error during prompt:', error);
  }
  
}

function executeCommand(command) {

  switch (command) {
    case 'createProject':
      createProjectAnswers();
      break;

    case 'connectDB':
      gatherDatabaseInfo();
      break;

    case 'createComp':
      // createComponent();
      break;
  }

}