import { embedded, rtc } from './target/config';
import connectRtc from './target/connectRtc';
import connectServer from './target/connectServer';
import connectIframe from './target/connectIframe';

if (!embedded) {
  if (rtc) {
    connectRtc()
  } else {
    connectServer();
  }
} else {
  connectIframe();
}
