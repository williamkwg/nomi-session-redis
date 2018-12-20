'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodeRedis = require('node-redis');

var _nodeRedis2 = _interopRequireDefault(_nodeRedis);

var _config = require('./config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RedisStore = function () {
  function RedisStore(opts, sync) {
    _classCallCheck(this, RedisStore);

    this.options = opts || _config.defaultConfig.redis;
    this.sync = sync || _config.defaultConfig.sync;
    this.prefix = this.options.keyPrefix;
    this.redis = this._initInstance();
    this._initSync();
    this.expires = _config.defaultConfig.maxAge; // 默认redis 运行期 默认1天过期    -1表示永久不过期
    this.timer = null;
  }

  _createClass(RedisStore, [{
    key: '_initSync',
    value: function _initSync() {
      var _this = this;

      if (this.sync.timer && this.sync.timer > 0) {
        this.timer = setInterval(function () {
          _this._save();
        }, this.sync.timer);
      }
    }
  }, {
    key: '_save',
    value: function _save() {
      var model = this.sync.AOF ? 'AOF' : 'RDB';
      this.save(model);
    }
  }, {
    key: '_initInstance',
    value: function _initInstance() {
      var _options = this.options,
          path = _options.path,
          opt = _objectWithoutProperties(_options, ['path']);

      var options = _extends({}, opt, { reconnectOnError: function reconnectOnError(err) {
          var targetError = 'READONLY';
          if (err.message.slice(0, targetError.length) === targetError) {
            return true; // reconnect when the keys of redis is readonly; 
          }
        } });
      if (path) {
        try {
          return new _nodeRedis2.default(path);
        } catch (error) {
          return new _nodeRedis2.default(options);
        }
      }
      return new _nodeRedis2.default(options);
    }
  }, {
    key: '_updateExpires',
    value: function _updateExpires(hkey, expires) {
      expires = expires || this.expires;
      if (expires < 0) {
        try {
          this.redis.persist(hkey); // 永久存储
        } catch (error) {
          throw error;
        }
        return;
      }
      try {
        this.redis.pexpire(hkey, expires);
      } catch (error) {
        throw error;
      }
    }

    // redis 持久化 model:持久化模式  AOF-非阻塞的AOF  RDB-非阻塞的RDB (默认阻塞的RDB : save)

  }, {
    key: 'save',
    value: function save(model) {
      model = model || 'OTHER';
      this.redis[_config.SAVE[model]]();
    }

    // 设置redis运行期 过期时间

  }, {
    key: 'setExpires',
    value: function setExpires(expires, hkey) {
      this.expires = expires;
      this._updateExpires('' + this.prefix + hkey, expires);
    }

    // 获取 hkey 对象 

  }, {
    key: 'getHash',
    value: function getHash(hkey) {
      return this.redis.hgetall(hkey);
    }
  }, {
    key: 'get',
    value: function get(hkey, field) {
      return this.redis.hget('' + this.prefix + hkey, field);
    }
  }, {
    key: 'set',
    value: function set(hkey, field, value) {
      this.redis.hset('' + this.prefix + hkey, field, value);
      this._updateExpires('' + this.prefix + hkey);
      this.sync.update && this._save();
      return this;
    }

    // 销毁hkey session 

  }, {
    key: 'destory',
    value: function destory() {
      this.redis.del(hkey);
      this.redis = null;
      this.timer = null;
      return this;
    }

    // 移除 hkey 中某一个字段

  }, {
    key: 'delete',
    value: function _delete(hkey, field) {
      var del = this.redis.hdel(hkey, field);
      this.sync.update && this._save();
      return del;
    }
  }]);

  return RedisStore;
}();

exports.default = RedisStore;