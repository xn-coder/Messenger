import { storeProfileImage } from "./storage.js";
import { saveInfo, checkExists } from "./database.js";
import { sendMailRegisterationOtp, sendMailRegisterationSuccessful } from "./mailSender.js";

let userGenerator = () => {
    let num = "0123456789";
    let userid = "";
    for (let i = 0; i < 10; i++)
        userid += num.charAt(Math.floor(Math.random() * 10));
    return userid;
};

let otp = "",
    isVerified = false,
    isEmail = "";

function inNext() {
    const slider = document.querySelectorAll(".inner-slider");
    slider[0].style.display = "none";
    slider[1].style.display = "block";
}

function inNextNext() {
    const slider = document.querySelectorAll(".inner-slider");
    slider[1].style.display = "none";
    slider[2].style.display = "block";
}

function popupBox(val, msg, event) {
    const popup = document.getElementsByClassName("popupbox")[0];
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

function otpGenerator() {
    var num = "0123456789";
    var OTP = "";
    for (let i = 0; i < 6; i++) {
        OTP += num.charAt(Math.random() * 10);
    }
    return OTP;
}

function fname() {
    if (document.getElementById("fname").value.length > 0) return true;
    else return false;
}

function lname() {
    if (document.getElementById("lname").value.length > 0) return true;
    else return false;
}

function email() {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (
        document.getElementById("email").value.length > 0 &&
        document.getElementById("email").value.match(emailRegex)
    )
        return true;
    else return false;
}

document.getElementById("register").addEventListener("click", async () => {
    if (!fname()) popupBox(false, "First name is required", null);
    else if (!lname()) popupBox(false, "Last name is required", null);
    else if (!email()) popupBox(false, "Email is not valid", null);
    else {
        let data = await checkExists("AllIds/" + document.getElementById("email").value.replace(".", "_"));
        if (data) {
            popupBox(false, "Email already exists", null);
        } else {
            if (isEmail != document.getElementById("email").value) {
                otp = otpGenerator();
                console.log(otp);
                document.getElementById("otp").value = otp;
                isEmail = document.getElementById("email").value;
                document.getElementById("verify").style.display = "block";
                isVerified = false;
                document.getElementById("otp").readOnly = false;
                document.getElementById("verified").style.display = "none";
                // sendMailRegisterationOtp(document.getElementById("fname").value + " " + document.getElementById("lname").value, otp, document.getElementById("email").value);
            }
            inNext()
        }
    }
});

document.getElementById("verify").addEventListener("click", () => {
    if (document.getElementById("otp").value.length != 6) {
        popupBox(false, "OTP must be 6 digits", null);
    } else if (document.getElementById("otp").value != otp) {
        popupBox(false, "OTP is not valid", null);
    } else {
        document.getElementById("verify").style.display = "none";
        isVerified = true;
        document.getElementById("otp").readOnly = true;
        document.getElementById("verified").style.display = "block";
    }
});

function password() {
    if (document.getElementById("password").value.length > 5) return true;
    else return false;
}

function confirmPassword() {
    if (document.getElementById("cpassword").value.length > 5) return true;
    else return false;
}

document.getElementById("back").addEventListener("click", () => {
    const slider = document.querySelectorAll(".inner-slider");
    slider[0].style.display = "block";
    slider[1].style.display = "none";
});

document.getElementById("next").addEventListener("click", () => {
    if (!isVerified) popupBox(false, "OTP is not verified", null);
    else if (!password())
        popupBox(false, "Password length must be 6 character", null);
    else if (!confirmPassword())
        popupBox(false, "Confirm password is not match", null);
    else inNextNext();
});

document.getElementById("browse").addEventListener("change", function (event) {
    if (event.target.files[0]) {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(event.target.files[0]);
        fileReader.addEventListener("load", function () {
            document.getElementById("profile").src = this.result;
        });
        document.getElementById("foradd").style.display = "none";
        document.getElementById("remove").style.display = "block";
    }
});

document.getElementById("remove").addEventListener("click", () => {
    document.getElementById("foradd").style.display = "block";
    document.getElementById("remove").style.display = "none";
    document.getElementById("profile").src = "../res/profile.png";
});

document.getElementById("finish").addEventListener("click", async() => {
    let fname = document.getElementById("fname").value;
    let lname = document.getElementById("lname").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    
    let file = document.getElementById("browse").files;
    let profile = document.getElementById("profile").src;

    let userid = userGenerator();
    while (await checkExists("Allusers/" + userid)) {
        userid = userGenerator();
    }

    fname = fname.substring(0, 1).toUpperCase() + fname.substring(1, fname.length);
    lname = lname.substring(0, 1).toUpperCase() + lname.substring(1, lname.length);

    if (file.length > 0 && profile.slice(-11) != "profile.png") {
        storeProfileImage(file[0], userid)
        .then((url) => {
            saveInfo(`AllIds/${email.replace(".", "_")}/`, { Id : userid })
            saveInfo(`Allusers/${userid}/Info/`, { Email : email, UserId : userid, First_Name : fname, Last_Name : lname, Password : password, Profile_Image : url })
        })
        .catch((error) => {
            popupBox(false, "Error uploading image:"+error, null);
        });
    } else {
        let url = "https://firebasestorage.googleapis.com/v0/b/webmessanger-dca14.appspot.com/o/default%2Fprofile.png?alt=media&token=a590bb3d-620c-4ccd-9323-c770bd7e9545";

        saveInfo(`AllIds/${email.replace(".", "_")}/`, { Id : userid })
        saveInfo(`Allusers/${userid}/Info/`, { Email : email, UserId : userid, First_Name : fname, Last_Name : lname, Password : password, Profile_Image : url })
    }
    // sendMailRegisterationSuccessful(fname + " " + lname, email);

    const slider = document.querySelectorAll(".outer-slider");
    slider[0].style.display = "none";
    slider[1].style.display = "block";
});
