(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["halyard"] = factory();
	else
		root["halyard"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _table = __webpack_require__(1);
	
	var _table2 = _interopRequireDefault(_table);
	
	var _utils = __webpack_require__(5);
	
	var Utils = _interopRequireWildcard(_utils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Halyard = function () {
	  function Halyard() {
	    _classCallCheck(this, Halyard);
	
	    this.items = [];
	    this.defaultSetStatements = {};
	  }
	
	  _createClass(Halyard, [{
	    key: 'getConnections',
	    value: function getConnections() {
	      return this.items.map(function (item) {
	        return item.getConnection && item.getConnection();
	      });
	    }
	  }, {
	    key: 'getQixConnections',
	    value: function getQixConnections() {
	      return this.getConnections().map(function (connection) {
	        return connection.getQixConnectionObject();
	      }).filter(function (connection) {
	        return !!connection;
	      });
	    }
	  }, {
	    key: 'getDefaultSetStatementsScript',
	    value: function getDefaultSetStatementsScript() {
	      var setStatementScript = '';
	      var that = this;
	
	      Object.keys(that.defaultSetStatements).forEach(function (key) {
	        setStatementScript = setStatementScript + 'SET ' + key + '=\'' + that.defaultSetStatements[key] + '\';' + Utils.newlineChar();
	      });
	
	      if (setStatementScript !== '') {
	        setStatementScript += Utils.newlineChar();
	      }
	
	      return setStatementScript;
	    }
	  }, {
	    key: 'setDefaultSetStatements',
	    value: function setDefaultSetStatements(defaultSetStatements, preservePreviouslyEnteredValues) {
	      var that = this;
	
	      Object.keys(defaultSetStatements).forEach(function (key) {
	        if (!(preservePreviouslyEnteredValues && that.defaultSetStatements[key])) {
	          that.defaultSetStatements[key] = defaultSetStatements[key];
	        }
	      });
	    }
	  }, {
	    key: 'getScript',
	    value: function getScript() {
	      var script = '';
	
	      script = this.getDefaultSetStatementsScript();
	
	      this.items.forEach(function (item) {
	        if (item.getName && item.getName() && item.getName() !== '') {
	          script = script + '"' + Utils.escapeText(item.getName()) + '":' + Utils.newlineChar();
	        }
	        script = '' + (script + item.getScript()) + Utils.newlineChar() + Utils.newlineChar();
	      });
	
	      return script;
	    }
	
	    // Support to add table explicit or implicitly
	
	  }, {
	    key: 'addTable',
	    value: function addTable(arg1, options) {
	      var newTable = void 0;
	
	      if (arg1 instanceof _table2.default) {
	        newTable = arg1;
	      } else {
	        newTable = new _table2.default(arg1, options);
	      }
	
	      return this.addItem(newTable);
	    }
	  }, {
	    key: 'addItem',
	    value: function addItem(newItem) {
	      if (!this.items.find(function (item) {
	        return item.getName() === newItem.getName();
	      })) {
	        this.items.push(newItem);
	        return newItem;
	      }
	      console.error('Cannot add the another table with the same name.');
	
	      return null;
	    }
	  }, {
	    key: 'getItemThatGeneratedScriptAt',
	    value: function getItemThatGeneratedScriptAt(charPosition) {
	      var script = '';
	
	      script = this.getDefaultSetStatementsScript();
	
	      for (var i = 0; i < this.items.length; i += 1) {
	        var item = this.items[i];
	        if (item.getName && item.getName() && item.getName() !== '') {
	          script = script + '"' + Utils.escapeText(item.getName()) + '":' + Utils.newlineChar();
	        }
	        script = '' + (script + item.getScript()) + Utils.newlineChar() + Utils.newlineChar();
	
	        if (script.length >= charPosition) {
	          return item;
	        }
	      }
	
	      return undefined;
	    }
	  }]);
	
	  return Halyard;
	}();
	
	Halyard.Table = _table2.default;
	
	exports.default = Halyard;
	
	
	module.exports = Halyard;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _bootstrapConnectionMatcher = __webpack_require__(2);
	
	var _bootstrapConnectionMatcher2 = _interopRequireDefault(_bootstrapConnectionMatcher);
	
	var _formatSpecification = __webpack_require__(10);
	
	var _formatSpecification2 = _interopRequireDefault(_formatSpecification);
	
	var _utils = __webpack_require__(5);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Table = function () {
	  function Table(connection, options) {
	    _classCallCheck(this, Table);
	
	    this.connection = Table.connectionMatcher.findMatch(connection);
	
	    options = options || {};
	
	    if (typeof options === 'string') {
	      this.name = options;
	      options = {};
	    } else {
	      this.name = options.name;
	      this.fields = options.fields;
	    }
	
	    this.options = options;
	  }
	
	  _createClass(Table, [{
	    key: 'getFieldList',
	    value: function getFieldList() {
	      if (this.fields) {
	        return this.fields.map(function (field) {
	          var formattedInput = '"' + (0, _utils.escapeText)(field.src || '') + '"';
	
	          if ((0, _utils.validFieldType)(field.type)) {
	            var format = field.type.toUpperCase();
	
	            if (field.inputFormat) {
	              formattedInput = format + '#(' + formattedInput + ', \'' + field.inputFormat + '\')';
	            }
	
	            if (field.displayFormat) {
	              formattedInput = format + '(' + formattedInput + ', \'' + field.displayFormat + '\')';
	            } else {
	              formattedInput = format + '(' + formattedInput + ')';
	            }
	          }
	
	          if (field.expr) {
	            formattedInput = field.expr;
	          }
	
	          if (!field.name && !field.src) {
	            console.error('A name or src needs to specified on the field: ', field);
	          }
	
	          return (0, _utils.indentation)() + formattedInput + ' AS "' + (0, _utils.escapeText)(field.name || field.src) + '"';
	        }).join(',' + (0, _utils.newlineChar)());
	      }
	
	      return '*';
	    }
	  }, {
	    key: 'isProccedingLoad',
	    value: function isProccedingLoad() {
	      return this.connection instanceof Table;
	    }
	  }, {
	    key: 'getScript',
	    value: function getScript() {
	      // In the future this could be moved into a connectionMatcher
	      // but for sake of clarity it is kept inline.
	      if (this.isProccedingLoad()) {
	        return 'LOAD' + (0, _utils.newlineChar)() + this.getFieldList() + ';' + (0, _utils.newlineChar)() + this.connection.getScript();
	      }
	
	      // Hack!
	      if (this.connection.getFileExtension) {
	        this.options.fileExtension = this.connection.getFileExtension();
	      }
	
	      return 'LOAD' + (0, _utils.newlineChar)() + this.getFieldList() + (0, _utils.newlineChar)() + this.connection.getScript() + (0, _formatSpecification2.default)(this.options) + ';';
	    }
	  }, {
	    key: 'getName',
	    value: function getName() {
	      return this.name || '';
	    }
	  }, {
	    key: 'getConnection',
	    value: function getConnection() {
	      return this.connection;
	    }
	  }]);
	
	  return Table;
	}();
	
	if (!Table.connectionMatcher) {
	  Table.connectionMatcher = _bootstrapConnectionMatcher2.default;
	}
	
	exports.default = Table;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _file = __webpack_require__(3);
	
	var _file2 = _interopRequireDefault(_file);
	
	var _webFile = __webpack_require__(6);
	
	var _webFile2 = _interopRequireDefault(_webFile);
	
	var _inlineData = __webpack_require__(7);
	
	var _inlineData2 = _interopRequireDefault(_inlineData);
	
	var _jsonToCsv = __webpack_require__(8);
	
	var JsonToCsv = _interopRequireWildcard(_jsonToCsv);
	
	var _connectionMatcher = __webpack_require__(9);
	
	var _connectionMatcher2 = _interopRequireDefault(_connectionMatcher);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var connectionMatcher = new _connectionMatcher2.default();
	
	// url to a table file
	connectionMatcher.addConnection(function (data) {
	    return typeof data === 'string' && data.match(/https?:\/\/(.*)/g);
	}, function (data) {
	    return new _webFile2.default(data);
	});
	
	// Path to a table file
	connectionMatcher.addConnection(function (data) {
	    return typeof data === 'string' && data.match(/^.*\.(.*)$/g);
	}, function (data) {
	    return new _file2.default(data);
	});
	
	// Inline JSON table to csv
	connectionMatcher.addConnection(function (data) {
	    return data instanceof Array && JsonToCsv.isJson(data);
	}, function (data) {
	    return new _inlineData2.default(JsonToCsv.convert(data));
	});
	
	// Inline csv table
	connectionMatcher.addConnection(function (data) {
	    return typeof data === 'string';
	}, function (data) {
	    return new _inlineData2.default(data);
	});
	
	exports.default = connectionMatcher;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };
	
	var _connectionBase = __webpack_require__(4);
	
	var _connectionBase2 = _interopRequireDefault(_connectionBase);
	
	var _utils = __webpack_require__(5);
	
	var Utils = _interopRequireWildcard(_utils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var FileConnection = function (_ConnectionBase) {
	  _inherits(FileConnection, _ConnectionBase);
	
	  function FileConnection(path) {
	    _classCallCheck(this, FileConnection);
	
	    var _this = _possibleConstructorReturn(this, (FileConnection.__proto__ || Object.getPrototypeOf(FileConnection)).call(this, Utils.folderPath(path), 'folder'));
	
	    _this.fileName = Utils.fileName(path);
	
	    _this.fileExtension = Utils.fileExtension(path) || 'txt';
	    return _this;
	  }
	
	  _createClass(FileConnection, [{
	    key: 'getLibStatement',
	    value: function getLibStatement() {
	      return _get(FileConnection.prototype.__proto__ || Object.getPrototypeOf(FileConnection.prototype), 'getLibStatement', this).call(this) + '/' + this.fileName;
	    }
	  }]);
	
	  return FileConnection;
	}(_connectionBase2.default);
	
	exports.default = FileConnection;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _utils = __webpack_require__(5);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var ConnectionBase = function () {
	  function ConnectionBase(path, connectionType) {
	    _classCallCheck(this, ConnectionBase);
	
	    this.path = path;
	    this.connectionType = connectionType;
	    this.fileExtension = '';
	  }
	
	  _createClass(ConnectionBase, [{
	    key: 'getFileExtension',
	    value: function getFileExtension() {
	      return this.fileExtension;
	    }
	  }, {
	    key: 'getConnectionType',
	    value: function getConnectionType() {
	      return this.connectionType;
	    }
	  }, {
	    key: 'getQixConnectionObject',
	    value: function getQixConnectionObject() {
	      return {
	        qName: this.getName(),
	        qConnectionString: this.path,
	        qType: this.getConnectionType()
	      };
	    }
	  }, {
	    key: 'getName',
	    value: function getName() {
	      if (!this.name) {
	        this.name = (0, _utils.uniqueName)();
	      }
	
	      return this.name;
	    }
	  }, {
	    key: 'getLibStatement',
	    value: function getLibStatement() {
	      return 'lib://' + this.getName();
	    }
	  }, {
	    key: 'getScript',
	    value: function getScript() {
	      return 'FROM [' + this.getLibStatement() + ']';
	    }
	  }]);
	
	  return ConnectionBase;
	}();
	
	exports.default = ConnectionBase;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.folderPath = folderPath;
	exports.fileName = fileName;
	exports.fileExtension = fileExtension;
	exports.escapeText = escapeText;
	exports.newlineChar = newlineChar;
	exports.uniqueName = uniqueName;
	exports.validFieldType = validFieldType;
	exports.indentation = indentation;
	function folderPath(path) {
	  var folderPathMatch = path.match(/^(.*)(\\.*\..*$|\\.*)$/);
	
	  if (folderPathMatch) {
	    return folderPathMatch[1];
	  }
	
	  // Unix file path check
	  folderPathMatch = path.match(/^(.*)(\/.*\..*$|\/.*)$/);
	
	  return folderPathMatch && folderPathMatch[1];
	}
	
	function fileName(path) {
	  var fileNameMatch = path.match(/^.*\\(.*\..*|.*)$/);
	
	  if (fileNameMatch) {
	    return fileNameMatch[1];
	  }
	
	  fileNameMatch = path.match(/^.*\/(.*\..*|.*)$/);
	
	  return fileNameMatch && fileNameMatch[1];
	}
	
	function fileExtension(path) {
	  var fileExtensionMatch = path.match(/^.*\.(.*)$/);
	
	  return fileExtensionMatch && fileExtensionMatch[1];
	}
	
	function escapeText(text) {
	  return text.replace(/"/g, '""');
	}
	
	function newlineChar() {
	  return '\r\n';
	}
	
	function uniqueName() {
	  /* eslint no-bitwise: ["off"] */
	  /* eslint no-mixed-operators: ["off"] */
	
	  return 'xxxxx-8xxxx-yxxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
	    var r = Math.random() * 16 | 0;
	    var v = c === 'x' ? r : r & 0x3 | 0x8;
	    return v.toString(16);
	  });
	}
	
	function validFieldType(type) {
	  var validFileTypes = ['time', 'timestamp', 'date'];
	
	  type = type || '';
	
	  return validFileTypes.indexOf(type.toLowerCase()) > -1;
	}
	
	function indentation() {
	  return '  ';
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _connectionBase = __webpack_require__(4);
	
	var _connectionBase2 = _interopRequireDefault(_connectionBase);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var WebFileConnection = function (_ConnectionBase) {
	  _inherits(WebFileConnection, _ConnectionBase);
	
	  function WebFileConnection(url, fileExtension) {
	    _classCallCheck(this, WebFileConnection);
	
	    var _this = _possibleConstructorReturn(this, (WebFileConnection.__proto__ || Object.getPrototypeOf(WebFileConnection)).call(this, url, 'internet'));
	
	    var fileExtensionMatch = url.match(/^https?:\/\/.*\/.*\.(\w*).*$/);
	    _this.fileExtension = fileExtensionMatch ? fileExtensionMatch[1] : fileExtension || 'html';
	    return _this;
	  }
	
	  return WebFileConnection;
	}(_connectionBase2.default);
	
	exports.default = WebFileConnection;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _connectionBase = __webpack_require__(4);
	
	var _connectionBase2 = _interopRequireDefault(_connectionBase);
	
	var _utils = __webpack_require__(5);
	
	var Utils = _interopRequireWildcard(_utils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var InlineData = function (_ConnectionBase) {
	  _inherits(InlineData, _ConnectionBase);
	
	  function InlineData(data) {
	    _classCallCheck(this, InlineData);
	
	    var _this = _possibleConstructorReturn(this, (InlineData.__proto__ || Object.getPrototypeOf(InlineData)).call(this));
	
	    _this.data = data;
	
	    _this.fileExtension = 'txt';
	    return _this;
	  }
	
	  _createClass(InlineData, [{
	    key: 'getScript',
	    value: function getScript() {
	      return 'INLINE "' + Utils.newlineChar() + Utils.escapeText(this.data) + Utils.newlineChar() + '"';
	    }
	  }, {
	    key: 'getLibStatement',
	    value: function getLibStatement() {}
	  }, {
	    key: 'getQixConnectionObject',
	    value: function getQixConnectionObject() {}
	  }]);
	
	  return InlineData;
	}(_connectionBase2.default);
	
	exports.default = InlineData;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	exports.convert = convert;
	exports.isJson = isJson;
	
	var _utils = __webpack_require__(5);
	
	var Utils = _interopRequireWildcard(_utils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function escapeValueContainingDelimiter(data, delimiter) {
	  if (data && typeof data === 'string' && data.indexOf(delimiter) > -1) {
	    return '"' + data + '"';
	  }
	
	  return data;
	}
	
	function convert(data) {
	  if (data instanceof Array === false) {
	    data = [data];
	  }
	
	  var csv = '';
	  var delimiter = ',';
	
	  var headers = Object.keys(data[0]);
	
	  csv = csv + headers.map(function (header) {
	    return escapeValueContainingDelimiter(header, delimiter);
	  }).join(delimiter) + Utils.newlineChar();
	
	  var fields = [];
	
	  data.forEach(function (i) {
	    fields = [];
	
	    headers.forEach(function (j) {
	      fields.push(escapeValueContainingDelimiter(i[j], delimiter));
	    });
	
	    csv = csv + fields.join(delimiter) + Utils.newlineChar();
	  });
	
	  csv = csv.slice(0, -Utils.newlineChar().length); // TODO: Uggly remove!
	
	  return csv;
	}
	
	function isJson(data) {
	  if (data instanceof Array) {
	    if (data[0] && _typeof(data[0]) === 'object') {
	      return true;
	    }
	  }
	
	  return false;
	}

/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var ConnectionLookup = function () {
	  function ConnectionLookup() {
	    _classCallCheck(this, ConnectionLookup);
	
	    this.connectionsRegistry = [];
	  }
	
	  _createClass(ConnectionLookup, [{
	    key: "addConnection",
	    value: function addConnection(matchingFn, connection) {
	      this.connectionsRegistry.push({
	        matchingFn: matchingFn,
	        connection: connection
	      });
	    }
	  }, {
	    key: "findMatch",
	    value: function findMatch(data) {
	      for (var i = 0; i < this.connectionsRegistry.length; i += 1) {
	        if (this.connectionsRegistry[i].matchingFn(data)) {
	          return this.connectionsRegistry[i].connection(data);
	        }
	      }
	
	      return data;
	    }
	  }]);
	
	  return ConnectionLookup;
	}();
	
	exports.default = ConnectionLookup;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = formatSpecification;
	
	var _utils = __webpack_require__(5);
	
	function supportedCharacterSet(characterSet) {
	  var validCharacterSets = ['utf8', 'unicode', 'ansi', 'oem', 'mac'];
	
	  return validCharacterSets.indexOf(characterSet) > -1 && characterSet || Number(characterSet).toString() !== 'NaN' && 'codepage is ' + characterSet;
	}
	
	function formatSpecification(options) {
	  if (!options) {
	    options = {};
	  }
	
	  var formatSpecificationArr = [];
	
	  if (options.fileExtension) {
	    var fileFormat = options.fileExtension;
	
	    if (fileFormat === 'xlsx') {
	      fileFormat = 'ooxml';
	    }
	
	    if (fileFormat === 'csv') {
	      fileFormat = 'txt';
	    }
	
	    if (fileFormat === 'htm') {
	      fileFormat = 'html';
	    }
	
	    formatSpecificationArr.push(fileFormat);
	  }
	
	  if (options.headerRowNr || options.headerRowNr === 0) {
	    formatSpecificationArr.push('header is ' + options.headerRowNr + ' lines');
	    // Should be included if header row is specified!
	    formatSpecificationArr.push('embedded labels');
	  }
	
	  if (options.delimiter) {
	    formatSpecificationArr.push('delimiter is \'' + options.delimiter + '\'');
	  }
	
	  if (options.characterSet && supportedCharacterSet(options.characterSet)) {
	    formatSpecificationArr.push(supportedCharacterSet(options.characterSet));
	  }
	
	  if (options.srcTable) {
	    formatSpecificationArr.push('table is "' + (0, _utils.escapeText)(options.srcTable) + '"');
	  }
	
	  if (options.noLabels) {
	    formatSpecificationArr.push('no labels');
	  }
	
	  var formatSpecificationString = '';
	
	  if (formatSpecificationArr.length > 0) {
	    formatSpecificationString = (0, _utils.newlineChar)() + '(' + formatSpecificationArr.join(', ') + ')';
	  }
	
	  return formatSpecificationString;
	}

/***/ }
/******/ ])
});
;
//# sourceMappingURL=halyard.js.map