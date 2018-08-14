const key = Symbol('NOMI_SESSION_REDIS');
export const defaultConfig = {
  key, // session 存放在cookie中的 key ，同时 使用该key 进行加密
  httpOnly: true,
  encrypt: true,
  maxAge: 60 * 60 * 1000 * 24, // 默认一天 有效期
  reNew: false, //  true 表示永远不过期
  redis: {
    port: '',
    host: '',
    keyPrefix: 'SESS:',
    path: '', // 存在path 以path为准 建立TCP
    db: 0,
    password: ''
  }
}
