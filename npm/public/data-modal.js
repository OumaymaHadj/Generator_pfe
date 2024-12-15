export const redText = '\x1b[31m%s\x1b[0m';
export const purpleText = '\x1b[35m%s\x1b[0m';
export const greenText = '\x1b[37m%s\x1b[0m';
export const yellowText = '\x1b[33m%s\x1b[0m';
export const orangeText = '\x1b[38;5;208m%s\x1b[0m'

export const welcomeMessage = `
\x1b[33m\x1b[1mWelcome to the Interface Generator Framework!\x1b[0m

  \x1b[33mThe goal of this framework is to generate user interfaces from your data model
  to facilitate development and save your energy for specific tasks of your project.\x1b[0m

  \x1b[33mHere's a quick guide to get started:\x1b[0m
  \x1b[33m1. Create a new project.\x1b[0m
  \x1b[33m2. Connect to your database.\x1b[0m
  \x1b[33m3. Generate components based on your data model.\x1b[0m

  \x1b[33mImportant Note:\x1b[0m
  \x1b[33mYou cannot generate components directly; you must establish a new connection each time.\x1b[0m

  \x1b[33mHappy coding!\x1b[0m
`;

export let numeric = [
    'tinyint', 
    'smallint', 
    'mediumint', 
    'int', 
    'bigint', 
    'serial', 
    'decimal', 
    'float', 
    'double', 
    'real'
];

export let bool = [
    'boolean', 
    'serial'
];

export let date = [
    'date', 
    'datetime', 
    'timestamp', 
    'time', 
    'year'
];

export let chaine = [
    'char', 
    'varchar', 
    'tinytext', 
    'text', 
    'mediumtext', 
    'longtext', 
    'binary', 
    'varbinary', 
    'tinyblob', 
    'blob', 
    'mediumblob', 
    'longblob'
];

export function mapSqlToJsTypes(fields) {
    return fields.map(item => {
        let type = item.type;
        if (numeric.includes(type)) {
            item.jsType = 'number';
        } else if (bool.includes(type)) {
            item.jsType = 'boolean';
        } else if (date.includes(type)) {
            item.jsType = 'Date';
        } else if (chaine.includes(type)) {
            item.jsType = 'string';
        } else {
            item.jsType = 'unknown';
        }
        return item;
    });
}