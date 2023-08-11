import admin from 'firebase-admin';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require('./serviceAccountKey.json');

export const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
