import { getData } from "./getAuth.js";
import {
    listenUpdates,
    updateInfo,
    getPathData,
    getFilteredData,
    saveInfo,
    removeData,
    checkExists,
    onChildUpdate,
    getSpecificData,
} from "./database.js";
import { storeProfileImage } from "./storage.js";

let userid = "",
    image = "",
    fname = "",
    lname = "",
    email = "",
    otp = "",
    intervalId,
    contactSelected = false,
    selected=null,
    offset=null;

try {
    let data = getData();
    userid = data[1];
    if (userid == "") {
        localStorage.clear();
        window.location = "../login";
    }
} catch (error) {
    localStorage.clear();
    window.location = "../login";
    console.log(error);
}


// Profile Managements
let mainpopupbox = document.getElementsByClassName("popupbox")[0];
let profilemanagebox = document.getElementsByClassName("profile-manage")[0];
let profilebtn = document.getElementById("profile-btn");
let profileImage = document.getElementById("profile");
let profileEditImage = document.getElementById("profile-image");
let useridInput = document.getElementById("self-userid");
let fnameInput = document.getElementById("self-firstname");
let lnameInput = document.getElementById("self-lastname");
let emailInput = document.getElementById("self-email");
let browse = document.getElementById("browse");
let profileBtns = document.getElementsByClassName("button")[0];
let profileImageButtons = document.getElementById("profile-image-btn");
let profileImageCancel = document.getElementById("profile-image-cancel");
let profileImageSave = document.getElementById("profile-image-save");
let profileEditBtn = document.getElementById("edit-btn");
let profileCancelBtn = document.getElementById("cancel-btn");
let profileRemoveBtn = document.getElementById("profile-remove");
let profileSaveBtn = document.getElementById("save-btn");
let otpbox = document.getElementsByClassName("otp")[0];
let otpInput = document.getElementById("otp");
let sendBtn = document.getElementById("send-btn");
let resendOtp = document.getElementById("resend-otp");
let loading = document.getElementsByClassName("loading")[0];

loading.style.display = "block";
await listenUpdates(`Allusers/${userid}/Info/`, (data) => {
    if (data) {
        image = data["Profile_Image"];
        profileImage.src = image;
        userid = data["UserId"];
        fname =
            data["First_Name"].slice(0, 1).toUpperCase() +
            data["First_Name"].slice(1);
        lname =
            data["Last_Name"].slice(0, 1).toUpperCase() +
            data["Last_Name"].slice(1);
        email = data["Email"];
        profileEditImage.src = image;
        useridInput.value = userid;
        fnameInput.value = fname;
        lnameInput.value = lname;
        emailInput.value = email;
        loading.style.display = "none";
    } else {
        localStorage.clear();
        window.location = "../login";
    }
});

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function popupBox(val, msg, event) {
    const popup = document.getElementsByClassName("popupMessage")[0];
    popup.style.display = "block";
    if (val) {
        document.getElementById("check").style.display = "block";
        document.getElementById("exclamation").style.display = "none";
        document.getElementById("check").style.color = "green";
    } else {
        document.getElementById("check").style.display = "none";
        document.getElementById("exclamation").style.display = "block";
        document.getElementById("exclamation").style.color = "red";
    }
    document.getElementById("message").innerHTML = msg;
    if (event)
        document.getElementById("popup-ok").addEventListener("click", () => {
            popup.style.display = "none";
            event();
        });
    else
        document.getElementById("popup-ok").addEventListener("click", () => {
            popup.style.display = "none";
        });
}

profilebtn.addEventListener("click", async () => {
    mainpopupbox.style.display = "flex";
    profilemanagebox.style.display = "block";
});

profileRemoveBtn.addEventListener("click", () => {
    updateInfo(`Allusers/${userid}/Info/Profile_Image`, "https://firebasestorage.googleapis.com/v0/b/webmessanger-dca14.appspot.com/o/default%2Fprofile.png?alt=media&token=da6136af-00f0-4c92-ba45-b4ed03954a40");
})

browse.addEventListener("change", function (event) {
    if (event.target.files[0]) {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(event.target.files[0]);
        fileReader.addEventListener("load", function () {
            profileEditImage.src = this.result;
        });
        profileBtns.style.display = "none";
        profileImageButtons.style.display = "block";
    }
});

profileImageCancel.addEventListener("click", () => {
    profileImageButtons.style.display = "none";
    profileBtns.style.display = "block";
    profileEditImage.src = image;
});

profileImageSave.addEventListener("click", () => {
    loading.style.display = "block";
    profileImageButtons.style.display = "none";
    profileBtns.style.display = "block";
    storeProfileImage(browse.files[0], userid)
        .then((url) => {
            updateInfo(`Allusers/${userid}/Info/Profile_Image`, url);
        })
        .catch((error) => {
            popupBox(false, "Error uploading image:" + error, null);
        })
        .finally(() => {
            loading.style.display = "none";
            mainpopupbox.click();
        });
});

profileEditBtn.addEventListener("click", () => {
    profileEditBtn.style.display = "none";
    profileCancelBtn.style.display = "block";
    profileSaveBtn.style.display = "block";
    profileSaveBtn.disabled = true;
    otpbox.style.display = "flex";
    fnameInput.readOnly = false;
    lnameInput.readOnly = false;
    emailInput.readOnly = false;
    profileSaveBtn.style.backgroundColor = "#2fa1f388";
    profileSaveBtn.style.color = "#ffffff88";
    profileSaveBtn.disabled = true;
    otpInput.value = "";
});

profileCancelBtn.addEventListener("click", () => {
    useridInput.value = userid;
    fnameInput.value = fname;
    lnameInput.value = lname;
    emailInput.value = email;
    profileEditBtn.style.display = "block";
    profileCancelBtn.style.display = "none";
    profileSaveBtn.style.display = "none";
    otpbox.style.display = "none";
    fnameInput.readOnly = true;
    lnameInput.readOnly = true;
    emailInput.readOnly = true;
    resendOtp.style.display = "none";
    resendOtp.innerText = "Resend 30 sec";
    sendBtn.style.display = "block";
    sendBtn.innerText = "Send";
    if (intervalId) clearInterval(intervalId);
});

otpInput.addEventListener("input", () => {
    if (otpInput.value.length == 6) {
        profileSaveBtn.disabled = false;
        profileSaveBtn.style.backgroundColor = "#2fa1f3";
        profileSaveBtn.style.color = "#fff";
    } else {
        profileSaveBtn.disabled = true;
        profileSaveBtn.style.backgroundColor = "#2fa1f388";
        profileSaveBtn.style.color = "#ffffff88";
    }
});

sendBtn.addEventListener("click", async () => {
    loading.style.display = "block";
    if (emailInput.value == "") emailInput.value = email;
    if (fnameInput.value == "") fnameInput.value = fname;
    if (lnameInput.value == "") lnameInput.value = lname;

    let data = await getPathData("AllIds/" + emailInput.value.replace(".", "_"));

    loading.style.display = "none";
    if (data && data["Id"] != userid) {
        popupBox(false, "Email already registered to another user", null);
    } else {
        otp = generateOTP();
        console.log(otp);
        sendBtn.style.display = "none";
        resendOtp.style.display = "block";
        let sec = 29;
        intervalId = setInterval(() => {
            resendOtp.innerText = `Resend ${sec} sec`;
            sec--;
            if (sec == -1) {
                resendOtp.style.display = "none";
                resendOtp.innerText = "Resend 30 sec";
                sendBtn.style.display = "block";
                sendBtn.innerText = "Resend";
                clearInterval(intervalId);
            }
        }, 1000);
    }
});

profileSaveBtn.addEventListener("click", () => {
    loading.style.display = "block";
    if (otpInput.value != otp) popupBox(false, "Invalid OTP", null);
    else if (
        fnameInput.value == fname &&
        lnameInput.value == lname &&
        emailInput.value == email
    )
        popupBox(false, "No changes made", null);
    else {
        updateInfo(`Allusers/${userid}/Info/Email`, emailInput.value);
        updateInfo(`Allusers/${userid}/Info/First_Name`, fnameInput.value);
        updateInfo(`Allusers/${userid}/Info/Last_Name`, lnameInput.value);
        profileEditBtn.style.display = "block";
        profileCancelBtn.style.display = "none";
        profileSaveBtn.style.display = "none";
        otpbox.style.display = "none";
        fnameInput.readOnly = true;
        lnameInput.readOnly = true;
        emailInput.readOnly = true;
        resendOtp.style.display = "none";
        resendOtp.innerText = "Resend 30 sec";
        sendBtn.style.display = "block";
        sendBtn.innerText = "Send";
        clearInterval(intervalId);
        popupBox(true, "Changes saved", null);
    }
    loading.style.display = "none";
});

// Menu box managements
let menubox = document.getElementsByClassName("menu")[0];
let menu = document.getElementById("menu");
let profileMenu = document.getElementById("profile-menu");
let settingMenu = document.getElementById("setting-menu");
let logoutMenu = document.getElementById("logout-menu");
let logoutmanagebox = document.getElementsByClassName("logout-manage")[0]
let lgCancel = document.getElementById("lg-cancel");
let lgLogout = document.getElementById("lg-logout");

menu.addEventListener("click", () => {
    if (menubox.style.display == "none") menubox.style.display = "block";
    else menubox.style.display = "none";
});

profileMenu.addEventListener("click", () => {
    profilebtn.click();
});

logoutMenu.addEventListener("click", () => {
    mainpopupbox.style.display = "flex";
    logoutmanagebox.style.display = "block";
});

lgCancel.addEventListener("click", () => {
    mainpopupbox.style.display = "none";
    logoutmanagebox.style.display = "none";
});

lgLogout.addEventListener("click", () => {
    localStorage.clear();
    window.location = "../login";
});


// Contact box managements

let contactbox = document.getElementById("tab-contact");
let addbox = document.getElementById("tab-add");
let pendingbox = document.getElementById("tab-pending");
let contactbody = document.getElementById("contact-body");
let addbody = document.getElementById("add-body");
let noadd = document.getElementsByClassName("no-add")[0];
let addloading = document.getElementsByClassName("add-loading")[0];
let addcontain = document.getElementsByClassName("add-contain")[0];
let addSearch = document.getElementById("add-search");
let pendingbody = document.getElementById("pending-body");
let contactmanagebox = document.getElementsByClassName("contact-manage")[0]
let add = document.getElementById("add");
var addsearchInterval;

function getTimeDate(time) {
    const [date, month, year, hour, minute, second, millis] = time.split(':').map(Number);
    const inputDate = new Date(year, month, date, hour, minute, second, millis);
    const now = new Date();
    const inputDateString = inputDate.toDateString();
    const nowDateString = now.toDateString();
    function formatTime12Hour(date) {
        return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(date);
    }
    if (inputDateString === nowDateString) return formatTime12Hour(inputDate);
    now.setDate(now.getDate() - 1);
    if (inputDateString === now.toDateString()) return "Yesterday";
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 6);
    if (inputDate >= oneWeekAgo) return inputDate.toLocaleDateString('en-US', { weekday: 'long' });
    return inputDate.toLocaleDateString('en-GB');
}

function friendContact(fId, fImage, fName) {
    let contactContain = document.getElementsByClassName("contact-contain")[0];
    const contactItem = document.createElement("div");
    const contactImage = document.createElement("img");
    const contactNameBox = document.createElement("div");
    const contactName = document.createElement("h4");
    const contactUserid = document.createElement("p");
    const contactAction = document.createElement("span");

    contactItem.classList.add("contact-item");
    contactItem.id = fId;
    contactImage.src = fImage;
    contactNameBox.classList.add("contact-name");
    contactName.innerText = fName;
    contactUserid.innerText = fId;
    contactAction.innerText = "Friends";

    contactItem.appendChild(contactImage);
    contactNameBox.appendChild(contactName);
    contactNameBox.appendChild(contactUserid);
    contactItem.appendChild(contactNameBox);
    contactItem.appendChild(contactAction);

    contactContain.appendChild(contactItem);
}

function addContact(aId, aImage, aName, aEmail, aAction) {
    if(document.getElementById("A"+aId)) return;
    let addContain = document.getElementsByClassName("add-contain")[0]
    const addItem = document.createElement("div");
    const addImage = document.createElement("img");
    const addNameBox = document.createElement("div");
    const addName = document.createElement("h3");
    const addUserid = document.createElement("p");
    const addButtons = document.createElement("div");
    const addRequestBtn = document.createElement("button");
    const addCancelBtn = document.createElement("button");
    const addFriends = document.createElement("span");
    const addpend = document.createElement("div");
    const pendCancelBtn = document.createElement("button");
    const pendCancelIcon = document.createElement("i");
    const pendAcceptBtn = document.createElement("button");
    const pendAcceptIcon = document.createElement("i");

    addItem.classList.add("add-item");
    addItem.id = "A"+aId;
    addImage.src = aImage;
    addNameBox.classList.add("add-name");
    addName.innerText = aName;
    addUserid.innerText = aId;
    addButtons.classList.add("buttons");
    addRequestBtn.classList.add("request");
    addRequestBtn.innerText = "Request";
    addCancelBtn.classList.add("req-cancel");
    addCancelBtn.innerText = "Cancel";
    addFriends.innerText = "Friends";
    addpend.classList.add("pending-btns");
    pendCancelBtn.classList.add("pend-cancel");
    pendCancelIcon.classList.add("fa-regular");
    pendCancelIcon.classList.add("fa-xmark");
    pendAcceptBtn.classList.add("accept");
    pendAcceptIcon.classList.add("fa-solid");
    pendAcceptIcon.classList.add("fa-check");

    if (aAction == "req") {
        addRequestBtn.style.display = "block";
        addCancelBtn.style.display = "none";
        addFriends.style.display = "none";
        addpend.style.display = "none";
    } else if (aAction == "can") {
        addRequestBtn.style.display = "none";
        addCancelBtn.style.display = "block";
        addFriends.style.display = "none";
        addpend.style.display = "none";
    } else if (aAction == "ok") {
        addRequestBtn.style.display = "none";
        addCancelBtn.style.display = "none";
        addFriends.style.display = "block";
        addpend.style.display = "none";
    } else if (aAction == "pend") {
        addRequestBtn.style.display = "none";
        addCancelBtn.style.display = "none";
        addFriends.style.display = "none";
        addpend.style.display = "block";
    }

    addRequestBtn.addEventListener("click", () => {
        saveInfo(`Allusers/${userid}/Requests/${aId}`, { Email : aEmail, UserId : aId, Profile_Image : aImage, Name : aName });
        saveInfo(`Allusers/${aId}/Pendings/${userid}`, { Email : email, UserId : userid, Profile_Image : image, Name : fname + " " + lname });
        addRequestBtn.style.display = "none";
        addCancelBtn.style.display = "block";
    });

    addCancelBtn.addEventListener("click", () => {
        removeData(`Allusers/${userid}/Requests/${aId}`);
        removeData(`Allusers/${aId}/Pendings/${userid}`);
        addRequestBtn.style.display = "block";
        addCancelBtn.style.display = "none";
    });

    pendCancelBtn.addEventListener("click", () => {
        removeData(`Allusers/${userid}/Pendings/${aId}`);
        removeData(`Allusers/${aId}/Requests/${userid}`);
        addpend.style.display = "none";
        addRequestBtn.style.display = "block";
    });

    pendAcceptBtn.addEventListener("click", () => {
        let d = new Date();
        let date = `${d.getDate()}:${d.getMonth()}:${d.getFullYear()}:${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}:${d.getMilliseconds()}`;
        saveInfo(`Allusers/${userid}/Friends/${aId}`, {
            Profile_Image: aImage,
            Message: "New Added",
            Name: aName,
            Pending: 0,
            Time: date,
            UserId: aId
        });
        saveInfo(`Allusers/${aId}/Friends/${userid}`, {
            Profile_Image: image,
            Message: "New Added",
            Name: fname + " " + lname,
            Pending: 0,
            Time: date,
            UserId: userid
        });
        removeData(`Allusers/${userid}/Pendings/${aId}`);
        removeData(`Allusers/${aId}/Requests/${userid}`);
        addpend.style.display = "none";
        addFriends.style.display = "block";
    });

    addItem.appendChild(addImage);
    addNameBox.appendChild(addName);
    addNameBox.appendChild(addUserid);
    addItem.appendChild(addNameBox);
    addButtons.appendChild(addRequestBtn);
    addButtons.appendChild(addCancelBtn);
    addButtons.appendChild(addFriends);
    addItem.appendChild(addButtons);
    addButtons.appendChild(addpend);
    addpend.appendChild(pendCancelBtn);
    addpend.appendChild(pendAcceptBtn);
    pendCancelBtn.appendChild(pendCancelIcon);
    pendAcceptBtn.appendChild(pendAcceptIcon);

    addContain.appendChild(addItem);
}

function pendingContact(pId, pImage, pName) {
    let pendingContain = document.getElementsByClassName("pending-contain")[0];
    const pendingItem = document.createElement("div");
    const pendingImage = document.createElement("img");
    const pendingNameBox = document.createElement("div");
    const pendingName = document.createElement("h4");
    const pendingUserid = document.createElement("p");
    const pendingButtons = document.createElement("div");
    const pendingCancel = document.createElement("button");
    const pendingCancelIcon = document.createElement("i");
    const pendingAccept = document.createElement("button");
    const pendingAcceptIcon = document.createElement("i");

    pendingItem.classList.add("pending-item");
    pendingItem.id = "P"+pId;
    pendingImage.src = pImage;
    pendingNameBox.classList.add("pending-name");
    pendingName.innerText = pName;
    pendingUserid.innerText = pId;
    pendingButtons.classList.add("buttons");
    pendingCancel.classList.add("pend-cancel");
    pendingCancelIcon.classList.add("fa-regular");
    pendingCancelIcon.classList.add("fa-xmark");
    pendingAccept.classList.add("accept");
    pendingAcceptIcon.classList.add("fa-solid");
    pendingAcceptIcon.classList.add("fa-check");

    pendingCancel.addEventListener("click", () => {
        removeData(`Allusers/${userid}/Pendings/${pId}`);
        removeData(`Allusers/${pId}/Requests/${userid}`);
        pendingItem.remove();
    });

    pendingAccept.addEventListener("click", () => {
        let d = new Date();
        let date = `${d.getDate()}:${d.getMonth()}:${d.getFullYear()}:${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}:${d.getMilliseconds()}`;
        saveInfo(`Allusers/${userid}/Friends/${pId}`, {
            Profile_Image: pImage,
            Message: "New Added",
            Name: pName,
            Time: date,
            UserId: pId
        });
        saveInfo(`Allusers/${pId}/Friends/${userid}`, {
            Profile_Image: image,
            Message: "New Added",
            Name: fname + " " + lname,
            Time: date,
            UserId: userid
        });
        removeData(`Allusers/${userid}/Pendings/${pId}`);
        removeData(`Allusers/${pId}/Requests/${userid}`);
        pendingItem.remove();
    });

    pendingItem.appendChild(pendingImage);
    pendingNameBox.appendChild(pendingName);
    pendingNameBox.appendChild(pendingUserid);
    pendingItem.appendChild(pendingNameBox);
    pendingCancel.appendChild(pendingCancelIcon);
    pendingAccept.appendChild(pendingAcceptIcon);
    pendingButtons.appendChild(pendingCancel);
    pendingButtons.appendChild(pendingAccept);
    pendingItem.appendChild(pendingButtons);

    pendingContain.appendChild(pendingItem);
}

contactbox.addEventListener("click", () => {
    contactbox.classList.add("active");
    addbox.classList.remove("active");
    pendingbox.classList.remove("active");
    contactbody.style.display = "block";
    addbody.style.display = "none";
    pendingbody.style.display = "none";
});

addbox.addEventListener("click", () => {
    contactbox.classList.remove("active");
    addbox.classList.add("active");
    pendingbox.classList.remove("active");
    contactbody.style.display = "none";
    addbody.style.display = "block";
    pendingbody.style.display = "none";
});

pendingbox.addEventListener("click", () => {
    contactbox.classList.remove("active");
    addbox.classList.remove("active");
    pendingbox.classList.add("active");
    contactbody.style.display = "none";
    addbody.style.display = "none";
    pendingbody.style.display = "block";
});

// mainpopupbox.style.display = "flex";
// contactmanagebox.style.display = "flex";

add.addEventListener("click", () => {
    mainpopupbox.style.display = "flex";
    contactmanagebox.style.display = "flex";
    contactbox.click();
});

addSearch.addEventListener("input", async () => {
    if (addSearch.value != "") {
        noadd.style.display = "none";
        addloading.style.display = "block";
        addcontain.style.display = "none";
        clearInterval(addsearchInterval);
        let items = document.querySelectorAll(".add-item");
        items.forEach((item) => item.remove())
        addsearchInterval = setTimeout( async() => {
            let data = await getFilteredData(addSearch.value, [userid]);
            if(data) {
                noadd.style.display = "none";
                addloading.style.display = "none";
                addcontain.style.display = "block";
                for (let i = 0; i < data.length; i++) {
                    if(await checkExists(`Allusers/${userid}/Requests/${data[i]['Info']['UserId']}`))
                        addContact(data[i]['Info']['UserId'], data[i]['Info']['Profile_Image'], data[i]['Info']['First_Name'] + " " + data[i]['Info']['Last_Name'], data[i]['Info']['Email'], "can");
                    else if(await checkExists(`Allusers/${userid}/Pendings/${data[i]['Info']['UserId']}`))
                        addContact(data[i]['Info']['UserId'], data[i]['Info']['Profile_Image'], data[i]['Info']['First_Name'] + " " + data[i]['Info']['Last_Name'], data[i]['Info']['Email'], "pend");
                    else if(await checkExists(`Allusers/${userid}/Friends/${data[i]['Info']['UserId']}`))
                        addContact(data[i]['Info']['UserId'], data[i]['Info']['Profile_Image'], data[i]['Info']['First_Name'] + " " + data[i]['Info']['Last_Name'], data[i]['Info']['Email'], "ok");
                    else
                        addContact(data[i]['Info']['UserId'], data[i]['Info']['Profile_Image'], data[i]['Info']['First_Name'] + " " + data[i]['Info']['Last_Name'], data[i]['Info']['Email'], "req");
                }
            } else {
                noadd.style.display = "block";
                addloading.style.display = "none";
                addcontain.style.display = "none";
            }
        }, 800);
    }
});

onChildUpdate(`Allusers/${userid}/Requests/`, async(type, data) => {
    let element = document.getElementById("A"+data['UserId']);
    if(element && type == "removed") {
        if(await checkExists(`Allusers/${userid}/Friends/${data['UserId']}`))
            element.getElementsByTagName('span')[0].style.display = "block";
        else
            element.getElementsByClassName("request")[0].style.display = "block";
        element.getElementsByClassName("req-cancel")[0].style.display = "none";
    }
});

onChildUpdate(`Allusers/${userid}/Pendings/`, (type, data) => {
    let addElement = document.getElementById("A"+data['UserId']);
    let pendElement = document.getElementById("P"+data['UserId']);
    if(type == "added") {
        if(addElement) {
            addElement.getElementsByClassName("request")[0].style.display = "none";
            addElement.getElementsByClassName("pending-btns")[0].style.display = "block";
        }
        if(!pendElement)
            pendingContact(data['UserId'], data['Profile_Image'], data['Name']);
    } else {
        if(pendElement)
            pendElement.remove();
        if(addElement) {
            addElement.getElementsByClassName("request")[0].style.display = "block";
            addElement.getElementsByClassName("pending-btns")[0].style.display = "none";
        }
    }
});

listenUpdates(`Allusers/${userid}/Pendings/`, (data) => {
    if(data) {
        let countPending = Object.keys(data).length;
        if(countPending != 0) {
            document.getElementsByClassName("badge")[0].innerText = countPending;
            document.getElementsByClassName("badge")[0].style.display = "block";
        }
    } else
        document.getElementsByClassName("badge")[0].style.display = "none";
});

onChildUpdate(`Allusers/${userid}/Friends/`, (type, data) => {
    let element = document.getElementById("A"+data['UserId']);
    if(type == "added") {
        if(element) {
            element.getElementsByClassName("req-cancel")[0].style.display = "none";
            element.getElementsByClassName("pending-btns")[0].style.display = "none";
            element.getElementsByTagName('span')[0].style.display = "block";
        }
        friendContact(data['UserId'], data['Profile_Image'], data['Name']);
        messageContact(data['UserId'], data['Profile_Image'], data['Name'], data['Message'], getTimeDate(data['Time']));
    }
});

// message managements
function messageContact(mId, mImage, mName, mMessage, mTime) {
    let messageContactList = document.getElementsByClassName("contacts-list")[0];
    const messageItem = document.createElement("div");
    const messageImageBox = document.createElement("div");
    const messageImage = document.createElement("img");
    const messageNameBox = document.createElement("div");
    const messageName = document.createElement("h4");
    let message = document.createElement("p");
    const messageStatus = document.createElement("div");
    const messageDate = document.createElement("div");
    const messagePending = document.createElement("span");
    
    messageItem.classList.add("contact");
    messageItem.id = mId;
    messageImageBox.classList.add("contact-image");
    messageImage.src = mImage;
    messageNameBox.classList.add("sub-info");
    messageName.innerText = mName;
    message.innerText = mMessage;
    messageStatus.classList.add("status");
    messageDate.classList.add("date");
    messageDate.innerText = mTime;
    messagePending.style.display = "none";

    messageItem.addEventListener("click", async() => {

        const messagesContainer = document.getElementsByClassName("messages")[0];
        while (messagesContainer.firstChild) {
            messagesContainer.removeChild(messagesContainer.firstChild);
        }

        contactSelected = true;
        selected = mId;
        document.getElementsByClassName("no-contact-selected")[0].style.display = "none";
        document.getElementsByClassName("contact-selected")[0].style.display = "flex";
        document.querySelector("div.contact-image img").src = mImage;
        document.querySelector("div.contact-name h3").innerText = mName;

        if(window.innerWidth < 521) {
            document.getElementsByClassName("right-content")[0].style.display = "flex";
            document.getElementsByClassName("left-content")[0].style.display = "none";
        }

        offset = null;
        await setMessages("last");

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(async entry => {
                if (entry.isIntersecting) {
                    await setMessages("first");
                    observer.disconnect();
                }
            });
        }, { threshold: [0.1] });

        if(messagesContainer.children.length > 60)
            observer.observe(messagesContainer.children[59]);
        const lastMessage = messagesContainer.lastElementChild;
        if (lastMessage) {
            lastMessage.scrollIntoView();
        }
    });

    listenUpdates(`Allusers/${mId}/Messages/${userid}`, (data) => {
        let countMsgs = 0;
        for(let i in data) {
            if(data[i]['Seen'] == false)
                countMsgs++;
        }
        if(countMsgs > 0) {
            messagePending.innerText = countMsgs;
            messagePending.style.display = "block";
        } else {
            messagePending.style.display = "none";
        }
    });

    onChildUpdate(`Allusers/${userid}/Friends/`, (type, data) =>{
        if(type == "updated") {
            document.getElementById(data['UserId']).querySelector('h4').innerText = data['Name'];
            document.getElementById(data['UserId']).querySelector('p').innerText = data['Message'];
            document.getElementById(data['UserId']).querySelector('div.date').innerText = getTimeDate(data['Time']);
            document.getElementById(data['UserId']).querySelector('img').src = data['Profile_Image'];
        }
    });

    onChildUpdate(`Allusers/${userid}/Messages/${selected}/`, (type, data) => {
        console.log(type, data);
    });

    messageItem.appendChild(messageImageBox);
    messageImageBox.appendChild(messageImage);
    messageItem.appendChild(messageNameBox);
    messageNameBox.appendChild(messageName);
    messageNameBox.appendChild(message);
    messageItem.appendChild(messageStatus);
    messageStatus.appendChild(messageDate);
    messageStatus.appendChild(messagePending);

    messageContactList.appendChild(messageItem);
}

async function setMessages(pos) {
    let val = await getSpecificData(`Allusers/${userid}/Messages/${selected}`, offset, 100);
    if(val) {
        val.forEach(ele => {
            if(ele['value']['Source'] == "sender")
                sendMsg(ele['key'], ele['value']['Message'], getTimeDate(ele['value']['Date']), ele['value']['Seen'], pos);
            else
                receiveMsg(ele['key'], ele['value']['Message'], getTimeDate(ele['value']['Date']), ele['value']['Seen'], pos);
        });
        offset = val[val.length - 1]['key'];
    }
    document.getElementById("msg-input").focus();
}

function sendMsg(mId, mMessage, mTime, mPending, pos) {
    let msgList = document.getElementsByClassName("messages")[0];
    const msgItem = document.createElement("div");
    const subBox = document.createElement("div");
    const msgTime = document.createElement("div");
    const seeIcon = document.createElement("i");

    msgItem.id = mId;
    msgItem.classList.add("sender");
    msgItem.classList.add("msg");
    msgItem.innerText = mMessage;
    subBox.classList.add("sub-box");
    msgTime.classList.add("time");
    msgTime.innerText = mTime;
    seeIcon.classList.add("fa-sharp");
    seeIcon.classList.add("fa-solid");
    if(mPending) {
        seeIcon.classList.add("fa-eye");
    } else {
        seeIcon.classList.add("fa-eye-slash");
    }

    onChildUpdate(`Allusers/${userid}/Messages/${selected}/`, (type, data) => {
        if(type == "updated" && seeIcon.classList.contains("fa-eye-slash")) {
            seeIcon.classList.remove("fa-eye-slash");
            seeIcon.classList.add("fa-eye");
        }
    });

    msgItem.appendChild(subBox);
    subBox.appendChild(msgTime);
    subBox.appendChild(seeIcon);
    if (pos == "first") {
        msgList.insertBefore(msgItem, msgList.firstChild);
    } else {
        msgList.appendChild(msgItem);
    }
}

function receiveMsg(mId, mMessage, mTime, pos) {
    let msgList = document.getElementsByClassName("messages")[0];
    const msgItem = document.createElement("div");
    const subBox = document.createElement("div");
    const msgTime = document.createElement("div");

    msgItem.id = mId;
    msgItem.classList.add("receiver");
    msgItem.classList.add("msg");
    msgItem.innerText = mMessage;
    subBox.classList.add("sub-box");
    msgTime.classList.add("time");
    msgTime.innerText = mTime;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                updateInfo(`Allusers/${selected}/Messages/${userid}/${mId}/Seen`, true);
                observer.disconnect();
            }
        });
    }, { threshold: [0.1] });
    observer.observe(msgItem);

    msgItem.appendChild(subBox);
    subBox.appendChild(msgTime);
    // console.log(mMessage);
    if (pos == "first") {
        msgList.insertBefore(msgItem, msgList.firstChild);
    } else {
        msgList.appendChild(msgItem);
    }
}

function msgDate(mDate) {
    let msgList = document.getElementsByClassName("messages")[0];
    const msgDate = document.createElement("div");
    const msgSpan = document.createElement("span");

    msgDate.classList.add("msg-date");
    msgSpan.innerText = mDate;

    msgDate.appendChild(msgSpan);
    if (msgList.firstChild) {
        msgList.insertBefore(msgDate, msgList.firstChild);
    } else {
        msgList.appendChild(msgDate);
    }
}

document.getElementById("send-msg-btn").addEventListener("click", () => {
    let msg = document.getElementById("msg-input").value;
    if(msg != "") {
        let d = new Date();
        let date = `${d.getDate()}:${d.getMonth()}:${d.getFullYear()}:${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}:${d.getMilliseconds()}`;
        let mid = `${d.getDate()}${d.getMonth()}${d.getFullYear()}${d.getHours()}${d.getMinutes()}${d.getSeconds()}${d.getMilliseconds()}`;
        document.getElementById("msg-input").value = "";
        sendMsg(mid, msg, getTimeDate(date), false);

        saveInfo(`Allusers/${userid}/Messages/${selected}/${mid}`, {
            Message: msg,
            Date: date,
            Source: "sender",
            Seen:false
        });

        updateInfo(`Allusers/${userid}/Friends/${selected}/Message`, msg);
        updateInfo(`Allusers/${userid}/Friends/${selected}/Time`, date);

        updateInfo(`Allusers/${selected}/Friends/${userid}/Message`, msg);
        updateInfo(`Allusers/${selected}/Friends/${userid}/Time`, date);

        saveInfo(`Allusers/${selected}/Messages/${userid}/${mid}`, {
            Message: msg,
            Date: date,
            Source: "receiver",
            Seen:true
        });
    }
    const lastMessage = document.getElementsByClassName("messages")[0].lastElementChild;
    if (lastMessage) {
        lastMessage.scrollIntoView();
    }
})

document.getElementById("msg-input").addEventListener("keypress", (e) => {
    if(e.key == "Enter") {
        document.getElementById("send-msg-btn").click();
    }
});

document.getElementsByClassName("back")[0].addEventListener("click", () => {
    document.getElementsByClassName("right-content")[0].style.display = "none";
    document.getElementsByClassName("left-content")[0].style.display = "flex";
});

window.addEventListener("resize", () => {
    if(window.innerWidth < 521 && contactSelected) {
        document.getElementsByClassName("right-content")[0].style.display = "flex";
        document.getElementsByClassName("left-content")[0].style.display = "none";
    } else {
        document.getElementsByClassName("left-content")[0].style.display = "flex";
    }
});

document.addEventListener("ontextmenu", (event) => {
    event.preventDefault();
    const contextMenu = document.getElementById("context-menu");
    const contactItem = event.target.closest(".messages");

    if (contactItem) {
        contextMenu.style.display = "block";
        contextMenu.style.left = `${event.pageX}px`;
        contextMenu.style.top = `${event.pageY}px`;
    } else {
        contextMenu.style.display = "none";
    }
});

document.addEventListener("click", (event) => {
    const contextMenu = document.getElementById("context-menu");
    if (!event.target.closest("#context-menu")) {
        contextMenu.style.display = "none";
    }
});

document.getElementById("close-chat").addEventListener("click", () => {
    contactSelected = false;
    selected = null;
    document.getElementsByClassName("no-contact-selected")[0].style.display = "flex";
    document.getElementsByClassName("contact-selected")[0].style.display = "none";
    document.getElementById("context-menu").style.display = "none";
});

document.getElementById("clear-chat").addEventListener("click", () => {
    document.getElementById("context-menu").style.display = "none";
});

document.addEventListener("click", (e) => {
    // console.log(e.target);
    if (
        !e.target.classList.contains("mn-it") &&
        menubox.style.display == "block"
    ) {
        menubox.style.display = "none";
    }
    if (e.target.classList.contains("popupbox")) {
        mainpopupbox.style.display = "none";
        profilemanagebox.style.display = "none";
        contactmanagebox.style.display = "none";
        logoutmanagebox.style.display = "none";

        profileBtns.style.display = "block";
        profileImageButtons.style.display = "none";

        profileEditBtn.style.display = "block";
        profileEditImage.src = image;
        profileCancelBtn.style.display = "none";
        profileSaveBtn.style.display = "none";
        otpbox.style.display = "none";
        fnameInput.readOnly = true;
        lnameInput.readOnly = true;
        emailInput.readOnly = true;
    }
});
