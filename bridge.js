const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyA5kK4d3H5o_IXmGL_XkaqD9AskpetJWRg",
  authDomain: "cansat-bdba7.firebaseapp.com",
  databaseURL: "https://cansat-bdba7-default-rtdb.firebaseio.com",
  projectId: "cansat-bdba7",
  storageBucket: "cansat-bdba7.firebasestorage.app",
  messagingSenderId: "476265577879",
  appId: "1:476265577879:web:d002a9cf0a6612632098d2"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

const port = new SerialPort({
  path: 'COM14',
  baudRate: 115200
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

function toNum(val) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

parser.on('data', (line) => {
  const valores = line.trim().split(',');
  if (valores.length >= 13) {
    const datos = {
      ax: toNum(valores[0]),
      ay: toNum(valores[1]),
      az: toNum(valores[2]),
      gx: toNum(valores[3]),
      gy: toNum(valores[4]),
      gz: toNum(valores[5]),
      heading: toNum(valores[6]),
      temp: toNum(valores[7]),
      press: toNum(valores[8]),
      alt: toNum(valores[9]),
      lat: toNum(valores[10]),
      lng: toNum(valores[11]),
      sats: toNum(valores[13]),
      timestamp: Date.now()
    };

    set(ref(db, 'cansat/telemetria'), datos)
      .then(() => console.log('Enviado:', JSON.stringify(datos)))
      .catch(err => console.error('Error Firebase:', err.message));
  }
});

port.on('error', (err) => {
  console.error('Error puerto serial:', err.message);
});

console.log('Bridge iniciado. Esperando datos del CanSat...');