import { getPathData } from "./database.js";
import { store } from "./getAuth.js";

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

function email() {
    if (document.getElementById("email").value.length > 0) return true;
    return false;
}

function password() {
    if (document.getElementById("password").value.length > 0) return true;
    return false;
}

document.getElementById("login").addEventListener("click", async () => {
    if (!email()) popupBox(false, "Email is required", null);
    else if (!password()) popupBox(false, "Password is required", null);
    else {
        let data = await getPathData(
            "AllIds/" + document.getElementById("email").value.replace(".", "_")
        );
        if (data) {
            data = await getPathData("Allusers/" + data["Id"] + "/Info/");
            if (data["Password"] == document.getElementById("password").value) {
                store(
                    document.getElementById("email").value,
                    data['UserId'],
                    document.getElementById("password").value);
                popupBox(true, "Login successful", () => {
                    window.location.href = "../";
                });
            } else {
                popupBox(false, "Incorrect password", null);
            }
        } else {
            popupBox(false, "Email not registered", null);
        }
    }
});

document.getElementById("register").addEventListener("click", () => {
    window.location.href = "../registration/";
});
