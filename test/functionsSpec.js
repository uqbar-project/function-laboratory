'use strict';

const assert = this.chai.assert;

const passParameter = (block, parameterBlock) => {
  try {
    block.inputList[0].connection.connect(parameterBlock.outputConnection);
  } catch { }
};

const withWorkspace = (test) => {
  var workspace = new Blockly.Workspace();
  try {
    test(workspace);
  } finally {
    workspace.dispose();
  }
}

// This forces synchronous onchange() calls.
function forceBlocklyEvents() {
  Blockly.Events.fireNow_();
}

describe('Applying parameters', () => {
  describe('One parameter functions', () => {
    describe('even', () => {
      it('should be possible to apply numbers to it', () => {
        withWorkspace(workspace => {
          const even = workspace.newBlock('even');
          const zero = workspace.newBlock('math_number');
  
          passParameter(even, zero)

          forceBlocklyEvents();
  
          assert.include(even.getChildren(), zero);
        })
      }),
      it('should not be possible to apply strings to it', () => {
        withWorkspace(workspace => {
          const even = workspace.newBlock('even');
          const emptyString = workspace.newBlock('text');

          passParameter(even, emptyString)

          forceBlocklyEvents();

          assert.notInclude(even.getChildren(), emptyString);
        })
      });
    })
  });
});
