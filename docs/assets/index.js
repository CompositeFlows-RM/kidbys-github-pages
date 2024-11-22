var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
var RECYCLED_NODE = 1;
var LAZY_NODE = 2;
var TEXT_NODE = 3;
var EMPTY_OBJ = {};
var EMPTY_ARR = [];
var map = EMPTY_ARR.map;
var isArray = Array.isArray;
var defer = typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : setTimeout;
var createClass = function(obj) {
  var out = "";
  if (typeof obj === "string") return obj;
  if (isArray(obj) && obj.length > 0) {
    for (var k = 0, tmp; k < obj.length; k++) {
      if ((tmp = createClass(obj[k])) !== "") {
        out += (out && " ") + tmp;
      }
    }
  } else {
    for (var k in obj) {
      if (obj[k]) {
        out += (out && " ") + k;
      }
    }
  }
  return out;
};
var merge = function(a, b) {
  var out = {};
  for (var k in a) out[k] = a[k];
  for (var k in b) out[k] = b[k];
  return out;
};
var batch = function(list) {
  return list.reduce(function(out, item) {
    return out.concat(
      !item || item === true ? 0 : typeof item[0] === "function" ? [item] : batch(item)
    );
  }, EMPTY_ARR);
};
var isSameAction = function(a, b) {
  return isArray(a) && isArray(b) && a[0] === b[0] && typeof a[0] === "function";
};
var shouldRestart = function(a, b) {
  if (a !== b) {
    for (var k in merge(a, b)) {
      if (a[k] !== b[k] && !isSameAction(a[k], b[k])) return true;
      b[k] = a[k];
    }
  }
};
var patchSubs = function(oldSubs, newSubs, dispatch) {
  for (var i = 0, oldSub, newSub, subs = []; i < oldSubs.length || i < newSubs.length; i++) {
    oldSub = oldSubs[i];
    newSub = newSubs[i];
    subs.push(
      newSub ? !oldSub || newSub[0] !== oldSub[0] || shouldRestart(newSub[1], oldSub[1]) ? [
        newSub[0],
        newSub[1],
        newSub[0](dispatch, newSub[1]),
        oldSub && oldSub[2]()
      ] : oldSub : oldSub && oldSub[2]()
    );
  }
  return subs;
};
var patchProperty = function(node, key, oldValue, newValue, listener, isSvg) {
  if (key === "key") ;
  else if (key === "style") {
    for (var k in merge(oldValue, newValue)) {
      oldValue = newValue == null || newValue[k] == null ? "" : newValue[k];
      if (k[0] === "-") {
        node[key].setProperty(k, oldValue);
      } else {
        node[key][k] = oldValue;
      }
    }
  } else if (key[0] === "o" && key[1] === "n") {
    if (!((node.actions || (node.actions = {}))[key = key.slice(2).toLowerCase()] = newValue)) {
      node.removeEventListener(key, listener);
    } else if (!oldValue) {
      node.addEventListener(key, listener);
    }
  } else if (!isSvg && key !== "list" && key in node) {
    node[key] = newValue == null || newValue == "undefined" ? "" : newValue;
  } else if (newValue == null || newValue === false || key === "class" && !(newValue = createClass(newValue))) {
    node.removeAttribute(key);
  } else {
    node.setAttribute(key, newValue);
  }
};
var createNode = function(vdom, listener, isSvg) {
  var ns = "http://www.w3.org/2000/svg";
  var props = vdom.props;
  var node = vdom.type === TEXT_NODE ? document.createTextNode(vdom.name) : (isSvg = isSvg || vdom.name === "svg") ? document.createElementNS(ns, vdom.name, { is: props.is }) : document.createElement(vdom.name, { is: props.is });
  for (var k in props) {
    patchProperty(node, k, null, props[k], listener, isSvg);
  }
  for (var i = 0, len = vdom.children.length; i < len; i++) {
    node.appendChild(
      createNode(
        vdom.children[i] = getVNode(vdom.children[i]),
        listener,
        isSvg
      )
    );
  }
  return vdom.node = node;
};
var getKey = function(vdom) {
  return vdom == null ? null : vdom.key;
};
var patch = function(parent, node, oldVNode, newVNode, listener, isSvg) {
  if (oldVNode === newVNode) ;
  else if (oldVNode != null && oldVNode.type === TEXT_NODE && newVNode.type === TEXT_NODE) {
    if (oldVNode.name !== newVNode.name) node.nodeValue = newVNode.name;
  } else if (oldVNode == null || oldVNode.name !== newVNode.name) {
    node = parent.insertBefore(
      createNode(newVNode = getVNode(newVNode), listener, isSvg),
      node
    );
    if (oldVNode != null) {
      parent.removeChild(oldVNode.node);
    }
  } else {
    var tmpVKid;
    var oldVKid;
    var oldKey;
    var newKey;
    var oldVProps = oldVNode.props;
    var newVProps = newVNode.props;
    var oldVKids = oldVNode.children;
    var newVKids = newVNode.children;
    var oldHead = 0;
    var newHead = 0;
    var oldTail = oldVKids.length - 1;
    var newTail = newVKids.length - 1;
    isSvg = isSvg || newVNode.name === "svg";
    for (var i in merge(oldVProps, newVProps)) {
      if ((i === "value" || i === "selected" || i === "checked" ? node[i] : oldVProps[i]) !== newVProps[i]) {
        patchProperty(node, i, oldVProps[i], newVProps[i], listener, isSvg);
      }
    }
    while (newHead <= newTail && oldHead <= oldTail) {
      if ((oldKey = getKey(oldVKids[oldHead])) == null || oldKey !== getKey(newVKids[newHead])) {
        break;
      }
      patch(
        node,
        oldVKids[oldHead].node,
        oldVKids[oldHead],
        newVKids[newHead] = getVNode(
          newVKids[newHead++],
          oldVKids[oldHead++]
        ),
        listener,
        isSvg
      );
    }
    while (newHead <= newTail && oldHead <= oldTail) {
      if ((oldKey = getKey(oldVKids[oldTail])) == null || oldKey !== getKey(newVKids[newTail])) {
        break;
      }
      patch(
        node,
        oldVKids[oldTail].node,
        oldVKids[oldTail],
        newVKids[newTail] = getVNode(
          newVKids[newTail--],
          oldVKids[oldTail--]
        ),
        listener,
        isSvg
      );
    }
    if (oldHead > oldTail) {
      while (newHead <= newTail) {
        node.insertBefore(
          createNode(
            newVKids[newHead] = getVNode(newVKids[newHead++]),
            listener,
            isSvg
          ),
          (oldVKid = oldVKids[oldHead]) && oldVKid.node
        );
      }
    } else if (newHead > newTail) {
      while (oldHead <= oldTail) {
        node.removeChild(oldVKids[oldHead++].node);
      }
    } else {
      for (var i = oldHead, keyed = {}, newKeyed = {}; i <= oldTail; i++) {
        if ((oldKey = oldVKids[i].key) != null) {
          keyed[oldKey] = oldVKids[i];
        }
      }
      while (newHead <= newTail) {
        oldKey = getKey(oldVKid = oldVKids[oldHead]);
        newKey = getKey(
          newVKids[newHead] = getVNode(newVKids[newHead], oldVKid)
        );
        if (newKeyed[oldKey] || newKey != null && newKey === getKey(oldVKids[oldHead + 1])) {
          if (oldKey == null) {
            node.removeChild(oldVKid.node);
          }
          oldHead++;
          continue;
        }
        if (newKey == null || oldVNode.type === RECYCLED_NODE) {
          if (oldKey == null) {
            patch(
              node,
              oldVKid && oldVKid.node,
              oldVKid,
              newVKids[newHead],
              listener,
              isSvg
            );
            newHead++;
          }
          oldHead++;
        } else {
          if (oldKey === newKey) {
            patch(
              node,
              oldVKid.node,
              oldVKid,
              newVKids[newHead],
              listener,
              isSvg
            );
            newKeyed[newKey] = true;
            oldHead++;
          } else {
            if ((tmpVKid = keyed[newKey]) != null) {
              patch(
                node,
                node.insertBefore(tmpVKid.node, oldVKid && oldVKid.node),
                tmpVKid,
                newVKids[newHead],
                listener,
                isSvg
              );
              newKeyed[newKey] = true;
            } else {
              patch(
                node,
                oldVKid && oldVKid.node,
                null,
                newVKids[newHead],
                listener,
                isSvg
              );
            }
          }
          newHead++;
        }
      }
      while (oldHead <= oldTail) {
        if (getKey(oldVKid = oldVKids[oldHead++]) == null) {
          node.removeChild(oldVKid.node);
        }
      }
      for (var i in keyed) {
        if (newKeyed[i] == null) {
          node.removeChild(keyed[i].node);
        }
      }
    }
  }
  return newVNode.node = node;
};
var propsChanged = function(a, b) {
  for (var k in a) if (a[k] !== b[k]) return true;
  for (var k in b) if (a[k] !== b[k]) return true;
};
var getTextVNode = function(node) {
  return typeof node === "object" ? node : createTextVNode(node);
};
var getVNode = function(newVNode, oldVNode) {
  return newVNode.type === LAZY_NODE ? ((!oldVNode || !oldVNode.lazy || propsChanged(oldVNode.lazy, newVNode.lazy)) && ((oldVNode = getTextVNode(newVNode.lazy.view(newVNode.lazy))).lazy = newVNode.lazy), oldVNode) : newVNode;
};
var createVNode = function(name, props, children, node, key, type) {
  return {
    name,
    props,
    children,
    node,
    type,
    key
  };
};
var createTextVNode = function(value, node) {
  return createVNode(value, EMPTY_OBJ, EMPTY_ARR, node, void 0, TEXT_NODE);
};
var recycleNode = function(node) {
  return node.nodeType === TEXT_NODE ? createTextVNode(node.nodeValue, node) : createVNode(
    node.nodeName.toLowerCase(),
    EMPTY_OBJ,
    map.call(node.childNodes, recycleNode),
    node,
    void 0,
    RECYCLED_NODE
  );
};
var h = function(name, props) {
  for (var vdom, rest = [], children = [], i = arguments.length; i-- > 2; ) {
    rest.push(arguments[i]);
  }
  while (rest.length > 0) {
    if (isArray(vdom = rest.pop())) {
      for (var i = vdom.length; i-- > 0; ) {
        rest.push(vdom[i]);
      }
    } else if (vdom === false || vdom === true || vdom == null) ;
    else {
      children.push(getTextVNode(vdom));
    }
  }
  props = props || EMPTY_OBJ;
  return typeof name === "function" ? name(props, children) : createVNode(name, props, children, void 0, props.key);
};
var app = function(props) {
  var state = {};
  var lock = false;
  var view = props.view;
  var node = props.node;
  var vdom = node && recycleNode(node);
  var subscriptions = props.subscriptions;
  var subs = [];
  var listener = function(event) {
    dispatch(this.actions[event.type], event);
  };
  var setState = function(newState) {
    if (state !== newState) {
      state = newState;
      if (subscriptions) {
        subs = patchSubs(subs, batch([subscriptions(state)]), dispatch);
      }
      if (view && !lock) defer(render, lock = true);
    }
    return state;
  };
  var dispatch = (props.middleware || function(obj) {
    return obj;
  })(function(action, props2) {
    return typeof action === "function" ? dispatch(action(state, props2)) : isArray(action) ? typeof action[0] === "function" || isArray(action[0]) ? dispatch(
      action[0],
      typeof action[1] === "function" ? action[1](props2) : action[1]
    ) : (batch(action.slice(1)).map(function(fx) {
      fx && fx[0](dispatch, fx[1]);
    }, setState(action[0])), state) : setState(action);
  });
  var render = function() {
    lock = false;
    node = patch(
      node.parentNode,
      node,
      vdom,
      vdom = getTextVNode(view(state)),
      listener
    );
  };
  dispatch(props.init);
};
const initSubscriptions = (state) => {
  if (!state) {
    return [];
  }
  const subscriptions = [];
  return subscriptions;
};
const initEvents = {
  onRenderFinished: () => {
  },
  registerGlobalEvents: () => {
    window.onresize = () => {
    };
  }
};
const gStateCode = {
  cloneState: (state) => {
    let newState = { ...state };
    return newState;
  }
};
const pentSideValidationCode = {
  validateValues: (pent) => {
    let alertText = "";
    if (pent.maxStudDistance == null) {
      alertText += `maxStudDistance is undefined
    `;
    }
    if (pent.framingSizePivot == null) {
      alertText += `framingSizePivot is undefined
    `;
    }
    if (pent.floorOverhangStandard == null) {
      alertText += `floorOverhangStandard is undefined
    `;
    }
    if (pent.floorOverhangHeavy == null) {
      alertText += `floorOverhangHeavy is undefined
    `;
    }
    if (pent.maxPanelLength == null) {
      alertText += `maxPanelLength is undefined
    `;
    }
    if (pent.floorDepth == null) {
      alertText += `floorDepth is undefined
    `;
    }
    if (pent.frontHeight == null) {
      alertText += `frontHeight is undefined
    `;
    }
    if (pent.backHeight == null) {
      alertText += `backHeight is undefined
    `;
    }
    if (pent.framingWidth == null) {
      alertText += `framingWidth is undefined
    `;
    }
    if (pent.framingDepth == null) {
      alertText += `framingDepth is undefined
    `;
    }
    if (pent.roofRailWidth == null) {
      alertText += `roofRailWidth is undefined
    `;
    }
    if (pent.roofRailDepth == null) {
      alertText += `roofRailDepth is undefined
    `;
    }
    if (pent.sideCount == null) {
      alertText += `sideCount is undefined
    `;
    }
    if (pent.buildPanelsTogether == null) {
      alertText += `buildPanelsTogether is undefined
    `;
    }
    if (pent.shiplapBottomOverhang == null) {
      alertText += `shiplapBottomOverhang is undefined
    `;
    }
    if (pent.shiplapButtingWidth == null) {
      alertText += `shiplapButtingWidth is undefined
    `;
    }
    if (pent.shiplapDepth == null) {
      alertText += `shiplapDepth is undefined
    `;
    }
    if (pent.maxStudDistance < 100 || pent.maxStudDistance > 1e3) {
      alertText += `maxStudDistance is less than 100 or greater than 1000
    `;
    }
    if (pent.framingSizePivot < 10 || pent.framingSizePivot > 1e3) {
      alertText += `framingSizePivot is undefined
    `;
    }
    if (pent.floorOverhangStandard < 1 || pent.floorOverhangStandard > 100) {
      alertText += `floorOverhangStandard is less than 1 or greater than 100
    `;
    }
    if (pent.floorOverhangHeavy < 1 || pent.floorOverhangHeavy > 100) {
      alertText += `floorOverhangHeavy is less than 100 or greater than 100
    `;
    }
    if (pent.maxPanelLength < 100 || pent.maxPanelLength > 1e4) {
      alertText += `maxPanelLength is less than 100 or greater than 5000
    `;
    }
    if (pent.floorDepth && (pent.floorDepth < 100 || pent.floorDepth > 2e4)) {
      alertText += `floorDepth is less than 100 or greater than 20000
    `;
    }
    if (pent.frontHeight && (pent.frontHeight < 100 || pent.frontHeight > 4e3)) {
      alertText += `frontHeight is less than 100 or greater than 4000
    `;
    }
    if (pent.backHeight && (pent.backHeight < 100 || pent.backHeight > 4e3)) {
      alertText += `backHeight is less than 100 or greater than 4000
    `;
    }
    if (pent.framingWidth < 10 || pent.framingWidth > 300) {
      alertText += `framingWidth is less than 10 or greater than 300
    `;
    }
    if (pent.framingDepth < 10 || pent.framingDepth > 300) {
      alertText += `framingDepth is less than 10 or greater than 300
    `;
    }
    if (pent.roofRailWidth < 10 || pent.roofRailWidth > 300) {
      alertText += `roofRailWidth is less than 10 or greater than 300
    `;
    }
    if (pent.roofRailDepth < 10 || pent.roofRailDepth > 300) {
      alertText += `roofRailDepth is less than 10 or greater than 300
    `;
    }
    if (pent.sideCount < 1 || pent.sideCount > 2) {
      alertText += `sideCount is less than 1 or greater than 2
    `;
    }
    if (pent.shiplapBottomOverhang < 1 || pent.shiplapBottomOverhang > 100) {
      alertText += `shiplapBottomOverhang is less than 1 or greater than 100
    `;
    }
    if (pent.shiplapButtingWidth < 10 || pent.shiplapButtingWidth > 1e3) {
      alertText += `shiplapButtingWidth is less than 10 or greater than 1000
    `;
    }
    if (pent.shiplapDepth < 10 || pent.shiplapDepth > 1e3) {
      alertText += `shiplapDepth is less than 10 or greater than 1000
    `;
    }
    if (alertText && alertText.length > 0) {
      alert(alertText);
    }
  }
};
let currentPageChildren = [];
let pages = [];
const addPage = () => {
  currentPageChildren = [];
  pages.push({
    type: "page",
    properties: {},
    value: currentPageChildren
  });
};
const addUiElement = (type, value, properties = null) => {
  currentPageChildren.push({
    type,
    properties,
    value
  });
};
const addUiChildElement = (parentArray, type, value, properties = null) => {
  parentArray.push({
    type,
    properties,
    value
  });
};
const calculateFrameUprightAdjustment = (horizontalDistanceFromFront, roofAngleRadians) => {
  const adjustment = horizontalDistanceFromFront * Math.tan(roofAngleRadians);
  return adjustment;
};
const printShiplapTimberRequirements = (printPanelName, shiplapButtingWidthInt, shiplapDepthInt) => {
  addPage();
  if (printPanelName && printPanelName.length > 0) {
    addUiElement(
      "h1",
      `Panel ${printPanelName}`
    );
  }
  addUiElement(
    "h2",
    `Shiplap cutting list`
  );
  addUiElement(
    "h3",
    `Timber requirements:`,
    { class: "top-padded" }
  );
  const children = [];
  addUiElement(
    "ul",
    children
  );
  addUiChildElement(
    children,
    "li",
    `Shiplap with a back butting width of ${shiplapButtingWidthInt}mm and depth of ${shiplapDepthInt}mm`
  );
};
const printShiplapCuttingList = (pent, printShiplapBoardCount, printFrameBottomLength, printPanelName = "") => {
  printShiplapTimberRequirements(
    printPanelName,
    pent.shiplapButtingWidth,
    pent.shiplapDepth
  );
  addUiElement(
    "h3",
    "Shiplap boards"
  );
  addUiElement(
    "p",
    "YY Cut both ends square."
  );
  addUiElement(
    "p",
    `Cut ${printShiplapBoardCount} lengths at the following measurement:`
  );
  const children = [];
  addUiElement(
    "ul",
    children
  );
  addUiChildElement(
    children,
    "li",
    `${printFrameBottomLength}mm`
  );
};
const printCladdingInstructions = (pent, printPanelName) => {
  addPage();
  if (printPanelName && printPanelName.length > 0) {
    addUiElement(
      "h1",
      `Panel ${printPanelName}`
    );
  }
  addUiElement(
    "h2",
    `Shiplap cladding instructions`
  );
  addUiElement(
    "p",
    `Start at the panel bottom and work upwards.`
  );
  addUiElement(
    "p",
    `On pent sides the shiplap finishes flush with the frame.`
  );
  addUiElement(
    "p",
    `The first board must overhang the bottom rail downwards by bottom overhang shown below. Use a set square to make sure this is the case at both ends of the board.`
  );
  addUiElement(
    "p",
    `Make sure all shiplap edges are flush with the frame before fixing.`
  );
  addUiElement(
    "p",
    `Nail one board at a time while pulling down hard against the already fixed boards - to prevent any gaps between the boards showing on the inside shed when finished.`
  );
  const children = [];
  addUiElement(
    "ul",
    children
  );
  addUiChildElement(
    children,
    "li",
    `bottom overhang: ${pent.shiplapBottomOverhang}mm`
  );
};
const printFrameAssemblyInstructions = (printPanelName) => {
  addPage();
  if (printPanelName && printPanelName.length > 0) {
    addUiElement(
      "h1",
      `Panel ${printPanelName}`
    );
  }
  addUiElement(
    "h2",
    `Frame assembly instructions`
  );
  addUiElement(
    "p",
    `Sides should be mirror images - BEWARE - an all too easy mistake to make is to build them as identical instead.
The best way to prevent this mistake, and indeed cladding ones, is to assemble all 4 sides on top of the floor and then mark CLEARLY the faces that need cladding and any cladding overlaps.
If this is not possible, place the two sides on top of each other with the sides you want cladded facing up. Make sure the 2 top slopes point in opposite directions. Then mark CLEARLY the top face of each side as the one needing cladding.`
  );
  addUiElement(
    "p",
    `Make sure all edges are flush before fixing.`
  );
  addUiElement(
    "p",
    `Use 2 screws to fix each end of an upright to the top and bottom rails.`
  );
  addUiElement(
    "p",
    `When screwing the 2 outer frame uprights pilot the top and bottom rails first, otherwise the rails will split.`
  );
  addUiElement(
    "p",
    `When piloting the top frame rail remember it is angled, so drill at the same slant as the slant on the cut face.`
  );
};
const printFrameTimberRequirements = (printPanelName, framingSize) => {
  addPage();
  if (printPanelName && printPanelName.length > 0) {
    addUiElement(
      "h1",
      `Panel ${printPanelName}`
    );
  }
  addUiElement(
    "h2",
    `Frame cutting list`
  );
  addUiElement(
    "h3",
    `Timber requirements:`,
    { class: "top-padded" }
  );
  const children = [];
  addUiElement(
    "ul",
    children
  );
  addUiChildElement(
    children,
    "li",
    `${framingSize} framing`
  );
};
const printFrameBottom = (printCountLengths, printPanelFrameBottomLength, framingSize, printPanelName = "") => {
  printFrameTimberRequirements(
    printPanelName,
    framingSize
  );
  addUiElement(
    "h3",
    "Frame bottom"
  );
  addUiElement(
    "p",
    "Cut both ends square."
  );
  addUiElement(
    "p",
    `Cut ${printCountLengths} of the following measurement:`
  );
  const children = [];
  addUiElement(
    "ul",
    children
  );
  addUiChildElement(
    children,
    "li",
    `${printPanelFrameBottomLength}mm`
  );
};
const printFrameTop = (printCountLengths, printPanelFrameTopLengthRoundedInt, roofAngleDegreesRounded, framingSize, printPanelName = "") => {
  printFrameTimberRequirements(
    printPanelName,
    framingSize
  );
  addUiElement(
    "h3",
    "Frame top"
  );
  addUiElement(
    "p",
    `Cut both ends at an angle of ${roofAngleDegreesRounded}°.`
  );
  addUiElement(
    "p",
    "The angled ends must be parallel - ie face in the same direction."
  );
  addUiElement(
    "p",
    `The angle should be on the shorter face of the framing - the depth.`
  );
  addUiElement(
    "p",
    `Cut ${printCountLengths} of the following measurement:`
  );
  const children = [];
  addUiElement(
    "ul",
    children
  );
  addUiChildElement(
    children,
    "li",
    `${printPanelFrameTopLengthRoundedInt}mm`
  );
};
const printUprights = (printCountLengths, printPanelUprights, roofAngleDegreesRounded, framingSize, printPanelName = "") => {
  printFrameTimberRequirements(
    printPanelName,
    framingSize
  );
  addUiElement(
    "h3",
    "Frame uprights"
  );
  addUiElement(
    "p",
    `The top end will be cut at an angle, the bottom square.`
  );
  addUiElement(
    "p",
    `Start each length by cutting the top end at an angle of ${roofAngleDegreesRounded}°.`
  );
  addUiElement(
    "p",
    "Measure down from the peak of the angled cut and cut the bottom square."
  );
  addUiElement(
    "p",
    `The angle should be on the shorter face of the framing - the depth.`
  );
  addUiElement(
    "p",
    `Cut ${printCountLengths} of the following measurements:`
  );
  const children = [];
  addUiElement(
    "ul",
    children
  );
  for (let i = 0; i < printPanelUprights.length; i++) {
    addUiChildElement(
      children,
      "li",
      `${printPanelUprights[i]}mm`
    );
  }
};
const printSpacers = (pent, printPanelAvailableLength, printHorizontalStudSpacer, framingSize, printPanelIndex = 0, printPanelName = "") => {
  if (printPanelAvailableLength > pent.maxStudDistance) {
    printFrameTimberRequirements(
      printPanelName,
      framingSize
    );
    addUiElement(
      "h3",
      "Stud spacers"
    );
    addUiElement(
      "p",
      "Cut both ends square."
    );
    if (printPanelIndex === 0) {
      addUiElement(
        "p",
        `Cut 2 lengths of the following measurement:`
      );
    } else {
      addUiElement(
        "p",
        `Use the 2 spacers already cut with the following measurement:`
      );
    }
    const children = [];
    addUiElement(
      "ul",
      children
    );
    addUiChildElement(
      children,
      "li",
      `${printHorizontalStudSpacer}mm`
    );
  }
};
const printPanel = (pent, printCountLengths, printPanelFrameBottomLength, printPanelFrameTopLengthRoundedInt, printPanelUprights, printPanelAvailableLength, printHorizontalStudSpacer, printShiplapBoardCount, framingSize, roofAngleDegreesRounded, printPanelName = "", printPanelIndex = 0) => {
  printFrameBottom(
    printCountLengths,
    printPanelFrameBottomLength,
    framingSize,
    printPanelName
  );
  printFrameTop(
    printCountLengths,
    printPanelFrameTopLengthRoundedInt,
    roofAngleDegreesRounded,
    framingSize,
    printPanelName
  );
  printUprights(
    printCountLengths,
    printPanelUprights,
    roofAngleDegreesRounded,
    framingSize,
    printPanelName
  );
  printSpacers(
    pent,
    printPanelAvailableLength,
    printHorizontalStudSpacer,
    framingSize,
    printPanelIndex,
    printPanelName
  );
  printFrameAssemblyInstructions(printPanelName);
  printShiplapCuttingList(
    pent,
    printShiplapBoardCount,
    printPanelFrameBottomLength,
    printPanelName
  );
  printCladdingInstructions(
    pent,
    printPanelName
  );
};
const pentSideCalculationCode = {
  calculate: (state) => {
    pentSideValidationCode.validateValues(state.pent);
    pages = [];
    currentPageChildren = [];
    const pent = state.pent;
    pent.floorDepth = pent.floorDepth ?? 0;
    pent.frontHeight = pent.frontHeight ?? 0;
    pent.backHeight = pent.backHeight ?? 0;
    const floorOverhang = pent.framingWidth > pent.framingSizePivot ? pent.floorOverhangHeavy : pent.floorOverhangStandard;
    const frameBottomLength = pent.floorDepth + 2 * floorOverhang;
    const framingSize = `${pent.framingWidth}mm x ${pent.framingDepth}mm`;
    const adjustedFrameBottomLength = frameBottomLength - pent.framingWidth;
    const triangleHeight = pent.frontHeight - pent.backHeight;
    const roofAngleRadians = Math.atan2(triangleHeight, adjustedFrameBottomLength);
    const heightAdjustmentInt = pent.framingWidth * Math.tan(roofAngleRadians);
    const adjustedFrontHeightInt = pent.frontHeight + heightAdjustmentInt;
    const adjustedTriangleHeight = triangleHeight + heightAdjustmentInt;
    const roofAngleDegreesRounded = Math.round(roofAngleRadians * 180 / Math.PI);
    const angleAdjustedFrameDepth = pent.framingDepth / Math.cos(roofAngleRadians);
    const angleAdjustedRailWidth = pent.roofRailWidth / Math.cos(roofAngleRadians);
    const panelCountInt = Math.ceil(frameBottomLength / pent.maxPanelLength);
    const panelFrameBottomLengthInt = Math.round(frameBottomLength / panelCountInt);
    const panelFrameTopLengthRoundedInt = Math.round(adjustedTriangleHeight / (Math.sin(roofAngleRadians) * panelCountInt));
    const sideFrameFrontLengthInt = adjustedFrontHeightInt - pent.framingDepth - angleAdjustedFrameDepth + angleAdjustedRailWidth;
    const panelAvailableLength = panelFrameBottomLengthInt - pent.framingDepth;
    const studDivisionCount = Math.floor(panelAvailableLength / pent.maxStudDistance) + 1;
    const horizontalSpacing = Math.round(panelAvailableLength / studDivisionCount);
    const horizontalStudSpacer = horizontalSpacing - pent.framingDepth;
    const spacingHeightAdjustment = calculateFrameUprightAdjustment(
      horizontalSpacing,
      roofAngleRadians
    );
    const frameDepthHeightAdjustment = calculateFrameUprightAdjustment(
      pent.framingDepth,
      roofAngleRadians
    );
    const shiplapBoardCounts = [];
    const sideUprights = [];
    let panelUprights;
    let runningAdjustment = 0;
    let uprightHeightRounded = 0;
    for (let i = 0; i < panelCountInt; i++) {
      panelUprights = [];
      for (let j = 0; j <= studDivisionCount; j++) {
        uprightHeightRounded = Math.round(sideFrameFrontLengthInt - runningAdjustment);
        panelUprights.push(uprightHeightRounded);
        if (j === studDivisionCount) {
          runningAdjustment += frameDepthHeightAdjustment;
        } else {
          runningAdjustment += spacingHeightAdjustment;
        }
      }
      sideUprights.push(panelUprights);
    }
    for (let k = 0; k < panelCountInt; k++) {
      let panelLengthsCount = `${pent.sideCount} length`;
      if (pent.sideCount > 1) {
        panelLengthsCount = `${panelLengthsCount}s`;
      }
      printPanel(
        pent,
        panelLengthsCount,
        panelFrameBottomLengthInt,
        panelFrameTopLengthRoundedInt,
        sideUprights[k],
        panelAvailableLength,
        horizontalStudSpacer,
        shiplapBoardCounts[k],
        framingSize,
        roofAngleDegreesRounded,
        `A${k + 1}`,
        k
      );
    }
    state.pages = pages;
    state.currentPageIndex = 0;
  }
};
const pentSideActions = {
  setFloorDepth: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.floorDepth = +element.value;
    return gStateCode.cloneState(state);
  },
  setFrontHeight: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.frontHeight = +element.value;
    return gStateCode.cloneState(state);
  },
  setBackHeight: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.backHeight = +element.value;
    return gStateCode.cloneState(state);
  },
  setFramingWidth: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.framingWidth = +element.value;
    return gStateCode.cloneState(state);
  },
  setFramingDepth: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.framingDepth = +element.value;
    return gStateCode.cloneState(state);
  },
  setRoofRailWidth: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.roofRailWidth = +element.value;
    return gStateCode.cloneState(state);
  },
  setRoofRailDepth: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.roofRailDepth = +element.value;
    return gStateCode.cloneState(state);
  },
  setSideCount: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.sideCount = +element.value;
    return gStateCode.cloneState(state);
  },
  // setBuildPanelsTogether: (
  //     state: IState,
  //     value: boolean
  // ): IState => {
  //     if (!element) {
  //         return state;
  //     }
  //     state.pent.buildPanelsTogether = value;
  //     return gStateCode.cloneState(state);
  // },
  setShiplapBottomOverhang: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.shiplapBottomOverhang = +element.value;
    return gStateCode.cloneState(state);
  },
  setShiplapButtingWidth: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.shiplapButtingWidth = +element.value;
    return gStateCode.cloneState(state);
  },
  setShiplapDepth: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.shiplapDepth = +element.value;
    return gStateCode.cloneState(state);
  },
  setMaxStudDistance: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.maxStudDistance = +element.value;
    return gStateCode.cloneState(state);
  },
  setFramingSizePivot: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.framingSizePivot = +element.value;
    return gStateCode.cloneState(state);
  },
  setFloorOverhangStandard: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.floorOverhangStandard = +element.value;
    return gStateCode.cloneState(state);
  },
  setFloorOverhangHeavy: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.floorOverhangHeavy = +element.value;
    return gStateCode.cloneState(state);
  },
  setMaxPanelLength: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.maxPanelLength = +element.value;
    return gStateCode.cloneState(state);
  },
  minimiseDefaults: (state) => {
    state.showDefaults = state.showDefaults !== true;
    return gStateCode.cloneState(state);
  },
  nextPage: (state) => {
    state.currentPageIndex++;
    if (state.currentPageIndex > state.pages.length - 1) {
      state.currentPageIndex = state.pages.length - 1;
    }
    return gStateCode.cloneState(state);
  },
  previousPage: (state) => {
    state.currentPageIndex--;
    if (state.currentPageIndex < -1) {
      state.currentPageIndex = -1;
    }
    return gStateCode.cloneState(state);
  },
  calculate: (state) => {
    pentSideCalculationCode.calculate(state);
    return gStateCode.cloneState(state);
  }
};
const inputViews = {
  buildNumberView: (id, value, required, label, placeholder, error, action) => {
    const view = h("div", { class: "nft-i-numeric" }, [
      h("h4", {}, `${label}`),
      h("div", { class: "input-wrapper" }, [
        h("div", { class: "title-table" }, [
          h("div", { class: "title-row" }, [
            h("div", { class: "title-cell" }, [
              h("div", { class: "error" }, `${error ?? ""}`)
            ])
          ])
        ]),
        h(
          "input",
          {
            id: `${id}`,
            value: `${value ?? 0}`,
            required: required === true,
            tabindex: 0,
            // if this is not set it is not focusable
            // min: rangeMin,
            // max: rangeMax,
            type: "text",
            placeholder: `${placeholder}`,
            onInput: [
              action,
              (event) => {
                return event.target;
              }
            ]
          },
          ""
        )
      ])
    ]);
    return view;
  },
  buildSelectView: (selectedValue, label, placeholder, optionValues, action) => {
    let selectClasses = "nft-i-select";
    let selected = false;
    let selectionMade = false;
    const optionViews = [
      h(
        "option",
        {
          class: "select-default",
          value: ""
        },
        `--select ${placeholder}--`
      )
    ];
    optionValues.forEach((choice) => {
      if (choice === selectedValue) {
        selected = true;
        selectionMade = true;
      } else {
        selected = false;
      }
      optionViews.push(
        h(
          "option",
          {
            value: `${choice}`,
            selected
          },
          `${choice}`
        )
      );
    });
    if (selectionMade) {
      selectClasses = `${selectClasses} selected`;
    }
    const view = h(
      "div",
      {
        class: `${selectClasses}`,
        onChange: [
          action,
          (event) => {
            return event.target;
          }
        ]
      },
      [
        h("h4", {}, `${label}`),
        h("select", {}, optionViews)
      ]
    );
    return view;
  }
};
const buildShowHideButton = (state) => {
  let label;
  if (!state.showDefaults) {
    label = "Show defaults";
  } else {
    label = "Hide defaults";
  }
  const view = h(
    "button",
    {
      type: "button",
      onClick: pentSideActions.minimiseDefaults
    },
    `${label}`
  );
  return view;
};
const buildInputsView = (state) => {
  const view = [
    inputViews.buildNumberView(
      "maxStudDistance",
      state.pent.maxStudDistance,
      true,
      "Max inter-stud distance (mm)",
      "Max inter-stud distance",
      state.pent.maxStudDistanceError,
      pentSideActions.setMaxStudDistance
    ),
    inputViews.buildNumberView(
      "framingSizePivot",
      state.pent.framingSizePivot,
      true,
      "Framing pivot standard to heavy (mm)",
      "Framing pivot standard to heavy",
      state.pent.framingSizePivotError,
      pentSideActions.setFramingSizePivot
    ),
    inputViews.buildNumberView(
      "floorOverhangStandard",
      state.pent.floorOverhangStandard,
      true,
      "Panel floor overhang (mm)",
      "Panel floor overhang",
      state.pent.floorOverhangStandardError,
      pentSideActions.setFloorOverhangStandard
    ),
    inputViews.buildNumberView(
      "floorOverhangHeavy",
      state.pent.floorOverhangHeavy,
      true,
      "Heavy duty panel floor overhang (mm)",
      "Heavy duty floor overhang",
      state.pent.floorOverhangHeavyError,
      pentSideActions.setFloorOverhangHeavy
    ),
    inputViews.buildNumberView(
      "shiplapBottomOverhang",
      state.pent.shiplapBottomOverhang,
      true,
      "Shiplap bottom overhang (mm)",
      "Shiplap bottom overhang",
      state.pent.shiplapBottomOverhangError,
      pentSideActions.setShiplapBottomOverhang
    ),
    inputViews.buildNumberView(
      "maxPanelLength",
      state.pent.maxPanelLength,
      true,
      "Max side length (mm)",
      "Max side length",
      state.pent.maxPanelLengthError,
      pentSideActions.setMaxPanelLength
    )
  ];
  return view;
};
const buildMinimisedView = (state) => {
  const view = h("div", { class: "nft-collapse-group minimised" }, [
    buildShowHideButton(state)
  ]);
  return view;
};
const buildMaximisedView = (state) => {
  const view = h("div", { class: "nft-collapse-group" }, [
    buildShowHideButton(state),
    ...buildInputsView(state)
  ]);
  return view;
};
const defaultViews = {
  buildView: (state) => {
    if (!state.showDefaults) {
      return buildMinimisedView(state);
    } else {
      return buildMaximisedView(state);
    }
  }
};
const shedViews = {
  buildView: (state) => {
    const view = h("div", { class: "nft-display-group" }, [
      h("h4", { class: "label" }, "Shed"),
      h("div", { class: "display-contents" }, [
        inputViews.buildNumberView(
          "floorDepth",
          state.pent.floorDepth,
          true,
          "Floor depth (mm)",
          "Floor depth",
          state.pent.floorDepthError,
          pentSideActions.setFloorDepth
        ),
        inputViews.buildNumberView(
          "frontHeight",
          state.pent.frontHeight,
          true,
          "Front height (mm)",
          "Front height",
          state.pent.frontHeightError,
          pentSideActions.setFrontHeight
        ),
        inputViews.buildNumberView(
          "backHeight",
          state.pent.backHeight,
          true,
          "Back height (mm)",
          "Back height",
          state.pent.backHeightError,
          pentSideActions.setBackHeight
        ),
        inputViews.buildSelectView(
          `${state.pent.sideCount}`,
          "Side build count",
          "side build count",
          ["1", "2"],
          pentSideActions.setSideCount
        )
      ])
    ]);
    return view;
  }
};
const shedDisplayViews = {
  buildView: (state) => {
    const view = h("div", { class: "nft-display-group" }, [
      h("h4", { class: "label" }, "Timber"),
      h("div", { class: "display-contents" }, [
        inputViews.buildNumberView(
          "framingWidth",
          state.pent.framingWidth,
          true,
          "Framing timber width (mm)",
          "Framing timber width",
          state.pent.framingWidthError,
          pentSideActions.setFramingWidth
        ),
        inputViews.buildNumberView(
          "framingDepth",
          state.pent.framingDepth,
          true,
          "Framing timber depth (mm)",
          "Framing timber depth",
          state.pent.framingDepthError,
          pentSideActions.setFramingDepth
        ),
        inputViews.buildNumberView(
          "roofRailWidth",
          state.pent.roofRailWidth,
          true,
          "Roof rail timber width (mm)",
          "Roof rail timber width",
          state.pent.roofRailWidthError,
          pentSideActions.setRoofRailWidth
        ),
        inputViews.buildNumberView(
          "roofRailDepth",
          state.pent.roofRailDepth,
          true,
          "Roof rail timber depth (mm)",
          "Roof rail timber depth",
          state.pent.roofRailDepthError,
          pentSideActions.setRoofRailDepth
        ),
        inputViews.buildNumberView(
          "shiplapButtingWidth",
          state.pent.shiplapButtingWidth,
          true,
          "Shiplap butting width (mm)",
          "Shiplap butting width",
          state.pent.shiplapButtingWidthError,
          pentSideActions.setShiplapButtingWidth
        ),
        inputViews.buildNumberView(
          "shiplapDepth",
          state.pent.shiplapDepth,
          true,
          "Shiplap depth (mm)",
          "Shiplap depth",
          state.pent.shiplapDepthError,
          pentSideActions.setShiplapDepth
        )
      ])
    ]);
    return view;
  }
};
const pentSideInputViews = {
  buildView: (state) => {
    const view = h("div", { id: "stepView" }, [
      h("div", { class: "step-discussion" }, [
        h("div", { class: "discussion" }, [
          h("h4", { class: "title-text" }, "Pent shed side calculator"),
          h("div", { id: "inputView" }, [
            defaultViews.buildView(state),
            shedViews.buildView(state),
            shedDisplayViews.buildView(state)
          ])
        ])
      ]),
      h("div", { class: "step-options" }, [
        h(
          "a",
          {
            class: "option",
            onClick: pentSideActions.calculate
          },
          [
            h(
              "p",
              {},
              "Calculate"
            )
          ]
        )
      ])
    ]);
    return view;
  }
};
const buildPatternView = (views, node) => {
  if (node.value) {
    if (Array.isArray(node.value)) {
      views.push(
        h(
          node.type,
          node.properties,
          elementViews.buildView(node.value)
        )
      );
    } else {
      views.push(
        h(
          node.type,
          node.properties,
          node.value
        )
      );
    }
  }
};
const elementViews = {
  buildView: (viewPatterns) => {
    const views = [];
    for (let i = 0; i < viewPatterns.length; i++) {
      buildPatternView(
        views,
        viewPatterns[i]
      );
    }
    return views;
  }
};
const buildPageBackwards = (_state) => {
  const view = h(
    "a",
    {
      onClick: pentSideActions.previousPage
    },
    [
      h("div", { class: "page-backwards-icon" }, "")
    ]
  );
  return view;
};
const buildPageForwards = (state) => {
  if (state.currentPageIndex >= state.pages.length - 1) {
    return null;
  }
  const view = h(
    "a",
    {
      onClick: pentSideActions.nextPage
    },
    [
      h("div", { class: "page-forwards-icon" }, "")
    ]
  );
  return view;
};
const pentSidePagesView = {
  buildPageView: (state) => {
    const currentPage = state.pages[state.currentPageIndex];
    if (!currentPage.value || !Array.isArray(currentPage.value)) {
      return null;
    }
    const view = h("div", { id: "stepView" }, [
      h("div", { class: "step-discussion" }, [
        h("div", { class: "discussion" }, [
          h("h4", { class: "title-text" }, "Pent side"),
          h("div", { id: "inputView" }, [
            h("div", { class: "nft-i-pattern" }, [
              h("div", { class: "nft-i-page" }, [
                elementViews.buildView(currentPage.value)
              ])
            ])
          ])
        ])
      ]),
      h("div", { class: "step-page-buttons" }, [
        h(
          "div",
          { class: "page-backwards" },
          buildPageBackwards()
        ),
        h(
          "div",
          { class: "page-forwards" },
          buildPageForwards(state)
        )
      ])
    ]);
    return view;
  }
};
const pentSideViews = {
  buildView: (state) => {
    if (state.pages && state.pages.length > 0 && state.currentPageIndex > -1) {
      return pentSidePagesView.buildPageView(state);
    } else {
      return pentSideInputViews.buildView(state);
    }
  }
};
const initView = {
  buildView: (state) => {
    const view = h(
      "div",
      { id: "treeSolveAuthor" },
      pentSideViews.buildView(state)
    );
    return view;
  }
};
class Pent {
  constructor() {
    // defaults
    __publicField(this, "maxStudDistance", 400);
    __publicField(this, "framingSizePivot", 50);
    __publicField(this, "floorOverhangStandard", 10);
    __publicField(this, "floorOverhangHeavy", 15);
    __publicField(this, "maxPanelLength", 4e3);
    __publicField(this, "buildPanelsTogether", false);
    // shed measurements
    __publicField(this, "floorDepth", 0);
    __publicField(this, "frontHeight", 0);
    __publicField(this, "backHeight", 0);
    // frame sizes
    __publicField(this, "framingWidth", 45);
    __publicField(this, "framingDepth", 33);
    __publicField(this, "roofRailWidth", 69);
    __publicField(this, "roofRailDepth", 34);
    __publicField(this, "shiplapBottomOverhang", 35);
    __publicField(this, "shiplapButtingWidth", 112);
    __publicField(this, "shiplapDepth", 12);
    __publicField(this, "sideCount", 2);
    __publicField(this, "maxStudDistanceError", null);
    __publicField(this, "framingSizePivotError", null);
    __publicField(this, "floorOverhangStandardError", null);
    __publicField(this, "floorOverhangHeavyError", null);
    __publicField(this, "maxPanelLengthError", null);
    __publicField(this, "buildPanelsTogetherError", null);
    // shed measurements
    __publicField(this, "floorDepthError", null);
    __publicField(this, "frontHeightError", null);
    __publicField(this, "backHeightError", null);
    __publicField(this, "framingWidthError", null);
    __publicField(this, "framingDepthError", null);
    // frame sizes
    __publicField(this, "roofRailWidthError", null);
    __publicField(this, "roofRailDepthError", null);
    __publicField(this, "shiplapBottomOverhangError", null);
    __publicField(this, "shiplapButtingWidthError", null);
    __publicField(this, "shiplapDepthError", null);
    __publicField(this, "sideCountError", null);
  }
}
class State {
  constructor() {
    __publicField(this, "pent", new Pent());
    __publicField(this, "showDefaults", false);
    __publicField(this, "pages", []);
    __publicField(this, "currentPageIndex", 0);
  }
}
const initState = {
  initialise: () => {
    const state = new State();
    return state;
  }
};
initEvents.registerGlobalEvents();
window.CompositeFlowsAuthor = app({
  node: document.getElementById("treeSolveAuthor"),
  init: initState.initialise,
  view: initView.buildView,
  subscriptions: initSubscriptions,
  onEnd: initEvents.onRenderFinished
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uL3Jvb3Qvc3JjL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbC5qcyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L3N1YnNjcmlwdGlvbnMvaW5pdFN1YnNjcmlwdGlvbnMudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9jb2RlL2luaXRFdmVudHMudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9jb2RlL2dTdGF0ZUNvZGUudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvcGVudFNpZGUvY29kZS9wZW50U2lkZVZhbGlkYXRpb25Db2RlLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL3BlbnRTaWRlL2NvZGUvcGVudFNpZGVDYWxjdWxhdGlvbkNvZGUudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvcGVudFNpZGUvYWN0aW9ucy9wZW50U2lkZUFjdGlvbnMudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvcGVudFNpZGUvdmlld3MvaW5wdXRWaWV3cy50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9wZW50U2lkZS92aWV3cy9kZWZhdWx0Vmlld3MudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvcGVudFNpZGUvdmlld3Mvc2hlZFZpZXdzLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL3BlbnRTaWRlL3ZpZXdzL3RpbWJlclZpZXdzLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL3BlbnRTaWRlL3ZpZXdzL3BlbnRTaWRlSW5wdXRWaWV3cy50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9wZW50U2lkZS92aWV3cy9lbGVtZW50Vmlld3MudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvcGVudFNpZGUvdmlld3MvcGVudFNpZGVQYWdlc1ZpZXcudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvcGVudFNpZGUvdmlld3MvcGVudFNpZGVWaWV3cy50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L3ZpZXdzL2luaXRWaWV3LnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9QZW50LnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9TdGF0ZS50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L2NvZGUvaW5pdFN0YXRlLnRzIiwiLi4vLi4vcm9vdC9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIFJFQ1lDTEVEX05PREUgPSAxXHJcbnZhciBMQVpZX05PREUgPSAyXHJcbnZhciBURVhUX05PREUgPSAzXHJcbnZhciBFTVBUWV9PQkogPSB7fVxyXG52YXIgRU1QVFlfQVJSID0gW11cclxudmFyIG1hcCA9IEVNUFRZX0FSUi5tYXBcclxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5XHJcbnZhciBkZWZlciA9XHJcbiAgdHlwZW9mIHJlcXVlc3RBbmltYXRpb25GcmFtZSAhPT0gXCJ1bmRlZmluZWRcIlxyXG4gICAgPyByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcclxuICAgIDogc2V0VGltZW91dFxyXG5cclxudmFyIGNyZWF0ZUNsYXNzID0gZnVuY3Rpb24ob2JqKSB7XHJcbiAgdmFyIG91dCA9IFwiXCJcclxuXHJcbiAgaWYgKHR5cGVvZiBvYmogPT09IFwic3RyaW5nXCIpIHJldHVybiBvYmpcclxuXHJcbiAgaWYgKGlzQXJyYXkob2JqKSAmJiBvYmoubGVuZ3RoID4gMCkge1xyXG4gICAgZm9yICh2YXIgayA9IDAsIHRtcDsgayA8IG9iai5sZW5ndGg7IGsrKykge1xyXG4gICAgICBpZiAoKHRtcCA9IGNyZWF0ZUNsYXNzKG9ialtrXSkpICE9PSBcIlwiKSB7XHJcbiAgICAgICAgb3V0ICs9IChvdXQgJiYgXCIgXCIpICsgdG1wXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgZm9yICh2YXIgayBpbiBvYmopIHtcclxuICAgICAgaWYgKG9ialtrXSkge1xyXG4gICAgICAgIG91dCArPSAob3V0ICYmIFwiIFwiKSArIGtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG91dFxyXG59XHJcblxyXG52YXIgbWVyZ2UgPSBmdW5jdGlvbihhLCBiKSB7XHJcbiAgdmFyIG91dCA9IHt9XHJcblxyXG4gIGZvciAodmFyIGsgaW4gYSkgb3V0W2tdID0gYVtrXVxyXG4gIGZvciAodmFyIGsgaW4gYikgb3V0W2tdID0gYltrXVxyXG5cclxuICByZXR1cm4gb3V0XHJcbn1cclxuXHJcbnZhciBiYXRjaCA9IGZ1bmN0aW9uKGxpc3QpIHtcclxuICByZXR1cm4gbGlzdC5yZWR1Y2UoZnVuY3Rpb24ob3V0LCBpdGVtKSB7XHJcbiAgICByZXR1cm4gb3V0LmNvbmNhdChcclxuICAgICAgIWl0ZW0gfHwgaXRlbSA9PT0gdHJ1ZVxyXG4gICAgICAgID8gMFxyXG4gICAgICAgIDogdHlwZW9mIGl0ZW1bMF0gPT09IFwiZnVuY3Rpb25cIlxyXG4gICAgICAgID8gW2l0ZW1dXHJcbiAgICAgICAgOiBiYXRjaChpdGVtKVxyXG4gICAgKVxyXG4gIH0sIEVNUFRZX0FSUilcclxufVxyXG5cclxudmFyIGlzU2FtZUFjdGlvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcclxuICByZXR1cm4gaXNBcnJheShhKSAmJiBpc0FycmF5KGIpICYmIGFbMF0gPT09IGJbMF0gJiYgdHlwZW9mIGFbMF0gPT09IFwiZnVuY3Rpb25cIlxyXG59XHJcblxyXG52YXIgc2hvdWxkUmVzdGFydCA9IGZ1bmN0aW9uKGEsIGIpIHtcclxuICBpZiAoYSAhPT0gYikge1xyXG4gICAgZm9yICh2YXIgayBpbiBtZXJnZShhLCBiKSkge1xyXG4gICAgICBpZiAoYVtrXSAhPT0gYltrXSAmJiAhaXNTYW1lQWN0aW9uKGFba10sIGJba10pKSByZXR1cm4gdHJ1ZVxyXG4gICAgICBiW2tdID0gYVtrXVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxudmFyIHBhdGNoU3VicyA9IGZ1bmN0aW9uKG9sZFN1YnMsIG5ld1N1YnMsIGRpc3BhdGNoKSB7XHJcbiAgZm9yIChcclxuICAgIHZhciBpID0gMCwgb2xkU3ViLCBuZXdTdWIsIHN1YnMgPSBbXTtcclxuICAgIGkgPCBvbGRTdWJzLmxlbmd0aCB8fCBpIDwgbmV3U3Vicy5sZW5ndGg7XHJcbiAgICBpKytcclxuICApIHtcclxuICAgIG9sZFN1YiA9IG9sZFN1YnNbaV1cclxuICAgIG5ld1N1YiA9IG5ld1N1YnNbaV1cclxuICAgIHN1YnMucHVzaChcclxuICAgICAgbmV3U3ViXHJcbiAgICAgICAgPyAhb2xkU3ViIHx8XHJcbiAgICAgICAgICBuZXdTdWJbMF0gIT09IG9sZFN1YlswXSB8fFxyXG4gICAgICAgICAgc2hvdWxkUmVzdGFydChuZXdTdWJbMV0sIG9sZFN1YlsxXSlcclxuICAgICAgICAgID8gW1xyXG4gICAgICAgICAgICAgIG5ld1N1YlswXSxcclxuICAgICAgICAgICAgICBuZXdTdWJbMV0sXHJcbiAgICAgICAgICAgICAgbmV3U3ViWzBdKGRpc3BhdGNoLCBuZXdTdWJbMV0pLFxyXG4gICAgICAgICAgICAgIG9sZFN1YiAmJiBvbGRTdWJbMl0oKVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICA6IG9sZFN1YlxyXG4gICAgICAgIDogb2xkU3ViICYmIG9sZFN1YlsyXSgpXHJcbiAgICApXHJcbiAgfVxyXG4gIHJldHVybiBzdWJzXHJcbn1cclxuXHJcbnZhciBwYXRjaFByb3BlcnR5ID0gZnVuY3Rpb24obm9kZSwga2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUsIGxpc3RlbmVyLCBpc1N2Zykge1xyXG4gIGlmIChrZXkgPT09IFwia2V5XCIpIHtcclxuICB9IGVsc2UgaWYgKGtleSA9PT0gXCJzdHlsZVwiKSB7XHJcbiAgICBmb3IgKHZhciBrIGluIG1lcmdlKG9sZFZhbHVlLCBuZXdWYWx1ZSkpIHtcclxuICAgICAgb2xkVmFsdWUgPSBuZXdWYWx1ZSA9PSBudWxsIHx8IG5ld1ZhbHVlW2tdID09IG51bGwgPyBcIlwiIDogbmV3VmFsdWVba11cclxuICAgICAgaWYgKGtbMF0gPT09IFwiLVwiKSB7XHJcbiAgICAgICAgbm9kZVtrZXldLnNldFByb3BlcnR5KGssIG9sZFZhbHVlKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG5vZGVba2V5XVtrXSA9IG9sZFZhbHVlXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9IGVsc2UgaWYgKGtleVswXSA9PT0gXCJvXCIgJiYga2V5WzFdID09PSBcIm5cIikge1xyXG4gICAgaWYgKFxyXG4gICAgICAhKChub2RlLmFjdGlvbnMgfHwgKG5vZGUuYWN0aW9ucyA9IHt9KSlbXHJcbiAgICAgICAgKGtleSA9IGtleS5zbGljZSgyKS50b0xvd2VyQ2FzZSgpKVxyXG4gICAgICBdID0gbmV3VmFsdWUpXHJcbiAgICApIHtcclxuICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGtleSwgbGlzdGVuZXIpXHJcbiAgICB9IGVsc2UgaWYgKCFvbGRWYWx1ZSkge1xyXG4gICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoa2V5LCBsaXN0ZW5lcilcclxuICAgIH1cclxuICB9IGVsc2UgaWYgKCFpc1N2ZyAmJiBrZXkgIT09IFwibGlzdFwiICYmIGtleSBpbiBub2RlKSB7XHJcbiAgICBub2RlW2tleV0gPSBuZXdWYWx1ZSA9PSBudWxsIHx8IG5ld1ZhbHVlID09IFwidW5kZWZpbmVkXCIgPyBcIlwiIDogbmV3VmFsdWVcclxuICB9IGVsc2UgaWYgKFxyXG4gICAgbmV3VmFsdWUgPT0gbnVsbCB8fFxyXG4gICAgbmV3VmFsdWUgPT09IGZhbHNlIHx8XHJcbiAgICAoa2V5ID09PSBcImNsYXNzXCIgJiYgIShuZXdWYWx1ZSA9IGNyZWF0ZUNsYXNzKG5ld1ZhbHVlKSkpXHJcbiAgKSB7XHJcbiAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShrZXkpXHJcbiAgfSBlbHNlIHtcclxuICAgIG5vZGUuc2V0QXR0cmlidXRlKGtleSwgbmV3VmFsdWUpXHJcbiAgfVxyXG59XHJcblxyXG52YXIgY3JlYXRlTm9kZSA9IGZ1bmN0aW9uKHZkb20sIGxpc3RlbmVyLCBpc1N2Zykge1xyXG4gIHZhciBucyA9IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxyXG4gIHZhciBwcm9wcyA9IHZkb20ucHJvcHNcclxuICB2YXIgbm9kZSA9XHJcbiAgICB2ZG9tLnR5cGUgPT09IFRFWFRfTk9ERVxyXG4gICAgICA/IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHZkb20ubmFtZSlcclxuICAgICAgOiAoaXNTdmcgPSBpc1N2ZyB8fCB2ZG9tLm5hbWUgPT09IFwic3ZnXCIpXHJcbiAgICAgID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5zLCB2ZG9tLm5hbWUsIHsgaXM6IHByb3BzLmlzIH0pXHJcbiAgICAgIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh2ZG9tLm5hbWUsIHsgaXM6IHByb3BzLmlzIH0pXHJcblxyXG4gIGZvciAodmFyIGsgaW4gcHJvcHMpIHtcclxuICAgIHBhdGNoUHJvcGVydHkobm9kZSwgaywgbnVsbCwgcHJvcHNba10sIGxpc3RlbmVyLCBpc1N2ZylcclxuICB9XHJcblxyXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSB2ZG9tLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICBub2RlLmFwcGVuZENoaWxkKFxyXG4gICAgICBjcmVhdGVOb2RlKFxyXG4gICAgICAgICh2ZG9tLmNoaWxkcmVuW2ldID0gZ2V0Vk5vZGUodmRvbS5jaGlsZHJlbltpXSkpLFxyXG4gICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgIGlzU3ZnXHJcbiAgICAgIClcclxuICAgIClcclxuICB9XHJcblxyXG4gIHJldHVybiAodmRvbS5ub2RlID0gbm9kZSlcclxufVxyXG5cclxudmFyIGdldEtleSA9IGZ1bmN0aW9uKHZkb20pIHtcclxuICByZXR1cm4gdmRvbSA9PSBudWxsID8gbnVsbCA6IHZkb20ua2V5XHJcbn1cclxuXHJcbnZhciBwYXRjaCA9IGZ1bmN0aW9uKHBhcmVudCwgbm9kZSwgb2xkVk5vZGUsIG5ld1ZOb2RlLCBsaXN0ZW5lciwgaXNTdmcpIHtcclxuICBpZiAob2xkVk5vZGUgPT09IG5ld1ZOb2RlKSB7XHJcbiAgfSBlbHNlIGlmIChcclxuICAgIG9sZFZOb2RlICE9IG51bGwgJiZcclxuICAgIG9sZFZOb2RlLnR5cGUgPT09IFRFWFRfTk9ERSAmJlxyXG4gICAgbmV3Vk5vZGUudHlwZSA9PT0gVEVYVF9OT0RFXHJcbiAgKSB7XHJcbiAgICBpZiAob2xkVk5vZGUubmFtZSAhPT0gbmV3Vk5vZGUubmFtZSkgbm9kZS5ub2RlVmFsdWUgPSBuZXdWTm9kZS5uYW1lXHJcbiAgfSBlbHNlIGlmIChvbGRWTm9kZSA9PSBudWxsIHx8IG9sZFZOb2RlLm5hbWUgIT09IG5ld1ZOb2RlLm5hbWUpIHtcclxuICAgIG5vZGUgPSBwYXJlbnQuaW5zZXJ0QmVmb3JlKFxyXG4gICAgICBjcmVhdGVOb2RlKChuZXdWTm9kZSA9IGdldFZOb2RlKG5ld1ZOb2RlKSksIGxpc3RlbmVyLCBpc1N2ZyksXHJcbiAgICAgIG5vZGVcclxuICAgIClcclxuICAgIGlmIChvbGRWTm9kZSAhPSBudWxsKSB7XHJcbiAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChvbGRWTm9kZS5ub2RlKVxyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICB2YXIgdG1wVktpZFxyXG4gICAgdmFyIG9sZFZLaWRcclxuXHJcbiAgICB2YXIgb2xkS2V5XHJcbiAgICB2YXIgbmV3S2V5XHJcblxyXG4gICAgdmFyIG9sZFZQcm9wcyA9IG9sZFZOb2RlLnByb3BzXHJcbiAgICB2YXIgbmV3VlByb3BzID0gbmV3Vk5vZGUucHJvcHNcclxuXHJcbiAgICB2YXIgb2xkVktpZHMgPSBvbGRWTm9kZS5jaGlsZHJlblxyXG4gICAgdmFyIG5ld1ZLaWRzID0gbmV3Vk5vZGUuY2hpbGRyZW5cclxuXHJcbiAgICB2YXIgb2xkSGVhZCA9IDBcclxuICAgIHZhciBuZXdIZWFkID0gMFxyXG4gICAgdmFyIG9sZFRhaWwgPSBvbGRWS2lkcy5sZW5ndGggLSAxXHJcbiAgICB2YXIgbmV3VGFpbCA9IG5ld1ZLaWRzLmxlbmd0aCAtIDFcclxuXHJcbiAgICBpc1N2ZyA9IGlzU3ZnIHx8IG5ld1ZOb2RlLm5hbWUgPT09IFwic3ZnXCJcclxuXHJcbiAgICBmb3IgKHZhciBpIGluIG1lcmdlKG9sZFZQcm9wcywgbmV3VlByb3BzKSkge1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgKGkgPT09IFwidmFsdWVcIiB8fCBpID09PSBcInNlbGVjdGVkXCIgfHwgaSA9PT0gXCJjaGVja2VkXCJcclxuICAgICAgICAgID8gbm9kZVtpXVxyXG4gICAgICAgICAgOiBvbGRWUHJvcHNbaV0pICE9PSBuZXdWUHJvcHNbaV1cclxuICAgICAgKSB7XHJcbiAgICAgICAgcGF0Y2hQcm9wZXJ0eShub2RlLCBpLCBvbGRWUHJvcHNbaV0sIG5ld1ZQcm9wc1tpXSwgbGlzdGVuZXIsIGlzU3ZnKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgd2hpbGUgKG5ld0hlYWQgPD0gbmV3VGFpbCAmJiBvbGRIZWFkIDw9IG9sZFRhaWwpIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgIChvbGRLZXkgPSBnZXRLZXkob2xkVktpZHNbb2xkSGVhZF0pKSA9PSBudWxsIHx8XHJcbiAgICAgICAgb2xkS2V5ICE9PSBnZXRLZXkobmV3VktpZHNbbmV3SGVhZF0pXHJcbiAgICAgICkge1xyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHBhdGNoKFxyXG4gICAgICAgIG5vZGUsXHJcbiAgICAgICAgb2xkVktpZHNbb2xkSGVhZF0ubm9kZSxcclxuICAgICAgICBvbGRWS2lkc1tvbGRIZWFkXSxcclxuICAgICAgICAobmV3VktpZHNbbmV3SGVhZF0gPSBnZXRWTm9kZShcclxuICAgICAgICAgIG5ld1ZLaWRzW25ld0hlYWQrK10sXHJcbiAgICAgICAgICBvbGRWS2lkc1tvbGRIZWFkKytdXHJcbiAgICAgICAgKSksXHJcbiAgICAgICAgbGlzdGVuZXIsXHJcbiAgICAgICAgaXNTdmdcclxuICAgICAgKVxyXG4gICAgfVxyXG5cclxuICAgIHdoaWxlIChuZXdIZWFkIDw9IG5ld1RhaWwgJiYgb2xkSGVhZCA8PSBvbGRUYWlsKSB7XHJcbiAgICAgIGlmIChcclxuICAgICAgICAob2xkS2V5ID0gZ2V0S2V5KG9sZFZLaWRzW29sZFRhaWxdKSkgPT0gbnVsbCB8fFxyXG4gICAgICAgIG9sZEtleSAhPT0gZ2V0S2V5KG5ld1ZLaWRzW25ld1RhaWxdKVxyXG4gICAgICApIHtcclxuICAgICAgICBicmVha1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwYXRjaChcclxuICAgICAgICBub2RlLFxyXG4gICAgICAgIG9sZFZLaWRzW29sZFRhaWxdLm5vZGUsXHJcbiAgICAgICAgb2xkVktpZHNbb2xkVGFpbF0sXHJcbiAgICAgICAgKG5ld1ZLaWRzW25ld1RhaWxdID0gZ2V0Vk5vZGUoXHJcbiAgICAgICAgICBuZXdWS2lkc1tuZXdUYWlsLS1dLFxyXG4gICAgICAgICAgb2xkVktpZHNbb2xkVGFpbC0tXVxyXG4gICAgICAgICkpLFxyXG4gICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgIGlzU3ZnXHJcbiAgICAgIClcclxuICAgIH1cclxuXHJcbiAgICBpZiAob2xkSGVhZCA+IG9sZFRhaWwpIHtcclxuICAgICAgd2hpbGUgKG5ld0hlYWQgPD0gbmV3VGFpbCkge1xyXG4gICAgICAgIG5vZGUuaW5zZXJ0QmVmb3JlKFxyXG4gICAgICAgICAgY3JlYXRlTm9kZShcclxuICAgICAgICAgICAgKG5ld1ZLaWRzW25ld0hlYWRdID0gZ2V0Vk5vZGUobmV3VktpZHNbbmV3SGVhZCsrXSkpLFxyXG4gICAgICAgICAgICBsaXN0ZW5lcixcclxuICAgICAgICAgICAgaXNTdmdcclxuICAgICAgICAgICksXHJcbiAgICAgICAgICAob2xkVktpZCA9IG9sZFZLaWRzW29sZEhlYWRdKSAmJiBvbGRWS2lkLm5vZGVcclxuICAgICAgICApXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAobmV3SGVhZCA+IG5ld1RhaWwpIHtcclxuICAgICAgd2hpbGUgKG9sZEhlYWQgPD0gb2xkVGFpbCkge1xyXG4gICAgICAgIG5vZGUucmVtb3ZlQ2hpbGQob2xkVktpZHNbb2xkSGVhZCsrXS5ub2RlKVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmb3IgKHZhciBpID0gb2xkSGVhZCwga2V5ZWQgPSB7fSwgbmV3S2V5ZWQgPSB7fTsgaSA8PSBvbGRUYWlsOyBpKyspIHtcclxuICAgICAgICBpZiAoKG9sZEtleSA9IG9sZFZLaWRzW2ldLmtleSkgIT0gbnVsbCkge1xyXG4gICAgICAgICAga2V5ZWRbb2xkS2V5XSA9IG9sZFZLaWRzW2ldXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB3aGlsZSAobmV3SGVhZCA8PSBuZXdUYWlsKSB7XHJcbiAgICAgICAgb2xkS2V5ID0gZ2V0S2V5KChvbGRWS2lkID0gb2xkVktpZHNbb2xkSGVhZF0pKVxyXG4gICAgICAgIG5ld0tleSA9IGdldEtleShcclxuICAgICAgICAgIChuZXdWS2lkc1tuZXdIZWFkXSA9IGdldFZOb2RlKG5ld1ZLaWRzW25ld0hlYWRdLCBvbGRWS2lkKSlcclxuICAgICAgICApXHJcblxyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgIG5ld0tleWVkW29sZEtleV0gfHxcclxuICAgICAgICAgIChuZXdLZXkgIT0gbnVsbCAmJiBuZXdLZXkgPT09IGdldEtleShvbGRWS2lkc1tvbGRIZWFkICsgMV0pKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgaWYgKG9sZEtleSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIG5vZGUucmVtb3ZlQ2hpbGQob2xkVktpZC5ub2RlKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgb2xkSGVhZCsrXHJcbiAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG5ld0tleSA9PSBudWxsIHx8IG9sZFZOb2RlLnR5cGUgPT09IFJFQ1lDTEVEX05PREUpIHtcclxuICAgICAgICAgIGlmIChvbGRLZXkgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBwYXRjaChcclxuICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgIG9sZFZLaWQgJiYgb2xkVktpZC5ub2RlLFxyXG4gICAgICAgICAgICAgIG9sZFZLaWQsXHJcbiAgICAgICAgICAgICAgbmV3VktpZHNbbmV3SGVhZF0sXHJcbiAgICAgICAgICAgICAgbGlzdGVuZXIsXHJcbiAgICAgICAgICAgICAgaXNTdmdcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICBuZXdIZWFkKytcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG9sZEhlYWQrK1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpZiAob2xkS2V5ID09PSBuZXdLZXkpIHtcclxuICAgICAgICAgICAgcGF0Y2goXHJcbiAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICBvbGRWS2lkLm5vZGUsXHJcbiAgICAgICAgICAgICAgb2xkVktpZCxcclxuICAgICAgICAgICAgICBuZXdWS2lkc1tuZXdIZWFkXSxcclxuICAgICAgICAgICAgICBsaXN0ZW5lcixcclxuICAgICAgICAgICAgICBpc1N2Z1xyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICAgIG5ld0tleWVkW25ld0tleV0gPSB0cnVlXHJcbiAgICAgICAgICAgIG9sZEhlYWQrK1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKCh0bXBWS2lkID0ga2V5ZWRbbmV3S2V5XSkgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgIHBhdGNoKFxyXG4gICAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICAgIG5vZGUuaW5zZXJ0QmVmb3JlKHRtcFZLaWQubm9kZSwgb2xkVktpZCAmJiBvbGRWS2lkLm5vZGUpLFxyXG4gICAgICAgICAgICAgICAgdG1wVktpZCxcclxuICAgICAgICAgICAgICAgIG5ld1ZLaWRzW25ld0hlYWRdLFxyXG4gICAgICAgICAgICAgICAgbGlzdGVuZXIsXHJcbiAgICAgICAgICAgICAgICBpc1N2Z1xyXG4gICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICBuZXdLZXllZFtuZXdLZXldID0gdHJ1ZVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBhdGNoKFxyXG4gICAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICAgIG9sZFZLaWQgJiYgb2xkVktpZC5ub2RlLFxyXG4gICAgICAgICAgICAgICAgbnVsbCxcclxuICAgICAgICAgICAgICAgIG5ld1ZLaWRzW25ld0hlYWRdLFxyXG4gICAgICAgICAgICAgICAgbGlzdGVuZXIsXHJcbiAgICAgICAgICAgICAgICBpc1N2Z1xyXG4gICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbmV3SGVhZCsrXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB3aGlsZSAob2xkSGVhZCA8PSBvbGRUYWlsKSB7XHJcbiAgICAgICAgaWYgKGdldEtleSgob2xkVktpZCA9IG9sZFZLaWRzW29sZEhlYWQrK10pKSA9PSBudWxsKSB7XHJcbiAgICAgICAgICBub2RlLnJlbW92ZUNoaWxkKG9sZFZLaWQubm9kZSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAodmFyIGkgaW4ga2V5ZWQpIHtcclxuICAgICAgICBpZiAobmV3S2V5ZWRbaV0gPT0gbnVsbCkge1xyXG4gICAgICAgICAgbm9kZS5yZW1vdmVDaGlsZChrZXllZFtpXS5ub2RlKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIChuZXdWTm9kZS5ub2RlID0gbm9kZSlcclxufVxyXG5cclxudmFyIHByb3BzQ2hhbmdlZCA9IGZ1bmN0aW9uKGEsIGIpIHtcclxuICBmb3IgKHZhciBrIGluIGEpIGlmIChhW2tdICE9PSBiW2tdKSByZXR1cm4gdHJ1ZVxyXG4gIGZvciAodmFyIGsgaW4gYikgaWYgKGFba10gIT09IGJba10pIHJldHVybiB0cnVlXHJcbn1cclxuXHJcbnZhciBnZXRUZXh0Vk5vZGUgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgcmV0dXJuIHR5cGVvZiBub2RlID09PSBcIm9iamVjdFwiID8gbm9kZSA6IGNyZWF0ZVRleHRWTm9kZShub2RlKVxyXG59XHJcblxyXG52YXIgZ2V0Vk5vZGUgPSBmdW5jdGlvbihuZXdWTm9kZSwgb2xkVk5vZGUpIHtcclxuICByZXR1cm4gbmV3Vk5vZGUudHlwZSA9PT0gTEFaWV9OT0RFXHJcbiAgICA/ICgoIW9sZFZOb2RlIHx8ICFvbGRWTm9kZS5sYXp5IHx8IHByb3BzQ2hhbmdlZChvbGRWTm9kZS5sYXp5LCBuZXdWTm9kZS5sYXp5KSlcclxuICAgICAgICAmJiAoKG9sZFZOb2RlID0gZ2V0VGV4dFZOb2RlKG5ld1ZOb2RlLmxhenkudmlldyhuZXdWTm9kZS5sYXp5KSkpLmxhenkgPVxyXG4gICAgICAgICAgbmV3Vk5vZGUubGF6eSksXHJcbiAgICAgIG9sZFZOb2RlKVxyXG4gICAgOiBuZXdWTm9kZVxyXG59XHJcblxyXG52YXIgY3JlYXRlVk5vZGUgPSBmdW5jdGlvbihuYW1lLCBwcm9wcywgY2hpbGRyZW4sIG5vZGUsIGtleSwgdHlwZSkge1xyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiBuYW1lLFxyXG4gICAgcHJvcHM6IHByb3BzLFxyXG4gICAgY2hpbGRyZW46IGNoaWxkcmVuLFxyXG4gICAgbm9kZTogbm9kZSxcclxuICAgIHR5cGU6IHR5cGUsXHJcbiAgICBrZXk6IGtleVxyXG4gIH1cclxufVxyXG5cclxudmFyIGNyZWF0ZVRleHRWTm9kZSA9IGZ1bmN0aW9uKHZhbHVlLCBub2RlKSB7XHJcbiAgcmV0dXJuIGNyZWF0ZVZOb2RlKHZhbHVlLCBFTVBUWV9PQkosIEVNUFRZX0FSUiwgbm9kZSwgdW5kZWZpbmVkLCBURVhUX05PREUpXHJcbn1cclxuXHJcbnZhciByZWN5Y2xlTm9kZSA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gVEVYVF9OT0RFXHJcbiAgICA/IGNyZWF0ZVRleHRWTm9kZShub2RlLm5vZGVWYWx1ZSwgbm9kZSlcclxuICAgIDogY3JlYXRlVk5vZGUoXHJcbiAgICAgICAgbm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpLFxyXG4gICAgICAgIEVNUFRZX09CSixcclxuICAgICAgICBtYXAuY2FsbChub2RlLmNoaWxkTm9kZXMsIHJlY3ljbGVOb2RlKSxcclxuICAgICAgICBub2RlLFxyXG4gICAgICAgIHVuZGVmaW5lZCxcclxuICAgICAgICBSRUNZQ0xFRF9OT0RFXHJcbiAgICAgIClcclxufVxyXG5cclxuZXhwb3J0IHZhciBMYXp5ID0gZnVuY3Rpb24ocHJvcHMpIHtcclxuICByZXR1cm4ge1xyXG4gICAgbGF6eTogcHJvcHMsXHJcbiAgICB0eXBlOiBMQVpZX05PREVcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgaCA9IGZ1bmN0aW9uKG5hbWUsIHByb3BzKSB7XHJcbiAgZm9yICh2YXIgdmRvbSwgcmVzdCA9IFtdLCBjaGlsZHJlbiA9IFtdLCBpID0gYXJndW1lbnRzLmxlbmd0aDsgaS0tID4gMjsgKSB7XHJcbiAgICByZXN0LnB1c2goYXJndW1lbnRzW2ldKVxyXG4gIH1cclxuXHJcbiAgd2hpbGUgKHJlc3QubGVuZ3RoID4gMCkge1xyXG4gICAgaWYgKGlzQXJyYXkoKHZkb20gPSByZXN0LnBvcCgpKSkpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IHZkb20ubGVuZ3RoOyBpLS0gPiAwOyApIHtcclxuICAgICAgICByZXN0LnB1c2godmRvbVtpXSlcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmICh2ZG9tID09PSBmYWxzZSB8fCB2ZG9tID09PSB0cnVlIHx8IHZkb20gPT0gbnVsbCkge1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY2hpbGRyZW4ucHVzaChnZXRUZXh0Vk5vZGUodmRvbSkpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcm9wcyA9IHByb3BzIHx8IEVNUFRZX09CSlxyXG5cclxuICByZXR1cm4gdHlwZW9mIG5hbWUgPT09IFwiZnVuY3Rpb25cIlxyXG4gICAgPyBuYW1lKHByb3BzLCBjaGlsZHJlbilcclxuICAgIDogY3JlYXRlVk5vZGUobmFtZSwgcHJvcHMsIGNoaWxkcmVuLCB1bmRlZmluZWQsIHByb3BzLmtleSlcclxufVxyXG5cclxuZXhwb3J0IHZhciBhcHAgPSBmdW5jdGlvbihwcm9wcykge1xyXG4gIHZhciBzdGF0ZSA9IHt9XHJcbiAgdmFyIGxvY2sgPSBmYWxzZVxyXG4gIHZhciB2aWV3ID0gcHJvcHMudmlld1xyXG4gIHZhciBub2RlID0gcHJvcHMubm9kZVxyXG4gIHZhciB2ZG9tID0gbm9kZSAmJiByZWN5Y2xlTm9kZShub2RlKVxyXG4gIHZhciBzdWJzY3JpcHRpb25zID0gcHJvcHMuc3Vic2NyaXB0aW9uc1xyXG4gIHZhciBzdWJzID0gW11cclxuICB2YXIgb25FbmQgPSBwcm9wcy5vbkVuZFxyXG5cclxuICB2YXIgbGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgZGlzcGF0Y2godGhpcy5hY3Rpb25zW2V2ZW50LnR5cGVdLCBldmVudClcclxuICB9XHJcblxyXG4gIHZhciBzZXRTdGF0ZSA9IGZ1bmN0aW9uKG5ld1N0YXRlKSB7XHJcbiAgICBpZiAoc3RhdGUgIT09IG5ld1N0YXRlKSB7XHJcbiAgICAgIHN0YXRlID0gbmV3U3RhdGVcclxuICAgICAgaWYgKHN1YnNjcmlwdGlvbnMpIHtcclxuICAgICAgICBzdWJzID0gcGF0Y2hTdWJzKHN1YnMsIGJhdGNoKFtzdWJzY3JpcHRpb25zKHN0YXRlKV0pLCBkaXNwYXRjaClcclxuICAgICAgfVxyXG4gICAgICBpZiAodmlldyAmJiAhbG9jaykgZGVmZXIocmVuZGVyLCAobG9jayA9IHRydWUpKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN0YXRlXHJcbiAgfVxyXG5cclxuICB2YXIgZGlzcGF0Y2ggPSAocHJvcHMubWlkZGxld2FyZSB8fFxyXG4gICAgZnVuY3Rpb24ob2JqKSB7XHJcbiAgICAgIHJldHVybiBvYmpcclxuICAgIH0pKGZ1bmN0aW9uKGFjdGlvbiwgcHJvcHMpIHtcclxuICAgIHJldHVybiB0eXBlb2YgYWN0aW9uID09PSBcImZ1bmN0aW9uXCJcclxuICAgICAgPyBkaXNwYXRjaChhY3Rpb24oc3RhdGUsIHByb3BzKSlcclxuICAgICAgOiBpc0FycmF5KGFjdGlvbilcclxuICAgICAgPyB0eXBlb2YgYWN0aW9uWzBdID09PSBcImZ1bmN0aW9uXCIgfHwgaXNBcnJheShhY3Rpb25bMF0pXHJcbiAgICAgICAgPyBkaXNwYXRjaChcclxuICAgICAgICAgICAgYWN0aW9uWzBdLFxyXG4gICAgICAgICAgICB0eXBlb2YgYWN0aW9uWzFdID09PSBcImZ1bmN0aW9uXCIgPyBhY3Rpb25bMV0ocHJvcHMpIDogYWN0aW9uWzFdXHJcbiAgICAgICAgICApXHJcbiAgICAgICAgOiAoYmF0Y2goYWN0aW9uLnNsaWNlKDEpKS5tYXAoZnVuY3Rpb24oZngpIHtcclxuICAgICAgICAgICAgZnggJiYgZnhbMF0oZGlzcGF0Y2gsIGZ4WzFdKVxyXG4gICAgICAgICAgfSwgc2V0U3RhdGUoYWN0aW9uWzBdKSksXHJcbiAgICAgICAgICBzdGF0ZSlcclxuICAgICAgOiBzZXRTdGF0ZShhY3Rpb24pXHJcbiAgfSlcclxuXHJcbiAgdmFyIHJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgbG9jayA9IGZhbHNlXHJcbiAgICBub2RlID0gcGF0Y2goXHJcbiAgICAgIG5vZGUucGFyZW50Tm9kZSxcclxuICAgICAgbm9kZSxcclxuICAgICAgdmRvbSxcclxuICAgICAgKHZkb20gPSBnZXRUZXh0Vk5vZGUodmlldyhzdGF0ZSkpKSxcclxuICAgICAgbGlzdGVuZXJcclxuICAgIClcclxuICAgIG9uRW5kKClcclxuICB9XHJcblxyXG4gIGRpc3BhdGNoKHByb3BzLmluaXQpXHJcbn1cclxuIiwiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9JU3RhdGVcIjtcclxuXHJcblxyXG5jb25zdCBpbml0U3Vic2NyaXB0aW9ucyA9IChzdGF0ZTogSVN0YXRlKTogYW55W10gPT4ge1xyXG5cclxuICAgIGlmICghc3RhdGUpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnM6IGFueVtdID0gW1xyXG5cclxuICAgIF07XHJcblxyXG4gICAgcmV0dXJuIHN1YnNjcmlwdGlvbnM7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBpbml0U3Vic2NyaXB0aW9ucztcclxuXHJcbiIsIlxyXG5cclxuY29uc3QgaW5pdEV2ZW50cyA9IHtcclxuXHJcbiAgICBvblJlbmRlckZpbmlzaGVkOiAoKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIGNvbXBhcmlzb25PblJlbmRlckZpbmlzaGVkLnNldFVwKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIHJlZ2lzdGVyR2xvYmFsRXZlbnRzOiAoKSA9PiB7XHJcblxyXG4gICAgICAgIHdpbmRvdy5vbnJlc2l6ZSA9ICgpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGluaXRFdmVudHMub25SZW5kZXJGaW5pc2hlZCgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIGRvY3VtZW50Lm9ubW91c2Vtb3ZlID0gKF9ldmVudDogTW91c2VFdmVudCk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICAvLyAgICAgbGV0IGhhbmRsZWQgPSBjb21wYXJpc29uT25SZW5kZXJGaW5pc2hlZC5zZXRVcE1vdXNlTW92ZUhhbmRsZXJzKCk7XHJcblxyXG4gICAgICAgIC8vICAgICBpZiAoaGFuZGxlZCkge1xyXG5cclxuICAgICAgICAvLyAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAvLyAgICAgfVxyXG5cclxuICAgICAgICAvLyAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgLy8gfTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGluaXRFdmVudHM7XHJcblxyXG5cclxuIiwiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9JU3RhdGVcIjtcclxuXHJcblxyXG4vLyBUaGlzIGlzIHdoZXJlIGFsbCBhbGVydHMgdG8gZGF0YSBjaGFuZ2VzIHNob3VsZCBiZSBtYWRlXHJcbmNvbnN0IGdTdGF0ZUNvZGUgPSB7XHJcblxyXG4gICAgY2xvbmVTdGF0ZTogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBsZXQgbmV3U3RhdGU6IElTdGF0ZSA9IHsgLi4uc3RhdGUgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ld1N0YXRlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ1N0YXRlQ29kZTtcclxuXHJcbiIsImltcG9ydCBJUGVudCBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9JUGVudFwiO1xyXG5cclxuXHJcbmNvbnN0IHBlbnRTaWRlVmFsaWRhdGlvbkNvZGUgPSB7XHJcblxyXG4gICAgdmFsaWRhdGVWYWx1ZXM6IChwZW50OiBJUGVudCk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBsZXQgYWxlcnRUZXh0ID0gXCJcIjtcclxuXHJcbiAgICAgICAgaWYgKHBlbnQubWF4U3R1ZERpc3RhbmNlID09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgbWF4U3R1ZERpc3RhbmNlIGlzIHVuZGVmaW5lZFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LmZyYW1pbmdTaXplUGl2b3QgPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGBmcmFtaW5nU2l6ZVBpdm90IGlzIHVuZGVmaW5lZFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LmZsb29yT3ZlcmhhbmdTdGFuZGFyZCA9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYGZsb29yT3ZlcmhhbmdTdGFuZGFyZCBpcyB1bmRlZmluZWRcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVudC5mbG9vck92ZXJoYW5nSGVhdnkgPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGBmbG9vck92ZXJoYW5nSGVhdnkgaXMgdW5kZWZpbmVkXHJcbiAgICBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBlbnQubWF4UGFuZWxMZW5ndGggPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGBtYXhQYW5lbExlbmd0aCBpcyB1bmRlZmluZWRcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVudC5mbG9vckRlcHRoID09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgZmxvb3JEZXB0aCBpcyB1bmRlZmluZWRcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVudC5mcm9udEhlaWdodCA9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYGZyb250SGVpZ2h0IGlzIHVuZGVmaW5lZFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LmJhY2tIZWlnaHQgPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGBiYWNrSGVpZ2h0IGlzIHVuZGVmaW5lZFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LmZyYW1pbmdXaWR0aCA9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYGZyYW1pbmdXaWR0aCBpcyB1bmRlZmluZWRcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVudC5mcmFtaW5nRGVwdGggPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGBmcmFtaW5nRGVwdGggaXMgdW5kZWZpbmVkXHJcbiAgICBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBlbnQucm9vZlJhaWxXaWR0aCA9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYHJvb2ZSYWlsV2lkdGggaXMgdW5kZWZpbmVkXHJcbiAgICBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBlbnQucm9vZlJhaWxEZXB0aCA9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYHJvb2ZSYWlsRGVwdGggaXMgdW5kZWZpbmVkXHJcbiAgICBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBlbnQuc2lkZUNvdW50ID09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgc2lkZUNvdW50IGlzIHVuZGVmaW5lZFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LmJ1aWxkUGFuZWxzVG9nZXRoZXIgPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGBidWlsZFBhbmVsc1RvZ2V0aGVyIGlzIHVuZGVmaW5lZFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LnNoaXBsYXBCb3R0b21PdmVyaGFuZyA9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYHNoaXBsYXBCb3R0b21PdmVyaGFuZyBpcyB1bmRlZmluZWRcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVudC5zaGlwbGFwQnV0dGluZ1dpZHRoID09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgc2hpcGxhcEJ1dHRpbmdXaWR0aCBpcyB1bmRlZmluZWRcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVudC5zaGlwbGFwRGVwdGggPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGBzaGlwbGFwRGVwdGggaXMgdW5kZWZpbmVkXHJcbiAgICBgO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGlmIChwZW50Lm1heFN0dWREaXN0YW5jZSA8IDEwMFxyXG4gICAgICAgICAgICB8fCBwZW50Lm1heFN0dWREaXN0YW5jZSA+IDEwMDBcclxuICAgICAgICApIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgbWF4U3R1ZERpc3RhbmNlIGlzIGxlc3MgdGhhbiAxMDAgb3IgZ3JlYXRlciB0aGFuIDEwMDBcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVudC5mcmFtaW5nU2l6ZVBpdm90IDwgMTBcclxuICAgICAgICAgICAgfHwgcGVudC5mcmFtaW5nU2l6ZVBpdm90ID4gMTAwMFxyXG4gICAgICAgICkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGBmcmFtaW5nU2l6ZVBpdm90IGlzIHVuZGVmaW5lZFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LmZsb29yT3ZlcmhhbmdTdGFuZGFyZCA8IDFcclxuICAgICAgICAgICAgfHwgcGVudC5mbG9vck92ZXJoYW5nU3RhbmRhcmQgPiAxMDBcclxuICAgICAgICApIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgZmxvb3JPdmVyaGFuZ1N0YW5kYXJkIGlzIGxlc3MgdGhhbiAxIG9yIGdyZWF0ZXIgdGhhbiAxMDBcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVudC5mbG9vck92ZXJoYW5nSGVhdnkgPCAxXHJcbiAgICAgICAgICAgIHx8IHBlbnQuZmxvb3JPdmVyaGFuZ0hlYXZ5ID4gMTAwXHJcbiAgICAgICAgKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYGZsb29yT3ZlcmhhbmdIZWF2eSBpcyBsZXNzIHRoYW4gMTAwIG9yIGdyZWF0ZXIgdGhhbiAxMDBcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVudC5tYXhQYW5lbExlbmd0aCA8IDEwMFxyXG4gICAgICAgICAgICB8fCBwZW50Lm1heFBhbmVsTGVuZ3RoID4gMTAwMDBcclxuICAgICAgICApIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgbWF4UGFuZWxMZW5ndGggaXMgbGVzcyB0aGFuIDEwMCBvciBncmVhdGVyIHRoYW4gNTAwMFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LmZsb29yRGVwdGhcclxuICAgICAgICAgICAgJiYgKHBlbnQuZmxvb3JEZXB0aCA8IDEwMFxyXG4gICAgICAgICAgICAgICAgfHwgcGVudC5mbG9vckRlcHRoID4gMjAwMDApXHJcbiAgICAgICAgKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYGZsb29yRGVwdGggaXMgbGVzcyB0aGFuIDEwMCBvciBncmVhdGVyIHRoYW4gMjAwMDBcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVudC5mcm9udEhlaWdodFxyXG4gICAgICAgICAgICAmJiAocGVudC5mcm9udEhlaWdodCA8IDEwMFxyXG4gICAgICAgICAgICAgICAgfHwgcGVudC5mcm9udEhlaWdodCA+IDQwMDApXHJcbiAgICAgICAgKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYGZyb250SGVpZ2h0IGlzIGxlc3MgdGhhbiAxMDAgb3IgZ3JlYXRlciB0aGFuIDQwMDBcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVudC5iYWNrSGVpZ2h0XHJcbiAgICAgICAgICAgICYmIChwZW50LmJhY2tIZWlnaHQgPCAxMDBcclxuICAgICAgICAgICAgICAgIHx8IHBlbnQuYmFja0hlaWdodCA+IDQwMDApXHJcbiAgICAgICAgKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYGJhY2tIZWlnaHQgaXMgbGVzcyB0aGFuIDEwMCBvciBncmVhdGVyIHRoYW4gNDAwMFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LmZyYW1pbmdXaWR0aCA8IDEwXHJcbiAgICAgICAgICAgIHx8IHBlbnQuZnJhbWluZ1dpZHRoID4gMzAwKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYGZyYW1pbmdXaWR0aCBpcyBsZXNzIHRoYW4gMTAgb3IgZ3JlYXRlciB0aGFuIDMwMFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LmZyYW1pbmdEZXB0aCA8IDEwXHJcbiAgICAgICAgICAgIHx8IHBlbnQuZnJhbWluZ0RlcHRoID4gMzAwKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYGZyYW1pbmdEZXB0aCBpcyBsZXNzIHRoYW4gMTAgb3IgZ3JlYXRlciB0aGFuIDMwMFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LnJvb2ZSYWlsV2lkdGggPCAxMFxyXG4gICAgICAgICAgICB8fCBwZW50LnJvb2ZSYWlsV2lkdGggPiAzMDApIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgcm9vZlJhaWxXaWR0aCBpcyBsZXNzIHRoYW4gMTAgb3IgZ3JlYXRlciB0aGFuIDMwMFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LnJvb2ZSYWlsRGVwdGggPCAxMFxyXG4gICAgICAgICAgICB8fCBwZW50LnJvb2ZSYWlsRGVwdGggPiAzMDApIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgcm9vZlJhaWxEZXB0aCBpcyBsZXNzIHRoYW4gMTAgb3IgZ3JlYXRlciB0aGFuIDMwMFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LnNpZGVDb3VudCA8IDFcclxuICAgICAgICAgICAgfHwgcGVudC5zaWRlQ291bnQgPiAyKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYHNpZGVDb3VudCBpcyBsZXNzIHRoYW4gMSBvciBncmVhdGVyIHRoYW4gMlxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LnNoaXBsYXBCb3R0b21PdmVyaGFuZyA8IDFcclxuICAgICAgICAgICAgfHwgcGVudC5zaGlwbGFwQm90dG9tT3ZlcmhhbmcgPiAxMDApIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgc2hpcGxhcEJvdHRvbU92ZXJoYW5nIGlzIGxlc3MgdGhhbiAxIG9yIGdyZWF0ZXIgdGhhbiAxMDBcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVudC5zaGlwbGFwQnV0dGluZ1dpZHRoIDwgMTBcclxuICAgICAgICAgICAgfHwgcGVudC5zaGlwbGFwQnV0dGluZ1dpZHRoID4gMTAwMCkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGBzaGlwbGFwQnV0dGluZ1dpZHRoIGlzIGxlc3MgdGhhbiAxMCBvciBncmVhdGVyIHRoYW4gMTAwMFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LnNoaXBsYXBEZXB0aCA8IDEwXHJcbiAgICAgICAgICAgIHx8IHBlbnQuc2hpcGxhcERlcHRoID4gMTAwMCkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGBzaGlwbGFwRGVwdGggaXMgbGVzcyB0aGFuIDEwIG9yIGdyZWF0ZXIgdGhhbiAxMDAwXHJcbiAgICBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGFsZXJ0VGV4dFxyXG4gICAgICAgICAgICAmJiBhbGVydFRleHQubGVuZ3RoID4gMCkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnQoYWxlcnRUZXh0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBwZW50U2lkZVZhbGlkYXRpb25Db2RlO1xyXG5cclxuIiwiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9JU3RhdGVcIjtcclxuaW1wb3J0IHBlbnRTaWRlVmFsaWRhdGlvbkNvZGUgZnJvbSBcIi4vcGVudFNpZGVWYWxpZGF0aW9uQ29kZVwiO1xyXG5pbXBvcnQgSVBlbnQgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvSVBlbnRcIjtcclxuaW1wb3J0IElWaWV3RWxlbWVudCBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9JVmlld0VsZW1lbnRcIjtcclxuXHJcblxyXG5sZXQgY3VycmVudFBhZ2VDaGlsZHJlbjogSVZpZXdFbGVtZW50W10gPSBbXTtcclxubGV0IHBhZ2VzOiBJVmlld0VsZW1lbnRbXSA9IFtdO1xyXG5cclxuY29uc3QgYWRkUGFnZSA9ICgpOiB2b2lkID0+IHtcclxuXHJcbiAgICBjdXJyZW50UGFnZUNoaWxkcmVuID0gW107XHJcblxyXG4gICAgcGFnZXMucHVzaCh7XHJcbiAgICAgICAgdHlwZTogJ3BhZ2UnLFxyXG4gICAgICAgIHByb3BlcnRpZXM6IHt9LFxyXG4gICAgICAgIHZhbHVlOiBjdXJyZW50UGFnZUNoaWxkcmVuXHJcbiAgICB9KTtcclxufVxyXG5cclxuY29uc3QgYWRkVWlFbGVtZW50ID0gKFxyXG4gICAgdHlwZTogc3RyaW5nLFxyXG4gICAgdmFsdWU6IHN0cmluZyB8IG51bGwgfCBBcnJheTxJVmlld0VsZW1lbnQ+LFxyXG4gICAgcHJvcGVydGllczogYW55IHwgbnVsbCA9IG51bGxcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgcHJvcGVydGllcyA/PyB7fTtcclxuXHJcbiAgICBjdXJyZW50UGFnZUNoaWxkcmVuLnB1c2goe1xyXG4gICAgICAgIHR5cGUsXHJcbiAgICAgICAgcHJvcGVydGllcyxcclxuICAgICAgICB2YWx1ZVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbmNvbnN0IGFkZFVpQ2hpbGRFbGVtZW50ID0gKFxyXG4gICAgcGFyZW50QXJyYXk6IElWaWV3RWxlbWVudFtdLFxyXG4gICAgdHlwZTogc3RyaW5nLFxyXG4gICAgdmFsdWU6IHN0cmluZyB8IG51bGwgfCBBcnJheTxJVmlld0VsZW1lbnQ+LFxyXG4gICAgcHJvcGVydGllczogYW55IHwgbnVsbCA9IG51bGxcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgcHJvcGVydGllcyA/PyB7fTtcclxuXHJcbiAgICBwYXJlbnRBcnJheS5wdXNoKHtcclxuICAgICAgICB0eXBlLFxyXG4gICAgICAgIHByb3BlcnRpZXMsXHJcbiAgICAgICAgdmFsdWVcclxuICAgIH0pO1xyXG59XHJcblxyXG5jb25zdCBjYWxjdWxhdGVGcmFtZVVwcmlnaHRBZGp1c3RtZW50ID0gKFxyXG4gICAgaG9yaXpvbnRhbERpc3RhbmNlRnJvbUZyb250OiBudW1iZXIsXHJcbiAgICByb29mQW5nbGVSYWRpYW5zOiBudW1iZXJcclxuKTogbnVtYmVyID0+IHtcclxuXHJcbiAgICBjb25zdCBhZGp1c3RtZW50ID0gaG9yaXpvbnRhbERpc3RhbmNlRnJvbUZyb250ICogTWF0aC50YW4ocm9vZkFuZ2xlUmFkaWFucyk7XHJcblxyXG4gICAgcmV0dXJuIGFkanVzdG1lbnQ7XHJcbn1cclxuXHJcbmNvbnN0IHByaW50U2hpcGxhcFRpbWJlclJlcXVpcmVtZW50cyA9IChcclxuICAgIHByaW50UGFuZWxOYW1lOiBzdHJpbmcsXHJcbiAgICBzaGlwbGFwQnV0dGluZ1dpZHRoSW50OiBudW1iZXIsXHJcbiAgICBzaGlwbGFwRGVwdGhJbnQ6IG51bWJlclxyXG4pID0+IHtcclxuXHJcbiAgICBhZGRQYWdlKCk7XHJcblxyXG4gICAgaWYgKHByaW50UGFuZWxOYW1lXHJcbiAgICAgICAgJiYgcHJpbnRQYW5lbE5hbWUubGVuZ3RoID4gMCkge1xyXG5cclxuICAgICAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgICAgICdoMScsXHJcbiAgICAgICAgICAgIGBQYW5lbCAke3ByaW50UGFuZWxOYW1lfWBcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAnaDInLFxyXG4gICAgICAgIGBTaGlwbGFwIGN1dHRpbmcgbGlzdGBcclxuICAgICk7XHJcblxyXG4gICAgLy8gVGltYmVyXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ2gzJyxcclxuICAgICAgICBgVGltYmVyIHJlcXVpcmVtZW50czpgLFxyXG4gICAgICAgIHsgY2xhc3M6ICd0b3AtcGFkZGVkJyB9XHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IGNoaWxkcmVuOiBBcnJheTxJVmlld0VsZW1lbnQ+ID0gW107XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICd1bCcsXHJcbiAgICAgICAgY2hpbGRyZW5cclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlDaGlsZEVsZW1lbnQoXHJcbiAgICAgICAgY2hpbGRyZW4sXHJcbiAgICAgICAgJ2xpJyxcclxuICAgICAgICBgU2hpcGxhcCB3aXRoIGEgYmFjayBidXR0aW5nIHdpZHRoIG9mICR7c2hpcGxhcEJ1dHRpbmdXaWR0aEludH1tbSBhbmQgZGVwdGggb2YgJHtzaGlwbGFwRGVwdGhJbnR9bW1gXHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgcHJpbnRTaGlwbGFwQ3V0dGluZ0xpc3QgPSAoXHJcbiAgICBwZW50OiBJUGVudCxcclxuICAgIHByaW50U2hpcGxhcEJvYXJkQ291bnQ6IG51bWJlcixcclxuICAgIHByaW50RnJhbWVCb3R0b21MZW5ndGg6IG51bWJlcixcclxuICAgIHByaW50UGFuZWxOYW1lID0gXCJcIlxyXG4pID0+IHtcclxuXHJcbiAgICBwcmludFNoaXBsYXBUaW1iZXJSZXF1aXJlbWVudHMoXHJcbiAgICAgICAgcHJpbnRQYW5lbE5hbWUsXHJcbiAgICAgICAgcGVudC5zaGlwbGFwQnV0dGluZ1dpZHRoLFxyXG4gICAgICAgIHBlbnQuc2hpcGxhcERlcHRoXHJcbiAgICApO1xyXG5cclxuICAgIC8vIFNoaXBsYXBcclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAnaDMnLFxyXG4gICAgICAgICdTaGlwbGFwIGJvYXJkcydcclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdwJyxcclxuICAgICAgICAnWVkgQ3V0IGJvdGggZW5kcyBzcXVhcmUuJ1xyXG4gICAgKTtcclxuXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ3AnLFxyXG4gICAgICAgIGBDdXQgJHtwcmludFNoaXBsYXBCb2FyZENvdW50fSBsZW5ndGhzIGF0IHRoZSBmb2xsb3dpbmcgbWVhc3VyZW1lbnQ6YFxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBjaGlsZHJlbjogQXJyYXk8SVZpZXdFbGVtZW50PiA9IFtdO1xyXG5cclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAndWwnLFxyXG4gICAgICAgIGNoaWxkcmVuXHJcbiAgICApO1xyXG5cclxuICAgIGFkZFVpQ2hpbGRFbGVtZW50KFxyXG4gICAgICAgIGNoaWxkcmVuLFxyXG4gICAgICAgICdsaScsXHJcbiAgICAgICAgYCR7cHJpbnRGcmFtZUJvdHRvbUxlbmd0aH1tbWBcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBwcmludENsYWRkaW5nSW5zdHJ1Y3Rpb25zID0gKFxyXG4gICAgcGVudDogSVBlbnQsXHJcbiAgICBwcmludFBhbmVsTmFtZTogc3RyaW5nXHJcbikgPT4ge1xyXG5cclxuICAgIGFkZFBhZ2UoKTtcclxuXHJcbiAgICBpZiAocHJpbnRQYW5lbE5hbWVcclxuICAgICAgICAmJiBwcmludFBhbmVsTmFtZS5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAgICAgJ2gxJyxcclxuICAgICAgICAgICAgYFBhbmVsICR7cHJpbnRQYW5lbE5hbWV9YFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdoMicsXHJcbiAgICAgICAgYFNoaXBsYXAgY2xhZGRpbmcgaW5zdHJ1Y3Rpb25zYFxyXG4gICAgKTtcclxuXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ3AnLFxyXG4gICAgICAgIGBTdGFydCBhdCB0aGUgcGFuZWwgYm90dG9tIGFuZCB3b3JrIHVwd2FyZHMuYFxyXG4gICAgKTtcclxuXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ3AnLFxyXG4gICAgICAgIGBPbiBwZW50IHNpZGVzIHRoZSBzaGlwbGFwIGZpbmlzaGVzIGZsdXNoIHdpdGggdGhlIGZyYW1lLmBcclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdwJyxcclxuICAgICAgICBgVGhlIGZpcnN0IGJvYXJkIG11c3Qgb3ZlcmhhbmcgdGhlIGJvdHRvbSByYWlsIGRvd253YXJkcyBieSBib3R0b20gb3Zlcmhhbmcgc2hvd24gYmVsb3cuIFVzZSBhIHNldCBzcXVhcmUgdG8gbWFrZSBzdXJlIHRoaXMgaXMgdGhlIGNhc2UgYXQgYm90aCBlbmRzIG9mIHRoZSBib2FyZC5gXHJcbiAgICApO1xyXG5cclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAncCcsXHJcbiAgICAgICAgYE1ha2Ugc3VyZSBhbGwgc2hpcGxhcCBlZGdlcyBhcmUgZmx1c2ggd2l0aCB0aGUgZnJhbWUgYmVmb3JlIGZpeGluZy5gXHJcbiAgICApO1xyXG5cclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAncCcsXHJcbiAgICAgICAgYE5haWwgb25lIGJvYXJkIGF0IGEgdGltZSB3aGlsZSBwdWxsaW5nIGRvd24gaGFyZCBhZ2FpbnN0IHRoZSBhbHJlYWR5IGZpeGVkIGJvYXJkcyAtIHRvIHByZXZlbnQgYW55IGdhcHMgYmV0d2VlbiB0aGUgYm9hcmRzIHNob3dpbmcgb24gdGhlIGluc2lkZSBzaGVkIHdoZW4gZmluaXNoZWQuYFxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBjaGlsZHJlbjogQXJyYXk8SVZpZXdFbGVtZW50PiA9IFtdO1xyXG5cclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAndWwnLFxyXG4gICAgICAgIGNoaWxkcmVuXHJcbiAgICApO1xyXG5cclxuICAgIGFkZFVpQ2hpbGRFbGVtZW50KFxyXG4gICAgICAgIGNoaWxkcmVuLFxyXG4gICAgICAgICdsaScsXHJcbiAgICAgICAgYGJvdHRvbSBvdmVyaGFuZzogJHtwZW50LnNoaXBsYXBCb3R0b21PdmVyaGFuZ31tbWBcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBwcmludEZyYW1lQXNzZW1ibHlJbnN0cnVjdGlvbnMgPSAoXHJcbiAgICBwcmludFBhbmVsTmFtZTogc3RyaW5nXHJcbikgPT4ge1xyXG5cclxuICAgIGFkZFBhZ2UoKTtcclxuXHJcbiAgICBpZiAocHJpbnRQYW5lbE5hbWVcclxuICAgICAgICAmJiBwcmludFBhbmVsTmFtZS5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAgICAgJ2gxJyxcclxuICAgICAgICAgICAgYFBhbmVsICR7cHJpbnRQYW5lbE5hbWV9YFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdoMicsXHJcbiAgICAgICAgYEZyYW1lIGFzc2VtYmx5IGluc3RydWN0aW9uc2BcclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdwJyxcclxuICAgICAgICBgU2lkZXMgc2hvdWxkIGJlIG1pcnJvciBpbWFnZXMgLSBCRVdBUkUgLSBhbiBhbGwgdG9vIGVhc3kgbWlzdGFrZSB0byBtYWtlIGlzIHRvIGJ1aWxkIHRoZW0gYXMgaWRlbnRpY2FsIGluc3RlYWQuXHJcblRoZSBiZXN0IHdheSB0byBwcmV2ZW50IHRoaXMgbWlzdGFrZSwgYW5kIGluZGVlZCBjbGFkZGluZyBvbmVzLCBpcyB0byBhc3NlbWJsZSBhbGwgNCBzaWRlcyBvbiB0b3Agb2YgdGhlIGZsb29yIGFuZCB0aGVuIG1hcmsgQ0xFQVJMWSB0aGUgZmFjZXMgdGhhdCBuZWVkIGNsYWRkaW5nIGFuZCBhbnkgY2xhZGRpbmcgb3ZlcmxhcHMuXHJcbklmIHRoaXMgaXMgbm90IHBvc3NpYmxlLCBwbGFjZSB0aGUgdHdvIHNpZGVzIG9uIHRvcCBvZiBlYWNoIG90aGVyIHdpdGggdGhlIHNpZGVzIHlvdSB3YW50IGNsYWRkZWQgZmFjaW5nIHVwLiBNYWtlIHN1cmUgdGhlIDIgdG9wIHNsb3BlcyBwb2ludCBpbiBvcHBvc2l0ZSBkaXJlY3Rpb25zLiBUaGVuIG1hcmsgQ0xFQVJMWSB0aGUgdG9wIGZhY2Ugb2YgZWFjaCBzaWRlIGFzIHRoZSBvbmUgbmVlZGluZyBjbGFkZGluZy5gXHJcbiAgICApO1xyXG5cclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAncCcsXHJcbiAgICAgICAgYE1ha2Ugc3VyZSBhbGwgZWRnZXMgYXJlIGZsdXNoIGJlZm9yZSBmaXhpbmcuYFxyXG4gICAgKTtcclxuXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ3AnLFxyXG4gICAgICAgIGBVc2UgMiBzY3Jld3MgdG8gZml4IGVhY2ggZW5kIG9mIGFuIHVwcmlnaHQgdG8gdGhlIHRvcCBhbmQgYm90dG9tIHJhaWxzLmBcclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdwJyxcclxuICAgICAgICBgV2hlbiBzY3Jld2luZyB0aGUgMiBvdXRlciBmcmFtZSB1cHJpZ2h0cyBwaWxvdCB0aGUgdG9wIGFuZCBib3R0b20gcmFpbHMgZmlyc3QsIG90aGVyd2lzZSB0aGUgcmFpbHMgd2lsbCBzcGxpdC5gXHJcbiAgICApO1xyXG5cclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAncCcsXHJcbiAgICAgICAgYFdoZW4gcGlsb3RpbmcgdGhlIHRvcCBmcmFtZSByYWlsIHJlbWVtYmVyIGl0IGlzIGFuZ2xlZCwgc28gZHJpbGwgYXQgdGhlIHNhbWUgc2xhbnQgYXMgdGhlIHNsYW50IG9uIHRoZSBjdXQgZmFjZS5gXHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgcHJpbnRGcmFtZVRpbWJlclJlcXVpcmVtZW50cyA9IChcclxuICAgIHByaW50UGFuZWxOYW1lOiBzdHJpbmcsXHJcbiAgICBmcmFtaW5nU2l6ZTogc3RyaW5nXHJcbikgPT4ge1xyXG5cclxuICAgIGFkZFBhZ2UoKTtcclxuXHJcbiAgICBpZiAocHJpbnRQYW5lbE5hbWVcclxuICAgICAgICAmJiBwcmludFBhbmVsTmFtZS5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAgICAgJ2gxJyxcclxuICAgICAgICAgICAgYFBhbmVsICR7cHJpbnRQYW5lbE5hbWV9YFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdoMicsXHJcbiAgICAgICAgYEZyYW1lIGN1dHRpbmcgbGlzdGBcclxuICAgICk7XHJcblxyXG4gICAgLy8gVGltYmVyXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ2gzJyxcclxuICAgICAgICBgVGltYmVyIHJlcXVpcmVtZW50czpgLFxyXG4gICAgICAgIHsgY2xhc3M6ICd0b3AtcGFkZGVkJyB9XHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IGNoaWxkcmVuOiBBcnJheTxJVmlld0VsZW1lbnQ+ID0gW107XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICd1bCcsXHJcbiAgICAgICAgY2hpbGRyZW5cclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlDaGlsZEVsZW1lbnQoXHJcbiAgICAgICAgY2hpbGRyZW4sXHJcbiAgICAgICAgJ2xpJyxcclxuICAgICAgICBgJHtmcmFtaW5nU2l6ZX0gZnJhbWluZ2BcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBwcmludEZyYW1lQm90dG9tID0gKFxyXG4gICAgcHJpbnRDb3VudExlbmd0aHM6IHN0cmluZyxcclxuICAgIHByaW50UGFuZWxGcmFtZUJvdHRvbUxlbmd0aDogbnVtYmVyLFxyXG4gICAgZnJhbWluZ1NpemU6IHN0cmluZyxcclxuICAgIHByaW50UGFuZWxOYW1lID0gXCJcIikgPT4ge1xyXG5cclxuICAgIHByaW50RnJhbWVUaW1iZXJSZXF1aXJlbWVudHMoXHJcbiAgICAgICAgcHJpbnRQYW5lbE5hbWUsXHJcbiAgICAgICAgZnJhbWluZ1NpemVcclxuICAgICk7XHJcblxyXG4gICAgLy8gQm90dG9tc1xyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdoMycsXHJcbiAgICAgICAgJ0ZyYW1lIGJvdHRvbSdcclxuICAgICk7XHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ3AnLFxyXG4gICAgICAgICdDdXQgYm90aCBlbmRzIHNxdWFyZS4nXHJcbiAgICApO1xyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdwJyxcclxuICAgICAgICBgQ3V0ICR7cHJpbnRDb3VudExlbmd0aHN9IG9mIHRoZSBmb2xsb3dpbmcgbWVhc3VyZW1lbnQ6YFxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBjaGlsZHJlbjogQXJyYXk8SVZpZXdFbGVtZW50PiA9IFtdO1xyXG5cclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAndWwnLFxyXG4gICAgICAgIGNoaWxkcmVuXHJcbiAgICApO1xyXG5cclxuICAgIGFkZFVpQ2hpbGRFbGVtZW50KFxyXG4gICAgICAgIGNoaWxkcmVuLFxyXG4gICAgICAgICdsaScsXHJcbiAgICAgICAgYCR7cHJpbnRQYW5lbEZyYW1lQm90dG9tTGVuZ3RofW1tYFxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IHByaW50RnJhbWVUb3AgPSAoXHJcbiAgICBwcmludENvdW50TGVuZ3Roczogc3RyaW5nLFxyXG4gICAgcHJpbnRQYW5lbEZyYW1lVG9wTGVuZ3RoUm91bmRlZEludDogbnVtYmVyLFxyXG4gICAgcm9vZkFuZ2xlRGVncmVlc1JvdW5kZWQ6IG51bWJlcixcclxuICAgIGZyYW1pbmdTaXplOiBzdHJpbmcsXHJcbiAgICBwcmludFBhbmVsTmFtZSA9IFwiXCIpID0+IHtcclxuXHJcbiAgICBwcmludEZyYW1lVGltYmVyUmVxdWlyZW1lbnRzKFxyXG4gICAgICAgIHByaW50UGFuZWxOYW1lLFxyXG4gICAgICAgIGZyYW1pbmdTaXplXHJcbiAgICApO1xyXG5cclxuICAgIC8vIFRvcFxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdoMycsXHJcbiAgICAgICAgJ0ZyYW1lIHRvcCdcclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdwJyxcclxuICAgICAgICBgQ3V0IGJvdGggZW5kcyBhdCBhbiBhbmdsZSBvZiAke3Jvb2ZBbmdsZURlZ3JlZXNSb3VuZGVkfcKwLmBcclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdwJyxcclxuICAgICAgICAnVGhlIGFuZ2xlZCBlbmRzIG11c3QgYmUgcGFyYWxsZWwgLSBpZSBmYWNlIGluIHRoZSBzYW1lIGRpcmVjdGlvbi4nXHJcbiAgICApO1xyXG5cclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAncCcsXHJcbiAgICAgICAgYFRoZSBhbmdsZSBzaG91bGQgYmUgb24gdGhlIHNob3J0ZXIgZmFjZSBvZiB0aGUgZnJhbWluZyAtIHRoZSBkZXB0aC5gXHJcbiAgICApO1xyXG5cclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAncCcsXHJcbiAgICAgICAgYEN1dCAke3ByaW50Q291bnRMZW5ndGhzfSBvZiB0aGUgZm9sbG93aW5nIG1lYXN1cmVtZW50OmBcclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgY2hpbGRyZW46IEFycmF5PElWaWV3RWxlbWVudD4gPSBbXTtcclxuXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ3VsJyxcclxuICAgICAgICBjaGlsZHJlblxyXG4gICAgKTtcclxuXHJcbiAgICBhZGRVaUNoaWxkRWxlbWVudChcclxuICAgICAgICBjaGlsZHJlbixcclxuICAgICAgICAnbGknLFxyXG4gICAgICAgIGAke3ByaW50UGFuZWxGcmFtZVRvcExlbmd0aFJvdW5kZWRJbnR9bW1gXHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgcHJpbnRVcHJpZ2h0cyA9IChcclxuICAgIHByaW50Q291bnRMZW5ndGhzOiBzdHJpbmcsXHJcbiAgICBwcmludFBhbmVsVXByaWdodHM6IEFycmF5PG51bWJlcj4sXHJcbiAgICByb29mQW5nbGVEZWdyZWVzUm91bmRlZDogbnVtYmVyLFxyXG4gICAgZnJhbWluZ1NpemU6IHN0cmluZyxcclxuICAgIHByaW50UGFuZWxOYW1lID0gXCJcIikgPT4ge1xyXG5cclxuICAgIHByaW50RnJhbWVUaW1iZXJSZXF1aXJlbWVudHMoXHJcbiAgICAgICAgcHJpbnRQYW5lbE5hbWUsXHJcbiAgICAgICAgZnJhbWluZ1NpemVcclxuICAgICk7XHJcblxyXG4gICAgLy8gVXByaWdodHNcclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAnaDMnLFxyXG4gICAgICAgICdGcmFtZSB1cHJpZ2h0cydcclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdwJyxcclxuICAgICAgICBgVGhlIHRvcCBlbmQgd2lsbCBiZSBjdXQgYXQgYW4gYW5nbGUsIHRoZSBib3R0b20gc3F1YXJlLmBcclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdwJyxcclxuICAgICAgICBgU3RhcnQgZWFjaCBsZW5ndGggYnkgY3V0dGluZyB0aGUgdG9wIGVuZCBhdCBhbiBhbmdsZSBvZiAke3Jvb2ZBbmdsZURlZ3JlZXNSb3VuZGVkfcKwLmBcclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdwJyxcclxuICAgICAgICAnTWVhc3VyZSBkb3duIGZyb20gdGhlIHBlYWsgb2YgdGhlIGFuZ2xlZCBjdXQgYW5kIGN1dCB0aGUgYm90dG9tIHNxdWFyZS4nXHJcbiAgICApO1xyXG5cclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAncCcsXHJcbiAgICAgICAgYFRoZSBhbmdsZSBzaG91bGQgYmUgb24gdGhlIHNob3J0ZXIgZmFjZSBvZiB0aGUgZnJhbWluZyAtIHRoZSBkZXB0aC5gXHJcbiAgICApO1xyXG5cclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAncCcsXHJcbiAgICAgICAgYEN1dCAke3ByaW50Q291bnRMZW5ndGhzfSBvZiB0aGUgZm9sbG93aW5nIG1lYXN1cmVtZW50czpgXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IGNoaWxkcmVuOiBBcnJheTxJVmlld0VsZW1lbnQ+ID0gW107XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICd1bCcsXHJcbiAgICAgICAgY2hpbGRyZW5cclxuICAgICk7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmludFBhbmVsVXByaWdodHMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgYWRkVWlDaGlsZEVsZW1lbnQoXHJcbiAgICAgICAgICAgIGNoaWxkcmVuLFxyXG4gICAgICAgICAgICAnbGknLFxyXG4gICAgICAgICAgICBgJHtwcmludFBhbmVsVXByaWdodHNbaV19bW1gXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IHByaW50U3BhY2VycyA9IChcclxuICAgIHBlbnQ6IElQZW50LFxyXG4gICAgcHJpbnRQYW5lbEF2YWlsYWJsZUxlbmd0aDogbnVtYmVyLFxyXG4gICAgcHJpbnRIb3Jpem9udGFsU3R1ZFNwYWNlcjogbnVtYmVyLFxyXG4gICAgZnJhbWluZ1NpemU6IHN0cmluZyxcclxuICAgIHByaW50UGFuZWxJbmRleCA9IDAsXHJcbiAgICBwcmludFBhbmVsTmFtZSA9IFwiXCJcclxuKSA9PiB7XHJcblxyXG4gICAgaWYgKHByaW50UGFuZWxBdmFpbGFibGVMZW5ndGggPiBwZW50Lm1heFN0dWREaXN0YW5jZSkge1xyXG5cclxuICAgICAgICBwcmludEZyYW1lVGltYmVyUmVxdWlyZW1lbnRzKFxyXG4gICAgICAgICAgICBwcmludFBhbmVsTmFtZSxcclxuICAgICAgICAgICAgZnJhbWluZ1NpemVcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBTcGFjZXJcclxuICAgICAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgICAgICdoMycsXHJcbiAgICAgICAgICAgICdTdHVkIHNwYWNlcnMnXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICAgICAncCcsXHJcbiAgICAgICAgICAgICdDdXQgYm90aCBlbmRzIHNxdWFyZS4nXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKHByaW50UGFuZWxJbmRleCA9PT0gMCkge1xyXG5cclxuICAgICAgICAgICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICAgICAgICAgJ3AnLFxyXG4gICAgICAgICAgICAgICAgYEN1dCAyIGxlbmd0aHMgb2YgdGhlIGZvbGxvd2luZyBtZWFzdXJlbWVudDpgXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgICAgICAgICAncCcsXHJcbiAgICAgICAgICAgICAgICBgVXNlIHRoZSAyIHNwYWNlcnMgYWxyZWFkeSBjdXQgd2l0aCB0aGUgZm9sbG93aW5nIG1lYXN1cmVtZW50OmBcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuOiBBcnJheTxJVmlld0VsZW1lbnQ+ID0gW107XHJcblxyXG4gICAgICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAgICAgJ3VsJyxcclxuICAgICAgICAgICAgY2hpbGRyZW5cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBhZGRVaUNoaWxkRWxlbWVudChcclxuICAgICAgICAgICAgY2hpbGRyZW4sXHJcbiAgICAgICAgICAgICdsaScsXHJcbiAgICAgICAgICAgIGAke3ByaW50SG9yaXpvbnRhbFN0dWRTcGFjZXJ9bW1gXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IHByaW50UGFuZWwgPSAoXHJcbiAgICBwZW50OiBJUGVudCxcclxuICAgIHByaW50Q291bnRMZW5ndGhzOiBzdHJpbmcsIC8vIHNpZGVDb3VudExlbmd0aHNcclxuICAgIHByaW50UGFuZWxGcmFtZUJvdHRvbUxlbmd0aDogbnVtYmVyLCAvL2ZyYW1lQm90dG9tTGVuZ3RoXHJcbiAgICBwcmludFBhbmVsRnJhbWVUb3BMZW5ndGhSb3VuZGVkSW50OiBudW1iZXIsIC8vIHBhbmVsRnJhbWVUb3BMZW5ndGhSb3VuZGVkSW50XHJcbiAgICBwcmludFBhbmVsVXByaWdodHM6IEFycmF5PG51bWJlcj4sIC8vcGFuZWxVcHJpZ2h0c1xyXG4gICAgcHJpbnRQYW5lbEF2YWlsYWJsZUxlbmd0aDogbnVtYmVyLCAvL3BhbmVsQXZhaWxhYmxlTGVuZ3RoXHJcbiAgICBwcmludEhvcml6b250YWxTdHVkU3BhY2VyOiBudW1iZXIsIC8vIGhvcml6b250YWxTdHVkU3BhY2VyXHJcbiAgICBwcmludFNoaXBsYXBCb2FyZENvdW50OiBudW1iZXIsXHJcbiAgICBmcmFtaW5nU2l6ZTogc3RyaW5nLFxyXG4gICAgcm9vZkFuZ2xlRGVncmVlc1JvdW5kZWQ6IG51bWJlcixcclxuICAgIHByaW50UGFuZWxOYW1lID0gJycsXHJcbiAgICBwcmludFBhbmVsSW5kZXggPSAwXHJcbikgPT4ge1xyXG5cclxuICAgIHByaW50RnJhbWVCb3R0b20oXHJcbiAgICAgICAgcHJpbnRDb3VudExlbmd0aHMsXHJcbiAgICAgICAgcHJpbnRQYW5lbEZyYW1lQm90dG9tTGVuZ3RoLFxyXG4gICAgICAgIGZyYW1pbmdTaXplLFxyXG4gICAgICAgIHByaW50UGFuZWxOYW1lXHJcbiAgICApO1xyXG5cclxuICAgIHByaW50RnJhbWVUb3AoXHJcbiAgICAgICAgcHJpbnRDb3VudExlbmd0aHMsXHJcbiAgICAgICAgcHJpbnRQYW5lbEZyYW1lVG9wTGVuZ3RoUm91bmRlZEludCxcclxuICAgICAgICByb29mQW5nbGVEZWdyZWVzUm91bmRlZCxcclxuICAgICAgICBmcmFtaW5nU2l6ZSxcclxuICAgICAgICBwcmludFBhbmVsTmFtZVxyXG4gICAgKTtcclxuXHJcbiAgICBwcmludFVwcmlnaHRzKFxyXG4gICAgICAgIHByaW50Q291bnRMZW5ndGhzLFxyXG4gICAgICAgIHByaW50UGFuZWxVcHJpZ2h0cyxcclxuICAgICAgICByb29mQW5nbGVEZWdyZWVzUm91bmRlZCxcclxuICAgICAgICBmcmFtaW5nU2l6ZSxcclxuICAgICAgICBwcmludFBhbmVsTmFtZVxyXG4gICAgKTtcclxuXHJcbiAgICBwcmludFNwYWNlcnMoXHJcbiAgICAgICAgcGVudCxcclxuICAgICAgICBwcmludFBhbmVsQXZhaWxhYmxlTGVuZ3RoLFxyXG4gICAgICAgIHByaW50SG9yaXpvbnRhbFN0dWRTcGFjZXIsXHJcbiAgICAgICAgZnJhbWluZ1NpemUsXHJcbiAgICAgICAgcHJpbnRQYW5lbEluZGV4LFxyXG4gICAgICAgIHByaW50UGFuZWxOYW1lXHJcbiAgICApO1xyXG5cclxuICAgIHByaW50RnJhbWVBc3NlbWJseUluc3RydWN0aW9ucyhwcmludFBhbmVsTmFtZSk7XHJcblxyXG4gICAgcHJpbnRTaGlwbGFwQ3V0dGluZ0xpc3QoXHJcbiAgICAgICAgcGVudCxcclxuICAgICAgICBwcmludFNoaXBsYXBCb2FyZENvdW50LFxyXG4gICAgICAgIHByaW50UGFuZWxGcmFtZUJvdHRvbUxlbmd0aCxcclxuICAgICAgICBwcmludFBhbmVsTmFtZVxyXG4gICAgKTtcclxuXHJcbiAgICBwcmludENsYWRkaW5nSW5zdHJ1Y3Rpb25zKFxyXG4gICAgICAgIHBlbnQsXHJcbiAgICAgICAgcHJpbnRQYW5lbE5hbWVcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBwZW50U2lkZUNhbGN1bGF0aW9uQ29kZSA9IHtcclxuXHJcbiAgICBjYWxjdWxhdGU6IChzdGF0ZTogSVN0YXRlKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIHBlbnRTaWRlVmFsaWRhdGlvbkNvZGUudmFsaWRhdGVWYWx1ZXMoc3RhdGUucGVudCk7XHJcbiAgICAgICAgcGFnZXMgPSBbXTtcclxuICAgICAgICBjdXJyZW50UGFnZUNoaWxkcmVuID0gW107XHJcblxyXG4gICAgICAgIGNvbnN0IHBlbnQgPSBzdGF0ZS5wZW50O1xyXG4gICAgICAgIHBlbnQuZmxvb3JEZXB0aCA9IHBlbnQuZmxvb3JEZXB0aCA/PyAwOyAvLyBtZWFzdXJlbWVudCBmcm9udCB0byBiYWNrXHJcbiAgICAgICAgcGVudC5mcm9udEhlaWdodCA9IHBlbnQuZnJvbnRIZWlnaHQgPz8gMDsgLy8gZnJvbnQgcGFuZWwgaGVpZ2h0XHJcbiAgICAgICAgcGVudC5iYWNrSGVpZ2h0ID0gcGVudC5iYWNrSGVpZ2h0ID8/IDA7IC8vIGJhY2sgcGFuZWwgaGVpZ2h0XHJcblxyXG4gICAgICAgIGNvbnN0IGZsb29yT3ZlcmhhbmcgPSBwZW50LmZyYW1pbmdXaWR0aCA+IHBlbnQuZnJhbWluZ1NpemVQaXZvdCA/IHBlbnQuZmxvb3JPdmVyaGFuZ0hlYXZ5IDogcGVudC5mbG9vck92ZXJoYW5nU3RhbmRhcmQ7XHJcbiAgICAgICAgY29uc3QgZnJhbWVCb3R0b21MZW5ndGggPSBwZW50LmZsb29yRGVwdGggKyAoMiAqIGZsb29yT3ZlcmhhbmcpOyAvLyBsZW5ndGggZnJvbnQgdG8gYmFjayBhbG9uZyB0aGUgZmxvb3IgLSBpbmNsdWRlcyBvdmVyaGFuZ1xyXG5cclxuICAgICAgICBjb25zdCBmcmFtaW5nU2l6ZSA9IGAke3BlbnQuZnJhbWluZ1dpZHRofW1tIHggJHtwZW50LmZyYW1pbmdEZXB0aH1tbWA7XHJcblxyXG5cclxuICAgICAgICAvLyBzaWRlIHBhbmVsIHNpemVzXHJcbiAgICAgICAgY29uc3QgYWRqdXN0ZWRGcmFtZUJvdHRvbUxlbmd0aCA9IGZyYW1lQm90dG9tTGVuZ3RoIC0gcGVudC5mcmFtaW5nV2lkdGg7IC8vIEJlY2F1c2UgdGhlIHJvb2YgcmFpbHMgd2lsbCBzaXQgb24gdGhlIGJhY2sgb2YgdGhlIGZyb250IHBhbmVscyBmcmFtZSBub3QgdGhlIHRoZSBmcm9udFxyXG4gICAgICAgIGNvbnN0IHRyaWFuZ2xlSGVpZ2h0ID0gcGVudC5mcm9udEhlaWdodCAtIHBlbnQuYmFja0hlaWdodDsgLy8gaG93IG1vdWNoIHRoZSByb29mIHJpc2VzIGZyb20gdGhlIGJhY2sgdG8gIHRoZSBmcm9udC5cclxuICAgICAgICBjb25zdCByb29mQW5nbGVSYWRpYW5zID0gTWF0aC5hdGFuMih0cmlhbmdsZUhlaWdodCwgYWRqdXN0ZWRGcmFtZUJvdHRvbUxlbmd0aCk7IC8vIHJvb2YgYW5nbGVcclxuXHJcbiAgICAgICAgY29uc3QgaGVpZ2h0QWRqdXN0bWVudEludCA9IHBlbnQuZnJhbWluZ1dpZHRoICogTWF0aC50YW4ocm9vZkFuZ2xlUmFkaWFucyk7IC8vIFRoZSBmcm9udCBwYW5lbCBpcyBzcXVhcmUsIHNvIHRoZSByb29mIHdpbGwgc2l0IG9uIHRoZSBiYWNrIG9mIHRoZSBmcm9udCBwYW5lbCBhbmQgcmlzZSBoZWlnaHRBZGp1c3RtZW50SW50IGFib3ZlIHRoZSBmcm9udCBvZiB0aGUgcGFuZWwuXHJcbiAgICAgICAgY29uc3QgYWRqdXN0ZWRGcm9udEhlaWdodEludCA9IHBlbnQuZnJvbnRIZWlnaHQgKyBoZWlnaHRBZGp1c3RtZW50SW50OyAvLyBUaGUgZnVsbCBoZWlnaHQgb2YgdGhlIGZyb250IHVwcmlnaHQgaWYgaXQgd2VyZSBhcyB0aGluIGFzIGEgcGVuY2lsIGxpbmUuXHJcbiAgICAgICAgY29uc3QgYWRqdXN0ZWRUcmlhbmdsZUhlaWdodCA9IHRyaWFuZ2xlSGVpZ2h0ICsgaGVpZ2h0QWRqdXN0bWVudEludDsgLy8gVGhlIHRyaWFuZ2xlIGhlaWdodCBpZiB0aGUgZnJhbWluZyB3ZXJlIHBlbmNpbCBsaW5lIHRoaW4uXHJcblxyXG4gICAgICAgIGNvbnN0IHJvb2ZBbmdsZURlZ3JlZXNSb3VuZGVkID0gTWF0aC5yb3VuZChyb29mQW5nbGVSYWRpYW5zICogMTgwIC8gTWF0aC5QSSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGFuZ2xlQWRqdXN0ZWRGcmFtZURlcHRoID0gcGVudC5mcmFtaW5nRGVwdGggLyBNYXRoLmNvcyhyb29mQW5nbGVSYWRpYW5zKTsgLy8gVGhlIHRvcCBiYXIgb2YgdGhlIHNpZGUgcGFuZWwgaXMgc2xvcHBlZC4gU28gaXQgYWRkcyBtb3JlIHRvIHRoZSBzaGVkIGhlaWdodCB0aGFuIGlmIGl0IHdlcmUgaG9yaXpvbnRhbC5cclxuICAgICAgICBjb25zdCBhbmdsZUFkanVzdGVkUmFpbFdpZHRoID0gcGVudC5yb29mUmFpbFdpZHRoIC8gTWF0aC5jb3Mocm9vZkFuZ2xlUmFkaWFucyk7IC8vIFRoZSByb29mIHJhaWwgaXMgc2xvcHBlZC4gU28gaXQgYWRkcyBtb3JlIHRvIHRoZSBzaGVkIGhlaWdodCB0aGFuIGlmIGl0IHdlcmUgaG9yaXpvbnRhbC5cclxuXHJcbiAgICAgICAgY29uc3QgcGFuZWxDb3VudEludCA9IE1hdGguY2VpbChmcmFtZUJvdHRvbUxlbmd0aCAvIHBlbnQubWF4UGFuZWxMZW5ndGgpOyAvLyBIb3cgbWFueSBlcXVhbCB3aWR0aCBwYW5lbHMgYXJlIG5lZWRlZCB0byBtYWtlIG9uZSBzaGVkIHNpZGUuXHJcbiAgICAgICAgY29uc3QgcGFuZWxGcmFtZUJvdHRvbUxlbmd0aEludCA9IE1hdGgucm91bmQoZnJhbWVCb3R0b21MZW5ndGggLyBwYW5lbENvdW50SW50KTsgLy8gVGhlIGxlbmd0aCBvZiB0aGUgYm90dG9tIGJhciBmb3IgZWFjaCBzaWRlIHBhbmVsLlxyXG4gICAgICAgIGNvbnN0IHBhbmVsRnJhbWVUb3BMZW5ndGhSb3VuZGVkSW50ID0gTWF0aC5yb3VuZChhZGp1c3RlZFRyaWFuZ2xlSGVpZ2h0IC8gKE1hdGguc2luKHJvb2ZBbmdsZVJhZGlhbnMpICogcGFuZWxDb3VudEludCkpOyAvLyBUaGUgbGVuZ3RoIG9mIHRoZSB0b3AgYmFyIChzbG9wcGVkKSBmb3IgZWFjaCBzaWRlIHBhbmVsLlxyXG5cclxuICAgICAgICAvLyBUaGUgaGVpZ2h0IG9mIHRoZSBmcm9udCBiYXIgb2YgdGhlIGZpcnN0IHBhbmVsIGZyb20gdGhlIGZyb250LCBcclxuICAgICAgICAvLyAgICAgIChpZSB0aGUgZnVsbCBwZW5jaWwgdGhpbiBoZWlnaHQgXHJcbiAgICAgICAgLy8gICAgICAgICAgLSBtaW51cyB0aGUgdGhpY2tuZXNzIG9mIHRoZSBib3R0b20gYmFyIC0gaXQgd2lsbCBzaXQgb24gaXQuXHJcbiAgICAgICAgLy8gICAgICAgICAgLSBtaW51cyB0aGUgYW5nbGVkIHRoaWNrbmVzcyBvZiB0aGUgdG9wIGJhciAtIHRoZSBzbG9wZWQgYmFyIHdpbGwgc2l0IG9uIHRvcCBvZiBpdCAtIGFzIGl0IGlzIHNsb3BlZCB0aGlzIHZhbHVlIHNob3VsZCBiZSBhIGxpdHRsZSBiaWdnZXIgdGhhbiB0aGUgdGhpY2tuZXNzIG9mIHRoZSBib3R0b20gYmFyLlxyXG4gICAgICAgIC8vICAgICAgICAgICsgdGhlIGFuZ2xlZCB0aGlja25lZXMgb2YgdGhlIHJvb2YgcmFpbC4gVGhlIHJvb2YgcmFpbHMgd2lsbCBzaXQgb24gdGhlIGZyb250IGFuZCBiYWNrIHBhbmVscyBidXQgbm90IG9uIHRoZSBzaWRlcywgdGhleSBvdmVyaGFuZyB0aGVtLCB0byB0aGUgc2lkZXMgdG91Y2ggdGhlIHJvb2YgYm9hcmRzIC0gaGVuY2UgYWRkIHJvb2YgcmFpbCBhbmdsZWQgdGhpY2tuZXNzLlxyXG4gICAgICAgIGNvbnN0IHNpZGVGcmFtZUZyb250TGVuZ3RoSW50ID0gYWRqdXN0ZWRGcm9udEhlaWdodEludCAtIHBlbnQuZnJhbWluZ0RlcHRoIC0gYW5nbGVBZGp1c3RlZEZyYW1lRGVwdGggKyBhbmdsZUFkanVzdGVkUmFpbFdpZHRoO1xyXG5cclxuXHJcbiAgICAgICAgY29uc3QgcGFuZWxBdmFpbGFibGVMZW5ndGggPSBwYW5lbEZyYW1lQm90dG9tTGVuZ3RoSW50IC0gcGVudC5mcmFtaW5nRGVwdGg7IC8vIFRoaXMgaXMgdGhlIGxlbmd0aCB0aGF0IG5lZWRzIHRvIGJlIHNwbGl0IHVwIHdpdGggZXF1YWxseSBzcGFjZWQgdXByaWdodHMgLSB0aGUgZnJhbWluZyBkZXB0aCBpcyBzdWJ0cmFjdGVkIGFzIGl0IGlzIHRoZSB0ZXJtaW5hdGluZyB1cHJpZ2h0LlxyXG4gICAgICAgIGNvbnN0IHN0dWREaXZpc2lvbkNvdW50ID0gTWF0aC5mbG9vcihwYW5lbEF2YWlsYWJsZUxlbmd0aCAvIHBlbnQubWF4U3R1ZERpc3RhbmNlKSArIDE7IC8vIEFkZCBvbmUgdG8gbWFrZSBzdXJlIGJlbG93IG1heFN0dWREaXN0YW5jZS5cclxuICAgICAgICBjb25zdCBob3Jpem9udGFsU3BhY2luZyA9IE1hdGgucm91bmQocGFuZWxBdmFpbGFibGVMZW5ndGggLyBzdHVkRGl2aXNpb25Db3VudCk7IC8vIEFzIHdlIHJlbXZlZCB0aGUgdGVybWluYXRpbmcgdXByaWdodCB3ZSBjYW4gbm93IGNvbnNpZGVyIHRoaXMgaG9yaXpvbnRhbCBzcGFjaW5nIGFzIHRoZSBzcGFjaW5nIHBsdXMgdGhlIGRlcHRoIG9mIG9uZSB1cHJpZ2h0LlxyXG4gICAgICAgIGNvbnN0IGhvcml6b250YWxTdHVkU3BhY2VyID0gaG9yaXpvbnRhbFNwYWNpbmcgLSBwZW50LmZyYW1pbmdEZXB0aDsgLy8gVGhlIHNwYWNpbmcgYmV0d2VlbiBzdHVkcy5cclxuXHJcbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgZHJvcCBpbiBoZWlnaHQgb2YgdGhpcyB1cHJpZ2h0IGNvbXBhcmVkIHRvIHRoZSBmcm9udCBvbmUgZm9yIGVhY2ggc3BhY2luZy5cclxuICAgICAgICBjb25zdCBzcGFjaW5nSGVpZ2h0QWRqdXN0bWVudCA9IGNhbGN1bGF0ZUZyYW1lVXByaWdodEFkanVzdG1lbnQoXHJcbiAgICAgICAgICAgIGhvcml6b250YWxTcGFjaW5nLFxyXG4gICAgICAgICAgICByb29mQW5nbGVSYWRpYW5zXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gV2hlbiB0d28gdXByaWdodHMgYXJlIGJ1dHRlZCB0b2dldGhlciAtIGxpa2UgdGhlIGxhc3QgdXByaWdodCBvbiBvbmUgcGFuZWwgYW5kIHRoZSBmaXJzdCB1cHJpZ2h0IG9mIHRoZSBuZXh0IHBhbmVsIC0gdGhpcyBpcyB0aGUgZHJvcCBpbiBoZWlnaHQgZm9yIHRoZSBzZWNvbmQgdXByaWdodCBjb21wYXJlZCB0byB0aGUgZmlyc3QuXHJcbiAgICAgICAgY29uc3QgZnJhbWVEZXB0aEhlaWdodEFkanVzdG1lbnQgPSBjYWxjdWxhdGVGcmFtZVVwcmlnaHRBZGp1c3RtZW50KFxyXG4gICAgICAgICAgICBwZW50LmZyYW1pbmdEZXB0aCxcclxuICAgICAgICAgICAgcm9vZkFuZ2xlUmFkaWFuc1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnN0IHNoaXBsYXBCb2FyZENvdW50czogQXJyYXk8bnVtYmVyPiA9IFtdO1xyXG4gICAgICAgIGNvbnN0IHNpZGVVcHJpZ2h0czogQXJyYXk8QXJyYXk8bnVtYmVyPj4gPSBbXTtcclxuICAgICAgICBsZXQgcGFuZWxVcHJpZ2h0czogQXJyYXk8bnVtYmVyPjtcclxuICAgICAgICBsZXQgcnVubmluZ0FkanVzdG1lbnQgPSAwO1xyXG4gICAgICAgIGxldCB1cHJpZ2h0SGVpZ2h0Um91bmRlZCA9IDA7XHJcbiAgICAgICAgLy8gbGV0IHNoaXBsYXBCb2FyZENvdW50ID0gMDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYW5lbENvdW50SW50OyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIHBhbmVsVXByaWdodHMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDw9IHN0dWREaXZpc2lvbkNvdW50OyBqKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICB1cHJpZ2h0SGVpZ2h0Um91bmRlZCA9IE1hdGgucm91bmQoc2lkZUZyYW1lRnJvbnRMZW5ndGhJbnQgLSBydW5uaW5nQWRqdXN0bWVudCk7XHJcbiAgICAgICAgICAgICAgICBwYW5lbFVwcmlnaHRzLnB1c2godXByaWdodEhlaWdodFJvdW5kZWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGlmIChqID09PSAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gICAgIHNoaXBsYXBCb2FyZENvdW50ID0gTWF0aC5jZWlsKCh1cHJpZ2h0SGVpZ2h0Um91bmRlZCArIHBlbnQuc2hpcGxhcEJvdHRvbU92ZXJoYW5nKSAvIHBlbnQuc2hpcGxhcEJ1dHRpbmdXaWR0aCk7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgc2hpcGxhcEJvYXJkQ291bnRzLnB1c2goc2hpcGxhcEJvYXJkQ291bnQpO1xyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChqID09PSBzdHVkRGl2aXNpb25Db3VudCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBydW5uaW5nQWRqdXN0bWVudCArPSBmcmFtZURlcHRoSGVpZ2h0QWRqdXN0bWVudDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bm5pbmdBZGp1c3RtZW50ICs9IHNwYWNpbmdIZWlnaHRBZGp1c3RtZW50O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzaWRlVXByaWdodHMucHVzaChwYW5lbFVwcmlnaHRzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE5lZWQgdG8gZ2V0IHRoZW0gdG8gbGFiZWwgZWFjaCBwYXJ0IHNvIHRoZXJlIGlzIG5vIGNvbmZ1c2lvblxyXG4gICAgICAgIC8vIEFsc28gd2FudCB0byBzcGxpdCBpdCBvdXQgaW4gbW9yZSBwYWdlcyB0byBtYWtlIGl0IGVhc2llclxyXG4gICAgICAgIC8vIGlmIChwZW50LmJ1aWxkUGFuZWxzVG9nZXRoZXIgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgLy8gICAgIGNvbnN0IGxlbmd0aHNDb3VudEludCA9IHBlbnQuc2lkZUNvdW50ICogcGFuZWxDb3VudEludDtcclxuICAgICAgICAvLyAgICAgbGV0IGxlbmd0aHNDb3VudCA9IGAke2xlbmd0aHNDb3VudEludH0gbGVuZ3RoYDtcclxuXHJcbiAgICAgICAgLy8gICAgIGlmIChsZW5ndGhzQ291bnRJbnQgPiAxKSB7XHJcblxyXG4gICAgICAgIC8vICAgICAgICAgbGVuZ3Roc0NvdW50ID0gYCR7bGVuZ3Roc0NvdW50fXNgO1xyXG4gICAgICAgIC8vICAgICB9XHJcblxyXG4gICAgICAgIC8vICAgICBsZXQgc2lkZVNoaXBsYXBCb2FyZENvdW50ID0gMDtcclxuXHJcbiAgICAgICAgLy8gICAgIGZvciAobGV0IG0gPSAwOyBtIDwgc2hpcGxhcEJvYXJkQ291bnRzLmxlbmd0aDsgbSsrKSB7XHJcblxyXG4gICAgICAgIC8vICAgICAgICAgc2lkZVNoaXBsYXBCb2FyZENvdW50ICs9IHNoaXBsYXBCb2FyZENvdW50c1ttXTtcclxuICAgICAgICAvLyAgICAgfVxyXG5cclxuICAgICAgICAvLyAgICAgcHJpbnRQYW5lbChcclxuICAgICAgICAvLyAgICAgICAgIHBlbnQsXHJcbiAgICAgICAgLy8gICAgICAgICBsZW5ndGhzQ291bnQsXHJcbiAgICAgICAgLy8gICAgICAgICBmcmFtZUJvdHRvbUxlbmd0aCxcclxuICAgICAgICAvLyAgICAgICAgIHBhbmVsRnJhbWVUb3BMZW5ndGhSb3VuZGVkSW50LFxyXG4gICAgICAgIC8vICAgICAgICAgc2lkZVVwcmlnaHRzLmZsYXQoKSxcclxuICAgICAgICAvLyAgICAgICAgIHBhbmVsQXZhaWxhYmxlTGVuZ3RoLFxyXG4gICAgICAgIC8vICAgICAgICAgaG9yaXpvbnRhbFN0dWRTcGFjZXIsXHJcbiAgICAgICAgLy8gICAgICAgICBzaWRlU2hpcGxhcEJvYXJkQ291bnQsXHJcbiAgICAgICAgLy8gICAgICAgICBmcmFtaW5nU2l6ZSxcclxuICAgICAgICAvLyAgICAgICAgIHJvb2ZBbmdsZURlZ3JlZXNSb3VuZGVkXHJcbiAgICAgICAgLy8gICAgICk7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgICAgIC8vIGVsc2Uge1xyXG4gICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgcGFuZWxDb3VudEludDsgaysrKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgcGFuZWxMZW5ndGhzQ291bnQgPSBgJHtwZW50LnNpZGVDb3VudH0gbGVuZ3RoYDtcclxuXHJcbiAgICAgICAgICAgIGlmIChwZW50LnNpZGVDb3VudCA+IDEpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBwYW5lbExlbmd0aHNDb3VudCA9IGAke3BhbmVsTGVuZ3Roc0NvdW50fXNgO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwcmludFBhbmVsKFxyXG4gICAgICAgICAgICAgICAgcGVudCxcclxuICAgICAgICAgICAgICAgIHBhbmVsTGVuZ3Roc0NvdW50LFxyXG4gICAgICAgICAgICAgICAgcGFuZWxGcmFtZUJvdHRvbUxlbmd0aEludCxcclxuICAgICAgICAgICAgICAgIHBhbmVsRnJhbWVUb3BMZW5ndGhSb3VuZGVkSW50LFxyXG4gICAgICAgICAgICAgICAgc2lkZVVwcmlnaHRzW2tdLFxyXG4gICAgICAgICAgICAgICAgcGFuZWxBdmFpbGFibGVMZW5ndGgsXHJcbiAgICAgICAgICAgICAgICBob3Jpem9udGFsU3R1ZFNwYWNlcixcclxuICAgICAgICAgICAgICAgIHNoaXBsYXBCb2FyZENvdW50c1trXSxcclxuICAgICAgICAgICAgICAgIGZyYW1pbmdTaXplLFxyXG4gICAgICAgICAgICAgICAgcm9vZkFuZ2xlRGVncmVlc1JvdW5kZWQsXHJcbiAgICAgICAgICAgICAgICBgQSR7ayArIDF9YCxcclxuICAgICAgICAgICAgICAgIGtcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICBzdGF0ZS5wYWdlcyA9IHBhZ2VzO1xyXG4gICAgICAgIHN0YXRlLmN1cnJlbnRQYWdlSW5kZXggPSAwO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgcGVudFNpZGVDYWxjdWxhdGlvbkNvZGU7XHJcblxyXG4iLCJpbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ1N0YXRlQ29kZVwiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL0lTdGF0ZVwiO1xyXG5pbXBvcnQgcGVudFNpZGVDYWxjdWxhdGlvbkNvZGUgZnJvbSBcIi4uL2NvZGUvcGVudFNpZGVDYWxjdWxhdGlvbkNvZGVcIjtcclxuXHJcblxyXG5jb25zdCBwZW50U2lkZUFjdGlvbnMgPSB7XHJcblxyXG4gICAgc2V0Rmxvb3JEZXB0aDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZWxlbWVudDogSFRNTElucHV0RWxlbWVudFxyXG4gICAgKTogSVN0YXRlID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFlbGVtZW50KSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS5wZW50LmZsb29yRGVwdGggPSArZWxlbWVudC52YWx1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNldEZyb250SGVpZ2h0OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50XHJcbiAgICApOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWVsZW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnBlbnQuZnJvbnRIZWlnaHQgPSArZWxlbWVudC52YWx1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNldEJhY2tIZWlnaHQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnRcclxuICAgICk6IElTdGF0ZSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZWxlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucGVudC5iYWNrSGVpZ2h0ID0gK2VsZW1lbnQudmFsdWU7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzZXRGcmFtaW5nV2lkdGg6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnRcclxuICAgICk6IElTdGF0ZSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZWxlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucGVudC5mcmFtaW5nV2lkdGggPSArZWxlbWVudC52YWx1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNldEZyYW1pbmdEZXB0aDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZWxlbWVudDogSFRNTElucHV0RWxlbWVudFxyXG4gICAgKTogSVN0YXRlID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFlbGVtZW50KSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS5wZW50LmZyYW1pbmdEZXB0aCA9ICtlbGVtZW50LnZhbHVlO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgc2V0Um9vZlJhaWxXaWR0aDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZWxlbWVudDogSFRNTElucHV0RWxlbWVudFxyXG4gICAgKTogSVN0YXRlID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFlbGVtZW50KSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS5wZW50LnJvb2ZSYWlsV2lkdGggPSArZWxlbWVudC52YWx1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNldFJvb2ZSYWlsRGVwdGg6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnRcclxuICAgICk6IElTdGF0ZSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZWxlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucGVudC5yb29mUmFpbERlcHRoID0gK2VsZW1lbnQudmFsdWU7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzZXRTaWRlQ291bnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGVsZW1lbnQ6IEhUTUxTZWxlY3RFbGVtZW50XHJcbiAgICApOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWVsZW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnBlbnQuc2lkZUNvdW50ID0gK2VsZW1lbnQudmFsdWU7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyBzZXRCdWlsZFBhbmVsc1RvZ2V0aGVyOiAoXHJcbiAgICAvLyAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIC8vICAgICB2YWx1ZTogYm9vbGVhblxyXG4gICAgLy8gKTogSVN0YXRlID0+IHtcclxuXHJcbiAgICAvLyAgICAgaWYgKCFlbGVtZW50KSB7XHJcblxyXG4gICAgLy8gICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAvLyAgICAgfVxyXG5cclxuICAgIC8vICAgICBzdGF0ZS5wZW50LmJ1aWxkUGFuZWxzVG9nZXRoZXIgPSB2YWx1ZTtcclxuXHJcbiAgICAvLyAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICAvLyB9LFxyXG5cclxuICAgIHNldFNoaXBsYXBCb3R0b21PdmVyaGFuZzogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZWxlbWVudDogSFRNTElucHV0RWxlbWVudFxyXG4gICAgKTogSVN0YXRlID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFlbGVtZW50KSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS5wZW50LnNoaXBsYXBCb3R0b21PdmVyaGFuZyA9ICtlbGVtZW50LnZhbHVlO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgc2V0U2hpcGxhcEJ1dHRpbmdXaWR0aDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZWxlbWVudDogSFRNTElucHV0RWxlbWVudFxyXG4gICAgKTogSVN0YXRlID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFlbGVtZW50KSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS5wZW50LnNoaXBsYXBCdXR0aW5nV2lkdGggPSArZWxlbWVudC52YWx1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNldFNoaXBsYXBEZXB0aDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZWxlbWVudDogSFRNTElucHV0RWxlbWVudFxyXG4gICAgKTogSVN0YXRlID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFlbGVtZW50KSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS5wZW50LnNoaXBsYXBEZXB0aCA9ICtlbGVtZW50LnZhbHVlO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgc2V0TWF4U3R1ZERpc3RhbmNlOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50XHJcbiAgICApOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWVsZW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnBlbnQubWF4U3R1ZERpc3RhbmNlID0gK2VsZW1lbnQudmFsdWU7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzZXRGcmFtaW5nU2l6ZVBpdm90OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50XHJcbiAgICApOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWVsZW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnBlbnQuZnJhbWluZ1NpemVQaXZvdCA9ICtlbGVtZW50LnZhbHVlO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgc2V0Rmxvb3JPdmVyaGFuZ1N0YW5kYXJkOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50XHJcbiAgICApOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWVsZW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnBlbnQuZmxvb3JPdmVyaGFuZ1N0YW5kYXJkID0gK2VsZW1lbnQudmFsdWU7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzZXRGbG9vck92ZXJoYW5nSGVhdnk6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnRcclxuICAgICk6IElTdGF0ZSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZWxlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucGVudC5mbG9vck92ZXJoYW5nSGVhdnkgPSArZWxlbWVudC52YWx1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNldE1heFBhbmVsTGVuZ3RoOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50XHJcbiAgICApOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWVsZW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnBlbnQubWF4UGFuZWxMZW5ndGggPSArZWxlbWVudC52YWx1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIG1pbmltaXNlRGVmYXVsdHM6IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlID0+IHtcclxuXHJcbiAgICAgICAgc3RhdGUuc2hvd0RlZmF1bHRzID0gc3RhdGUuc2hvd0RlZmF1bHRzICE9PSB0cnVlO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgbmV4dFBhZ2U6IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlID0+IHtcclxuXHJcbiAgICAgICAgc3RhdGUuY3VycmVudFBhZ2VJbmRleCsrO1xyXG5cclxuICAgICAgICBpZiAoc3RhdGUuY3VycmVudFBhZ2VJbmRleCA+IHN0YXRlLnBhZ2VzLmxlbmd0aCAtIDEpIHtcclxuXHJcbiAgICAgICAgICAgIHN0YXRlLmN1cnJlbnRQYWdlSW5kZXggPSBzdGF0ZS5wYWdlcy5sZW5ndGggLSAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHByZXZpb3VzUGFnZTogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBzdGF0ZS5jdXJyZW50UGFnZUluZGV4LS07XHJcblxyXG4gICAgICAgIGlmIChzdGF0ZS5jdXJyZW50UGFnZUluZGV4IDwgLTEpIHtcclxuXHJcbiAgICAgICAgICAgIHN0YXRlLmN1cnJlbnRQYWdlSW5kZXggPSAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNhbGN1bGF0ZTogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBwZW50U2lkZUNhbGN1bGF0aW9uQ29kZS5jYWxjdWxhdGUoc3RhdGUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgcGVudFNpZGVBY3Rpb25zO1xyXG4iLCJpbXBvcnQgeyBWTm9kZSB9IGZyb20gXCJoeXBlci1hcHAtbG9jYWxcIjtcclxuaW1wb3J0IHsgaCB9IGZyb20gXCIuLi8uLi8uLi8uLi9oeXBlckFwcC9oeXBlci1hcHAtbG9jYWxcIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9JU3RhdGVcIjtcclxuXHJcblxyXG5jb25zdCBpbnB1dFZpZXdzID0ge1xyXG5cclxuICAgIGJ1aWxkTnVtYmVyVmlldzogKFxyXG4gICAgICAgIGlkOiBzdHJpbmcsXHJcbiAgICAgICAgdmFsdWU6IG51bWJlciB8IG51bGwsXHJcbiAgICAgICAgcmVxdWlyZWQ6IGJvb2xlYW4sXHJcbiAgICAgICAgLy8gcmFuZ2VNaW46IG51bWJlcixcclxuICAgICAgICAvLyByYW5nZU1heDogbnVtYmVyLFxyXG4gICAgICAgIGxhYmVsOiBzdHJpbmcsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6IHN0cmluZyxcclxuICAgICAgICBlcnJvcjogc3RyaW5nIHwgbnVsbCxcclxuICAgICAgICBhY3Rpb246IChzdGF0ZTogSVN0YXRlLCBlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50KSA9PiBJU3RhdGVcclxuICAgICk6IFZOb2RlID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcIm5mdC1pLW51bWVyaWNcIiB9LCBbXHJcbiAgICAgICAgICAgICAgICBoKFwiaDRcIiwge30sIGAke2xhYmVsfWApLFxyXG5cclxuICAgICAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJpbnB1dC13cmFwcGVyXCIgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJ0aXRsZS10YWJsZVwiIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcInRpdGxlLXJvd1wiIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJ0aXRsZS1jZWxsXCIgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJlcnJvclwiIH0sIGAke2Vycm9yID8/ICcnfWApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICBoKFwiaW5wdXRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGAke2lkfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYCR7dmFsdWUgPz8gMH1gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IHJlcXVpcmVkID09PSB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFiaW5kZXg6IDAsIC8vIGlmIHRoaXMgaXMgbm90IHNldCBpdCBpcyBub3QgZm9jdXNhYmxlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBtaW46IHJhbmdlTWluLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWF4OiByYW5nZU1heCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6IGAke3BsYWNlaG9sZGVyfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbklucHV0OiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChldmVudDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBldmVudC50YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlwiXHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIF0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdmlldztcclxuICAgIH0sXHJcblxyXG4gICAgYnVpbGRTZWxlY3RWaWV3OiAoXHJcbiAgICAgICAgc2VsZWN0ZWRWYWx1ZTogc3RyaW5nLFxyXG4gICAgICAgIGxhYmVsOiBzdHJpbmcsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6IHN0cmluZyxcclxuICAgICAgICBvcHRpb25WYWx1ZXM6IEFycmF5PHN0cmluZz4sXHJcbiAgICAgICAgYWN0aW9uOiAoc3RhdGU6IElTdGF0ZSwgZWxlbWVudDogSFRNTFNlbGVjdEVsZW1lbnQpID0+IElTdGF0ZVxyXG4gICAgKTogVk5vZGUgPT4ge1xyXG5cclxuICAgICAgICBsZXQgc2VsZWN0Q2xhc3Nlczogc3RyaW5nID0gXCJuZnQtaS1zZWxlY3RcIjtcclxuICAgICAgICBsZXQgc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICBsZXQgc2VsZWN0aW9uTWFkZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBjb25zdCBvcHRpb25WaWV3czogVk5vZGVbXSA9IFtcclxuXHJcbiAgICAgICAgICAgIGgoXCJvcHRpb25cIixcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzczogXCJzZWxlY3QtZGVmYXVsdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIlwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgYC0tc2VsZWN0ICR7cGxhY2Vob2xkZXJ9LS1gXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICBvcHRpb25WYWx1ZXMuZm9yRWFjaCgoY2hvaWNlOiBzdHJpbmcpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGlmIChjaG9pY2UgPT09IHNlbGVjdGVkVmFsdWUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25NYWRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG9wdGlvblZpZXdzLnB1c2goXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGgoXCJvcHRpb25cIixcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBgJHtjaG9pY2V9YCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IHNlbGVjdGVkXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBgJHtjaG9pY2V9YFxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoc2VsZWN0aW9uTWFkZSkge1xyXG5cclxuICAgICAgICAgICAgc2VsZWN0Q2xhc3NlcyA9IGAke3NlbGVjdENsYXNzZXN9IHNlbGVjdGVkYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXc6IFZOb2RlID1cclxuXHJcbiAgICAgICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzczogYCR7c2VsZWN0Q2xhc3Nlc31gLFxyXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgKGV2ZW50OiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBldmVudC50YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoXCJoNFwiLCB7fSwgYCR7bGFiZWx9YCksXHJcbiAgICAgICAgICAgICAgICAgICAgaChcInNlbGVjdFwiLCB7fSwgb3B0aW9uVmlld3MpXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3O1xyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGlucHV0Vmlld3M7XHJcblxyXG4iLCJpbXBvcnQgeyBWTm9kZSB9IGZyb20gXCJoeXBlci1hcHAtbG9jYWxcIjtcclxuaW1wb3J0IHsgaCB9IGZyb20gXCIuLi8uLi8uLi8uLi9oeXBlckFwcC9oeXBlci1hcHAtbG9jYWxcIjtcclxuaW1wb3J0IHBlbnRTaWRlQWN0aW9ucyBmcm9tIFwiLi4vYWN0aW9ucy9wZW50U2lkZUFjdGlvbnNcIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9JU3RhdGVcIjtcclxuaW1wb3J0IGlucHV0Vmlld3MgZnJvbSBcIi4vaW5wdXRWaWV3c1wiO1xyXG5cclxuXHJcbmNvbnN0IGJ1aWxkU2hvd0hpZGVCdXR0b24gPSAoc3RhdGU6IElTdGF0ZSk6IFZOb2RlID0+IHtcclxuXHJcbiAgICBsZXQgbGFiZWw6IHN0cmluZztcclxuXHJcbiAgICBpZiAoIXN0YXRlLnNob3dEZWZhdWx0cykge1xyXG5cclxuICAgICAgICBsYWJlbCA9ICdTaG93IGRlZmF1bHRzJztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGxhYmVsID0gJ0hpZGUgZGVmYXVsdHMnO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHZpZXc6IFZOb2RlID1cclxuXHJcbiAgICAgICAgaChcImJ1dHRvblwiLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxyXG4gICAgICAgICAgICAgICAgb25DbGljazogcGVudFNpZGVBY3Rpb25zLm1pbmltaXNlRGVmYXVsdHMsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGAke2xhYmVsfWBcclxuICAgICAgICApO1xyXG5cclxuICAgIHJldHVybiB2aWV3O1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRJbnB1dHNWaWV3ID0gKHN0YXRlOiBJU3RhdGUpOiBWTm9kZVtdID0+IHtcclxuXHJcbiAgICBjb25zdCB2aWV3OiBWTm9kZVtdID0gW1xyXG5cclxuICAgICAgICBpbnB1dFZpZXdzLmJ1aWxkTnVtYmVyVmlldyhcclxuICAgICAgICAgICAgJ21heFN0dWREaXN0YW5jZScsXHJcbiAgICAgICAgICAgIHN0YXRlLnBlbnQubWF4U3R1ZERpc3RhbmNlLFxyXG4gICAgICAgICAgICB0cnVlLFxyXG4gICAgICAgICAgICAnTWF4IGludGVyLXN0dWQgZGlzdGFuY2UgKG1tKScsXHJcbiAgICAgICAgICAgICdNYXggaW50ZXItc3R1ZCBkaXN0YW5jZScsXHJcbiAgICAgICAgICAgIHN0YXRlLnBlbnQubWF4U3R1ZERpc3RhbmNlRXJyb3IsXHJcbiAgICAgICAgICAgIHBlbnRTaWRlQWN0aW9ucy5zZXRNYXhTdHVkRGlzdGFuY2VcclxuICAgICAgICApLFxyXG5cclxuICAgICAgICBpbnB1dFZpZXdzLmJ1aWxkTnVtYmVyVmlldyhcclxuICAgICAgICAgICAgJ2ZyYW1pbmdTaXplUGl2b3QnLFxyXG4gICAgICAgICAgICBzdGF0ZS5wZW50LmZyYW1pbmdTaXplUGl2b3QsXHJcbiAgICAgICAgICAgIHRydWUsXHJcbiAgICAgICAgICAgICdGcmFtaW5nIHBpdm90IHN0YW5kYXJkIHRvIGhlYXZ5IChtbSknLFxyXG4gICAgICAgICAgICAnRnJhbWluZyBwaXZvdCBzdGFuZGFyZCB0byBoZWF2eScsXHJcbiAgICAgICAgICAgIHN0YXRlLnBlbnQuZnJhbWluZ1NpemVQaXZvdEVycm9yLFxyXG4gICAgICAgICAgICBwZW50U2lkZUFjdGlvbnMuc2V0RnJhbWluZ1NpemVQaXZvdFxyXG4gICAgICAgICksXHJcblxyXG4gICAgICAgIGlucHV0Vmlld3MuYnVpbGROdW1iZXJWaWV3KFxyXG4gICAgICAgICAgICAnZmxvb3JPdmVyaGFuZ1N0YW5kYXJkJyxcclxuICAgICAgICAgICAgc3RhdGUucGVudC5mbG9vck92ZXJoYW5nU3RhbmRhcmQsXHJcbiAgICAgICAgICAgIHRydWUsXHJcbiAgICAgICAgICAgICdQYW5lbCBmbG9vciBvdmVyaGFuZyAobW0pJyxcclxuICAgICAgICAgICAgJ1BhbmVsIGZsb29yIG92ZXJoYW5nJyxcclxuICAgICAgICAgICAgc3RhdGUucGVudC5mbG9vck92ZXJoYW5nU3RhbmRhcmRFcnJvcixcclxuICAgICAgICAgICAgcGVudFNpZGVBY3Rpb25zLnNldEZsb29yT3ZlcmhhbmdTdGFuZGFyZFxyXG4gICAgICAgICksXHJcblxyXG4gICAgICAgIGlucHV0Vmlld3MuYnVpbGROdW1iZXJWaWV3KFxyXG4gICAgICAgICAgICAnZmxvb3JPdmVyaGFuZ0hlYXZ5JyxcclxuICAgICAgICAgICAgc3RhdGUucGVudC5mbG9vck92ZXJoYW5nSGVhdnksXHJcbiAgICAgICAgICAgIHRydWUsXHJcbiAgICAgICAgICAgICdIZWF2eSBkdXR5IHBhbmVsIGZsb29yIG92ZXJoYW5nIChtbSknLFxyXG4gICAgICAgICAgICAnSGVhdnkgZHV0eSBmbG9vciBvdmVyaGFuZycsXHJcbiAgICAgICAgICAgIHN0YXRlLnBlbnQuZmxvb3JPdmVyaGFuZ0hlYXZ5RXJyb3IsXHJcbiAgICAgICAgICAgIHBlbnRTaWRlQWN0aW9ucy5zZXRGbG9vck92ZXJoYW5nSGVhdnlcclxuICAgICAgICApLFxyXG5cclxuICAgICAgICBpbnB1dFZpZXdzLmJ1aWxkTnVtYmVyVmlldyhcclxuICAgICAgICAgICAgJ3NoaXBsYXBCb3R0b21PdmVyaGFuZycsXHJcbiAgICAgICAgICAgIHN0YXRlLnBlbnQuc2hpcGxhcEJvdHRvbU92ZXJoYW5nLFxyXG4gICAgICAgICAgICB0cnVlLFxyXG4gICAgICAgICAgICAnU2hpcGxhcCBib3R0b20gb3ZlcmhhbmcgKG1tKScsXHJcbiAgICAgICAgICAgICdTaGlwbGFwIGJvdHRvbSBvdmVyaGFuZycsXHJcbiAgICAgICAgICAgIHN0YXRlLnBlbnQuc2hpcGxhcEJvdHRvbU92ZXJoYW5nRXJyb3IsXHJcbiAgICAgICAgICAgIHBlbnRTaWRlQWN0aW9ucy5zZXRTaGlwbGFwQm90dG9tT3ZlcmhhbmdcclxuICAgICAgICApLFxyXG5cclxuICAgICAgICBpbnB1dFZpZXdzLmJ1aWxkTnVtYmVyVmlldyhcclxuICAgICAgICAgICAgJ21heFBhbmVsTGVuZ3RoJyxcclxuICAgICAgICAgICAgc3RhdGUucGVudC5tYXhQYW5lbExlbmd0aCxcclxuICAgICAgICAgICAgdHJ1ZSxcclxuICAgICAgICAgICAgJ01heCBzaWRlIGxlbmd0aCAobW0pJyxcclxuICAgICAgICAgICAgJ01heCBzaWRlIGxlbmd0aCcsXHJcbiAgICAgICAgICAgIHN0YXRlLnBlbnQubWF4UGFuZWxMZW5ndGhFcnJvcixcclxuICAgICAgICAgICAgcGVudFNpZGVBY3Rpb25zLnNldE1heFBhbmVsTGVuZ3RoXHJcbiAgICAgICAgKSxcclxuICAgIF07XHJcblxyXG4gICAgcmV0dXJuIHZpZXc7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZE1pbmltaXNlZFZpZXcgPSAoc3RhdGU6IElTdGF0ZSk6IFZOb2RlID0+IHtcclxuXHJcbiAgICBjb25zdCB2aWV3OiBWTm9kZSA9XHJcblxyXG4gICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJuZnQtY29sbGFwc2UtZ3JvdXAgbWluaW1pc2VkXCIgfSwgW1xyXG5cclxuICAgICAgICAgICAgYnVpbGRTaG93SGlkZUJ1dHRvbihzdGF0ZSlcclxuICAgICAgICBdKTtcclxuXHJcbiAgICByZXR1cm4gdmlldztcclxufTtcclxuXHJcbmNvbnN0IGJ1aWxkTWF4aW1pc2VkVmlldyA9IChzdGF0ZTogSVN0YXRlKTogVk5vZGUgPT4ge1xyXG5cclxuICAgIGNvbnN0IHZpZXc6IFZOb2RlID1cclxuXHJcbiAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcIm5mdC1jb2xsYXBzZS1ncm91cFwiIH0sIFtcclxuXHJcbiAgICAgICAgICAgIGJ1aWxkU2hvd0hpZGVCdXR0b24oc3RhdGUpLFxyXG4gICAgICAgICAgICAuLi5idWlsZElucHV0c1ZpZXcoc3RhdGUpXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgcmV0dXJuIHZpZXc7XHJcbn07XHJcblxyXG5jb25zdCBkZWZhdWx0Vmlld3MgPSB7XHJcblxyXG4gICAgYnVpbGRWaWV3OiAoc3RhdGU6IElTdGF0ZSk6IFZOb2RlIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUuc2hvd0RlZmF1bHRzKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRNaW5pbWlzZWRWaWV3KHN0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBidWlsZE1heGltaXNlZFZpZXcoc3RhdGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmF1bHRWaWV3cztcclxuXHJcbiIsImltcG9ydCB7IFZOb2RlIH0gZnJvbSBcImh5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgeyBoIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgcGVudFNpZGVBY3Rpb25zIGZyb20gXCIuLi9hY3Rpb25zL3BlbnRTaWRlQWN0aW9uc1wiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL0lTdGF0ZVwiO1xyXG5pbXBvcnQgaW5wdXRWaWV3cyBmcm9tIFwiLi9pbnB1dFZpZXdzXCI7XHJcblxyXG5cclxuY29uc3Qgc2hlZFZpZXdzID0ge1xyXG5cclxuICAgIGJ1aWxkVmlldzogKHN0YXRlOiBJU3RhdGUpOiBWTm9kZSB8IG51bGwgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3OiBWTm9kZSA9XHJcblxyXG4gICAgICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwibmZ0LWRpc3BsYXktZ3JvdXBcIiB9LCBbXHJcbiAgICAgICAgICAgICAgICBoKFwiaDRcIiwgeyBjbGFzczogXCJsYWJlbFwiIH0sIFwiU2hlZFwiKSxcclxuICAgICAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJkaXNwbGF5LWNvbnRlbnRzXCIgfSwgW1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpbnB1dFZpZXdzLmJ1aWxkTnVtYmVyVmlldyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2Zsb29yRGVwdGgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5wZW50LmZsb29yRGVwdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdGbG9vciBkZXB0aCAobW0pJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0Zsb29yIGRlcHRoJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUucGVudC5mbG9vckRlcHRoRXJyb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlbnRTaWRlQWN0aW9ucy5zZXRGbG9vckRlcHRoXHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRWaWV3cy5idWlsZE51bWJlclZpZXcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdmcm9udEhlaWdodCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnBlbnQuZnJvbnRIZWlnaHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdGcm9udCBoZWlnaHQgKG1tKScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdGcm9udCBoZWlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5wZW50LmZyb250SGVpZ2h0RXJyb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlbnRTaWRlQWN0aW9ucy5zZXRGcm9udEhlaWdodFxyXG4gICAgICAgICAgICAgICAgICAgICksXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Vmlld3MuYnVpbGROdW1iZXJWaWV3KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnYmFja0hlaWdodCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnBlbnQuYmFja0hlaWdodCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0JhY2sgaGVpZ2h0IChtbSknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQmFjayBoZWlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5wZW50LmJhY2tIZWlnaHRFcnJvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVudFNpZGVBY3Rpb25zLnNldEJhY2tIZWlnaHRcclxuICAgICAgICAgICAgICAgICAgICApLFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpbnB1dFZpZXdzLmJ1aWxkU2VsZWN0VmlldyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgYCR7c3RhdGUucGVudC5zaWRlQ291bnR9YCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ1NpZGUgYnVpbGQgY291bnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnc2lkZSBidWlsZCBjb3VudCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFsnMScsICcyJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlbnRTaWRlQWN0aW9ucy5zZXRTaWRlQ291bnRcclxuICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3O1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgc2hlZFZpZXdzO1xyXG5cclxuIiwiaW1wb3J0IHsgVk5vZGUgfSBmcm9tIFwiaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCB7IGggfSBmcm9tIFwiLi4vLi4vLi4vLi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCBwZW50U2lkZUFjdGlvbnMgZnJvbSBcIi4uL2FjdGlvbnMvcGVudFNpZGVBY3Rpb25zXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvSVN0YXRlXCI7XHJcbmltcG9ydCBpbnB1dFZpZXdzIGZyb20gXCIuL2lucHV0Vmlld3NcIjtcclxuXHJcblxyXG5jb25zdCBzaGVkRGlzcGxheVZpZXdzID0ge1xyXG5cclxuICAgIGJ1aWxkVmlldzogKHN0YXRlOiBJU3RhdGUpOiBWTm9kZSB8IG51bGwgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3OiBWTm9kZSA9XHJcblxyXG4gICAgICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwibmZ0LWRpc3BsYXktZ3JvdXBcIiB9LCBbXHJcbiAgICAgICAgICAgICAgICBoKFwiaDRcIiwgeyBjbGFzczogXCJsYWJlbFwiIH0sIFwiVGltYmVyXCIpLFxyXG4gICAgICAgICAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcImRpc3BsYXktY29udGVudHNcIiB9LCBbXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Vmlld3MuYnVpbGROdW1iZXJWaWV3KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZnJhbWluZ1dpZHRoJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUucGVudC5mcmFtaW5nV2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdGcmFtaW5nIHRpbWJlciB3aWR0aCAobW0pJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0ZyYW1pbmcgdGltYmVyIHdpZHRoJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUucGVudC5mcmFtaW5nV2lkdGhFcnJvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVudFNpZGVBY3Rpb25zLnNldEZyYW1pbmdXaWR0aFxyXG4gICAgICAgICAgICAgICAgICAgICksXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Vmlld3MuYnVpbGROdW1iZXJWaWV3KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZnJhbWluZ0RlcHRoJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUucGVudC5mcmFtaW5nRGVwdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdGcmFtaW5nIHRpbWJlciBkZXB0aCAobW0pJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0ZyYW1pbmcgdGltYmVyIGRlcHRoJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUucGVudC5mcmFtaW5nRGVwdGhFcnJvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVudFNpZGVBY3Rpb25zLnNldEZyYW1pbmdEZXB0aFxyXG4gICAgICAgICAgICAgICAgICAgICksXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Vmlld3MuYnVpbGROdW1iZXJWaWV3KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAncm9vZlJhaWxXaWR0aCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnBlbnQucm9vZlJhaWxXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ1Jvb2YgcmFpbCB0aW1iZXIgd2lkdGggKG1tKScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdSb29mIHJhaWwgdGltYmVyIHdpZHRoJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUucGVudC5yb29mUmFpbFdpZHRoRXJyb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlbnRTaWRlQWN0aW9ucy5zZXRSb29mUmFpbFdpZHRoXHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRWaWV3cy5idWlsZE51bWJlclZpZXcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdyb29mUmFpbERlcHRoJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUucGVudC5yb29mUmFpbERlcHRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnUm9vZiByYWlsIHRpbWJlciBkZXB0aCAobW0pJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ1Jvb2YgcmFpbCB0aW1iZXIgZGVwdGgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5wZW50LnJvb2ZSYWlsRGVwdGhFcnJvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVudFNpZGVBY3Rpb25zLnNldFJvb2ZSYWlsRGVwdGhcclxuICAgICAgICAgICAgICAgICAgICApLFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpbnB1dFZpZXdzLmJ1aWxkTnVtYmVyVmlldyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3NoaXBsYXBCdXR0aW5nV2lkdGgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5wZW50LnNoaXBsYXBCdXR0aW5nV2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdTaGlwbGFwIGJ1dHRpbmcgd2lkdGggKG1tKScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdTaGlwbGFwIGJ1dHRpbmcgd2lkdGgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5wZW50LnNoaXBsYXBCdXR0aW5nV2lkdGhFcnJvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVudFNpZGVBY3Rpb25zLnNldFNoaXBsYXBCdXR0aW5nV2lkdGhcclxuICAgICAgICAgICAgICAgICAgICApLFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpbnB1dFZpZXdzLmJ1aWxkTnVtYmVyVmlldyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3NoaXBsYXBEZXB0aCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnBlbnQuc2hpcGxhcERlcHRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnU2hpcGxhcCBkZXB0aCAobW0pJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ1NoaXBsYXAgZGVwdGgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5wZW50LnNoaXBsYXBEZXB0aEVycm9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZW50U2lkZUFjdGlvbnMuc2V0U2hpcGxhcERlcHRoXHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIF0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdmlldztcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHNoZWREaXNwbGF5Vmlld3M7XHJcblxyXG4iLCIvLyBpbXBvcnQgeyBofSBmcm9tIFwiLi4vLi4vLi4vLi4vZGVmaW5pdGlvbnMvaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSBcImh5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgeyBoIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbFwiO1xyXG5cclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9JU3RhdGVcIjtcclxuaW1wb3J0IGRlZmF1bHRWaWV3cyBmcm9tIFwiLi9kZWZhdWx0Vmlld3NcIjtcclxuaW1wb3J0IHNoZWRWaWV3cyBmcm9tIFwiLi9zaGVkVmlld3NcIjtcclxuaW1wb3J0IHRpbWJlclZpZXdzIGZyb20gXCIuL3RpbWJlclZpZXdzXCI7XHJcbmltcG9ydCBwZW50U2lkZUFjdGlvbnMgZnJvbSBcIi4uL2FjdGlvbnMvcGVudFNpZGVBY3Rpb25zXCI7XHJcblxyXG5cclxuY29uc3QgcGVudFNpZGVJbnB1dFZpZXdzID0ge1xyXG5cclxuICAgIGJ1aWxkVmlldzogKHN0YXRlOiBJU3RhdGUpOiBWTm9kZSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXc6IFZOb2RlID1cclxuXHJcbiAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBpZDogXCJzdGVwVmlld1wiIH0sIFtcclxuICAgICAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJzdGVwLWRpc2N1c3Npb25cIiB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcImRpc2N1c3Npb25cIiB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoXCJoNFwiLCB7IGNsYXNzOiBcInRpdGxlLXRleHRcIiB9LCBcIlBlbnQgc2hlZCBzaWRlIGNhbGN1bGF0b3JcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBpZDogXCJpbnB1dFZpZXdcIiB9LCBbXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFZpZXdzLmJ1aWxkVmlldyhzdGF0ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaGVkVmlld3MuYnVpbGRWaWV3KHN0YXRlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWJlclZpZXdzLmJ1aWxkVmlldyhzdGF0ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcInN0ZXAtb3B0aW9uc1wiIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICBoKFwiYVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogXCJvcHRpb25cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IHBlbnRTaWRlQWN0aW9ucy5jYWxjdWxhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoXCJwXCIsIHt9LCBcIkNhbGN1bGF0ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3O1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgcGVudFNpZGVJbnB1dFZpZXdzO1xyXG5cclxuIiwiaW1wb3J0IHsgQ2hpbGRyZW4gfSBmcm9tIFwiaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCB7IGggfSBmcm9tIFwiLi4vLi4vLi4vLi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCBJVmlld0VsZW1lbnQgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvSVZpZXdFbGVtZW50XCI7XHJcblxyXG5cclxuY29uc3QgYnVpbGRQYXR0ZXJuVmlldyA9IChcclxuICAgIHZpZXdzOiBDaGlsZHJlbltdLFxyXG4gICAgbm9kZTogSVZpZXdFbGVtZW50KTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKG5vZGUudmFsdWUpIHtcclxuXHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkobm9kZS52YWx1ZSkpIHtcclxuXHJcbiAgICAgICAgICAgIHZpZXdzLnB1c2goXHJcbiAgICAgICAgICAgICAgICBoKFxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUudHlwZSxcclxuICAgICAgICAgICAgICAgICAgICBub2RlLnByb3BlcnRpZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudFZpZXdzLmJ1aWxkVmlldyhub2RlLnZhbHVlKVxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gc3RyaW5nXHJcbiAgICAgICAgICAgIHZpZXdzLnB1c2goXHJcbiAgICAgICAgICAgICAgICBoKFxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUudHlwZSxcclxuICAgICAgICAgICAgICAgICAgICBub2RlLnByb3BlcnRpZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS52YWx1ZVxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgZWxlbWVudFZpZXdzID0ge1xyXG5cclxuICAgIGJ1aWxkVmlldzogKHZpZXdQYXR0ZXJuczogQXJyYXk8SVZpZXdFbGVtZW50Pik6IENoaWxkcmVuW10gPT4ge1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3czogQ2hpbGRyZW5bXSA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZpZXdQYXR0ZXJucy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgYnVpbGRQYXR0ZXJuVmlldyhcclxuICAgICAgICAgICAgICAgIHZpZXdzLFxyXG4gICAgICAgICAgICAgICAgdmlld1BhdHRlcm5zW2ldXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdmlld3M7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBlbGVtZW50Vmlld3M7XHJcblxyXG4iLCIvLyBpbXBvcnQgeyBofSBmcm9tIFwiLi4vLi4vLi4vLi4vZGVmaW5pdGlvbnMvaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSBcImh5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgeyBoIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbFwiO1xyXG5cclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9JU3RhdGVcIjtcclxuaW1wb3J0IGVsZW1lbnRWaWV3cyBmcm9tIFwiLi9lbGVtZW50Vmlld3NcIjtcclxuaW1wb3J0IHBlbnRTaWRlQWN0aW9ucyBmcm9tIFwiLi4vYWN0aW9ucy9wZW50U2lkZUFjdGlvbnNcIjtcclxuXHJcblxyXG5jb25zdCBidWlsZFBhZ2VCYWNrd2FyZHMgPSAoX3N0YXRlOiBJU3RhdGUpOiBWTm9kZSA9PiB7XHJcblxyXG4gICAgY29uc3QgdmlldyA9XHJcblxyXG4gICAgICAgIGgoXCJhXCIsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG9uQ2xpY2s6IHBlbnRTaWRlQWN0aW9ucy5wcmV2aW91c1BhZ2UsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJwYWdlLWJhY2t3YXJkcy1pY29uXCIgfSwgXCJcIilcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHZpZXc7XHJcblxyXG59O1xyXG5cclxuY29uc3QgYnVpbGRQYWdlRm9yd2FyZHMgPSAoc3RhdGU6IElTdGF0ZSk6IFZOb2RlIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgaWYgKHN0YXRlLmN1cnJlbnRQYWdlSW5kZXggPj0gc3RhdGUucGFnZXMubGVuZ3RoIC0gMSkge1xyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3ID1cclxuXHJcbiAgICAgICAgaChcImFcIixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgb25DbGljazogcGVudFNpZGVBY3Rpb25zLm5leHRQYWdlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwicGFnZS1mb3J3YXJkcy1pY29uXCIgfSwgXCJcIilcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHZpZXc7XHJcblxyXG59O1xyXG5cclxuY29uc3QgcGVudFNpZGVQYWdlc1ZpZXcgPSB7XHJcblxyXG4gICAgYnVpbGRQYWdlVmlldzogKHN0YXRlOiBJU3RhdGUpOiBWTm9kZSB8IG51bGwgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBjdXJyZW50UGFnZSA9IHN0YXRlLnBhZ2VzW3N0YXRlLmN1cnJlbnRQYWdlSW5kZXhdO1xyXG5cclxuICAgICAgICBpZiAoIWN1cnJlbnRQYWdlLnZhbHVlXHJcbiAgICAgICAgICAgIHx8ICFBcnJheS5pc0FycmF5KGN1cnJlbnRQYWdlLnZhbHVlKVxyXG4gICAgICAgICkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB2aWV3OiBWTm9kZSA9XHJcblxyXG4gICAgICAgICAgICBoKFwiZGl2XCIsIHsgaWQ6IFwic3RlcFZpZXdcIiB9LCBbXHJcbiAgICAgICAgICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwic3RlcC1kaXNjdXNzaW9uXCIgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJkaXNjdXNzaW9uXCIgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKFwiaDRcIiwgeyBjbGFzczogXCJ0aXRsZS10ZXh0XCIgfSwgXCJQZW50IHNpZGVcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBpZDogXCJpbnB1dFZpZXdcIiB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwibmZ0LWktcGF0dGVyblwiIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwibmZ0LWktcGFnZVwiIH0sIFtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRWaWV3cy5idWlsZFZpZXcoY3VycmVudFBhZ2UudmFsdWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcInN0ZXAtcGFnZS1idXR0b25zXCIgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJwYWdlLWJhY2t3YXJkc1wiIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZFBhZ2VCYWNrd2FyZHMoc3RhdGUpXHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwicGFnZS1mb3J3YXJkc1wiIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZFBhZ2VGb3J3YXJkcyhzdGF0ZSlcclxuICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBwZW50U2lkZVBhZ2VzVmlldztcclxuXHJcbiIsIi8vIGltcG9ydCB7IGh9IGZyb20gXCIuLi8uLi8uLi8uLi9kZWZpbml0aW9ucy9oeXBlci1hcHAtbG9jYWxcIjtcclxuaW1wb3J0IHsgVk5vZGUgfSBmcm9tIFwiaHlwZXItYXBwLWxvY2FsXCI7XHJcblxyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL0lTdGF0ZVwiO1xyXG5pbXBvcnQgcGVudFNpZGVJbnB1dFZpZXdzIGZyb20gXCIuL3BlbnRTaWRlSW5wdXRWaWV3c1wiO1xyXG5pbXBvcnQgcGVudFNpZGVQYWdlc1ZpZXcgZnJvbSBcIi4vcGVudFNpZGVQYWdlc1ZpZXdcIjtcclxuXHJcbmltcG9ydCBcIi4uL3Njc3MvcGVudFNpZGUuc2Nzc1wiO1xyXG5pbXBvcnQgXCIuLi9zY3NzL2lucHV0cy5zY3NzXCI7XHJcblxyXG5cclxuY29uc3QgcGVudFNpZGVWaWV3cyA9IHtcclxuXHJcbiAgICBidWlsZFZpZXc6IChzdGF0ZTogSVN0YXRlKTogVk5vZGUgfCBudWxsID0+IHtcclxuXHJcbiAgICAgICAgaWYgKHN0YXRlLnBhZ2VzXHJcbiAgICAgICAgICAgICYmIHN0YXRlLnBhZ2VzLmxlbmd0aCA+IDBcclxuICAgICAgICAgICAgJiYgc3RhdGUuY3VycmVudFBhZ2VJbmRleCA+IC0xXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwZW50U2lkZVBhZ2VzVmlldy5idWlsZFBhZ2VWaWV3KHN0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwZW50U2lkZUlucHV0Vmlld3MuYnVpbGRWaWV3KHN0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBwZW50U2lkZVZpZXdzO1xyXG5cclxuIiwiLy8gaW1wb3J0IHsgaH0gZnJvbSBcIi4uLy4uLy4uLy4uL2RlZmluaXRpb25zL2h5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gXCJoeXBlci1hcHAtbG9jYWxcIjtcclxuaW1wb3J0IHsgaCB9IGZyb20gXCIuLi8uLi8uLi8uLi9oeXBlckFwcC9oeXBlci1hcHAtbG9jYWxcIjtcclxuXHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvSVN0YXRlXCI7XHJcbmltcG9ydCBwZW50U2lkZVZpZXdzIGZyb20gXCIuLi8uLi9wZW50U2lkZS92aWV3cy9wZW50U2lkZVZpZXdzXCI7XHJcblxyXG5pbXBvcnQgXCIuLi9zY3NzL2luZGV4LnNjc3NcIjtcclxuXHJcblxyXG5jb25zdCBpbml0VmlldyA9IHtcclxuXHJcbiAgICBidWlsZFZpZXc6IChzdGF0ZTogSVN0YXRlKTogVk5vZGUgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3OiBWTm9kZSA9IGgoXCJkaXZcIiwgeyBpZDogXCJ0cmVlU29sdmVBdXRob3JcIiB9LFxyXG5cclxuICAgICAgICAgICAgcGVudFNpZGVWaWV3cy5idWlsZFZpZXcoc3RhdGUpLFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3O1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaW5pdFZpZXc7XHJcblxyXG4iLCJpbXBvcnQgSVBlbnQgZnJvbSBcIi4uL2ludGVyZmFjZXMvSVBlbnRcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQZW50IGltcGxlbWVudHMgSVBlbnQge1xyXG5cclxuICAgIC8vIGRlZmF1bHRzXHJcbiAgICBwdWJsaWMgbWF4U3R1ZERpc3RhbmNlOiBudW1iZXIgPSA0MDA7XHJcbiAgICBwdWJsaWMgZnJhbWluZ1NpemVQaXZvdDogbnVtYmVyID0gNTA7XHJcbiAgICBwdWJsaWMgZmxvb3JPdmVyaGFuZ1N0YW5kYXJkOiBudW1iZXIgPSAxMDtcclxuICAgIHB1YmxpYyBmbG9vck92ZXJoYW5nSGVhdnk6IG51bWJlciA9IDE1O1xyXG4gICAgcHVibGljIG1heFBhbmVsTGVuZ3RoOiBudW1iZXIgPSA0MDAwO1xyXG4gICAgcHVibGljIGJ1aWxkUGFuZWxzVG9nZXRoZXI6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICAvLyBzaGVkIG1lYXN1cmVtZW50c1xyXG4gICAgcHVibGljIGZsb29yRGVwdGg6IG51bWJlciA9IDA7XHJcbiAgICBwdWJsaWMgZnJvbnRIZWlnaHQ6IG51bWJlciA9IDA7XHJcbiAgICBwdWJsaWMgYmFja0hlaWdodDogbnVtYmVyID0gMDtcclxuXHJcbiAgICAvLyBmcmFtZSBzaXplc1xyXG4gICAgcHVibGljIGZyYW1pbmdXaWR0aDogbnVtYmVyID0gNDU7XHJcbiAgICBwdWJsaWMgZnJhbWluZ0RlcHRoOiBudW1iZXIgPSAzMztcclxuICAgIHB1YmxpYyByb29mUmFpbFdpZHRoOiBudW1iZXIgPSA2OTtcclxuICAgIHB1YmxpYyByb29mUmFpbERlcHRoOiBudW1iZXIgPSAzNDtcclxuICAgIHB1YmxpYyBzaGlwbGFwQm90dG9tT3Zlcmhhbmc6IG51bWJlciA9IDM1O1xyXG4gICAgcHVibGljIHNoaXBsYXBCdXR0aW5nV2lkdGg6IG51bWJlciA9IDExMjtcclxuICAgIHB1YmxpYyBzaGlwbGFwRGVwdGg6IG51bWJlciA9IDEyO1xyXG5cclxuICAgIHB1YmxpYyBzaWRlQ291bnQ6IG51bWJlciA9IDI7XHJcblxyXG4gICAgcHVibGljIG1heFN0dWREaXN0YW5jZUVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBmcmFtaW5nU2l6ZVBpdm90RXJyb3I6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIGZsb29yT3ZlcmhhbmdTdGFuZGFyZEVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBmbG9vck92ZXJoYW5nSGVhdnlFcnJvcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgbWF4UGFuZWxMZW5ndGhFcnJvcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgYnVpbGRQYW5lbHNUb2dldGhlckVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgICAvLyBzaGVkIG1lYXN1cmVtZW50c1xyXG4gICAgcHVibGljIGZsb29yRGVwdGhFcnJvcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgZnJvbnRIZWlnaHRFcnJvcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgYmFja0hlaWdodEVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBmcmFtaW5nV2lkdGhFcnJvcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgZnJhbWluZ0RlcHRoRXJyb3I6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgICAgIFxyXG4gICAgLy8gZnJhbWUgc2l6ZXNcclxuICAgIHB1YmxpYyByb29mUmFpbFdpZHRoRXJyb3I6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHJvb2ZSYWlsRGVwdGhFcnJvcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgc2hpcGxhcEJvdHRvbU92ZXJoYW5nRXJyb3I6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHNoaXBsYXBCdXR0aW5nV2lkdGhFcnJvcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgc2hpcGxhcERlcHRoRXJyb3I6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgXHJcbiAgICBwdWJsaWMgc2lkZUNvdW50RXJyb3I6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG5cclxufVxyXG4iLCJpbXBvcnQgSVBlbnQgZnJvbSBcIi4uL2ludGVyZmFjZXMvSVBlbnRcIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vaW50ZXJmYWNlcy9JU3RhdGVcIjtcclxuaW1wb3J0IFBlbnQgZnJvbSBcIi4vUGVudFwiO1xyXG5pbXBvcnQgSVZpZXdFbGVtZW50IGZyb20gXCIuLi9pbnRlcmZhY2VzL0lWaWV3RWxlbWVudFwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRlIGltcGxlbWVudHMgSVN0YXRlIHtcclxuXHJcbiAgICBwdWJsaWMgcGVudDogSVBlbnQgPSBuZXcgUGVudCgpO1xyXG4gICAgcHVibGljIHNob3dEZWZhdWx0czogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIHBhZ2VzOiBBcnJheTxJVmlld0VsZW1lbnQ+ID0gW107XHJcbiAgICBwdWJsaWMgY3VycmVudFBhZ2VJbmRleDogbnVtYmVyID0gMDtcclxufVxyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVN0YXRlQW55QXJyYXkgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvSVN0YXRlQW55QXJyYXlcIjtcclxuaW1wb3J0IFN0YXRlIGZyb20gXCIuLi8uLi8uLi9zdGF0ZS9TdGF0ZVwiO1xyXG5cclxuXHJcbmNvbnN0IGluaXRTdGF0ZSA9IHtcclxuXHJcbiAgICBpbml0aWFsaXNlOiAoKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBzdGF0ZTogSVN0YXRlID0gbmV3IFN0YXRlKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGluaXRTdGF0ZTtcclxuXHJcbiIsImltcG9ydCB7IGFwcCB9IGZyb20gXCIuL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbFwiO1xyXG5cclxuaW1wb3J0IGluaXRTdWJzY3JpcHRpb25zIGZyb20gXCIuL21vZHVsZXMvY29tcG9uZW50cy9pbml0L3N1YnNjcmlwdGlvbnMvaW5pdFN1YnNjcmlwdGlvbnNcIjtcclxuaW1wb3J0IGluaXRFdmVudHMgZnJvbSBcIi4vbW9kdWxlcy9jb21wb25lbnRzL2luaXQvY29kZS9pbml0RXZlbnRzXCI7XHJcbmltcG9ydCBpbml0VmlldyBmcm9tIFwiLi9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC92aWV3cy9pbml0Vmlld1wiO1xyXG5pbXBvcnQgaW5pdFN0YXRlIGZyb20gXCIuL21vZHVsZXMvY29tcG9uZW50cy9pbml0L2NvZGUvaW5pdFN0YXRlXCI7XHJcblxyXG5cclxuaW5pdEV2ZW50cy5yZWdpc3Rlckdsb2JhbEV2ZW50cygpO1xyXG5cclxuKHdpbmRvdyBhcyBhbnkpLkNvbXBvc2l0ZUZsb3dzQXV0aG9yID0gYXBwKHtcclxuICAgIFxyXG4gICAgbm9kZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0cmVlU29sdmVBdXRob3JcIiksXHJcbiAgICBpbml0OiBpbml0U3RhdGUuaW5pdGlhbGlzZSxcclxuICAgIHZpZXc6IGluaXRWaWV3LmJ1aWxkVmlldyxcclxuICAgIHN1YnNjcmlwdGlvbnM6IGluaXRTdWJzY3JpcHRpb25zLFxyXG4gICAgb25FbmQ6IGluaXRFdmVudHMub25SZW5kZXJGaW5p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
