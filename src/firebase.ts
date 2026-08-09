import { db as realTimeDb,firestore,auth,messaging } from './firebaseConfig';
export const db=firestore;export const rtdb=realTimeDb;export { auth,messaging };export default realTimeDb;
