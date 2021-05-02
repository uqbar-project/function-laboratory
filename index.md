<meta charset="UTF-8">
<link rel="shortcut icon" type="image/x-icon" href="favicon.ico">
<link rel="stylesheet" href="index.css">

<script src="dependencies/jquery-3.6.0.min.js"></script>
<script src="dependencies/notify.min.js"></script>
<script src="dependencies/blockly/blockly_compressed.js"></script>
<script src="dependencies/blockly/blocks_compressed.js"></script>
<script src="dependencies/blockly/msg/js/es.js"></script>
<script src="src/partialApply.js"></script>
<script src="src/renaming.js"></script>
<script src="src/constraintSolving.js"></script>
<script src="src/typeSystem.js"></script>
<script src="src/validator.js"></script>
<script src="src/colors.js"></script>
<script src="src/utils.js"></script>
<script src="src/functions.js"></script>

<div id="blocklyDiv" style="height: 500px; width: inherit;"></div>

<xml id="toolbox" style="display: none">
  <category name="Funciones">
    <block type="composition"></block>
    <category name="Matemáticas">
      <block type="even"></block>
      <block type="compare"></block>
      <block type="math_arithmetic"></block>
    </category>
    <category name="Lógicas">
      <block type="not"></block>
    </category>
    <category name="Strings">
      <block type="length"></block>
      <block type="charAt"></block>
    </category>
    <category name="Listas">
      <block type="any"></block>
      <block type="all"></block>
      <block type="filter"></block>
      <block type="map"></block>
      <block type="maximum"></block>
      <block type="minimum"></block>
      <block type="fold"></block>
      <block type="at"></block>
    </category>
    <category name="Otras">
      <block type="id"></block>
      <block type="apply"></block>
    </category>
  </category>
  <category name="Literales">
    <block type="logic_boolean"></block>
    <block type="math_number"></block>
    <block type="text"></block>
    <block type="list"></block>
  </category>
  
</xml>

<script>
  var wrapper = document.getElementsByClassName("wrapper")[0]
  if(wrapper) {
       wrapper.style.width = "90%" // Modify Jekyll theme
  }
  var workspace = Blockly.inject('blocklyDiv', {toolbox: document.getElementById('toolbox')})
</script>
