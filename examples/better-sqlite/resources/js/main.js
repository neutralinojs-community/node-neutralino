// This is just a sample app. You can structure your Neutralinojs app code as you wish.
// This example app is written with vanilla JavaScript and HTML.
// Feel free to use any frontend framework you like :)
// See more details: https://neutralino.js.org/docs/how-to/use-a-frontend-library


/*
    Function to set up a system tray menu with options specific to the window mode.
    This function checks if the application is running in window mode, and if so,
    it defines the tray menu items and sets up the tray accordingly.
*/
function setTray() {
    // Tray menu is only available in window mode
    if(NL_MODE != "window") {
        console.log("INFO: Tray menu is only available in the window mode.");
        return;
    }

    // Define tray menu items
    let tray = {
        icon: "/resources/icons/trayIcon.png",
        menuItems: [
            {id: "VERSION", text: "Get version"},
            {id: "SEP", text: "-"},
            {id: "QUIT", text: "Quit"}
        ]
    };

    // Set the tray menu
    Neutralino.os.setTray(tray);
}

/*
    Function to handle click events on the tray menu items.
    This function performs different actions based on the clicked item's ID,
    such as displaying version information or exiting the application.
*/
function onTrayMenuItemClicked(event) {
    switch(event.detail.id) {
        case "VERSION":
            // Display version information
            Neutralino.os.showMessageBox("Version information",
                `Neutralinojs server: v${NL_VERSION} | Neutralinojs client: v${NL_CVERSION}`);
            break;
        case "QUIT":
            // Exit the application
            Neutralino.app.exit();
            break;
    }
}

/*
    Function to handle the window close event by gracefully exiting the Neutralino application.
*/
function onWindowClose() {
    Neutralino.app.exit();
}

function handleNotes(notes) {
    const element = document.querySelector("table");
    element.innerHTML = ""; // Clear the table
    if (element) {
        notes.detail.forEach(note => {
            const newRow = element.insertRow(); // Create a new row
            const newCell = newRow.insertCell(); // Create a new cell
            newCell.textContent = note.id; // Set the cell's text content to the port
            const newCell2 = newRow.insertCell(); // Create a new cell
            newCell2.textContent = note.content; // Set the cell's text content to the port
        });
    }
}

// Function to get list of available notes in db
function fetchNotes() {
    Neutralino.events.broadcast("backend:getNotes");
}

function createNote() {
    const content = document.querySelector("#noteContent").value;
    Neutralino.events.broadcast("backend:createNote", content);
    document.querySelector("#noteContent").value = "";
}

// Initialize Neutralino
Neutralino.init();

window.onload = function() {
    fetchNotes();
}

// Register event listeners
Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);
Neutralino.events.on("windowClose", onWindowClose);
Neutralino.events.on("frontend:getNotes", handleNotes);


// Conditional initialization: Set up system tray if not running on macOS
if(NL_OS != "Darwin") { // TODO: Fix https://github.com/neutralinojs/neutralinojs/issues/615
    setTray();
}