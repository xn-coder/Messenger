import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
  } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import "https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.js";

export function storeProfileImage(file, userid) {
    return new Promise((resolve, reject) => {
            let imageRef = ref(getStorage(), `${userid}/profile.png`);
            let uploadTask = uploadBytesResumable(
                imageRef,
                file,
                file.type
            );
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    let progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                },
                (error) => {
                    console.log("error " + error);
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(
                        (downloadURL) => {
                            resolve(downloadURL);
                        }
                    ).catch(reject);
            }
        );
    });
}