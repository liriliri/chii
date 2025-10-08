import { embedded, rtc } from './target/config';
import connectRtc from './target/connectRtc';
import connectServer from './target/connectServer';
import connectIframe from './target/connectIframe';
import chobitsu from 'chobitsu';
import Socket from 'licia/Socket';

type ConnectionDetails = {
  ws?: Socket;
  rtc?: RTCPeerConnection;
};

const connection: ConnectionDetails = {};
if (!embedded) {
  if (rtc) {
    connectRtc().then(({ ws, rtc }) => {
      connection.ws = ws;
      connection.rtc = rtc;
    });
  } else {
    connection.ws = connectServer().ws;
  }
} else {
  connectIframe();
}

module.exports = {
  chobitsu,
  connection,
};
