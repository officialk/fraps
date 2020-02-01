const auth = firebase.auth();
auth.createUserWithEmailAndPassword("kk786.koppaka@gmail.com", "karthikk");
auth.onAuthStateChanged(e => {
  console.log(e);
});
