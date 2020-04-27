<link rel="shortcut icon" type="image/x-icon" href="favicon.ico">

<script src="blockly/blockly_compressed.js"></script>
<script src="blockly/blocks_compressed.js"></script>
<script src="blockly/msg/js/es.js"></script>
<script src="src/functions.js"></script>
<script src="src/colors.js"></script>

<div id="blocklyDiv"></div>

<xml id="toolbox" style="display: none">
  <block type="composition"></block>
  <block type="id"></block>
  <block type="even"></block>
  <block type="not"></block>
  <block type="length"></block>
  <block type="compare"></block>
  <block type="math_number"></block>
  <block type="math_arithmetic"></block>
  <block type="charAt"></block>
  <block type="text"></block>
 /xml>

<script>
  var workspace = Blockly.inject('blocklyDiv', {toolbox: document.getElementById('toolbox')})
</script>
  
