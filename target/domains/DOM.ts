import connector from '../lib/connector';
import * as stringifyNode from '../lib/stringifyNode';
import mutationObserver from '../lib/mutationObserver';

export async function enable() {
  mutationObserver.observe();
}

export async function getDocument() {
  return {
    root: stringifyNode.wrap(document, {
      depth: 2,
    }),
  };
}

export async function requestChildNodes(params: any) {
  const { nodeId } = params;

  connector.trigger('DOM.setChildNodes', {
    parentId: nodeId,
    nodes: stringifyNode.getChildNodes(params),
  });
}

mutationObserver.on('attributes', (target: any, name: string) => {
  const nodeId = stringifyNode.getNodeId(target);
  const value = target.getAttribute(name);

  connector.trigger('DOM.attributeModified', {
    nodeId,
    name,
    value,
  });
});
