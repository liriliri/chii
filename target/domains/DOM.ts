import connector from '../lib/connector';
import * as stringifyNode from '../lib/stringifyNode';
import mutationObserver from '../lib/mutationObserver';
import $ from 'licia/$';
import isNull from 'licia/isNull';
import isEmpty from 'licia/isEmpty';
import each from 'licia/each';
import trim from 'licia/trim';

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

export async function setAttributesAsText(params: any) {
  const { name, text, nodeId } = params;

  const node = stringifyNode.getNode(nodeId);
  if (name) {
    node.removeAttribute(name);
  }
  $(node).attr(parseAttributes(text));
}

function parseAttributes(text: string) {
  const texts = text.split(/\s+/);

  const attributes: any = {};
  each(texts, text => {
    const equalPos = text.indexOf('=');
    let name = '';
    let value = '';
    if (equalPos < 0) {
      name = text;
    } else {
      name = text.slice(0, equalPos);
      value = trim(text.slice(equalPos + 1), '"');
    }
    return (attributes[name] = value);
  });

  return attributes;
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
    each(addedNodes, node => {
      const params: any = {
        node: stringifyNode.wrap(node, {
          depth: 0,
        }),
        parentNodeId,
      };

      const previousNodeId = stringifyNode.getPreviousNodeId(node);
      if (previousNodeId) {
        params.previousNodeId = previousNodeId;
      }
      connector.trigger('DOM.childNodeInserted', params);
    });
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
