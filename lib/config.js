const key = Symbol('NOMI_SESSION_REDIS');
export const defaultConfig = {
  key,
  httpOnly: true,
  encrypt: true,
  maxAge: 60 * 60 * 1000 * 24, // 默认一天 有效期
  reNew: false, //  true 表示永远不过期
  redis: {
    port: '',
    path: '',
    
  }
}