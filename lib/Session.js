import Cookie from  'nomi-cookie';
import { defaultConfig } from './config';
import { gsid, pick } from './util';
import RedisStore from './RedisStore'; 

export default class Session {

  constructor(ctx, opts) {
    this.expires = opts.maxAge || defaultConfig.maxAge; // 过期时间
    this.options = { ...defaultConfig, ...opts, maxAge: this.expires };
    this.key = this.options.key;
    this.reNew = this.options.reNew; // 表示session永久不过期，亦表示 redis 数据永久不被清除
    this._genSession(ctx);
    this.redis = new RedisStore(this.options.redis);
    this.redis.setExpires(this.reNew ? -1 : this.expires, this._gsid()); // 同步redis 与 session 过期时间
    this._handleExpires();
  }

  _gsid() {
    return this.sess.get(this.key);
  }

  _genSession(ctx) {
    this.sess = new Cookie(ctx, this.key);
    this._setCookie();
  }

  _setCookie() {
    this.sess.set(this.key, gsid(), pick(this.options, ['httpOnly', 'overwrite', 'encrypt', 'maxAge'])); // Cookie: key => gsid
  }

  _handleExpires() {
    const expires = this.expires;
    const reNew = this.reNew;
    if (reNew) {
      this._timer = setInterval(() => {
        this._setCookie();
      }, expires / 2);
    } else {
      this._timer = setTimeout(() => {
        this.destroy();
      }, expires);
    }
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
  set(name, value, timer) {
    const gsid = this._gsid();
    this.redis.set(gsid, name, value);
    if (timer && timer > 0) {
      let tim = setTimeout(() => {
        this.delete(name);
        tim = null;
      }, timer)
    }
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
    this.sess.get(this.key) && this.sess.set(this.key, null); // cookie会自动清除，如果存在 cookie 则手动清除
    this._timer = null;
  }

  // 设置当前ctx 上下文的session的过期时间
  setExpires(time) {  // time  -1 表示永久存储
    this.redis.setExpires(time, this._gsid());
  }
}