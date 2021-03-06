'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = function (host, port, requestsAddress, fromAddress, additionalArgs) {
  let provider = new _web2.default.providers.HttpProvider(`http:\/\/${host}:${port}`);
  let did = new _did2.default(Requests, requestsAddress, provider, fromAddress, (0, _extends3.default)({
    Request,
    Response,
    User,
    Condition,
    UserDirectory
  }, additionalArgs));
  return did;
};

var _did = require('./lib/did');

var _did2 = _interopRequireDefault(_did);

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

var _truffleContract = require('truffle-contract');

var _truffleContract2 = _interopRequireDefault(_truffleContract);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var requestJson, requestsJson, responseJson, userJson, conditionJson, userDirectoryJson;
try {
  requestJson = require('./build/contracts/Request.json');
  responseJson = require('./build/contracts/Response.json');
  requestsJson = require('./build/contracts/Requests.json');
  userJson = require('./build/contracts/User.json');
  conditionJson = require('./build/contracts/Condition.json');
  userDirectoryJson = require('./build/contracts/UserDirectory.json');
} catch (error) {
  requestJson = require('./contracts/Request.json');
  responseJson = require('./contracts/Response.json');
  requestsJson = require('./contracts/Requests.json');
  userJson = require('./contracts/User.json');
  conditionJson = require('./contracts/Condition.json');
  userDirectoryJson = require('./contracts/UserDirectory.json');
}

const Request = (0, _truffleContract2.default)(requestJson);
const Response = (0, _truffleContract2.default)(responseJson);
const Requests = (0, _truffleContract2.default)(requestsJson);
const User = (0, _truffleContract2.default)(userJson);
const Condition = (0, _truffleContract2.default)(conditionJson);
const UserDirectory = (0, _truffleContract2.default)(userDirectoryJson);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2luZGV4LmpzIl0sIm5hbWVzIjpbImhvc3QiLCJwb3J0IiwicmVxdWVzdHNBZGRyZXNzIiwiZnJvbUFkZHJlc3MiLCJhZGRpdGlvbmFsQXJncyIsInByb3ZpZGVyIiwicHJvdmlkZXJzIiwiSHR0cFByb3ZpZGVyIiwiZGlkIiwiUmVxdWVzdHMiLCJSZXF1ZXN0IiwiUmVzcG9uc2UiLCJVc2VyIiwiQ29uZGl0aW9uIiwiVXNlckRpcmVjdG9yeSIsInJlcXVlc3RKc29uIiwicmVxdWVzdHNKc29uIiwicmVzcG9uc2VKc29uIiwidXNlckpzb24iLCJjb25kaXRpb25Kc29uIiwidXNlckRpcmVjdG9yeUpzb24iLCJyZXF1aXJlIiwiZXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7a0JBOEJlLFVBQVVBLElBQVYsRUFBZ0JDLElBQWhCLEVBQXNCQyxlQUF0QixFQUNXQyxXQURYLEVBQ3dCQyxjQUR4QixFQUN3QztBQUNyRCxNQUFJQyxXQUFXLElBQUksY0FBS0MsU0FBTCxDQUFlQyxZQUFuQixDQUFpQyxZQUFXUCxJQUFLLElBQUdDLElBQUssRUFBekQsQ0FBZjtBQUNBLE1BQUlPLE1BQU0sa0JBQ05DLFFBRE0sRUFFTlAsZUFGTSxFQUdORyxRQUhNLEVBSU5GLFdBSk07QUFNSk8sV0FOSTtBQU9KQyxZQVBJO0FBUUpDLFFBUkk7QUFTSkMsYUFUSTtBQVVKQztBQVZJLEtBV0RWLGNBWEMsRUFBVjtBQWNBLFNBQU9JLEdBQVA7QUFDRCxDOztBQWhERDs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLElBQUlPLFdBQUosRUFBZ0JDLFlBQWhCLEVBQTZCQyxZQUE3QixFQUEwQ0MsUUFBMUMsRUFDS0MsYUFETCxFQUNtQkMsaUJBRG5CO0FBRUEsSUFBSTtBQUNGTCxnQkFBY00sUUFBUSxnQ0FBUixDQUFkO0FBQ0FKLGlCQUFlSSxRQUFRLGlDQUFSLENBQWY7QUFDQUwsaUJBQWVLLFFBQVEsaUNBQVIsQ0FBZjtBQUNBSCxhQUFXRyxRQUFRLDZCQUFSLENBQVg7QUFDQUYsa0JBQWdCRSxRQUFRLGtDQUFSLENBQWhCO0FBQ0FELHNCQUFvQkMsUUFBUSxzQ0FBUixDQUFwQjtBQUNELENBUEQsQ0FRQSxPQUFNQyxLQUFOLEVBQWE7QUFDWFAsZ0JBQWNNLFFBQVEsMEJBQVIsQ0FBZDtBQUNBSixpQkFBZUksUUFBUSwyQkFBUixDQUFmO0FBQ0FMLGlCQUFlSyxRQUFRLDJCQUFSLENBQWY7QUFDQUgsYUFBV0csUUFBUSx1QkFBUixDQUFYO0FBQ0FGLGtCQUFnQkUsUUFBUSw0QkFBUixDQUFoQjtBQUNBRCxzQkFBb0JDLFFBQVEsZ0NBQVIsQ0FBcEI7QUFDRDs7QUFFRCxNQUFNWCxVQUFVLCtCQUFTSyxXQUFULENBQWhCO0FBQ0EsTUFBTUosV0FBVywrQkFBU00sWUFBVCxDQUFqQjtBQUNBLE1BQU1SLFdBQVcsK0JBQVNPLFlBQVQsQ0FBakI7QUFDQSxNQUFNSixPQUFPLCtCQUFTTSxRQUFULENBQWI7QUFDQSxNQUFNTCxZQUFZLCtCQUFTTSxhQUFULENBQWxCO0FBQ0EsTUFBTUwsZ0JBQWdCLCtCQUFTTSxpQkFBVCxDQUF0QiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlZmF1bHQgYXMgRGlkIH0gZnJvbSAnLi9saWIvZGlkJztcbmltcG9ydCB7IGRlZmF1bHQgYXMgV2ViMyB9IGZyb20gJ3dlYjMnO1xuaW1wb3J0IHsgZGVmYXVsdCBhcyBjb250cmFjdCB9IGZyb20gJ3RydWZmbGUtY29udHJhY3QnO1xuXG52YXIgcmVxdWVzdEpzb24scmVxdWVzdHNKc29uLHJlc3BvbnNlSnNvbix1c2VySnNvblxuICAgICxjb25kaXRpb25Kc29uLHVzZXJEaXJlY3RvcnlKc29uO1xudHJ5IHtcbiAgcmVxdWVzdEpzb24gPSByZXF1aXJlKCcuL2J1aWxkL2NvbnRyYWN0cy9SZXF1ZXN0Lmpzb24nKTtcbiAgcmVzcG9uc2VKc29uID0gcmVxdWlyZSgnLi9idWlsZC9jb250cmFjdHMvUmVzcG9uc2UuanNvbicpO1xuICByZXF1ZXN0c0pzb24gPSByZXF1aXJlKCcuL2J1aWxkL2NvbnRyYWN0cy9SZXF1ZXN0cy5qc29uJyk7XG4gIHVzZXJKc29uID0gcmVxdWlyZSgnLi9idWlsZC9jb250cmFjdHMvVXNlci5qc29uJyk7XG4gIGNvbmRpdGlvbkpzb24gPSByZXF1aXJlKCcuL2J1aWxkL2NvbnRyYWN0cy9Db25kaXRpb24uanNvbicpO1xuICB1c2VyRGlyZWN0b3J5SnNvbiA9IHJlcXVpcmUoJy4vYnVpbGQvY29udHJhY3RzL1VzZXJEaXJlY3RvcnkuanNvbicpO1xufVxuY2F0Y2goZXJyb3IpIHtcbiAgcmVxdWVzdEpzb24gPSByZXF1aXJlKCcuL2NvbnRyYWN0cy9SZXF1ZXN0Lmpzb24nKTtcbiAgcmVzcG9uc2VKc29uID0gcmVxdWlyZSgnLi9jb250cmFjdHMvUmVzcG9uc2UuanNvbicpO1xuICByZXF1ZXN0c0pzb24gPSByZXF1aXJlKCcuL2NvbnRyYWN0cy9SZXF1ZXN0cy5qc29uJyk7XG4gIHVzZXJKc29uID0gcmVxdWlyZSgnLi9jb250cmFjdHMvVXNlci5qc29uJyk7XG4gIGNvbmRpdGlvbkpzb24gPSByZXF1aXJlKCcuL2NvbnRyYWN0cy9Db25kaXRpb24uanNvbicpO1xuICB1c2VyRGlyZWN0b3J5SnNvbiA9IHJlcXVpcmUoJy4vY29udHJhY3RzL1VzZXJEaXJlY3RvcnkuanNvbicpO1xufVxuXG5jb25zdCBSZXF1ZXN0ID0gY29udHJhY3QocmVxdWVzdEpzb24pO1xuY29uc3QgUmVzcG9uc2UgPSBjb250cmFjdChyZXNwb25zZUpzb24pO1xuY29uc3QgUmVxdWVzdHMgPSBjb250cmFjdChyZXF1ZXN0c0pzb24pO1xuY29uc3QgVXNlciA9IGNvbnRyYWN0KHVzZXJKc29uKTtcbmNvbnN0IENvbmRpdGlvbiA9IGNvbnRyYWN0KGNvbmRpdGlvbkpzb24pO1xuY29uc3QgVXNlckRpcmVjdG9yeSA9IGNvbnRyYWN0KHVzZXJEaXJlY3RvcnlKc29uKTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKGhvc3QsIHBvcnQsIHJlcXVlc3RzQWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICAgICAgLCBmcm9tQWRkcmVzcywgYWRkaXRpb25hbEFyZ3MpIHtcbiAgbGV0IHByb3ZpZGVyID0gbmV3IFdlYjMucHJvdmlkZXJzLkh0dHBQcm92aWRlcihgaHR0cDpcXC9cXC8ke2hvc3R9OiR7cG9ydH1gKTtcbiAgbGV0IGRpZCA9IG5ldyBEaWQgKFxuICAgICAgUmVxdWVzdHMsXG4gICAgICByZXF1ZXN0c0FkZHJlc3MsXG4gICAgICBwcm92aWRlcixcbiAgICAgIGZyb21BZGRyZXNzLFxuICAgICAge1xuICAgICAgICBSZXF1ZXN0LFxuICAgICAgICBSZXNwb25zZSxcbiAgICAgICAgVXNlcixcbiAgICAgICAgQ29uZGl0aW9uLFxuICAgICAgICBVc2VyRGlyZWN0b3J5LFxuICAgICAgICAuLi5hZGRpdGlvbmFsQXJnc1xuICAgICAgfVxuICApO1xuICByZXR1cm4gZGlkO1xufVxuIl19