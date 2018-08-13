import Cookie from  'nomi-cookie';
import { defaultConfig } from './config';
import { gsid, pick } from './util';
import RedisStore from './RedisStore'; 

export default class Session {

  constructor(ctx, opts) {
    this.options = { ...opts, ...defaultConfig };
    this.key = this.options.key;
    this.cookie = new Cookie(ctx, this.key);
    this.cookie.set(this.key, gsid(), pick(this.options, ['httpOnly', 'overwrite', 'encrypt'])); // Cookie: key => gsid
    this.redis = new RedisStore(this.options.redis);
  }

  _gsid() {
    return this.cookie.get(this.key);
  }

  // 获取 反序列化后的 session 对象
  get session() {
    return this.redis.getHash(this._gsid());
  }

  // 获取session 的 某一个 field
  get(name) {
    const gsid = this._gsid(); // 获取 cookie 中 gsid , 即为 Redis 中 的hash 的 名字
    return this.redis.get(gsid, name); // 获取hash gsid 中 对应的 filed===name  的value
  }

  // 设置session的某一个field
  set(name, value, opt) {
    const gsid = this._gsid();
    this.redis.set(gsid, name, value, opt);
  }

  // 删除session 对象中某一个 字段
  delete(name) {
    const gsid = this._gsid();
    this.redis.delete(gsid, name);
  }

  // 销毁session对象
  destroy() {
    const gsid = this._gsid();
    this.redis.destory(gsid); // 销毁内存中的redis-session
    this.cookie.set(this.key, null);
  }
}