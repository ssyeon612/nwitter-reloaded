import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCHsWB1y3TaXxXDwJZzoxXgXemDzFh9aSY",
    authDomain: "nwitter-reloaded-945c0.firebaseapp.com",
    projectId: "nwitter-reloaded-945c0",
    storageBucket: "nwitter-reloaded-945c0.appspot.com",
    messagingSenderId: "563321291534",
    appId: "1:563321291534:web:0152075904289bc5ae0d5f",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
