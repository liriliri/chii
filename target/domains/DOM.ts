import connector from '../lib/connector';
import * as stringifyNode from '../lib/stringifyNode';

export async function getDocument() {
  return {
    root: stringifyNode.wrap(document, {
      depth: 2,
    }),
  };
}

export async function requestChildNodes(params: any) {
  const { nodeId } = params;

  connector.send({
    method: 'DOM.setChildNodes',
    params: {
      parentId: nodeId,
      nodes: stringifyNode.getChildNodes(params),
    },
  });
}
