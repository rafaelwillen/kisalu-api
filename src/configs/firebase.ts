import { initializeApp } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDIDs4GvSPfvx8IgMpYVMV3Fsz0aJHS_W0",
  authDomain: "kisalu-server.firebaseapp.com",
  projectId: "kisalu-server",
  messagingSenderId: "481448767753",
  appId: "1:481448767753:web:862e5f2d0d6a7fac1863d8",
  storageBucket: "gs://kisalu-server.appspot.com/",
};

const app = initializeApp(firebaseConfig);

const categoriesImagesRef = ref(getStorage(app), "categories-images/");

export const storage = {
  ref: {
    categories: categoriesImagesRef,
  },
  storage: getStorage(app),
  uploadBytes,
  getDownloadURL,
};