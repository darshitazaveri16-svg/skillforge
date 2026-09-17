import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

// Helper to resolve mongodb+srv URIs if local Node.js c-ares DNS blocks SRV queries
const resolveSrvToDirectUri = (srvUri) => {
  try {
    const srvMatch = srvUri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)(?:\/([^?]*))?(?:\?(.*))?$/);
    if (!srvMatch) return srvUri;

    const [, user, pass, host, db, query] = srvMatch;
    const srvOut = execSync(`nslookup -type=SRV _mongodb._tcp.${host}`, { timeout: 4000, stdio: ['pipe', 'pipe', 'ignore'] }).toString();
    const hosts = [...srvOut.matchAll(/svr hostname\s+=\s+(\S+)/g)].map((m) => `${m[1]}:27017`);
    if (!hosts.length) return srvUri;

    let txtQuery = '';
    try {
      const txtOut = execSync(`nslookup -type=TXT ${host}`, { timeout: 4000, stdio: ['pipe', 'pipe', 'ignore'] }).toString();
      const txtMatch = txtOut.match(/"([^"]+)"/);
      if (txtMatch) txtQuery = txtMatch[1];
    } catch {}

    const queryParts = [];
    queryParts.push('ssl=true');
    if (txtQuery) queryParts.push(txtQuery);
    if (query) queryParts.push(query);

    return `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${hosts.join(',')}/${db || ''}?${queryParts.join('&')}`;
  } catch {
    return srvUri;
  }
};

export const connectDB = async () => {
  const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillforge';
  const isAtlas = connStr.startsWith('mongodb+srv://') || connStr.includes('mongodb.net');

  try {
    let conn;
    try {
      conn = await mongoose.connect(connStr, {
        serverSelectionTimeoutMS: 8000,
      });
    } catch (primaryErr) {
      // If Node.js c-ares DNS refused SRV resolution on Windows, attempt system resolver fallback
      if (connStr.startsWith('mongodb+srv://') && (primaryErr.message.includes('querySrv') || primaryErr.message.includes('ECONNREFUSED'))) {
        const fallbackUri = resolveSrvToDirectUri(connStr);
        if (fallbackUri !== connStr) {
          conn = await mongoose.connect(fallbackUri, {
            serverSelectionTimeoutMS: 8000,
          });
        } else {
          throw primaryErr;
        }
      } else {
        throw primaryErr;
      }
    }

    if (isAtlas) {
      console.log(`[MongoDB] Connected successfully to MongoDB Atlas (Database: ${conn.connection.name})`);
    } else {
      console.log(`[MongoDB] Connected successfully to Host: ${conn.connection.host}`);
    }
    return conn;
  } catch (error) {
    const safeError = error.message.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/, '$1****$3');
    if (safeError.includes('SSL alert number 80') || safeError.includes('ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR')) {
      console.warn('[MongoDB Warning] Atlas rejected TLS connection (SSL Alert 80): IP address not whitelisted in MongoDB Atlas Network Access.');
      console.warn('[MongoDB Warning] Please add your IP address (or 0.0.0.0/0) to MongoDB Atlas -> Network Access.');
    } else {
      console.warn(`[MongoDB Warning] Could not connect to MongoDB instance: ${safeError}`);
    }
    console.warn('[MongoDB Warning] Server running in fallback mode (Database features will require MongoDB service)');
    return null;
  }
};


