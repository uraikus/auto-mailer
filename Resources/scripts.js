var template = {}; //To store the templates JSON data for easier access.
var dragElement = ""; //The element being dragged is stored globally for easier access.
var users = {}; //Stores the users in a global variable.
var modules = {}; //The modules are store in here. It loads globally so that a new template can be applied and saved easier. 
var initialized = false; //Used when the user tries to change template after already having opened one.

function loadDocument() {
  document.getElementById("modSelect").selectedIndex = 0; //Makes the dropdown start with the "Choose a Template" text. Otherwise refreshing page makes weirdness.
  include("Modules/modulesList.txt", "initializeModules");
  include("users.txt", "assignUsers"); //Grabs the users json file and loads it as a global variable.
}

function include(path, action) { //Include function for template dependencies.
  var frame = document.createElement("IFRAME");
  frame.style.display = "none";
  document.body.appendChild(frame);
  frame.onload = function() {
    window[action](frame); //What function to be ran after the frame is loaded. The frame element itself is passed as a parameter to quickly get contents.
    document.body.removeChild(frame); //This frame has served us well. Time to destroy it. :(
  }
  frame.src = path; //If you don't know what this does. Than... Well go back to school. JK ROFLOL. But seriously, its pretty simple.
}

function assignUsers(frame) {
  users = JSON.parse(frame.contentDocument.body.innerText); //This code is beautiful isn't it? Yeah yeah, I know kinda sloppy. But hey, saves precious vertical space!
  var userslist = document.getElementById("userslist"); //Updates the userslist datalist for creating templates.
  var x;
  for (x in users) {
    var option = document.createElement("OPTION");
    option.value = x;
    userslist.appendChild(option);
  }
}

function loadTemplateJSON(frame) {
  template = JSON.parse(frame.contentDocument.body.innerText);
  newTemplate(true);
}

function initializeModules(frame) { //Loads the modules from the modulesList.txt into the <select> options.
  var selector = document.getElementById("modSelect");
  modules = JSON.parse(frame.contentDocument.body.innerText);
  var x;
  for (x in modules) {
    var option = document.createElement("OPTION");
    if (x === "default" || x === "space") option.value = false;
    else option.value = x;
    option.innerHTML = modules[x];
    selector.appendChild(option);
  }
}

function loadModule() { //Loads whatever module is selected in the <select> element.
  var selElem = document.getElementById("modSelect"); //Get the module <select> element.
  var selVal = selElem.children[selElem.selectedIndex].value; //Take the currently selected templates <option> value.
  if (selVal === "false") return; //If user selects non functioning value. (I.E. "Select a Template")
  else if (initialized && confirm("Changing template will delete all already loaded content with changes.\n\nPress ok if you are sure you want to continue.")) {
    include("Modules/" + selVal + ".txt", "datarizeContents");
    document.getElementById("emailBut").disabled = false;
  }
  else {
    include("Modules/" + selVal + ".txt", "datarizeContents");
    initialized = true; //This way if you try to load another template. It will ask first. ;)
    document.getElementById("emailBut").disabled = false;
  }
}

function newTemplate(loaded) { //Creates the form stuff in options for a new template. Yay!
  loaded = (loaded || false);
  if (loaded || !initialized || confirm("Changing template will delete all already loaded content with changes.\n\nPress ok if you are sure you want to continue.")) {
    initialized = true; //This way if you try to load another template. It will ask first. ;)
    if (!loaded) template = {"mail":{},"prefabs":{}};
    document.getElementById("main").innerHTML = "To create form preset data, enclose a identifier in the subject or body with a \"|-\" and a \"-|\".<br>By starting the identifier off with a \"$\" symbol will let the system know that there are no preset values.<br>Example: |-incidentEvent-| or |-$incidentTime-|.<hr>";
    var table = document.createElement("TABLE");
    table.style.width = "100%;"
    var row = table.insertRow(0);
    var cell = row.insertCell(0);
    cell.innerHTML = "File Name:<sup>Do NOT include the extension</sup>";
    cell.style.width = "220px";
    cell = row.insertCell(1);
    cell.innerHTML = "<input type='text' id='filename' oninput='template.file = this.value;'>";
    if (loaded) {
      cell.firstElementChild.value = template.file;
      cell.firstElementChild.disabled = true;
    }
    else cell.firstElementChild.disabled = false;
    row = table.insertRow(1);
    cell = row.insertCell(0);
    cell.innerHTML = "Name in Dropdown:";
    cell = row.insertCell(1);
    cell.innerHTML = "<input type='text' id='optionName' oninput='template.display = this.value;'>";
    if (loaded) cell.firstElementChild.value = template.display;
    row = table.insertRow(2);
    cell = row.insertCell(0);
    cell.innerHTML = "Form Header:";
    cell = row.insertCell(1);
    cell.innerHTML = "<input type='text' id='formHeader' oninput='template.name = this.value;'>";
    if (loaded) cell.firstElementChild.value = template.name;
    row = table.insertRow(3);
    cell = row.insertCell(0);
    cell.innerHTML = "To: <input type='button' value='Add' style='float: right;' onclick='addEmails()'>";
    cell = row.insertCell(1);
    cell.setAttribute("id","toLine");
    if (loaded) {
      for (var x = 0; x < template.mail.to.length; x++) {
        var span = document.createElement("SPAN");
        span.innerHTML = template.mail.to[x];
        var removeB = document.createElement("B");
        removeB.innerHTML = " X";
        removeB.style.color = "red";
        removeB.setAttribute("onclick","this.parentElement.parentElement.removeChild(this.parentElement);");
        span.appendChild(removeB);
        cell.appendChild(span);
      }
    }
    row = table.insertRow(4);
    cell = row.insertCell(0);
    cell.innerHTML = "Subject Line:";
    cell = row.insertCell(1);
    cell.innerHTML = "<input type='text' id='subjectLine' oninput='generatePrefabJSON()'>";
    if (loaded) cell.firstElementChild.value = template.mail.subject;
    row = table.insertRow(5);
    cell = row.insertCell(0);
    cell.innerHTML = "Body:";
    cell.style.verticalAlign = "top";
    cell = row.insertCell(1);
    cell.innerHTML = "<textarea style='width: calc(100% - 20px); height: 200px;' id='emailBody' oninput='generatePrefabJSON()'></textarea>";
    if (loaded) cell.firstElementChild.value = template.mail.body;
    row = table.insertRow(6);
    cell = row.insertCell(0);
    if (loaded) cell.innerHTML = "<input type='button' value='Save Template' onclick='saveTemplate(true);'><input type='button' value='Cancel Edit' onclick='datarizeContents(false)'>";
    else cell.innerHTML = "<input type='button' value='Save Template' onclick='saveTemplate();'>";
    cell = row.insertCell(1);
    cell.innerHTML = "<input type='button' value='Edit Form Preset Data' onclick='showMenu(\"prefabContainer\"); generatePrefabs();'>";
    document.getElementById("main").appendChild(table);
    generatePrefabJSON();
  }
}

function generatePrefabs() { //Turns the JSON data into editable form fields.
  document.getElementById("activePrefab").value = "";
  document.getElementById("addValueButton").style.display = "none";
  document.getElementById("prefabInputs").innerHTML = ""; //Removes already loaded data if previously opened.
  var datalist = document.getElementById("allPrefabs");
  datalist.innerHTML = "";
  var x;
  for (x in template.prefabs) {
    var option = document.createElement("OPTION");
    option.value = x;
    datalist.appendChild(option);
  }
}

function loadPrefabData() { //Loads selected prefabs data.
  var container = document.getElementById("prefabInputs");
  var prefab = document.getElementById("activePrefab").value;
  container.innerHTML = "";
  if (template.prefabs[prefab] !== undefined) { //If prefab exists....
    if (prefab[0] === "$") { //If prefab is a $based form data
      document.getElementById("addValueButton").style.display = "none";
      var input = document.createElement("INPUT");
      input.value = template.prefabs[prefab];
      input.oninput = function() {updatePrefabValue();}
      container.appendChild(document.createTextNode("Form Title: "));
      container.appendChild(input);
    }
    else {
      document.getElementById("addValueButton").style.display = "inline-block";
      var input = document.createElement("INPUT");
      input.value = template.prefabs[prefab][0];
      input.oninput = function() {updatePrefabValue();}
      container.appendChild(document.createTextNode("Form Title: "));
      container.appendChild(input);
      var x;
      for (x = 1; x < template.prefabs[prefab].length; x++) {
        var br = document.createElement("BR");
        input = document.createElement("INPUT");
        input.value = template.prefabs[prefab][x];
        input.oninput = function() {updatePrefabValue();}
        container.appendChild(br);
        container.appendChild(document.createTextNode("Value " + x + ": "));
        container.appendChild(input);
      }
    }
  }
}

function updatePrefabValue() { //Assigns the input values to the global template object variable.
  var inputs = document.querySelectorAll("#prefabInputs input");
  var prefab = document.getElementById("activePrefab").value;
  var x;
  if (prefab[0] === "$") {
    template.prefabs[prefab] = inputs[0].value;
  }
  else {
    for (x = 0; x < inputs.length; x++) {
      template.prefabs[prefab][x] = inputs[x].value;
    }
  }
}

function addPrefabValue() {
  var br = document.createElement("BR");
  var container = document.getElementById("prefabInputs");
  var input = document.createElement("INPUT");
  input.oninput = function() {updatePrefabValue();}
  var x = document.querySelectorAll("#prefabInputs input").length;
  container.appendChild(br);
  container.appendChild(document.createTextNode("Value " + x + ": "));
  container.appendChild(input);
}

function generatePrefabJSON() { //Creates empty prefabs after scanning through text.
  var subject = document.querySelector("#subjectLine").value;
  var body = document.querySelector("#emailBody").value;
  template.mail.subject = subject;
  template.mail.body = body;
  var data = subject + body;
  var prefabs = data.match(/\|-(.*?)-\|/g);
  if (prefabs !== null) { //Checks for preset data and removes temp preset data.
    var x;
    for (x in template.prefabs) { //Removes any unused prefab data.
      if (template.prefabs[x] == false) delete template.prefabs[x];
    }
    for (x = 0; x < prefabs.length; x++) {
      var tempFab = prefabs[x].replace(/\|-|-\|/g, '');//Removes the |- and the -| symbols from the string.
      if (template.prefabs[tempFab] === undefined) { //Only write new data if the string isn't already occupied.
        if (tempFab[0] === "$") template.prefabs[tempFab] = "";
        else template.prefabs[tempFab] = [];
      }
    }
  }
}

function saveTemplate(loaded) { //Runs error check and saves template if no errors are found.
  loaded = (loaded || false);
  var errors = ["Please review the following errors"];
  var fileName = document.getElementById("filename");
  var formHeader = document.getElementById("formHeader");
  var subject = document.getElementById("subjectLine");
  var body = document.getElementById("emailBody");
  var drop = document.getElementById("optionName");
  if (!loaded && modules[fileName.value] !== undefined) {
    errors.push("\nThat file name is already taken");
    fileName.style.border = "2px solid red";
  }
  if (drop.value === "") {
    errors.push("\nThe dropdown value is blank");
    drop.style.border = "2px solid red";
  }
  if (fileName.value === "") {
    errors.push("\nThe filename value is blank");
    fileName.style.border = "2px solid red";
  }
  if (formHeader.value === "") {
    errors.push("\nThe form header value is blank");
    formHeader.style.border = "2px solid red";
  }
  if (subject.value === "") {
    errors.push("\nThe subject's value is blank");
    subject.style.border = "2px solid red";
  }
  if (body.value === "") {
    errors.push("\nThe body's value is blank");
    body.style.border = "2px solid red";
  }
  if (errors.length > 1) alert(errors); //Display errors if any are found.
  else { //If no errors, the template will be saved.
    modules[fileName.value] = drop.value; //Updates modules with the file and the dropdown value.
    var netModule = top.netPath + "/Widgets/Auto Mailer/Modules/" + fileName.value + ".txt";
    var locModule = "C:/Web Tools/Resources/Widgets/Auto Mailer/Modules/" +fileName.value + ".txt";
    var netList = parent.netPath + "/Widgets/Auto Mailer/Modules/modulesList.txt";
    var locList = "C:/Web Tools/Resources/Widgets/Auto Mailer/Modules/modulesList.txt";
    var templateString = JSON.stringify(template);
    var modulesString = JSON.stringify(modules);
    top.saveFile(netModule, templateString);
    top.saveFile(locModule, templateString);
    top.saveFile(netList, modulesString);
    top.saveFile(locList, modulesString);
    location.reload();
  }
}

function deletePreset() {
  if (confirm("Are you sure you'd like to delete this preset?")) {
    var prefab = document.getElementById("activePrefab").value;
    if (prefab) {
      delete template.prefabs[prefab];
      var dataPrefab = document.querySelector("#allPrefabs option[value=" + prefab + "]");
      if (dataPrefab) dataPrefab.parentElement.removeChild(dataPrefab);
    }
  }
}

function addEmails(){
  document.getElementById("options").innerHTML = "<b>To:</b><sup>Use office symbol or email address</sup><hr>";
  var div = document.createElement("DIV");
  div.setAttribute("id","emailDiv");
  var x;
  var input;
  var remove;
  var emailsTo = document.getElementById("toLine").children;
  for (x = 0; x < emailsTo.length; x++) { //Creates editable text fields for spans containing email data.
    input = document.createElement("INPUT");
    input.type = "text";
    input.value = emailsTo[x].firstChild.textContent;
    input.setAttribute("list","userslist");
    input.setAttribute("oninput","updateEmails()");
    div.appendChild(input);
    remove = document.createElement("INPUT");
    remove.type = 'button';
    remove.value = "X";
    remove.style.color = "red";
    remove.setAttribute("onclick","this.parentElement.removeChild(this.previousElementSibling); this.parentElement.removeChild(this);");
    div.appendChild(remove);
  }
  var button = document.createElement("INPUT"); //This button creates inputs for adding email addresses.
  button.type = "button";
  button.value = "Add Address";
  button.onclick = function() { //This button creates textfields for creating email data.
    input = document.createElement("INPUT");
    input.type = "text";
    input.setAttribute("list","userslist");
    input.setAttribute("oninput","updateEmails()");
    div.appendChild(input);
    remove = document.createElement("INPUT");
    remove.type = 'button';
    remove.value = "X";
    remove.style.color = "red";
    remove.setAttribute("onclick","this.parentElement.removeChild(this.previousElementSibling); this.parentElement.removeChild(this); updateEmails();");
    div.appendChild(remove);
  }
  document.getElementById("options").appendChild(button);
  document.getElementById("options").appendChild(div);
  showMenu("options");
}

function updateEmails() {
  var inputs = document.querySelectorAll("input[list=userslist]");
  var toLine = document.getElementById("toLine");
  var x;
  toLine.innerHTML = "";
  template.mail.to = [];
  for (x = 0; x < inputs.length; x++) {
    if (inputs[x].value !== "") {
      template.mail.to.push(inputs[x].value);
      var span = document.createElement("SPAN");
      span.innerHTML = inputs[x].value;
      var removeB = document.createElement("B");
      removeB.innerHTML = " X";
      removeB.style.color = "red";
      removeB.setAttribute("onclick","this.parentElement.parentElement.removeChild(this.parentElement);");
      span.appendChild(removeB);
      toLine.appendChild(span);
    }
  }
}

function addOptions(elem) { //Creates additional forms when data contents approve.
  var x;
  if (elem.dataset.forms !== "") { //If the forms is already set, remove them.
    var forms = elem.dataset.forms.split(",");
    for (x = 0; x < forms.length; x++) {
      document.getElementById("main").removeChild(document.getElementById(forms[x])); //Removes each form element that was dependent on this field
    }
    elem.dataset.forms = "";
  }
  if (elem.value.search(/\|-(.*?)-\|/) !== -1) { //Checks to see if there is any form data in value
    var forms = elem.value.match(/\|-(.*?)-\|/g); //Matches all form elements, and snatches them.
    for (x = 0; x < forms.length; x++) { //Cycles through the forms creating elements for them.
      var div = document.createElement("DIV");
      div.setAttribute("id", forms[x]);
      var input = document.createElement("INPUT");
      input.setAttribute("type", "text");
      input.setAttribute("data-x", forms[x]);
      input.setAttribute("class", "inputs");
      div.appendChild(document.createTextNode(forms[x]));
      div.appendChild(input);
      document.getElementById("main").appendChild(div);
    }
    elem.setAttribute("data-forms", forms.toString()); //Assigns the forms for future deletion if necessary.
  }
}

function datarizeContents(frame) {//Turns json data into form stuff. Its pretty nifty.
  var main = document.getElementById("main"); //Main window to create content into.
  var includes = document.getElementById("includes"); //For loading default values in textboxes.
  var x;
  if (frame) template = JSON.parse(frame.contentDocument.body.innerText); //Grabs the JSON from the iframe and parses it.
  main.innerHTML = "<h1>" + template.name + "</h1><b>To: </b>"; //Creates header and destroys any content if a previous template was opened.
  for (x = 0; x < template.mail.to.length; x++) { //Creates a checkbox for each individual you want to send an email to.
    var span = document.createElement("SPAN");
    span.innerHTML = template.mail.to[x];
    var check = document.createElement("INPUT");
    check.setAttribute("type", "checkbox");
    check.value = (users[template.mail.to[x]] || template.mail.to[x]);
    if (users[template.mail.to[x]] !== undefined) {
      span.style.backgroundColor = "lightgreen";
      span.setAttribute("title",users[template.mail.to[x]]);
    }
    check.checked = true;
    span.setAttribute("onclick", "this.firstElementChild.click()");
    span.appendChild(check);
    main.appendChild(span);
  }
  for (x in template.prefabs) {//Grabs each attribute in prefabs to build inputs.
    if (x[0] === "$") { //Creates a boring, plain ol textbox for this option.
      var div = document.createElement("DIV");
      div.appendChild(document.createTextNode(template.prefabs[x]));
      var input = document.createElement("TEXTAREA");
      input.setAttribute("data-x", "|-" + x + "-|");
      input.setAttribute("class", "inputs");
      div.appendChild(input);
      main.appendChild(div);
    }
    else { //Creates a cool dropdown textbox! Wow'ee!
      var y; 
      var div = document.createElement("DIV");
      div.appendChild(document.createTextNode(template.prefabs[x][0])); //Make first item in array become the title for the <input>
      var datalist = document.createElement("DATALIST");
      datalist.setAttribute("id", x);
      for (y = 1; y < template.prefabs[x].length; y++) { //Add rest of items in array become default values stored inside a datalist.
        var option = document.createElement("OPTION");
        option.setAttribute("value", template.prefabs[x][y]);
        datalist.appendChild(option);
      }
      includes.appendChild(datalist);
      var input = document.createElement("INPUT");
      input.type = "text";
      input.setAttribute("data-x", "|-" + x + "-|");
      input.setAttribute("class", "inputs");
      input.setAttribute("oninput", "addOptions(this);"); //For the creation of additional form data if contained in string.
      input.setAttribute("data-forms", "");
      input.setAttribute("list", x);
      div.appendChild(input);
      main.appendChild(div);      
    }
  }
}

function emailize() { //Function for sending emails to outlook.
  var inputs = document.getElementsByClassName("inputs");
  var dutyBox = "?cc=usaf.jbanafw.afdw-staff.mbx.11-wg-cp-duty-officer@mail.mil"; //CP Duty Officer Email Address, CC'd in all emails.
  var to = document.querySelectorAll("input[type=checkbox]:checked");
  var reformedTo = "";
  var subject = template.mail.subject;
  var body = template.mail.body;
  var x;
  var conditions = true;
  var errors = ["Please review the following errors","\n\nPress OK to generate anyway."];
  for (x = 0; x < inputs.length; x++) { //Cycles through replacing default values with new inputs.
    if (inputs[x].value === "") { //If there is an empty value, create an error to confirm that the user wants to submit.
      errors.splice(1,0,"\n" + inputs[x].previousSibling.textContent + " is empty");
      conditions = false;
      inputs[x].style.borderColor = "red"; //Turns the border red to make input more noticable.
    }
    else inputs[x].style.borderColor = "green"; //Turns the border green for visual confirmation that the field was filled.
    subject = subject.replace(inputs[x].getAttribute("data-x"), inputs[x].value);
    body = body.replace(inputs[x].getAttribute("data-x"), inputs[x].value);
  }
  for (x = 0; x < to.length; x++) {
    reformedTo += to[x].value + ";"; //John Calvin and Martin Luther would be proud! Actually it is just compiling the list of people to send the email to.
  }
  body = encodeURIComponent(body);
  var link = "mailto:" + reformedTo + dutyBox + "&subject=" + subject + "&body=" + body; //Adds all components to template.
  if (conditions) location.href = link; //Submits the link to the addressbox, resulting in new email. Yay!
  else if (window.confirm(errors)) location.href = link;
}

function showMenu(menu) {
  document.getElementById(menu).style.display = "block";
  document.getElementById("blur").style.display = "block";
}

function hideMenu() {
  var x;
  var menues = ["blur","options","prefabContainer"]; //Allows for future expansion if necessary.
  for (x = 0; x < menues.length; x++) {
    document.getElementById(menues[x]).style.display = "none";
  }
}

function loadUsers() { //Loads all the preset user emails into a editable table. (Not to be mistaken with edible)
  var options = document.getElementById("options");
  var x;
  var table = document.createElement("TABLE");
  table.setAttribute("id","users");
  var row = table.insertRow(0);
  row.innerHTML = "<th style='width: 100px;'>Duty Symbol</th><th>Email</th><th style='width: 25px;'>*</th><th style='width: 25px;'>Drag</th>";
  row = table.insertRow(table.rows.length); //Creates a row at the bottom so that all the items can be dragged around.
  row.setAttribute("ondragover","this.parentElement.insertBefore(dragElement,this);");
  row.innerHTML = "<td colspan='4' style='height: 10px; background-color: lightgrey;'> </td>";
  options.innerHTML = "";
  options.appendChild(table);
  for (x in users) {
    addUser(x, users[x]);
  }
  var addBut = document.createElement("INPUT"); //Creates button for adding users.
  addBut.type = "button";
  addBut.value = "Add User";
  addBut.setAttribute("onclick","addUser()");
  options.appendChild(addBut);
  var saveBut = document.createElement("INPUT"); //Creates the button for saving as JSON.
  saveBut.type = "button";
  saveBut.value = "Save All";
  saveBut.setAttribute("onclick","saveUsers()");
  options.appendChild(saveBut);
}

function addUser(symbol, email) { //Adds the cells, applies the styles, and attaches the events to each user. Pretty nifty!
  symbol = (symbol || "");
  email = (email || "");
  var table = document.getElementById("users");
  var row = table.insertRow(table.rows.length - 1);
  row.setAttribute("ondragover","this.parentElement.insertBefore(dragElement,this);");
  var cell = row.insertCell(0);
  var input = cell.appendChild(document.createElement("INPUT"));
  input.type = "text";
  input.value = symbol;
  input.setAttribute("class","symbol");
  cell = row.insertCell(1);
  input = cell.appendChild(document.createElement("INPUT"));
  input.type = "text";
  input.value = email;
  input.setAttribute("class","email");
  cell = row.insertCell(2);
  cell.innerText = "X";
  cell.setAttribute("onclick","this.parentElement.parentElement.removeChild(this.parentElement)");
  cell.setAttribute("style","cursor: pointer; color: red; font-weight: bold; text-align: center;");
  cell = row.insertCell(3);
  cell.innerText = "☰";
  cell.style.textAlign = "center";
  cell.setAttribute("class","dragHide");//Shows vertical arrows as the cursor to hint the drag feature.
  cell.draggable = true;
  cell.setAttribute("ondragstart","dragElement = this.parentElement;");
}

function saveUsers() { //Packages the users into a JSON and saves it with activeX.
  var symbols = document.getElementsByClassName("symbol");
  var emails = document.getElementsByClassName("email");
  var x;
  delete users; //So that we can remake the JSON so that pesky little leftover data won't some how spoil my plan... I mean code. 
  users = {};
  for (x = 0; x < symbols.length; x++) {
    users[symbols[x].value] = emails[x].value;
  }
  var usersString = JSON.stringify(users);
  var netPath = top.netPath + "/Widgets/Auto Mailer/users.txt";
  var locPath = "C:/Web Tools/Resources/Widgets/Auto Mailer/users.txt";
  top.saveFile(netPath, usersString);
  top.saveFile(locPath, usersString);
}

function templateManager() {
  var options = document.getElementById("options");
  options.innerText = ""; //Cleans the pane of leftover stuff
  var table = document.createElement("TABLE");
  var row = table.insertRow(0);
  row.innerHTML = "<th>Identifier</th><th>Dropdown Name</th><th>Tools</th>";
  var x;
  for (x in modules) {
    if (x !== "default" && x !== "space") { //Do not include unnecessary data.
      row = table.insertRow(table.rows.length);
      row.setAttribute("ondragover","this.parentElement.insertBefore(dragElement,this);");
      var cell = row.insertCell(0);
      cell.innerHTML = x;
      cell = row.insertCell(1);
      cell.innerHTML = modules[x];
      cell = row.insertCell(2);
      cell.style.textAlign = "center";
      cell.innerHTML = "<b class='dragHide'>☰</b>";
      cell.draggable = true;
      cell.setAttribute("ondragstart","dragElement = this.parentElement;");
      var input = document.createElement("INPUT");
      input.value = "E";
      input.title = "Edit Template.";
      input.setAttribute("class","editbutton");
      input.type = "button";
      input.onclick = function () {
        var name = this.parentElement.previousElementSibling.previousElementSibling.innerText;
        include("Modules/" + name + ".txt", "loadTemplateJSON");
        hideMenu();
      }
      cell.appendChild(input);
      input = document.createElement("INPUT");
      input.value = "X";
      input.title = "Delete Template.";
      input.setAttribute("class","deletebutton");
      input.onclick = function() {
        var template = this.parentElement.previousElementSibling.previousElementSibling.innerText;
        if (confirm("Are you sure you want to delete " + template + "'s template?")) {
          delete modules[template];
          var locPath = "C:/Web Tools/Resources/Widgets/Auto Mailer/Modules/modulesList.txt";
          var netPath = top.netPath + "/Widgets/Auto Mailer/Modules/modulesList.txt";
          var moduleString = JSON.stringify(modules);
          top.saveFile(locPath, moduleString);
          top.saveFile(netPath, moduleString);
          location.reload();
        }
      }
      input.type = "button";
      cell.appendChild(input);
    }
  }
  row = table.insertRow(table.rows.length); //Creates a row at the bottom so that all the items can be dragged around.
  row.setAttribute("ondragover","this.parentElement.insertBefore(dragElement,this);");
  row.innerHTML = "<td colspan='3' style='height: 10px; background-color: lightgrey;'> </td>";
  options.appendChild(table);
  var div = document.createElement("DIV");
  div.setAttribute("class","bottombar");
  options.appendChild(div);
  var input = document.createElement("INPUT");
  input.type = "button";
  input.value = "New Template";
  input.onclick = function() {
    newTemplate();
    hideMenu();
  }
  div.appendChild(input);
  div = document.createElement("DIV");
  div.style.height = "50px";
  options.appendChild(div); //A spacer for when the table needs to be scrolled.
}