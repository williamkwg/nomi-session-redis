import Redis from 'node-redis';
import { defaultConfig } from './config';
export default class RedisStore {
  constructor(opts) {
    this.options = opts || defaultConfig.redis;
    this.prefix = this.options.keyPrefix;
    this.redis = this._initInstance();
    this.expires = defaultConfig.maxAge; // 默认redis 运行期 默认1天过期    -1表示永久不过期
  }

  _initInstance() {
    const { path, ...opt } = this.options;
    if (path) {
      try {
        return new Redis(path);
      } catch (error) {
        return new Redis(opt);
      }
    }
    return new Redis(opt);
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
    return this;
  }

  // 销毁hkey session 
  destory() {
    this.redis.del(hkey);
    this.redis = null;
    return this;
  }

  // 移除 hkey 中某一个字段
  delete(hkey, field) {
    return this.redis.hdel(hkey, field);
  }
}