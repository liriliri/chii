import connector from './lib/connector';
import methods from './methods';

connector.on('message', async (message: any) => {
  const { method, params, id } = message;

  const resultMsg: any = {
    id,
  };

  try {
    resultMsg.result = await callMethod(method, params);
  } catch (e) {
    resultMsg.error = {
      message: e.message,
    };
  }

  connector.send(resultMsg);
});

async function callMethod(method: string, params: any) {
  if (methods[method]) {
    return methods[method](params) || {};
  } else {
    throw Error(`${method} unimplemented`);
  }
}
