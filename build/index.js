'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Promise = _interopDefault(require('bluebird'));
var $inject_Object_values = _interopDefault(require('object-values'));

var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

babelHelpers.extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

babelHelpers.slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

babelHelpers;

var Unauthorized = { code: 401, message: 'Unauthorized application ID' };
var NotFound = { code: 404, message: 'Route not found' };
var InternalServer = { code: 500, message: 'Internal skill error' };

var _ErrorCode = Object.freeze({
	Unauthorized: Unauthorized,
	NotFound: NotFound,
	InternalServer: InternalServer
});

var _class;
var _temp;
var Request = (_temp = _class = function () {
  function Request() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    babelHelpers.classCallCheck(this, Request);

    this.state = state;
  }

  babelHelpers.createClass(Request, [{
    key: 'session',
    value: function session(_session) {
      return new Request(babelHelpers.extends({}, this.state, {
        session: babelHelpers.extends({}, this.state.session, _session)
      }));
    }
  }, {
    key: 'intent',
    value: function intent(name) {
      var slots = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var slotData = Object.entries(slots).reduce(function (state, _ref) {
        var _ref2 = babelHelpers.slicedToArray(_ref, 2);

        var name = _ref2[0];
        var value = _ref2[1];
        return babelHelpers.extends({}, state, babelHelpers.defineProperty({}, name, { name: name, value: value }));
      }, {});
      return new Request(babelHelpers.extends({}, this.state, {
        request: {
          type: 'IntentRequest',
          intent: babelHelpers.extends({
            name: name
          }, Object.keys(slotData).length ? { slots: slotData } : null)
        }
      }));
    }
  }, {
    key: 'launchRequest',
    value: function launchRequest() {
      return new Request(babelHelpers.extends({}, this.state, {
        request: {
          type: 'LaunchRequest'
        }
      }));
    }
  }, {
    key: 'sessionEndedRequest',
    value: function sessionEndedRequest() {
      return new Request(babelHelpers.extends({}, this.state, {
        request: {
          type: 'SessionEndedRequest'
        }
      }));
    }
  }, {
    key: 'build',
    value: function build() {
      return babelHelpers.extends({}, this.state);
    }
  }]);
  return Request;
}(), _class.session = function () {
  var _ref3;

  return (_ref3 = new Request()).session.apply(_ref3, arguments);
}, _class.intent = function () {
  var _ref4;

  return (_ref4 = new Request()).intent.apply(_ref4, arguments);
}, _class.launchRequest = function () {
  var _ref5;

  return (_ref5 = new Request()).launchRequest.apply(_ref5, arguments);
}, _class.sessionEndedRequest = function () {
  var _ref6;

  return (_ref6 = new Request()).sessionEndedRequest.apply(_ref6, arguments);
}, _temp);

var isAuthorized = function isAuthorized() {
  var expected = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var actual = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  return new Promise(function (resolve, reject) {
    var isOK = !expected.applicationId || expected.applicationId === actual.applicationId;
    return isOK ? resolve() : reject(Unauthorized);
  });
};

var SkillAnnotation = function SkillAnnotation(options) {
  return function (Skill) {
    return function (event, context, callback) {
      event = event || {};

      if (Object.keys(event.body || {}).length) event = event.body;

      var _event = event;
      var request = _event.request;
      var session = _event.session;

      var _ref = session || {};

      var application = _ref.application;
      var attributes = _ref.attributes;


      return isAuthorized(options, application).then(function () {
        return new Skill(session).route(request) || Promise.reject(NotFound);
      }).then(function (response) {
        return typeof response.build === 'function' ? response.build(attributes) : response;
      }).then(function (response) {
        if (options.logging !== false) {
          var name = typeof options.logging === 'string' ? options.logging : 'Skill';
          console.log('[' + name + ']', JSON.stringify({ request: request, response: response }));
        }
        return response;
      }).then(function (response) {
        return context.succeed(response);
      }).catch(function () {
        var error = arguments.length <= 0 || arguments[0] === undefined ? InternalServer : arguments[0];
        return context.fail(error);
      });
    };
  };
};

/*******************************************************************************
 * This provides multiple ways of using the @Skill annotation:
 *
 * 1. @Skill
 * 2. @Skill()
 * 3. @Skill({ applicationId: 'my-authorized-application-id' })
 ******************************************************************************/

var _Skill = (function () {
  var optionsOrSkill = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var isSkill = typeof optionsOrSkill === 'function';
  var options = isSkill ? {} : optionsOrSkill;
  var skill = isSkill && optionsOrSkill;

  return isSkill ? SkillAnnotation(options)(skill) : SkillAnnotation(options);
})

var annotation = function annotation(predicate) {
  var transform = arguments.length <= 1 || arguments[1] === undefined ? function (i) {
    return i;
  } : arguments[1];
  return function (skill, name) {
    var route = skill.route || function () {
      return false;
    };

    skill.route = function (request) {
      return route.call(this, request) || predicate(request) && skill[name].call(this, transform(request), request);
    };

    return skill;
  };
};

var Launch = annotation(function (_ref) {
  var type = _ref.type;
  return type === 'LaunchRequest';
});

var SessionEnded = annotation(function (_ref2) {
  var type = _ref2.type;
  return type === 'SessionEndedRequest';
});

var Intent = function Intent() {
  for (var _len = arguments.length, names = Array(_len), _key = 0; _key < _len; _key++) {
    names[_key] = arguments[_key];
  }

  return annotation(function (_ref3) {
    var type = _ref3.type;
    var _ref3$intent = _ref3.intent;
    var intent = _ref3$intent === undefined ? {} : _ref3$intent;
    return type === 'IntentRequest' && names.indexOf(intent.name) >= 0;
  }, function (_ref4) {
    var _ref4$intent = _ref4.intent;
    var intent = _ref4$intent === undefined ? {} : _ref4$intent;
    return $inject_Object_values(intent.slots || {}).reduce(function (state, _ref5) {
      var name = _ref5.name;
      var value = _ref5.value;
      return name && value != null ? babelHelpers.extends({}, state, babelHelpers.defineProperty({}, name, value)) : state;
    }, {});
  });
};

exports.ErrorCode = _ErrorCode;
exports.Request = Request;
exports.Skill = _Skill;
exports.Launch = Launch;
exports.Intent = Intent;
exports.SessionEnded = SessionEnded;