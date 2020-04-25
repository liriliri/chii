import Emitter from 'licia/Emitter';
import each from 'licia/each';

class Observer extends Emitter {
  private observer: MutationObserver;
  constructor() {
    super();
    this.observer = new MutationObserver(mutations => {
      each(mutations, mutation => this.handleMutation(mutation));
    });
  }
  observe() {
    this.observer.observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  }
  private handleMutation(mutation: MutationRecord) {
    if (mutation.type === 'attributes') {
      this.emit('attributes', mutation.target, mutation.attributeName);
    }
  }
}

export default new Observer();
