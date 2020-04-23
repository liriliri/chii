import map from 'licia/map';
import filter from 'licia/filter';
import each from 'licia/each';
import trim from 'licia/trim';

const nodes = new Map();
const nodeIds = new Map();
let id = 0;

function getNodeId(node: any) {
  let nodeId = nodeIds.get(node);
  if (nodeId) return nodeId;

  nodeId = id++;
  nodeIds.set(node, nodeId);
  nodes.set(nodeId, node);

  return nodeId;
}

export function wrap(node: any, { depth = 1 } = {}) {
  const ret: any = {
    nodeName: node.nodeName,
    nodeType: node.nodeType,
    localName: node.localName || '',
    nodeValue: node.nodeValue || '',
    nodeId: getNodeId(node),
  };

  if (node.parentNode) {
    ret.parentId = getNodeId(node.parentNode);
  }

  if (node.attributes) {
    const attributes: string[] = [];
    each(node.attributes, ({ name, value }) => attributes.push(name, value));
    ret.attributes = attributes;
  }

  const childNodes = filterNodes(node.childNodes);
  ret.childNodeCount = childNodes.length;
  if (depth > 0) {
    ret.children = map(childNodes, node => wrap(node, { depth: depth - 1 }));
  }

  return ret;
}

export function getChildNodes(params: any) {
  const { nodeId, depth } = params;

  const node = nodes.get(nodeId);
  const childNodes = filterNodes(node.childNodes);

  return map(childNodes, node => wrap(node, { depth: depth - 1 }));
}

function filterNodes(childNodes: any[]) {
  return filter(childNodes, (node: any) => {
    return !(node.nodeType === 3 && trim(node.nodeValue) === '');
  });
}

export function getNode(nodeId: number) {
  return nodes.get(nodeId);
}
