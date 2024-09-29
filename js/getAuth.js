function encryptData(data, password) {
    const encryptedData = CryptoJS.AES.encrypt(data, password).toString();
    return encryptedData;
}

function decryptData(encryptedData, password) {
    const decryptedData = CryptoJS.AES.decrypt(
        encryptedData,
        password
    ).toString(CryptoJS.enc.Utf8);
    return decryptedData;
}

function getRandomKey() {
    return Math.floor(Math.random() * 99999);
}

export function getData() {
    let d = localStorage.key(0);
    let p = localStorage.getItem(d);
    let s, e;
    for (
        let i = Math.floor(d.length / 2);
        i > Math.floor(d.length / 2) - 5;
        i--
    )
        if (d.charAt(i) == "%") s = i;
    for (
        let i = Math.floor(d.length / 2);
        i < Math.floor(d.length / 2) + 5;
        i++
    )
        if (d.charAt(i) == "%") e = i;
    let k = d.slice(s + 1, e);
    p = decryptData(p, k);
    p = decryptData(p, k);
    p = decryptData(p, k);
    d = d.slice(0, s) + d.slice(e + 1, d.length);
    d = decryptData(d, p);
    d = decryptData(d, p);
    d = decryptData(d, p);
    return [d.slice(0, d.search("%")), d.slice(d.search("%") + 1, d.length), p];
}

export function store(e, i, p) {
    let key = String(getRandomKey());
    let encd = encryptData(e + "%" + i, p);
    encd = encryptData(encd, p);
    encd = encryptData(encd, p);

    let encp = encryptData(p, key);
    encp = encryptData(encp, key);
    encp = encryptData(encp, key);

    localStorage.setItem(
        encd.slice(0, encd.length / 2) +
            "%" +
            key +
            "%" +
            encd.slice(encd.length / 2, encd.length),
        encp
    );
}
