import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Ensure environment variables from environments/.env are loaded when this module
// is imported directly (some modules import this file before Nest's ConfigModule runs).
if (!process.env.FIREBASE_PROJECT_ID) {
  const envPath = path.join(process.cwd(), 'environments', '.env');
  dotenv.config({ path: envPath });
}

// Ensure google-cloud libraries can detect the project id
if (!process.env.GOOGLE_CLOUD_PROJECT && process.env.FIREBASE_PROJECT_ID) {
  process.env.GOOGLE_CLOUD_PROJECT = process.env.FIREBASE_PROJECT_ID;
}

if (!admin.apps.length) {
  // Support either a JSON string in FIREBASE_SERVICE_ACCOUNT or individual env vars.
  // Firebase Admin SDK expects snake_case keys: project_id, client_email, private_key.
  let serviceAccount: Partial<ServiceAccount> | undefined;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) as Partial<ServiceAccount>;
    } catch (err) {
      // invalid JSON string provided
      console.warn('Invalid JSON in FIREBASE_SERVICE_ACCOUNT env var, falling back to individual env vars.');
    }
  }

  if (!serviceAccount) {
    serviceAccount = {
      // use snake_case keys to match what the Admin SDK checks at runtime
      // cast to any because ServiceAccount type names keys differently in some libs
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      project_id: process.env.FIREBASE_PROJECT_ID,
      // @ts-ignore
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      // @ts-ignore
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    } as unknown as Partial<ServiceAccount>;
  }

  const hasProjectId = typeof (serviceAccount as any).project_id === 'string' && (serviceAccount as any).project_id.length > 0;
  const hasClientEmail = typeof (serviceAccount as any).client_email === 'string' && (serviceAccount as any).client_email.length > 0;
  const hasPrivateKey = typeof (serviceAccount as any).private_key === 'string' && (serviceAccount as any).private_key.length > 0;

  if (hasProjectId && hasClientEmail && hasPrivateKey) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as unknown as ServiceAccount),
      // ensure firestore and google-cloud clients see the project id
      projectId: (serviceAccount as any).project_id,
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Let the SDK pick up application default credentials from the file path.
    // If we have FIREBASE_PROJECT_ID set in env, pass it explicitly so Firestore can use it.
    if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
    } else {
      admin.initializeApp();
    }
  } else {
    console.warn(
      'Firebase service account not fully provided via env; initializing with default credentials.\n' +
        'Set FIREBASE_SERVICE_ACCOUNT (JSON), or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY,\n' +
        'or set GOOGLE_APPLICATION_CREDENTIALS to a service account file path.'
    );
    admin.initializeApp();
  }
}

export const db = admin.firestore();
export const messaging = admin.messaging();
