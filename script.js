//Generate random patient ID
function generate_patient_id() {
  const random = Math.floor(Math.random() * 10000);
  document.getElementById("patientId").innerHTML = random;
}

//Register button to register patient details
function register_new_patient() {
  //Form validation to prevent empty input fields
  let patientName = document.getElementById("patientName").value.trim();
  let patientGender = document.getElementById("patientGender").value.trim();
  let patientBloodtype = document
    .getElementById("patientBloodtype")
    .value.trim();
  let room = document.getElementById("room").value.trim();
  //function execute if name gender bloodtype room input fields is not empty
  if (
    patientName != "" &&
    patientGender != "" &&
    patientBloodtype != "" &&
    room != ""
  ) {
    //Create checkin in progress ticker
    create_ticker(
      document.getElementById("patientId").innerHTML,
      document.getElementById("patientName").value,
      document.getElementById("room").value,
      document.getElementById("patientGender").value
    );
    //register new patient in database
    new_patient_register(
      document.getElementById("patientId").innerHTML,
      document.getElementById("patientName").value,
      document.getElementById("room").value,
      document.getElementById("patientGender").value
    );
    //refresh dashboard status, generate new patient id, and clear input fields
    refresh_dashboard();
    generate_patient_id();
    clear_form();
  } else {
    //alert function if patient details input fields are left empty
    alert("Please ensure patient details are filled");
  }
}

//Add seconds to timer deadline
function addSeconds(date, seconds) {
  date.setSeconds(date.getSeconds() + seconds);
  return date;
}

//Create ticker for patient check-in in progress status
function create_ticker(id, name, room, gender) {
  //create div for ticker
  let ticker =
    "<div class='tdsmall'>" +
    "(ID: " +
    id +
    ") | " +
    name +
    " | " +
    gender +
    " | " +
    room +
    " | Checking In  - " +
    "<div id=sec_variable" +
    id +
    "></div></div>";

  if (document.getElementById("patientProgress").innerHTML.trim() != "") {
    let div = document.createElement("div");
    div.innerHTML = ticker;
    div.id = id;
    document.getElementById("patientProgress").appendChild(div);
  } else {
    let div = document.createElement("div");
    div.innerHTML = ticker;
    div.id = id;
    document.getElementById("patientProgress").appendChild(div);
  }

  //Create timer for checkin in progress
  const date = new Date();
  let deadline = addSeconds(date, 10); //Set timer (in seconds) for checkin in progress here
  let x = setInterval(function () {
    let now = new Date().getTime();
    let t = deadline - now;
    let seconds = Math.floor((t % (1000 * 60)) / 1000);

    document.getElementById("sec_variable" + id).innerHTML = seconds + " sec";
    if (t < 0) {
      clearInterval(x);
      document.getElementById(id).remove();

      //edit ticker for after countdown timer reaches 0
      let div = document.createElement("div");
      div.innerHTML =
        "<div class='tdsmall'>" +
        "(ID: " +
        id +
        ") | " +
        name +
        " | " +
        gender +
        " | " +
        room +
        " | Check In Completed!</div></div>";
      div.id = id;
      document.getElementById("patientProgress").appendChild(div);
      update_checked_in_patient(id, name, room, gender, "Check-In");
      refresh_dashboard();
    }
  }, 1000);
}

const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

function new_patient_register(idd, cname, croom, cgender) {
  // Open (or create) the database
  let open = indexedDB.open("Hospital", 1);
  open.onupgradeneeded = function () {
    let db = open.result;
    let store = db.createObjectStore("Hospital_Patients", { keyPath: "id" });
    let index = store.createIndex("Patient_Information", "id");
  };

  open.onsuccess = function () {
    // Start a new transaction
    let db = open.result;

    let tx = db.transaction("Hospital_Patients", "readwrite");
    let store = tx.objectStore("Hospital_Patients");

    // Add some data
    store.put({
      id: idd,
      name: cname,
      gender: cgender,
      room: croom,
      status: "Pending Check-In",
      roomno: "",
    });
    // Close the db when the transaction is done
    tx.oncomplete = function () {
      db.close();
    };
  };
}

//function to clear input fields in register patient form
function clear_form() {
  document.getElementById("patientName").value = "";
  document.getElementById("patientGender").value = "";
  document.getElementById("patientBloodtype").value = "";
  document.getElementById("room").value = "";
}

//function to update checkin status of patient
function update_checked_in_patient(idd, cname, croom, cgender, ops) {
  let a = 444;
  if (ops == "Check-In") {
    a = assign_room(idd, cname, croom, "", cgender);
  }

  let open = indexedDB.open("Hospital", 1);
  open.onupgradeneeded = function () {
    let db = open.result;
    let store = db.createObjectStore("Hospital_Patients", { keyPath: "id" });
    let index = store.createIndex("Patient_Information", "id");
  };

  open.onsuccess = function () {
    // For pending check in patient
    let db = open.result;

    let tx = db.transaction("Hospital_Patients", "readwrite");
    let store = tx.objectStore("Hospital_Patients");
    let getJohn = store.get(idd);

    getJohn.onsuccess = function (e) {
      let data = e.target.result;
      if (a != 100 && ops == "Check-In") {
        data.status = "Check-In Completed";
        data.roomno = a;
      } else if (ops == "Check-Out") {
        data.status = "Check-Out Completed";
        data.roomno = "";
      } else {
        data.status = "Waiting List";
      }

      let objRequest = store.put(data);
    };

    tx.oncomplete = function () {
      db.close();
    };
  };

  draw_occupancy_box();
}

//function to assign room to patient
function assign_room(id, name, room, roomno, gender) {
  let a, b;
  let c = 100;
  //If patient is in intensive care ward, assign to room 1-10
  if (room == "Intensive Care Ward") {
    a = 1;
    b = 10;

    //If patient is in infectious disease ward, assign to room 11-20
  } else if (room == "Infectious Disease Ward") {
    a = 11;
    b = 20;
  } else {
    //If patient is in General ward, assign to room 21-40
    a = 21;
    b = 40;
  }

  //exclude occupied rooms
  for (i = a; i <= b; i++) {
    if (document.getElementById(i).innerHTML.includes("OCCUPIED") != true) {
      c = i;
      break;
    }
  }

  return c;
}

//fucntion to refresh dashboard
function refresh_dashboard() {
  // Open (or create) the database
  let open = indexedDB.open("Hospital", 1);
  open.onupgradeneeded = function () {
    let db = open.result;
    let store = db.createObjectStore("Hospital_Patients", { keyPath: "id" });
    let index = store.createIndex("Patient_Information", "id");
  };

  open.onsuccess = function () {
    let inprogress = 0,
      intensive = 0,
      infectious = 0,
      general = 0,
      waitinglist = 0;
    let db = open.result;
    let tx = db.transaction("Hospital_Patients", "readonly");
    let store = tx.objectStore("Hospital_Patients");

    store.openCursor().onsuccess = function (event) {
      let cursor = event.target.result;

      if (cursor) {
        if (cursor.value.status.trim() == "Pending Check-In") {
          inprogress++;
        } else {
          if (
            cursor.value.room == "Intensive Care Ward" &&
            cursor.value.status != "Waiting List" &&
            cursor.value.status != "Check-Out Completed"
          )
            //document.getElementById("totalIntensive").innerHTML = Number(document.getElementById("totalIntensive").innerHTML) +1;
            intensive++;
          else if (
            cursor.value.room == "Infectious Disease Ward" &&
            cursor.value.status != "Waiting List" &&
            cursor.value.status != "Check-Out Completed"
          )
            //document.getElementById("totalInfectious").innerHTML = Number(document.getElementById("totalInfectious").innerHTML) +1;
            infectious++;
          else if (
            cursor.value.room == "General Ward" &&
            cursor.value.status != "Waiting List" &&
            cursor.value.status != "Check-Out Completed"
          )
            //document.getElementById("totalGeneral").innerHTML = Number(document.getElementById("totalGeneral").innerHTML) +1;
            general++;
          else if (cursor.value.status == "Waiting List") waitinglist++;
        }

        document.getElementById("totalInProgress").innerHTML = inprogress;
        document.getElementById("totalIntensive").innerHTML = intensive;
        document.getElementById("totalInfectious").innerHTML = infectious;
        document.getElementById("totalGeneral").innerHTML = general;
        document.getElementById("totalWL").innerHTML = waitinglist;
        cursor.continue();
      }
    };
    //   alert(inprogress);

    tx.oncomplete = function () {
      db.close();
    };
  };
}

//Create occupied room div for patient
function draw_occupancy_box() {
  // Open (or create) the database
  let open = indexedDB.open("Hospital", 1);
  open.onupgradeneeded = function () {
    let db = open.result;
    let store = db.createObjectStore("Hospital_Patients", { keyPath: "id" });
    let index = store.createIndex("Patient_Information", "id");
  };

  open.onsuccess = function () {
    let db = open.result;
    let tx = db.transaction("Hospital_Patients", "readonly");
    let store = tx.objectStore("Hospital_Patients");

    store.openCursor().onsuccess = function (event) {
      let cursor = event.target.result;

      if (cursor) {
        if (cursor.value.status.trim() == "Check-In Completed") {
          let html =
            "Room " +
            cursor.value.roomno +
            "<br><div style='background-color: #3BACB6'>OCCUPIED</div>";
          html +=
            "<div style='background-color: #B3E8E5 ; font-size:12px'>" +
            cursor.value.name +
            " (ID: " +
            cursor.value.id +
            ") | " +
            cursor.value.gender +
            "</div>";
          html +=
            "<div style='background-color: #B3E8E5 ; font-size:12px'><input id='dischargeButton' type=submit value='Discharge Patient' onclick=\"dischargePatient('" +
            cursor.value.id +
            "','" +
            cursor.value.roomno +
            "','" +
            cursor.value.name +
            "','" +
            cursor.value.gender +
            "');\"></div>";

          document.getElementById(cursor.value.roomno).innerHTML = html;
        }

        cursor.continue();
      }
    };
    //   alert(inprogress);

    tx.oncomplete = function () {
      db.close();
    };
  };
}

//Button funtion to discharge pending sanitizing in draw_occupancy_box
function dischargePatient(id, roomno, name, gender) {
  //create new div
  let html =
    "Room " +
    roomno +
    "<br><div style='background-color: #F94892' class='blink_me'>Discharged pending Sanitizing<div id=pendingSanitizingSec" +
    id +
    "></div></div>";
  html +=
    "<div style='background-color: #FFA1C9 ; font-size:12px'>" +
    name +
    " (ID: " +
    id +
    ") | " +
    gender +
    "</div>";
  html +=
    "<div style='background-color: #FFA1C9 ; font-size:12px'><input id='dischargeButton' type=submit value='Discharge Patient' disabled></div>";
  document.getElementById(roomno).innerHTML = html;

  const date = new Date();
  let deadline = addSeconds(date, 6); //Set timer (in seconds) for discharged panding sanitizing here
  let x = setInterval(function () {
    let now = new Date().getTime();
    let t = deadline - now;
    let seconds = Math.floor((t % (1000 * 60)) / 1000);

    document.getElementById("pendingSanitizingSec" + id).innerHTML = seconds;

    //after timer reaches 0, proceed to sanitizeRoom
    if (t < 0) {
      clearInterval(x);
      sanitizeRoom(id, roomno, name, gender);
    }
  }, 1000);
}

//function to change occupancy box to sanitizing room
function sanitizeRoom(id, roomno, name, gender) {
  let html =
    "Room " +
    roomno +
    "<br><div style='background-color: #B8F1B0' class='blink_me'>SANITIZING ROOM<div id=finalSanitize" +
    id +
    "></div></div>";
  html +=
    "<div style='background-color: #E3FCBF ; font-size:12px'>Readying room for next patient</div>";
  html +=
    "<div style='background-color: #E3FCBF ; font-size:12px'><input id='dischargeButton' type=submit value='Discharge Patient' disabled></div>";
  document.getElementById(roomno).innerHTML = html;

  const date = new Date();
  let deadline = addSeconds(date, 6); //Set timer (in seconds) for sanitizing room here
  let x = setInterval(function () {
    let now = new Date().getTime();
    let t = deadline - now;
    let seconds = Math.floor((t % (1000 * 60)) / 1000);

    document.getElementById("finalSanitize" + id).innerHTML = seconds;

    //after timer reaches 0, update patient checkin status
    if (t < 0) {
      clearInterval(x);

      update_checked_in_patient(id, name, room, gender, "Check-Out");
      refresh_dashboard();
      document.getElementById(roomno).innerHTML = "Room " + roomno;
    }
  }, 1000);
}

//function for to assign room to patients in waiting list Button
function assign_room_wl() {
  // Open (or create) the database
  let open = indexedDB.open("Hospital", 1);
  open.onupgradeneeded = function () {
    let db = open.result;
    let store = db.createObjectStore("Hospital_Patients", { keyPath: "id" });
    let index = store.createIndex("Patient_Information", "id");
  };

  open.onsuccess = function () {
    let db = open.result;
    let tx = db.transaction("Hospital_Patients", "readonly");
    let store = tx.objectStore("Hospital_Patients");

    store.openCursor().onsuccess = function (event) {
      let cursor = event.target.result;

      if (cursor) {
        if (cursor.value.status.trim() == "Waiting List") {
          update_checked_in_patient(
            cursor.value.id,
            cursor.value.name,
            cursor.value.room,
            cursor.value.gender,
            "Check-In"
          );
          sleep(2000);
        }
        cursor.continue();
      }
    };

    tx.oncomplete = function () {
      db.close();
    };
  };

  draw_occupancy_box();
  const myTimeout = setTimeout(refresh_dashboard, 3000);

  alert("All Waiting List patients are processed");
}
