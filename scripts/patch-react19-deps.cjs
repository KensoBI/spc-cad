const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function patchFile(relativePath, replacements) {
  const filePath = path.join(root, relativePath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Cannot patch missing file: ${relativePath}`);
  }

  let source = fs.readFileSync(filePath, 'utf8');
  let patched = source;

  for (const [before, after] of replacements) {
    if (after && patched.includes(after)) {
      continue;
    }

    if (!patched.includes(before) && after === '') {
      continue;
    }

    if (!patched.includes(before)) {
      throw new Error(`Patch target not found in ${relativePath}`);
    }

    patched = patched.replace(before, after);
  }

  if (patched !== source) {
    fs.writeFileSync(filePath, patched);
    console.log(`Patched ${relativePath}`);
  }
}

const rbdDefaults = `var defaultProps = {
  mode: 'standard',
  type: 'DEFAULT',
  direction: 'vertical',
  isDropDisabled: false,
  isCombineEnabled: false,
  ignoreContainerClipping: false,
  renderClone: null,
  getContainerForClone: getBody
};`;

const rbdRenamedDefaults = `var droppableDefaults = {
  mode: 'standard',
  type: 'DEFAULT',
  direction: 'vertical',
  isDropDisabled: false,
  isCombineEnabled: false,
  ignoreContainerClipping: false,
  renderClone: null,
  getContainerForClone: getBody
};`;

patchFile('node_modules/react-beautiful-dnd/dist/react-beautiful-dnd.esm.js', [
  [rbdDefaults, rbdRenamedDefaults],
  [
    `ConnectedDroppable.defaultProps = defaultProps;`,
    `var DroppableWithDefaultProps = function DroppableWithDefaultProps(props) {
  return React.createElement(ConnectedDroppable, _extends({}, droppableDefaults, props));
};`,
  ],
  [
    `export { DragDropContext, PublicDraggable as Draggable, ConnectedDroppable as Droppable, resetServerContext, useKeyboardSensor, useMouseSensor, useTouchSensor };`,
    `export { DragDropContext, PublicDraggable as Draggable, DroppableWithDefaultProps as Droppable, resetServerContext, useKeyboardSensor, useMouseSensor, useTouchSensor };`,
  ],
]);

patchFile('node_modules/react-beautiful-dnd/dist/react-beautiful-dnd.cjs.js', [
  [rbdDefaults, rbdRenamedDefaults],
  [
    `ConnectedDroppable.defaultProps = defaultProps;`,
    `var DroppableWithDefaultProps = function DroppableWithDefaultProps(props) {
  return React__default.createElement(ConnectedDroppable, _extends({}, droppableDefaults, props));
};`,
  ],
  [`exports.Droppable = ConnectedDroppable;`, `exports.Droppable = DroppableWithDefaultProps;`],
]);

patchFile('node_modules/react-beautiful-dnd/dist/react-beautiful-dnd.js', [
  [
    `  ${rbdDefaults.replaceAll('\n', '\n  ')}`,
    `  ${rbdRenamedDefaults.replaceAll('\n', '\n  ')}`,
  ],
  [
    `  ConnectedDroppable.defaultProps = defaultProps;`,
    `  var DroppableWithDefaultProps = function DroppableWithDefaultProps(props) {
    return React__default.createElement(ConnectedDroppable, Object.assign({}, droppableDefaults, props));
  };`,
  ],
  [`  exports.Droppable = ConnectedDroppable;`, `  exports.Droppable = DroppableWithDefaultProps;`],
]);

patchFile('node_modules/react-resizable/build/Resizable.js', [
  [`Resizable.propTypes = _propTypes.resizableProps;\n`, ''],
]);

patchFile('node_modules/react-resizable/build/ResizableBox.js', [
  [
    `// PropTypes are identical to <Resizable>, except that children are not strictly required to be present.
ResizableBox.propTypes = _objectSpread(_objectSpread({}, _propTypes2.resizableProps), {}, {
  children: _propTypes.default.element
});`,
    '',
  ],
]);
