import { embedded } from './target/config';
import connectServer from './target/connectServer';
import connectIframe from './target/connectIframe';

if (!embedded) {
  connectServer();
} else {
  connectIframe();
}
