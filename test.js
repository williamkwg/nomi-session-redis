const R = require('ioredis');
const r = new R();
r.set('my', 'my');
r.set('ke', 'ke');
//r.bgrewriteaof();
//r.bgsave();