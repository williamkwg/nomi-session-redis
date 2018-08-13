import Redis from 'koa-redis';
export default class RedisStore {
  constructor(opts) {
    this.options = opts;
    this.redis = new Redis(opts);
  }

  getHash() {

  }

  get() {

  }

  set() {

  }

  destory() {

  }

  remove() {
    
  }
}