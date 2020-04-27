import connector from '../lib/connector';
import * as stringifyNode from '../lib/stringifyNode';
import { getNode, getNodeId } from '../lib/stringifyNode';
import * as stringifyObj from '../lib/stringifyObj';
import mutationObserver from '../lib/mutationObserver';
import $ from 'licia/$';
import isNull from 'licia/isNull';
import isEmpty from 'licia/isEmpty';
import each from 'licia/each';
import trim from 'licia/trim';
import { setGlobal } from '../lib/evaluate';

export function copyTo(params: any) {
  const { nodeId, targetNodeId } = params;

  const node = getNode(nodeId);
  const targetNode = getNode(targetNodeId);

  const cloneNode = node.cloneNode(true);
  targetNode.appendChild(cloneNode);
}

export function enable() {
  mutationObserver.observe();
  stringifyNode.clear();
}

export function getDocument() {
  return {
    root: stringifyNode.wrap(document, {
      depth: 2,
    }),
  };
}

export function getOuterHTML(params: any) {
  const node = getNode(params.nodeId);

  return {
    outerHTML: node.outerHTML,
  };
}

export function moveTo(params: any) {
  const { nodeId, targetNodeId } = params;

  const node = getNode(nodeId);
  const targetNode = getNode(targetNodeId);

  targetNode.appendChild(node);
}

export function removeNode(params: any) {
  const node = getNode(params.nodeId);

  $(node).remove();
}

export function requestChildNodes(params: any) {
  const { nodeId, depth = 1 } = params;
  const node = getNode(nodeId);

  connector.trigger('DOM.setChildNodes', {
    parentId: nodeId,
    nodes: stringifyNode.getChildNodes(node, depth),
  });
}

export function requestNode(params: any) {
  const node = stringifyObj.getObj(params.objectId);

  return {
    nodeId: getNodeId(node),
  };
}

export function resolveNode(params: any) {
  const node = getNode(params.nodeId);

  return {
    object: stringifyObj.wrap(node),
  };
}

export function setAttributesAsText(params: any) {
  const { name, text, nodeId } = params;

  const node = getNode(nodeId);
  if (name) {
    node.removeAttribute(name);
  }
  $(node).attr(parseAttributes(text));
}

const history: any[] = [];

export function setInspectedNode(params: any) {
  const node = getNode(params.nodeId);
  history.unshift(node);
  if (history.length > 5) history.pop();
  for (let i = 0; i < 5; i++) {
    setGlobal(`$${i}`, history[i]);
  }
}

export function setNodeValue(params: any) {
  const { nodeId, value } = params;
  const node = getNode(nodeId);
  node.nodeValue = value;
}

export function setOuterHTML(params: any) {
  const { nodeId, outerHTML } = params;

  const node = getNode(nodeId);
  node.outerHTML = outerHTML;
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
  const nodeId = getNodeId(target);
  if (!nodeId) return;

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
  const parentNodeId = getNodeId(target);
  if (!parentNodeId) return;

  function childNodeCountUpdated() {
    connector.trigger('DOM.childNodeCountUpdated', {
      childNodeCount: stringifyNode.wrap(target, {
        depth: 0,
      }).childNodeCount,
      nodeId: parentNodeId,
    });
  }

  if (!isEmpty(addedNodes)) {
    each(addedNodes, node => {
      const previousNode = stringifyNode.getPreviousNode(node);
      const previousNodeId = previousNode ? getNodeId(previousNode) : 0;
      const params: any = {
        node: stringifyNode.wrap(node, {
          depth: 0,
        }),
        parentNodeId,
        previousNodeId,
      };

      childNodeCountUpdated();
      connector.trigger('DOM.childNodeInserted', params);
    });
  }

  if (!isEmpty(removedNodes)) {
    each(removedNodes, node => {
      const nodeId = getNodeId(node);
      if (!nodeId) {
        return childNodeCountUpdated();
      }
      connector.trigger('DOM.childNodeRemoved', {
        nodeId: getNodeId(node),
        parentNodeId,
      });
    });
  }
});

mutationObserver.on('characterData', (target: Node) => {
  const nodeId = getNodeId(target);
  if (!nodeId) return;

  connector.trigger('DOM.characterDataModified', {
    characterData: target.nodeValue,
    nodeId,
  });
});
