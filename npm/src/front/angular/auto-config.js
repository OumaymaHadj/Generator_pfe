import path from 'path';
import fs from 'fs';
import util from 'util';
import { greenText } from '../../../public/data-modal.js';

const writeFileAsync = util.promisify(fs.writeFile);

export default async function updateAppConfig(projectPath) {
    try {
        const configFilePath = path.resolve(`${projectPath}/src/app/app.config.ts`);
        const fileContent = generateConfigContent();

        await writeFileAsync(configFilePath, fileContent);
        console.log(greenText, `\n \t \x1b[1mapp.config.ts\x1b[0m \x1b[32mupdated successfully \u2714.`);
    } catch (error) {
        console.error(`Error updating app.config.ts:`, error);
    }
}

function generateConfigContent() {
    return `
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes), provideClientHydration(), provideHttpClient(), provideAnimationsAsync()
    ]
}

function provideAnimationsAsync(): import("@angular/core").Provider | import("@angular/core").EnvironmentProviders {
  return provideAnimations(); 
}`;
}
