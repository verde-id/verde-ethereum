'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Web3 = require('web3');

exports.default = class {
  constructor(Requests = false, requestsAddress, provider, fromAddress, addtionalArgs) {
    this.web3 = new Web3(provider);
    this.fromAddress = fromAddress;
    this.provider = provider;

    let defaultOptions = {
      from: fromAddress,
      gas: 3000000
    };

    if (Requests && requestsAddress) {
      Requests.setProvider(provider);
      Requests.defaults(defaultOptions);
      this.requests = Requests.at(requestsAddress);
    }

    let {
      Request,
      Response,
      User,
      Condition,
      UserDirectory,
      directoryAddress
    } = addtionalArgs;

    if (Request) {
      Request.setProvider(provider);
      Request.defaults(defaultOptions);
      this.request = Request;
    }

    if (Response) {
      Response.setProvider(provider);
      Response.defaults(defaultOptions);
      this.response = Response;
    }

    if (User) {
      User.setProvider(provider);
      User.defaults(defaultOptions);
      this.user = User;
    }

    if (Condition) {
      Condition.setProvider(provider);
      Condition.defaults(defaultOptions);
      this.condition = Condition;
    }

    if (UserDirectory && directoryAddress) {
      UserDirectory.setProvider(provider);
      UserDirectory.defaults(defaultOptions);
      this.userDirectory = UserDirectory.at(directoryAddress);
    }
  }

  /*setUserDirectory(UserDirectory, userDirectoryAddress, provider) {
    UserDirectory.setProvider(provider);
    UserDirectory.defaults({
      from: this.fromAddress,
      gas: 3000000 
    });
    this.userDirectory = UserDirectory.at(userDirectoryAddress);
  }*/

  /*
  * Create a request.
  * Parameters
  *   userAddress : string
  *   requestText : string
  * Returns
  *   requestID : string
  */
  createRequest(userAddress, requestText) {
    return this.requests.createRequest(userAddress, requestText).then(result => {
      for (var i in result.logs) {
        if (result.logs[i].event === 'LogRequest') return _promise2.default.resolve(result.logs[i].args.requestID);
      }
      return true;
    }).catch(console.log.bind(console));
  }

  getRequestCount() {
    return this.requests.getRequestCount();
  }

  /*
  * Create a user.
  * Parameters
  *   ownerAddress : string
  *   namespace    : string
  *   id           : string
  * Returns
  *   userContractAddress : string
  */
  createUser(ownerAddress, namespace, id) {
    return this.userDirectory.findUserByNamespaceAndId(namespace, id).then(result => {
      if (this.web3.toDecimal(result) == 0) {
        return this.newUser(ownerAddress, namespace, id).then(result => {
          return _promise2.default.resolve(result);
        });
      } else {
        return _promise2.default.resolve(result);
      }
    }).catch(console.log.bind(console));
  }

  newUser(ownerAddress, namespace, id) {
    return this.userDirectory.newUser(ownerAddress, namespace, id).then(result => {
      for (var i in result.logs) {
        if (result.logs[i].event === 'LogNewUser') return _promise2.default.resolve(result.logs[i].args.userContract);
      }
      return true;
    }).catch(console.log.bind(console));
  }

  getUserCount() {
    return this.userDirectory.userCount().then(result => {
      return _promise2.default.resolve(result);
    }).catch(console.log.bind(console));
  }

  setMinimumResponse(userAddress, idpCount) {
    var _this = this;

    return (0, _asyncToGenerator3.default)(function* () {
      let user = _this.user.at(userAddress);
      let conditionAddr = yield user.conditionContract();
      let condition = _this.condition.at(conditionAddr);
      yield condition.setMinimumResponseOKCount(idpCount);
    })();
  }

  getMinimumResponse(userAddress) {
    var _this2 = this;

    return (0, _asyncToGenerator3.default)(function* () {
      let user = _this2.user.at(userAddress);
      let conditionAddr = yield user.conditionContract();
      let condition = _this2.condition.at(conditionAddr);
      return yield condition.minimumResponseOKCount();
    })();
  }

  findUserAddress(namespace = 'cid', id) {
    return this.userDirectory.findUserByNamespaceAndId(namespace, id).then(result => {
      return _promise2.default.resolve(result);
    }).catch(console.log.bind(console));
  }

  addIdpResponse(rid, code, status) {
    return this.requests.addIdpResponse(rid, code, status).then(() => {
      return _promise2.default.resolve(true);
    }).catch(console.log.bind(console));
  }
  /* 
  * Parameters
  *   Function
  *     
  * Example
  *   watchRequestEvent(function(error, result)) {
  *     if (!error)
  *       console.log(result)
  *     else
  *       console.error(error);
  */
  watchRequestEvent(callback) {
    // eslint-disable-next-line babel/new-cap
    var event = this.requests.LogRequest();
    event.watch(callback);
  }

  watchIdpResponse(callback) {
    // eslint-disable-next-line babel/new-cap
    var event = this.requests.IdpResponse();
    event.watch(callback);
  }

  watchAuthenticationEvent(requestId, callback) {
    // eslint-disable-next-line babel/new-cap
    var event = this.request.at(requestId).LogConditionComplete();
    event.watch(callback);
  }

  getRequestsByUserAddress(userAddress) {
    var _this3 = this;

    return (0, _asyncToGenerator3.default)(function* () {
      try {
        let count = yield _this3.requests.getRequestCount();
        let pendingList = [],
            approvedList = [],
            deniedList = [];
        for (let i = 0; i < count; i++) {
          let requestID = yield _this3.requests.getRequest(i);
          let tmpRequest = _this3.request.at(requestID);
          let responseID = yield tmpRequest.getIdpResponse();
          let tmpResponse = _this3.response.at(responseID);
          if ((yield tmpRequest.userAddress()) == userAddress) {
            let targetRequest = {
              requestID: requestID,
              userAddress: yield tmpRequest.userAddress(),
              rpAddress: yield tmpRequest.rpAddress(),
              requestText: yield tmpRequest.requestText()
            };
            if ((yield tmpResponse.getResponseCount()) < (yield _this3.getMinimumResponse(userAddress))) {
              pendingList.push(targetRequest);
            } else {
              if (yield tmpRequest.authenticationComplete()) {
                approvedList.push(targetRequest);
              } else {
                deniedList.push(targetRequest);
              }
            }
          }
        }
        return [null, {
          pending: pendingList,
          approved: approvedList,
          denied: deniedList
        }];
      } catch (error) {
        console.error('Cannot get pending', error);
        return [error, null];
      }
    })();
  }

  getRequests(userAddress) {
    var _this4 = this;

    return (0, _asyncToGenerator3.default)(function* () {
      try {
        let count = yield _this4.requests.getRequestCount();
        let pendingList = [],
            approvedList = [],
            deniedList = [];
        for (let i = 0; i < count; i++) {
          let requestContract = yield _this4.requests.getRequest(i);
          let tmpRequest = _this4.request.at(requestContract);
          let responseContract = yield tmpRequest.getIdpResponse();
          let tmpResponse = _this4.response.at(responseContract);
          if ((yield tmpRequest.userAddress()) == userAddress) {
            let targetRequest = {
              requestID: requestContract,
              userAddress: yield tmpRequest.userAddress(),
              rpAddress: yield tmpRequest.rpAddress(),
              requestText: yield tmpRequest.requestText()
            };
            let [isAnswered, myRespond] = yield tmpResponse.didIRespond();
            if (isAnswered) {
              if (parseInt(Number(myRespond)) === 0) approvedList.push(targetRequest);else deniedList.push(targetRequest);
            } else {
              pendingList.push(targetRequest);
            }
          }
        }
        return [null, {
          pending: pendingList,
          approved: approvedList,
          denied: deniedList
        }];
      } catch (error) {
        console.error('Cannot get pending', error);
        return [error, null];
      }
    })();
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9kaWQuanMiXSwibmFtZXMiOlsiV2ViMyIsInJlcXVpcmUiLCJjb25zdHJ1Y3RvciIsIlJlcXVlc3RzIiwicmVxdWVzdHNBZGRyZXNzIiwicHJvdmlkZXIiLCJmcm9tQWRkcmVzcyIsImFkZHRpb25hbEFyZ3MiLCJ3ZWIzIiwiZGVmYXVsdE9wdGlvbnMiLCJmcm9tIiwiZ2FzIiwic2V0UHJvdmlkZXIiLCJkZWZhdWx0cyIsInJlcXVlc3RzIiwiYXQiLCJSZXF1ZXN0IiwiUmVzcG9uc2UiLCJVc2VyIiwiQ29uZGl0aW9uIiwiVXNlckRpcmVjdG9yeSIsImRpcmVjdG9yeUFkZHJlc3MiLCJyZXF1ZXN0IiwicmVzcG9uc2UiLCJ1c2VyIiwiY29uZGl0aW9uIiwidXNlckRpcmVjdG9yeSIsImNyZWF0ZVJlcXVlc3QiLCJ1c2VyQWRkcmVzcyIsInJlcXVlc3RUZXh0IiwidGhlbiIsInJlc3VsdCIsImkiLCJsb2dzIiwiZXZlbnQiLCJyZXNvbHZlIiwiYXJncyIsInJlcXVlc3RJRCIsImNhdGNoIiwiY29uc29sZSIsImxvZyIsImJpbmQiLCJnZXRSZXF1ZXN0Q291bnQiLCJjcmVhdGVVc2VyIiwib3duZXJBZGRyZXNzIiwibmFtZXNwYWNlIiwiaWQiLCJmaW5kVXNlckJ5TmFtZXNwYWNlQW5kSWQiLCJ0b0RlY2ltYWwiLCJuZXdVc2VyIiwidXNlckNvbnRyYWN0IiwiZ2V0VXNlckNvdW50IiwidXNlckNvdW50Iiwic2V0TWluaW11bVJlc3BvbnNlIiwiaWRwQ291bnQiLCJjb25kaXRpb25BZGRyIiwiY29uZGl0aW9uQ29udHJhY3QiLCJzZXRNaW5pbXVtUmVzcG9uc2VPS0NvdW50IiwiZ2V0TWluaW11bVJlc3BvbnNlIiwibWluaW11bVJlc3BvbnNlT0tDb3VudCIsImZpbmRVc2VyQWRkcmVzcyIsImFkZElkcFJlc3BvbnNlIiwicmlkIiwiY29kZSIsInN0YXR1cyIsIndhdGNoUmVxdWVzdEV2ZW50IiwiY2FsbGJhY2siLCJMb2dSZXF1ZXN0Iiwid2F0Y2giLCJ3YXRjaElkcFJlc3BvbnNlIiwiSWRwUmVzcG9uc2UiLCJ3YXRjaEF1dGhlbnRpY2F0aW9uRXZlbnQiLCJyZXF1ZXN0SWQiLCJMb2dDb25kaXRpb25Db21wbGV0ZSIsImdldFJlcXVlc3RzQnlVc2VyQWRkcmVzcyIsImNvdW50IiwicGVuZGluZ0xpc3QiLCJhcHByb3ZlZExpc3QiLCJkZW5pZWRMaXN0IiwiZ2V0UmVxdWVzdCIsInRtcFJlcXVlc3QiLCJyZXNwb25zZUlEIiwiZ2V0SWRwUmVzcG9uc2UiLCJ0bXBSZXNwb25zZSIsInRhcmdldFJlcXVlc3QiLCJycEFkZHJlc3MiLCJnZXRSZXNwb25zZUNvdW50IiwicHVzaCIsImF1dGhlbnRpY2F0aW9uQ29tcGxldGUiLCJwZW5kaW5nIiwiYXBwcm92ZWQiLCJkZW5pZWQiLCJlcnJvciIsImdldFJlcXVlc3RzIiwicmVxdWVzdENvbnRyYWN0IiwicmVzcG9uc2VDb250cmFjdCIsImlzQW5zd2VyZWQiLCJteVJlc3BvbmQiLCJkaWRJUmVzcG9uZCIsInBhcnNlSW50IiwiTnVtYmVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsTUFBTUEsT0FBT0MsUUFBUSxNQUFSLENBQWI7O2tCQUVlLE1BQU07QUFDbkJDLGNBQ0VDLFdBQVcsS0FEYixFQUVFQyxlQUZGLEVBR0VDLFFBSEYsRUFJRUMsV0FKRixFQUtFQyxhQUxGLEVBTUU7QUFDQSxTQUFLQyxJQUFMLEdBQVksSUFBSVIsSUFBSixDQUFTSyxRQUFULENBQVo7QUFDQSxTQUFLQyxXQUFMLEdBQW1CQSxXQUFuQjtBQUNBLFNBQUtELFFBQUwsR0FBZ0JBLFFBQWhCOztBQUVBLFFBQUlJLGlCQUFpQjtBQUNuQkMsWUFBTUosV0FEYTtBQUVuQkssV0FBSztBQUZjLEtBQXJCOztBQUtBLFFBQUlSLFlBQVlDLGVBQWhCLEVBQWlDO0FBQy9CRCxlQUFTUyxXQUFULENBQXFCUCxRQUFyQjtBQUNBRixlQUFTVSxRQUFULENBQWtCSixjQUFsQjtBQUNBLFdBQUtLLFFBQUwsR0FBZ0JY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QUFsQjtBQUNBLGNBQUksQ0FBQyxNQUFNZixXQUFXcEQsV0FBWCxFQUFQLEtBQW9DQSxXQUF4QyxFQUFxRDtBQUNuRCxnQkFBSXdELGdCQUFnQjtBQUNsQi9DLHlCQUFXeUQsZUFETztBQUVsQmxFLDJCQUFhLE1BQU1vRCxXQUFXcEQsV0FBWCxFQUZEO0FBR2xCeUQseUJBQVcsTUFBTUwsV0FBV0ssU0FBWCxFQUhDO0FBSWxCeEQsMkJBQWEsTUFBTW1ELFdBQVduRCxXQUFYO0FBSkQsYUFBcEI7QUFNQSxnQkFBSSxDQUFDbUUsVUFBRCxFQUFhQyxTQUFiLElBQTBCLE1BQU1kLFlBQVllLFdBQVosRUFBcEM7QUFDQSxnQkFBSUYsVUFBSixFQUFnQjtBQUNkLGtCQUFJRyxTQUFTQyxPQUFPSCxTQUFQLENBQVQsTUFBZ0MsQ0FBcEMsRUFDRXBCLGFBQWFVLElBQWIsQ0FBa0JILGFBQWxCLEVBREYsS0FFS04sV0FBV1MsSUFBWCxDQUFnQkgsYUFBaEI7QUFDTixhQUpELE1BSU87QUFDTFIsMEJBQVlXLElBQVosQ0FBaUJILGFBQWpCO0FBQ0Q7QUFDRjtBQUNGO0FBQ0QsZUFBTyxDQUNMLElBREssRUFFTDtBQUNFSyxtQkFBU2IsV0FEWDtBQUVFYyxvQkFBVWIsWUFGWjtBQUdFYyxrQkFBUWI7QUFIVixTQUZLLENBQVA7QUFRRCxPQW5DRCxDQW1DRSxPQUFPYyxLQUFQLEVBQWM7QUFDZHJELGdCQUFRcUQsS0FBUixDQUFjLG9CQUFkLEVBQW9DQSxLQUFwQztBQUNBLGVBQU8sQ0FBQ0EsS0FBRCxFQUFRLElBQVIsQ0FBUDtBQUNEO0FBdkM0QjtBQXdDOUI7QUFqU2tCLEMiLCJmaWxlIjoiZGlkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgV2ViMyA9IHJlcXVpcmUoJ3dlYjMnKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihcbiAgICBSZXF1ZXN0cyA9IGZhbHNlLFxuICAgIHJlcXVlc3RzQWRkcmVzcyxcbiAgICBwcm92aWRlcixcbiAgICBmcm9tQWRkcmVzcyxcbiAgICBhZGR0aW9uYWxBcmdzXG4gICkge1xuICAgIHRoaXMud2ViMyA9IG5ldyBXZWIzKHByb3ZpZGVyKTtcbiAgICB0aGlzLmZyb21BZGRyZXNzID0gZnJvbUFkZHJlc3M7XG4gICAgdGhpcy5wcm92aWRlciA9IHByb3ZpZGVyO1xuXG4gICAgbGV0IGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgZnJvbTogZnJvbUFkZHJlc3MsXG4gICAgICBnYXM6IDMwMDAwMDBcbiAgICB9O1xuXG4gICAgaWYgKFJlcXVlc3RzICYmIHJlcXVlc3RzQWRkcmVzcykge1xuICAgICAgUmVxdWVzdHMuc2V0UHJvdmlkZXIocHJvdmlkZXIpO1xuICAgICAgUmVxdWVzdHMuZGVmYXVsdHMoZGVmYXVsdE9wdGlvbnMpO1xuICAgICAgdGhpcy5yZXF1ZXN0cyA9IFJlcXVlc3RzLmF0KHJlcXVlc3RzQWRkcmVzcyk7XG4gICAgfVxuXG4gICAgbGV0IHtcbiAgICAgIFJlcXVlc3QsXG4gICAgICBSZXNwb25zZSxcbiAgICAgIFVzZXIsXG4gICAgICBDb25kaXRpb24sXG4gICAgICBVc2VyRGlyZWN0b3J5LFxuICAgICAgZGlyZWN0b3J5QWRkcmVzc1xuICAgIH0gPSBhZGR0aW9uYWxBcmdzO1xuXG4gICAgaWYgKFJlcXVlc3QpIHtcbiAgICAgIFJlcXVlc3Quc2V0UHJvdmlkZXIocHJvdmlkZXIpO1xuICAgICAgUmVxdWVzdC5kZWZhdWx0cyhkZWZhdWx0T3B0aW9ucyk7XG4gICAgICB0aGlzLnJlcXVlc3QgPSBSZXF1ZXN0O1xuICAgIH1cblxuICAgIGlmIChSZXNwb25zZSkge1xuICAgICAgUmVzcG9uc2Uuc2V0UHJvdmlkZXIocHJvdmlkZXIpO1xuICAgICAgUmVzcG9uc2UuZGVmYXVsdHMoZGVmYXVsdE9wdGlvbnMpO1xuICAgICAgdGhpcy5yZXNwb25zZSA9IFJlc3BvbnNlO1xuICAgIH1cblxuICAgIGlmIChVc2VyKSB7XG4gICAgICBVc2VyLnNldFByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICAgIFVzZXIuZGVmYXVsdHMoZGVmYXVsdE9wdGlvbnMpO1xuICAgICAgdGhpcy51c2VyID0gVXNlcjtcbiAgICB9XG5cbiAgICBpZiAoQ29uZGl0aW9uKSB7XG4gICAgICBDb25kaXRpb24uc2V0UHJvdmlkZXIocHJvdmlkZXIpO1xuICAgICAgQ29uZGl0aW9uLmRlZmF1bHRzKGRlZmF1bHRPcHRpb25zKTtcbiAgICAgIHRoaXMuY29uZGl0aW9uID0gQ29uZGl0aW9uO1xuICAgIH1cblxuICAgIGlmIChVc2VyRGlyZWN0b3J5ICYmIGRpcmVjdG9yeUFkZHJlc3MpIHtcbiAgICAgIFVzZXJEaXJlY3Rvcnkuc2V0UHJvdmlkZXIocHJvdmlkZXIpO1xuICAgICAgVXNlckRpcmVjdG9yeS5kZWZhdWx0cyhkZWZhdWx0T3B0aW9ucyk7XG4gICAgICB0aGlzLnVzZXJEaXJlY3RvcnkgPSBVc2VyRGlyZWN0b3J5LmF0KGRpcmVjdG9yeUFkZHJlc3MpO1xuICAgIH1cbiAgfVxuXG4gIC8qc2V0VXNlckRpcmVjdG9yeShVc2VyRGlyZWN0b3J5LCB1c2VyRGlyZWN0b3J5QWRkcmVzcywgcHJvdmlkZXIpIHtcbiAgICBVc2VyRGlyZWN0b3J5LnNldFByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICBVc2VyRGlyZWN0b3J5LmRlZmF1bHRzKHtcbiAgICAgIGZyb206IHRoaXMuZnJvbUFkZHJlc3MsXG4gICAgICBnYXM6IDMwMDAwMDAgXG4gICAgfSk7XG4gICAgdGhpcy51c2VyRGlyZWN0b3J5ID0gVXNlckRpcmVjdG9yeS5hdCh1c2VyRGlyZWN0b3J5QWRkcmVzcyk7XG4gIH0qL1xuXG4gIC8qXG4gICogQ3JlYXRlIGEgcmVxdWVzdC5cbiAgKiBQYXJhbWV0ZXJzXG4gICogICB1c2VyQWRkcmVzcyA6IHN0cmluZ1xuICAqICAgcmVxdWVzdFRleHQgOiBzdHJpbmdcbiAgKiBSZXR1cm5zXG4gICogICByZXF1ZXN0SUQgOiBzdHJpbmdcbiAgKi9cbiAgY3JlYXRlUmVxdWVzdCh1c2VyQWRkcmVzcywgcmVxdWVzdFRleHQpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0c1xuICAgICAgLmNyZWF0ZVJlcXVlc3QodXNlckFkZHJlc3MsIHJlcXVlc3RUZXh0KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgZm9yICh2YXIgaSBpbiByZXN1bHQubG9ncykge1xuICAgICAgICAgIGlmIChyZXN1bHQubG9nc1tpXS5ldmVudCA9PT0gJ0xvZ1JlcXVlc3QnKVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXN1bHQubG9nc1tpXS5hcmdzLnJlcXVlc3RJRCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSkpO1xuICB9XG5cbiAgZ2V0UmVxdWVzdENvdW50KCkge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3RzLmdldFJlcXVlc3RDb3VudCgpO1xuICB9XG5cbiAgLypcbiAgKiBDcmVhdGUgYSB1c2VyLlxuICAqIFBhcmFtZXRlcnNcbiAgKiAgIG93bmVyQWRkcmVzcyA6IHN0cmluZ1xuICAqICAgbmFtZXNwYWNlICAgIDogc3RyaW5nXG4gICogICBpZCAgICAgICAgICAgOiBzdHJpbmdcbiAgKiBSZXR1cm5zXG4gICogICB1c2VyQ29udHJhY3RBZGRyZXNzIDogc3RyaW5nXG4gICovXG4gIGNyZWF0ZVVzZXIob3duZXJBZGRyZXNzLCBuYW1lc3BhY2UsIGlkKSB7XG4gICAgcmV0dXJuIHRoaXMudXNlckRpcmVjdG9yeVxuICAgICAgLmZpbmRVc2VyQnlOYW1lc3BhY2VBbmRJZChuYW1lc3BhY2UsIGlkKVxuICAgICAgLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgaWYgKHRoaXMud2ViMy50b0RlY2ltYWwocmVzdWx0KSA9PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubmV3VXNlcihvd25lckFkZHJlc3MsIG5hbWVzcGFjZSwgaWQpLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuY2F0Y2goY29uc29sZS5sb2cuYmluZChjb25zb2xlKSk7XG4gIH1cblxuICBuZXdVc2VyKG93bmVyQWRkcmVzcywgbmFtZXNwYWNlLCBpZCkge1xuICAgIHJldHVybiB0aGlzLnVzZXJEaXJlY3RvcnlcbiAgICAgIC5uZXdVc2VyKG93bmVyQWRkcmVzcywgbmFtZXNwYWNlLCBpZClcbiAgICAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgIGZvciAodmFyIGkgaW4gcmVzdWx0LmxvZ3MpIHtcbiAgICAgICAgICBpZiAocmVzdWx0LmxvZ3NbaV0uZXZlbnQgPT09ICdMb2dOZXdVc2VyJylcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzdWx0LmxvZ3NbaV0uYXJncy51c2VyQ29udHJhY3QpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpKTtcbiAgfVxuXG4gIGdldFVzZXJDb3VudCgpIHtcbiAgICByZXR1cm4gdGhpcy51c2VyRGlyZWN0b3J5XG4gICAgICAudXNlckNvdW50KClcbiAgICAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzdWx0KTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goY29uc29sZS5sb2cuYmluZChjb25zb2xlKSk7XG4gIH1cblxuICBhc3luYyBzZXRNaW5pbXVtUmVzcG9uc2UodXNlckFkZHJlc3MsIGlkcENvdW50KSB7XG4gICAgbGV0IHVzZXIgPSB0aGlzLnVzZXIuYXQodXNlckFkZHJlc3MpO1xuICAgIGxldCBjb25kaXRpb25BZGRyID0gYXdhaXQgdXNlci5jb25kaXRpb25Db250cmFjdCgpO1xuICAgIGxldCBjb25kaXRpb24gPSB0aGlzLmNvbmRpdGlvbi5hdChjb25kaXRpb25BZGRyKTtcbiAgICBhd2FpdCBjb25kaXRpb24uc2V0TWluaW11bVJlc3BvbnNlT0tDb3VudChpZHBDb3VudCk7XG4gIH1cblxuICBhc3luYyBnZXRNaW5pbXVtUmVzcG9uc2UodXNlckFkZHJlc3MpIHtcbiAgICBsZXQgdXNlciA9IHRoaXMudXNlci5hdCh1c2VyQWRkcmVzcyk7XG4gICAgbGV0IGNvbmRpdGlvbkFkZHIgPSBhd2FpdCB1c2VyLmNvbmRpdGlvbkNvbnRyYWN0KCk7XG4gICAgbGV0IGNvbmRpdGlvbiA9IHRoaXMuY29uZGl0aW9uLmF0KGNvbmRpdGlvbkFkZHIpO1xuICAgIHJldHVybiBhd2FpdCBjb25kaXRpb24ubWluaW11bVJlc3BvbnNlT0tDb3VudCgpO1xuICB9XG5cbiAgZmluZFVzZXJBZGRyZXNzKG5hbWVzcGFjZSA9ICdjaWQnLCBpZCkge1xuICAgIHJldHVybiB0aGlzLnVzZXJEaXJlY3RvcnlcbiAgICAgIC5maW5kVXNlckJ5TmFtZXNwYWNlQW5kSWQobmFtZXNwYWNlLCBpZClcbiAgICAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzdWx0KTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goY29uc29sZS5sb2cuYmluZChjb25zb2xlKSk7XG4gIH1cblxuICBhZGRJZHBSZXNwb25zZShyaWQsIGNvZGUsIHN0YXR1cykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3RzXG4gICAgICAuYWRkSWRwUmVzcG9uc2UocmlkLCBjb2RlLCBzdGF0dXMpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSkpO1xuICB9XG4gIC8qIFxuICAqIFBhcmFtZXRlcnNcbiAgKiAgIEZ1bmN0aW9uXG4gICogICAgIFxuICAqIEV4YW1wbGVcbiAgKiAgIHdhdGNoUmVxdWVzdEV2ZW50KGZ1bmN0aW9uKGVycm9yLCByZXN1bHQpKSB7XG4gICogICAgIGlmICghZXJyb3IpXG4gICogICAgICAgY29uc29sZS5sb2cocmVzdWx0KVxuICAqICAgICBlbHNlXG4gICogICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICovXG4gIHdhdGNoUmVxdWVzdEV2ZW50KGNhbGxiYWNrKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGJhYmVsL25ldy1jYXBcbiAgICB2YXIgZXZlbnQgPSB0aGlzLnJlcXVlc3RzLkxvZ1JlcXVlc3QoKTtcbiAgICBldmVudC53YXRjaChjYWxsYmFjayk7XG4gIH1cblxuICB3YXRjaElkcFJlc3BvbnNlKGNhbGxiYWNrKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGJhYmVsL25ldy1jYXBcbiAgICB2YXIgZXZlbnQgPSB0aGlzLnJlcXVlc3RzLklkcFJlc3BvbnNlKCk7XG4gICAgZXZlbnQud2F0Y2goY2FsbGJhY2spO1xuICB9XG5cbiAgd2F0Y2hBdXRoZW50aWNhdGlvbkV2ZW50KHJlcXVlc3RJZCwgY2FsbGJhY2spIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgYmFiZWwvbmV3LWNhcFxuICAgIHZhciBldmVudCA9IHRoaXMucmVxdWVzdC5hdChyZXF1ZXN0SWQpLkxvZ0NvbmRpdGlvbkNvbXBsZXRlKCk7XG4gICAgZXZlbnQud2F0Y2goY2FsbGJhY2spO1xuICB9XG5cbiAgYXN5bmMgZ2V0UmVxdWVzdHNCeVVzZXJBZGRyZXNzKHVzZXJBZGRyZXNzKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBjb3VudCA9IGF3YWl0IHRoaXMucmVxdWVzdHMuZ2V0UmVxdWVzdENvdW50KCk7XG4gICAgICBsZXQgcGVuZGluZ0xpc3QgPSBbXSxcbiAgICAgICAgYXBwcm92ZWRMaXN0ID0gW10sXG4gICAgICAgIGRlbmllZExpc3QgPSBbXTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICBsZXQgcmVxdWVzdElEID0gYXdhaXQgdGhpcy5yZXF1ZXN0cy5nZXRSZXF1ZXN0KGkpO1xuICAgICAgICBsZXQgdG1wUmVxdWVzdCA9IHRoaXMucmVxdWVzdC5hdChyZXF1ZXN0SUQpO1xuICAgICAgICBsZXQgcmVzcG9uc2VJRCA9IGF3YWl0IHRtcFJlcXVlc3QuZ2V0SWRwUmVzcG9uc2UoKTtcbiAgICAgICAgbGV0IHRtcFJlc3BvbnNlID0gdGhpcy5yZXNwb25zZS5hdChyZXNwb25zZUlEKTtcbiAgICAgICAgaWYgKChhd2FpdCB0bXBSZXF1ZXN0LnVzZXJBZGRyZXNzKCkpID09IHVzZXJBZGRyZXNzKSB7XG4gICAgICAgICAgbGV0IHRhcmdldFJlcXVlc3QgPSB7XG4gICAgICAgICAgICByZXF1ZXN0SUQ6IHJlcXVlc3RJRCxcbiAgICAgICAgICAgIHVzZXJBZGRyZXNzOiBhd2FpdCB0bXBSZXF1ZXN0LnVzZXJBZGRyZXNzKCksXG4gICAgICAgICAgICBycEFkZHJlc3M6IGF3YWl0IHRtcFJlcXVlc3QucnBBZGRyZXNzKCksXG4gICAgICAgICAgICByZXF1ZXN0VGV4dDogYXdhaXQgdG1wUmVxdWVzdC5yZXF1ZXN0VGV4dCgpXG4gICAgICAgICAgfTtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAoYXdhaXQgdG1wUmVzcG9uc2UuZ2V0UmVzcG9uc2VDb3VudCgpKSA8XG4gICAgICAgICAgICAoYXdhaXQgdGhpcy5nZXRNaW5pbXVtUmVzcG9uc2UodXNlckFkZHJlc3MpKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgcGVuZGluZ0xpc3QucHVzaCh0YXJnZXRSZXF1ZXN0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGF3YWl0IHRtcFJlcXVlc3QuYXV0aGVudGljYXRpb25Db21wbGV0ZSgpKSB7XG4gICAgICAgICAgICAgIGFwcHJvdmVkTGlzdC5wdXNoKHRhcmdldFJlcXVlc3QpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZGVuaWVkTGlzdC5wdXNoKHRhcmdldFJlcXVlc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIFtcbiAgICAgICAgbnVsbCxcbiAgICAgICAge1xuICAgICAgICAgIHBlbmRpbmc6IHBlbmRpbmdMaXN0LFxuICAgICAgICAgIGFwcHJvdmVkOiBhcHByb3ZlZExpc3QsXG4gICAgICAgICAgZGVuaWVkOiBkZW5pZWRMaXN0XG4gICAgICAgIH1cbiAgICAgIF07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Nhbm5vdCBnZXQgcGVuZGluZycsIGVycm9yKTtcbiAgICAgIHJldHVybiBbZXJyb3IsIG51bGxdO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldFJlcXVlc3RzKHVzZXJBZGRyZXNzKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBjb3VudCA9IGF3YWl0IHRoaXMucmVxdWVzdHMuZ2V0UmVxdWVzdENvdW50KCk7XG4gICAgICBsZXQgcGVuZGluZ0xpc3QgPSBbXSxcbiAgICAgICAgYXBwcm92ZWRMaXN0ID0gW10sXG4gICAgICAgIGRlbmllZExpc3QgPSBbXTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICBsZXQgcmVxdWVzdENvbnRyYWN0ID0gYXdhaXQgdGhpcy5yZXF1ZXN0cy5nZXRSZXF1ZXN0KGkpO1xuICAgICAgICBsZXQgdG1wUmVxdWVzdCA9IHRoaXMucmVxdWVzdC5hdChyZXF1ZXN0Q29udHJhY3QpO1xuICAgICAgICBsZXQgcmVzcG9uc2VDb250cmFjdCA9IGF3YWl0IHRtcFJlcXVlc3QuZ2V0SWRwUmVzcG9uc2UoKTtcbiAgICAgICAgbGV0IHRtcFJlc3BvbnNlID0gdGhpcy5yZXNwb25zZS5hdChyZXNwb25zZUNvbnRyYWN0KTtcbiAgICAgICAgaWYgKChhd2FpdCB0bXBSZXF1ZXN0LnVzZXJBZGRyZXNzKCkpID09IHVzZXJBZGRyZXNzKSB7XG4gICAgICAgICAgbGV0IHRhcmdldFJlcXVlc3QgPSB7XG4gICAgICAgICAgICByZXF1ZXN0SUQ6IHJlcXVlc3RDb250cmFjdCxcbiAgICAgICAgICAgIHVzZXJBZGRyZXNzOiBhd2FpdCB0bXBSZXF1ZXN0LnVzZXJBZGRyZXNzKCksXG4gICAgICAgICAgICBycEFkZHJlc3M6IGF3YWl0IHRtcFJlcXVlc3QucnBBZGRyZXNzKCksXG4gICAgICAgICAgICByZXF1ZXN0VGV4dDogYXdhaXQgdG1wUmVxdWVzdC5yZXF1ZXN0VGV4dCgpXG4gICAgICAgICAgfTtcbiAgICAgICAgICBsZXQgW2lzQW5zd2VyZWQsIG15UmVzcG9uZF0gPSBhd2FpdCB0bXBSZXNwb25zZS5kaWRJUmVzcG9uZCgpO1xuICAgICAgICAgIGlmIChpc0Fuc3dlcmVkKSB7XG4gICAgICAgICAgICBpZiAocGFyc2VJbnQoTnVtYmVyKG15UmVzcG9uZCkpID09PSAwKVxuICAgICAgICAgICAgICBhcHByb3ZlZExpc3QucHVzaCh0YXJnZXRSZXF1ZXN0KTtcbiAgICAgICAgICAgIGVsc2UgZGVuaWVkTGlzdC5wdXNoKHRhcmdldFJlcXVlc3QpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwZW5kaW5nTGlzdC5wdXNoKHRhcmdldFJlcXVlc3QpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIFtcbiAgICAgICAgbnVsbCxcbiAgICAgICAge1xuICAgICAgICAgIHBlbmRpbmc6IHBlbmRpbmdMaXN0LFxuICAgICAgICAgIGFwcHJvdmVkOiBhcHByb3ZlZExpc3QsXG4gICAgICAgICAgZGVuaWVkOiBkZW5pZWRMaXN0XG4gICAgICAgIH1cbiAgICAgIF07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Nhbm5vdCBnZXQgcGVuZGluZycsIGVycm9yKTtcbiAgICAgIHJldHVybiBbZXJyb3IsIG51bGxdO1xuICAgIH1cbiAgfVxufVxuIl19