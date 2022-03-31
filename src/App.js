import React, {useRef, useState} from 'react';
import './App.css';

//to use firebase app
import firebase from 'firebase/compat/app'; //v9
//to use auth
import 'firebase/compat/auth'; //v9
//to use firestore
import 'firebase/compat/firestore'; //v9

import {useAuthState} from "react-firebase-hooks/auth";
import {useCollectionData} from "react-firebase-hooks/firestore";
import {Button, createTheme, TextField, ThemeProvider} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';

const firebaseConfig = {
    apiKey: "AIzaSyBCUq_Mek42MBvXdOdvB197qbJMEnVizEc",
    authDomain: "reactchatapp-b85cc.firebaseapp.com",
    projectId: "reactchatapp-b85cc",
    storageBucket: "reactchatapp-b85cc.appspot.com",
    messagingSenderId: "652472089109",
    appId: "1:652472089109:web:3f316e6a6acd695a3c6c1c",
    measurementId: "G-MZPEEMGJYZ"
};

const app = firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();

const theme = createTheme({
    palette: {
        primary: {
            light: '#757ce8',
            main: '#3f50b5',
            dark: '#002884',
            contrastText: '#fff',
        },
        secondary: {
            light: '#ff7961',
            main: '#f44336',
            dark: '#ba000d',
            contrastText: '#ba000d',
        },
    },
});

function SignIn(){
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    }

    return(
        <Button type="submit" variant="contained" onClick={signInWithGoogle} endIcon={<LoginIcon />}>
            Prihlás sa cez Google!
        </Button>
    )
}

function SignOut(){
    return auth.currentUser && (
    <Button type="submit" variant="contained" onClick={() => auth.signOut()} endIcon={<LogoutIcon />}>
        ODHLÁSENIE
    </Button>
    )
}

function ChatRoom(){
    const messageRef = firestore.collection("messages");
    const query = messageRef.orderBy("createdAt").limit(25);

    const [messages] = useCollectionData(query, {idFIeld: "id"});
    const [formValue, setFormValue] = useState("");

    const dummy = useRef();

    const sendMessage = async(e) => {
        e.preventDefault();

        const { uid, photoURL } = auth.currentUser;

        await messageRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL
        });

        setFormValue(" ");

        dummy.current.scrollIntoView();
    }

    return(
        <>
            <main>
                <h1>Hlúpy Chat</h1>
                {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}

                <div ref={dummy}> </div>
            </main>

            <form onSubmit={sendMessage}>
                <ThemeProvider theme={theme}>
                    <TextField
                        fullWidth
                        label="Zadaj Správu"
                        id="inputSendField"
                        color="warning"
                        style={{  }}
                        value={formValue}
                        onChange={(e) => setFormValue(e.target.value)}
                    />
                </ThemeProvider>
                <Button type="submit" variant="contained" endIcon={<SendIcon />}>
                    POSLAŤ
                </Button>
            </form>
        </>
    )
}

function ChatMessage(props){
    const { text, uid, photoURL } = props.message;

    const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

    return (
        <div className={messageClass}>
            <img src={photoURL} />
            <p>{text}</p>
        </div>
    )
}

function App() {
    const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">

          <section>
              {user ? <ChatRoom /> : <SignIn />}
              {user ? <SignOut /> : ""}
              {console.log(React.version)}
          </section>
      </header>
    </div>
  );
}

export default App;
