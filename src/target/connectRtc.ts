import Socket from 'licia/Socket';
import query from 'licia/query';
import chobitsu from 'chobitsu';
import { serverUrl, id } from './config';
import { getFavicon } from './util';

export default async function () {
  const proxy = `${serverUrl}proxy`;
  chobitsu.domain('Page').setProxy({
    proxy,
  });
  chobitsu.domain('Debugger').setProxy({
    proxy,
  });
  chobitsu.domain('CSS').setProxy({
    proxy,
  });

  const connection = new RTCPeerConnection({
    iceServers: [
      {
        urls: ['stun:stun.qq.com:3478'],
      },
    ],
  });

  connection.addEventListener('datachannel', event => {
    const { channel } = event;

    channel.onmessage = event => {
      chobitsu.sendRawMessage(event.data);
    };

    chobitsu.setOnMessage((message: string) => {
      channel.send(message);
    });
  });

  const ws = new Socket(
    `${serverUrl.replace(/^http/, 'ws')}target/${id}?${query.stringify({
      url: location.href,
      title: (window as any).ChiiTitle || document.title || 'Unknown',
      favicon: getFavicon(),
      rtc: true,
      '__chobitsu-hide__': true,
    })}`
  );

  connection.onicecandidate = event => {
    if (event.candidate) {
      ws.send(
        JSON.stringify({
          type: 'candidate',
          data: event.candidate,
        })
      );
    }
  };

  ws.on('message', async (event: MessageEvent<string>) => {
    const { type, data } = JSON.parse(event.data) as { type: string; data: any };
    if (type === 'offer') {
      connection.setRemoteDescription(new RTCSessionDescription(data));
      const answer = await connection.createAnswer();
      connection.setLocalDescription(answer);
      ws.send(
        JSON.stringify({
          type: 'answer',
          data: answer,
        })
      );
    } else if (type === 'candidate') {
      connection.addIceCandidate(data);
    }
  });

  return { ws, rtc: connection };
}
