const key = Symbol('NOMI_SESSION_REDIS');
export const defaultConfig = {
  key, // session 存放在cookie中的 key ，同时 使用该key 进行加密
  httpOnly: true,
  encrypt: true, // 对cookie进行加密，不对redis的 k-v进行加密
  maxAge: 1000 * 60 * 60 * 24, // 默认一天 有效期
  reNew: false, //  true 表示永远不过期
  redis: {
    port: '6379',
    host: '127.0.0.1',
    keyPrefix: 'SESS:',
    path: '', // 存在path 以path为准 建立TCP
    db: 0,
    password: ''
  },
  sync: {
    timer:  -1, // -1 默认使用系统 内置的 RDB模式，持久化机制由redis服务器配置决定    number : 每隔 number seconds 持久化一次
    AOF: false,
    update: true // 每次数据更新的时候立刻持久化数据
  }
}

export const SAVE = {
  AOF: 'bgrewriteaof',
  RDB: 'bgsave',
  OTHER: 'save'
}
