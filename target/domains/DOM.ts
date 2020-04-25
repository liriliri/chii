import connector from '../lib/connector';
import * as stringifyNode from '../lib/stringifyNode';
import mutationObserver from '../lib/mutationObserver';
import $ from 'licia/$';
import isNull from 'licia/isNull';
import isEmpty from 'licia/isEmpty';
import each from 'licia/each';

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

export async function removeNode(params: any) {
  const node = stringifyNode.getNode(params.nodeId);

  $(node).remove();
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

  if (isNull(value)) {
    connector.trigger('DOM.attributeRemoved', {
      nodeId,
      name,
    });
  } else {
    connector.trigger('DOM.attributeModified', {
      nodeId,
      name,
      value,
    });
  }
});

mutationObserver.on('childList', (target: Node, addedNodes: NodeList, removedNodes: NodeList) => {
  const parentNodeId = stringifyNode.getNodeId(target);

  if (!isEmpty(addedNodes)) {
  }

  if (!isEmpty(removedNodes)) {
    each(removedNodes, node => {
      connector.trigger('DOM.childNodeRemoved', {
        nodeId: stringifyNode.getNodeId(node),
        parentNodeId,
      });
    });
  }
});
