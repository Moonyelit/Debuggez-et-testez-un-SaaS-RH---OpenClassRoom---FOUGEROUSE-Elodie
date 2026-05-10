// Mock Bootstrap 5 Modal
global.bootstrap = {
  Modal: class {
    constructor(element) {
      this.element = element;
    }
    show() {}
    hide() {}
  }
};
