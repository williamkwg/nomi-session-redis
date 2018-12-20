'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nomiCookie = require('nomi-cookie');

var _nomiCookie2 = _interopRequireDefault(_nomiCookie);

var _config = require('./config');

var _util = require('./util');

var _RedisStore = require('./RedisStore');

var _RedisStore2 = _interopRequireDefault(_RedisStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Session = function () {
  function Session(ctx, opts) {
    _classCallCheck(this, Session);

    this.expires = opts.maxAge || _config.defaultConfig.maxAge; // 过期时间
    this.options = _extends({}, _config.defaultConfig, opts, { maxAge: this.expires });
    this.key = this.options.key;
    this.reNew = this.options.reNew; // 表示session永久不过期，亦表示 redis 数据永久不被清除
    this._genSession(ctx);
    this.redis = new _RedisStore2.default(this.options.redis, this.options.sync);
    this.redis.setExpires(this.reNew ? -1 : this.expires, this._gsid()); // 同步redis 与 session 过期时间
    this._handleExpires();
  }

  _createClass(Session, [{
    key: '_gsid',
    value: function _gsid() {
      return this.sess.get(this.key);
    }
  }, {
    key: '_genSession',
    value: function _genSession(ctx) {
      this.sess = new _nomiCookie2.default(ctx, this.key);
      this._setCookie();
    }
  }, {
    key: '_setCookie',
    value: function _setCookie() {
      this.sess.set(this.key, (0, _util.gsid)(), (0, _util.pick)(this.options, ['httpOnly', 'overwrite', 'encrypt', 'maxAge'])); // Cookie: key => gsid
    }
  }, {
    key: '_handleExpires',
    value: function _handleExpires() {
      var _this = this;

      var expires = this.expires;
      var reNew = this.reNew;
      if (reNew) {
        this._timer = setInterval(function () {
          _this._setCookie();
        }, expires / 2);
      } else {
        this._timer = setTimeout(function () {
          _this.destroy();
        }, expires);
      }
    }

    // 获取 反序列化后的 session 对象

  }, {
    key: 'get',


    // 获取session 的 某一个 field
    value: function get(name) {
      var gsid = this._gsid(); // 获取 cookie 中 gsid , 即为 Redis 中 的hash 的 名字
      return this.redis.get(gsid, name); // 获取hash gsid 中 对应的 filed===name  的value
    }

    // 设置session的某一个field

  }, {
    key: 'set',
    value: function set(name, value, timer) {
      var _this2 = this;

      var gsid = this._gsid();
      this.redis.set(gsid, name, value);
      if (timer && timer > 0) {
        var tim = setTimeout(function () {
          _this2.delete(name);
          tim = null;
        }, timer);
      }
    }

    // 删除session 对象中某一个 字段

  }, {
    key: 'delete',
    value: function _delete(name) {
      var gsid = this._gsid();
      this.redis.delete(gsid, name);
    }

    // 销毁session对象

  }, {
    key: 'destroy',
    value: function destroy() {
      var gsid = this._gsid();
      this.redis.destory(gsid); // 销毁内存中的redis-session
      this.sess.get(this.key) && this.sess.set(this.key, null); // cookie会自动清除，如果存在 cookie 则手动清除
      this._timer = null;
    }

    // 设置当前ctx 上下文的session的过期时间

  }, {
    key: 'setExpires',
    value: function setExpires(time) {
      // time  -1 表示永久存储
      this.redis.setExpires(time, this._gsid());
    }
  }, {
    key: 'session',
    get: function get() {
      return this.redis.getHash(this._gsid());
    }
  }]);

  return Session;
}();

exports.default = Session;