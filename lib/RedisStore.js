import Redis from 'node-redis';
import { defaultConfig, SAVE } from './config';

export default class RedisStore {
  constructor(opts, sync) {
    this.options = opts || defaultConfig.redis;
    this.sync = sync || defaultConfig.sync;
    this.prefix = this.options.keyPrefix;
    this.redis = this._initInstance();
    this._initSync();
    this.expires = defaultConfig.maxAge; // 默认redis 运行期 默认1天过期    -1表示永久不过期
    this.timer = null;
  }

  _initSync() {
    if (this.sync.timer && this.sync.timer > 0) {
      this.timer = setInterval(() => {
        this._save();
      }, this.sync.timer);
    }
  }

  _save() {
    const model = this.sync.AOF ? 'AOF' : 'RDB';
    this.save(model);
  }

  _initInstance() {
    let { path, ...opt } = this.options;
    const options = {...opt, reconnectOnError:  err => {
      const targetError = 'READONLY';
      if (err.message.slice(0, targetError.length) === targetError) {
        return true; // reconnect when the keys of redis is readonly; 
      }
    }};
    if (path) {
      try {
        return new Redis(path);
      } catch (error) {
        return new Redis(options);
      }
    }
    return new Redis(options);
  }

  _updateExpires(hkey, expires) {
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
  save(model) {
    model = model || 'OTHER';
    this.redis[SAVE[model]]();
  }

  // 设置redis运行期 过期时间
  setExpires(expires, hkey) {
    this.expires = expires;
    this._updateExpires(`${this.prefix}${hkey}`, expires);
  }

  // 获取 hkey 对象 
  getHash(hkey) {
    return this.redis.hgetall(hkey);
  }

  get(hkey, field) {
    return this.redis.hget(`${this.prefix}${hkey}`, field);
  }

  set(hkey, field, value) {
    this.redis.hset(`${this.prefix}${hkey}`, field, value);
    this._updateExpires(`${this.prefix}${hkey}`);
    this.sync.update && this._save();
    return this;
  }

  // 销毁hkey session 
  destory() {
    this.redis.del(hkey);
    this.redis = null;
    this.timer = null;
    return this;
  }

  // 移除 hkey 中某一个字段
  delete(hkey, field) {
    const del =  this.redis.hdel(hkey, field);
    this.sync.update && this._save();
    return del;
  }
}