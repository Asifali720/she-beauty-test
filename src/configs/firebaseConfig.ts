// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyD_Ata2sAufwH_zpmEIkcIUhM0f-rAPFNw',
  authDomain: 'she-beauty-6cb28.firebaseapp.com',
  projectId: 'she-beauty-6cb28',
  storageBucket: 'she-beauty-6cb28.appspot.com',
  messagingSenderId: '83718447542',
  appId: '1:83718447542:web:c1c6b9b099ea534f42a117'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export const storage = getStorage(app)
