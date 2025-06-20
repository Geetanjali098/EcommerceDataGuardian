import admin from "firebase-admin";
import serviceAccountJson from "server/config/serviceAccountKey.json" assert { type: "json" }; // adjust path if needed
import type { ServiceAccount } from "firebase-admin";
const serviceAccount = serviceAccountJson as ServiceAccount;

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';


if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export const adminAuth = getAuth();
export { admin, initializeApp, cert, getApps, getAuth };

