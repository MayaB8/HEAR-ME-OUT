// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, query, orderByChild, equalTo } from "firebase/database";
import { getStorage, getDownloadURL, ref as sref } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdpchf45b6z7_wEa-E3vO_fv0JuEwK1dw",
  authDomain: "hear-me-out-785e2.firebaseapp.com",
  projectId: "hear-me-out-785e2",
  storageBucket: "hear-me-out-785e2.appspot.com",
  messagingSenderId: "994012007554",
  appId: "1:994012007554:web:35d88c91c2fcdbcd4bf89b",
  databaseURL: "https://hear-me-out-785e2-default-rtdb.europe-west1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage();

async function getWordsFromDB(soundType, positionInWord, soundPair) {
  try {
      const nodesQuery = query(ref(db, 'words/' + soundType), orderByChild('sound_type'), equalTo(soundType));

      const snapshot = await get(nodesQuery);
      let nodes = [];

      snapshot.forEach((childSnapshot) => {
      nodes.push(childSnapshot.val());
    });

    if (soundPair !== "הכל") {
      nodes = nodes.filter(item => item.sound_pair === soundPair);
    }
    if (positionInWord !== "הכל"){
      nodes = nodes.filter(item => item.position_in_word === positionInWord);
    }

    return nodes;
  } catch (error) {
    console.error('Error querying nodes:', error);
    return null;
  }
}

// Function to download an image from Firebase Storage
async function downloadImageFromStorage(imageUrl) {
  try {
    const ref = sref(storage, imageUrl);
    const response = await getDownloadURL(ref);

    return response;

  } catch (error) {
    console.error('Error downloading image:', error);
    return null;
  }
}

export { downloadImageFromStorage, getWordsFromDB };