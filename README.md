# nomi-schedule

the session plugin of Using redis store.

## Installation

``` bash
$ npm install nomi-session-redis --save
```

Node.js >= 8.0.0  required.

## API

- get
- set
- delete
- destory
- setExpires

## Usage

``` javascript

const SessionStore = require("nomi-session-redis");
const ctx = new Koa().ctx;
const sessionStore = new SessionStore(ctx);
sessionStore.set('username', 'weiguo.kong');
sessionStore.get('username');
sessionStore.delete('username');
sessionStore.destory();

```

``` javascript 

const SessionStore = require("nomi-session-redis");
const ctx = new Koa().ctx;
const s1 = new SessionStore(ctx, {
  path: '127.0.0.1:9999',
  sync: true
});
const s2 = new SessionStore(ctx, {
  redis: {
    port: 8080,
    host: 127.0.0.1,
    auth: '22'
  }
});

s1.set('username', 'weiguo.kong');
s1.get('username');
s2.delete('password');
s2.setExpires(10000000);
s2.destory();
```