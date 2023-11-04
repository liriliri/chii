// "use liberal"

//------------------------------------------------------------------------------
var started = false;

var buttonStartStuff;
var buttonClearOutput;
var outputElement;
var storageIndex = 0;
var db;
var otherDB;

//------------------------------------------------------------------------------
function onLoad() {
  if (!buttonStartStuff) buttonStartStuff = document.getElementById('start-btn');
  if (!buttonClearOutput) buttonClearOutput = document.getElementById('clear-btn');
  if (!outputElement) outputElement = document.getElementById('output');

  buttonStartStuff.addEventListener('click', function () {
    lastClickTime = new Date().toString();
    if (db) db.transaction(addClick);

    openTheOtherDatabase();

    if (!started) {
      buttonStartStuff.innerHTML = 'Stop Stuff';
      startStuff();
    } else {
      buttonStartStuff.innerHTML = 'Start Stuff';
      stopStuff();
    }
    started = !started;
  });

  buttonClearOutput.addEventListener('click', function () {
    outputElement.innerHTML = '';
  });

  openTheDatabase();
}

//------------------------------------------------------------------------------
var interval;

function startStuff() {
  if (window.localStorage) window.localStorage.clear();

  storageIndex = 0;

  interval = setInterval(intervalStuff, 1000);
}

function stopStuff() {
  clearInterval(interval);
}

//------------------------------------------------------------------------------
function intervalStuff() {
  var message = 'Doing interval stuff at ' + new Date();

  // add a timeout
  setTimeout(function () {
    console.log(message);
  }, 333);

  // write to local- and sessionStorage
  if (window.localStorage) {
    var smessage = message + ' (local)';
    window.localStorage.setItem('item-' + storageIndex, smessage);
  }

  if (window.sessionStorage) {
    var smessage = message + ' (session)';
    window.sessionStorage.setItem('item-' + storageIndex, smessage);
  }
  storageIndex++;

  // write the message to the page
  output(message);

  // do an XHR
  var xhr = new XMLHttpRequest();
  // xhr.addEventListener("readystatechange", function() {logXhr(this)})
  xhr.open('GET', '../test/demo.json', true);
  xhr.send();

  // do an FETCH
  if (typeof fetch === 'function') {
    fetch('../test/demo.json');
  }
}

//------------------------------------------------------------------------------
function sqlSuccess(tx, resultSet) {
  console.log('SQL Success!');
}

//------------------------------------------------------------------------------
function sqlError(tx, error) {
  console.log('SQL Error ' + error.code + ': ' + error.message);
}

//------------------------------------------------------------------------------
var lastClickTime;

function addClick(tx) {
  var sql = 'insert into clicks (date) values (?)';
  tx.executeSql(sql, [lastClickTime], null, sqlError);
}

//------------------------------------------------------------------------------
function clearDatabase(tx, resultSet) {
  var sql = 'delete from clicks';
  tx.executeSql(sql, null, null, sqlError);
}

//------------------------------------------------------------------------------
function createDatabase(tx) {
  var schema = 'clicks (id integer primary key, date text)';
  var sql = 'create table if not exists ' + schema;

  tx.executeSql(sql, null, clearDatabase, sqlError);
}

//------------------------------------------------------------------------------
function createDatabase_other(tx) {
  var schema = 'clicks_other (id integer primary key, other text)';
  var sql = 'create table if not exists ' + schema;

  tx.executeSql(sql, null, null, sqlError);
}

//------------------------------------------------------------------------------
function openTheDatabase() {
  if (window.openDatabase) {
    db = window.openDatabase('clicks_db', '1.0', 'clicks_db', 8192);
    db.transaction(createDatabase);
  }
}

//------------------------------------------------------------------------------
function openTheOtherDatabase() {
  if (otherDB) return;

  if (window.openDatabase) {
    otherDB = window.openDatabase('clicks_other_db', '1.0', 'clicks_other_db', 8192);
    otherDB.transaction(createDatabase_other);
  }
}

//------------------------------------------------------------------------------
function output(string) {
  var element = document.createElement('div');
  element.innerHTML = string;
  outputElement.appendChild(element);
}

//------------------------------------------------------------------------------
function logXhr(xhr) {
  console.log('xhr: readyState: ' + xhr.readyState);
}

function injectTarget() {
  var script = document.createElement('script');
  script.src = '//' + location.host + location.pathname.replace('test/demo.html', '') + 'target.js';
  script.onload = function () {
    console.log('console right after target injected');
    throw Error('exception right after target injected');
  };
  if (location.href.indexOf('embedded=true') > -1) {
    script.setAttribute('embedded', 'true');
  }
  if (location.href.indexOf('rtc=true') > -1) {
    script.setAttribute('rtc', 'true');
  }
  if (location.href.indexOf('cdn=true') > -1) {
    script.setAttribute('cdn', 'https://cdn.jsdelivr.net/npm/chii/public');
  }
  document.head.appendChild(script);
}

injectTarget();
