export function getResourceTree() {
  return {
    frameTree: {
      frame: {
        id: '',
        mimeType: 'text/html',
        securityOrigin: location.origin,
        url: location.href,
      },
      resources: [],
    },
  };
}
