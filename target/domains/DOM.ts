import connector from '../lib/connector';
import * as stringifyNode from '../lib/stringifyNode';
import mutationObserver from '../lib/mutationObserver';
import $ from 'licia/$';
import isNull from 'licia/isNull';
import isEmpty from 'licia/isEmpty';
import each from 'licia/each';
import trim from 'licia/trim';

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
  const node = stringifyNode.getNode(params.nodeId);

  return {
    outerHTML: node.outerHTML,
  };
}

export function moveTo(params: any) {
  const { nodeId, targetNodeId } = params;

  const node = stringifyNode.getNode(nodeId);
  const targetNode = stringifyNode.getNode(targetNodeId);

  targetNode.appendChild(node);
}

export function removeNode(params: any) {
  const node = stringifyNode.getNode(params.nodeId);

  $(node).remove();
}

export function requestChildNodes(params: any) {
  const { nodeId, depth = 1 } = params;
  const node = stringifyNode.getNode(nodeId);

  connector.trigger('DOM.setChildNodes', {
    parentId: nodeId,
    nodes: stringifyNode.getChildNodes(node, depth),
  });
}

export function setAttributesAsText(params: any) {
  const { name, text, nodeId } = params;

  const node = stringifyNode.getNode(nodeId);
  if (name) {
    node.removeAttribute(name);
  }
  $(node).attr(parseAttributes(text));
}

export function setOuterHTML(params: any) {
  const { nodeId, outerHTML } = params;

  const node = stringifyNode.getNode(nodeId);
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
  const nodeId = stringifyNode.getNodeId(target);
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
  const parentNodeId = stringifyNode.getNodeId(target);
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
      const previousNodeId = previousNode ? stringifyNode.getNodeId(previousNode) : 0;
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
      const nodeId = stringifyNode.getNodeId(node);
      if (!nodeId) {
        return childNodeCountUpdated();
      }
      connector.trigger('DOM.childNodeRemoved', {
        nodeId: stringifyNode.getNodeId(node),
        parentNodeId,
      });
    });
  }
});
