import { verbose, Database as SQLiteDatabase, RunResult } from 'sqlite3';

const sqlite3 = verbose();

let db: SQLiteDatabase;

export function initializeDatabase() {
  db = new sqlite3.Database('./aiPredict.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error('Error connecting to the database:', err.message);
    } else {
      console.log('Connected to the aiPredict.db database.');
      createTables();
    }
  });
  return db;
}

  // Function to create the tables even if they do not exist in the database
function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT NOT NULL,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    predicted_score TEXT NOT NULL,
    predicted_winner TEXT,
    month TEXT NOT NULL,
    time TEXT NOT NULL,
    date TEXT NOT NULL,
    bts TEXT NOT NULL,
    home_win_probability TEXT,
    away_win_probability TEXT,
    confidence_level TEXT,
    actual_score TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating predictions table:', err.message);
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS championsleague (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT NOT NULL,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    predicted_score TEXT NOT NULL,
    predicted_winner TEXT,
    month TEXT NOT NULL,
    time TEXT NOT NULL,
    date TEXT NOT NULL,
    bts TEXT NOT NULL,
    home_win_probability TEXT,
    away_win_probability TEXT,
    confidence_level TEXT,
    actual_score TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating championsleague table:', err.message);
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT NOT NULL,
    passkey TEXT NOT NULL,
    subscribed BOOL DEFAULT false,
    subsribed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating championsleague table:', err.message);
    }
  });

//   ensureColumns();
}

// function ensureColumns() {
//   db.all("PRAGMA table_info(predictions)", (err, rows) => {
//     if (err) {
//       console.error('Error checking table info:', err.message);
//     } else {
//       const columns = rows.map(row => row.name);
//       if (!columns.includes('active')) {
//         db.run("ALTER TABLE apiKeys ADD COLUMN active INTEGER DEFAULT 1", (err) => {
//           if (err) {
//             console.error('Error adding active column:', err.message);
//           } else {
//             console.log("Added 'active' column to 'apiKeys' table.");
//           }
//         });
//       }
//       if (!columns.includes('description')) {
//         db.run("ALTER TABLE apiKeys ADD COLUMN description TEXT", (err) => {
//           if (err) {
//             console.error('Error adding description column:', err.message);
//           } else {
//             console.log("Added 'description' column to 'apiKeys' table.");
//           }
//         });
//       }
//     }
//   });
// }

export function closeDatabase() {
  db.close((err) => {
    if (err) {
      console.error('Error closing the database connection:', err.message);
    } else {
      console.log('Closed the database connection.');
    }
    process.exit(0);
  });
}

export function getDb() {
  return db;
}