import React, { useRef, useState } from 'react';
import './App.css';

// import firebase from 'firebase/app';
// import 'firebase/firestore';
// import 'firebase/auth';
// import 'firebase/analytics';
import firebase from 'firebase/compat/app';
import { initializeApp } from "firebase/app";
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
// import { getAnalytics } from "firebase/analytics";
// import { auth, signInWithGoogle} from "./firebase";

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
const fs = require('browserify-fs');
var data = require("./articles.json");

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('5db6ce66de334330a7a6f964e1726075', { corsProxyUrl: 'https://cors-anywhere.herokuapp.com/' });

firebase.initializeApp({
  apiKey: "AIzaSyDh04dx7PFxnS3-7jE-4GGwkAElf2FWWL4",
  authDomain: "data-display-e3c7e.firebaseapp.com",
  projectId: "data-display-e3c7e",
  storageBucket: "data-display-e3c7e.appspot.com",
  messagingSenderId: "535133706331",
  appId: "1:535133706331:web:dd130be43777759040077e",
  measurementId: "G-EGKJM7QHQ6"
})

// const auth = auth();
// const firestore = firestore();
// const analytics = getAnalytics();
const auth = firebase.auth()
const firestore = firebase.firestore() 



function App() {
  const [user] = useAuthState(auth);
//   let object = {
//     id: 123,
//     name: "Anj",
//     age: 28,
//     registered: true
// }
// let data = JSON.stringify(object)
// fs.writeFile('./articles.json', data, (err) => {
//   console.log(data)
//       if (err) {
//           throw err;
//       }
//       console.log("JSON data is saved.");
//   });
// console.log("yoooo", data["articles"])
  newsapi.v2.everything({
    sources: 'bbc-news,the-verge',
    domains: 'bbc.co.uk,techcrunch.com',
    language: 'en',
    sortBy: 'relevancy',
    q: 'facebook',
    page: 6
  }).then(response => {
    console.log(response);
    let data = JSON.stringify(response);
    console.log(data)
    fs.writeFile('./articles.json', data, (err) => {
      if (err) {
          throw err;
      }
      console.log("JSON data is saved.");
  });
  });
  

  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue}>🕊️</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
 
 return (<>
    <div className={`message ${messageClass}`} >
      {/* <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} /> */}
      <p>{text}</p>
    </div>
  </>)
}


export default App;