import mysql from 'mysql';

export const configMyDb = {
    host: 'localhost',
    user: 'root',
    password: 'oumayma',
    database: 'db_user'
}

export async function connectToDataBase(config) {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection(config);
        connection.connect((err) => {
            if (err) {
                return reject(err);
            }
            resolve(connection);
        });
    });
}

export function showLoading() {
    const loader = ["|", "/", "-", "\\"];
    let i = 0;
    return setInterval(() => {
      process.stdout.write(`\t\t\r${loader[i]} Loading...`);
      i = (i + 1) % loader.length;
    }, 200);
}