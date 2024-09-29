import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getDatabase,
    onValue,
    query,
    remove,
    startAt,
    orderByChild,
    onChildAdded,
    onChildChanged,
    onChildRemoved,
    limitToLast,
    orderByKey,
    endAt,  
    endBefore,
    ref,
    set,
    get,
    child,
    update,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyB5MMlr7Wbi7SGBenkqsWKJaoEp8wCqUto",
    authDomain: "webmessanger-dca14.firebaseapp.com",
    projectId: "webmessanger-dca14",
    storageBucket: "webmessanger-dca14.appspot.com",
    messagingSenderId: "215059496139",
    appId: "1:215059496139:web:462cc6e713a8b5ec35ef4e",
};

let app = initializeApp(firebaseConfig);

export async function checkExists(path) {
    try {
        let snapshot = await get(child(ref(getDatabase(app)), path));
        return snapshot.exists();
    } catch (err) {
        console.log(err);
        return false;
    }
}

export function updateInfo(path, value) {
    let dbRef = ref(getDatabase(app));
    const updates = {};
    updates[path] = value;
    update(dbRef, updates);
}

export function saveInfo(path, data) {
    let db = getDatabase(app);
    set(ref(db, path), data);
}

export async function getPathData(path) {
    try {
        let snapshot = await get(ref(getDatabase(app), path));
        return snapshot.val();
    } catch (err) {
        console.log(err);
        return null;
    }
}

export async function listenUpdates(path, callback) {
    let dbRef = ref(getDatabase(app), path);
    onValue(dbRef, (snapshot) => {
        callback(snapshot.val());
    });
}

export async function onChildUpdate(path, callback) {
    onChildAdded(ref(getDatabase(app), path), (snapshot) => {
        callback("added", snapshot.val());
    });
    onChildRemoved(ref(getDatabase(app), path), (snapshot) => {
        callback("removed", snapshot.val());
    });
    onChildChanged(ref(getDatabase(app), path), (snapshot) => {
        callback("updated", snapshot.val());
    });
}

export async function getFilteredData(search, ignore) {
    const data = await get(
        query(
            ref(getDatabase(app), "Allusers"),
            orderByChild("/Info/UserId"),
            startAt(search),
            endAt(search + "\uf8ff")
        )
    );
    if(data.val()) {
        const filteredData = [];
        Object.entries(data.val()).reduce((acc, [key, value]) => {
            if (!ignore.includes(key)) {
                acc[key] = value;
                filteredData.push(value);
            }
            return acc;
        }, {});
        return filteredData;
    }
    return null;
}

export async function removeData(path) {
    remove(ref(getDatabase(app), path));
}

export async function getSpecificData(path, offset, limit) {
    let que = null;
    if(!offset)
        que = query(ref(getDatabase(app), path), orderByKey(), limitToLast(limit));
    else
        que= query(ref(getDatabase(app), path), orderByKey(), endBefore(offset), limitToLast(limit));
    const data = await get(que);
    if (data.val()) {
        const allEntries = Object.entries(data.val());
        const limitedEntries = allEntries.slice(0, limit).map(entry => ({ key: entry[0], value: entry[1] }));
        return limitedEntries;
    }
    return null;
}

