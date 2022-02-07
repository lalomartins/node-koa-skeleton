import Koa from 'koa';
import Router from '@koa/router';
import mongo from 'koa-mongo';

// import {router as foo} from './foo.js';
export const app = new Koa();
app.use(mongo());
const router = new Router();

router.get('/health', async (ctx) => {
  ctx.body = 'Healthy';
});

// logger
app.use(async (ctx, next) => {
  try {
    await next();
  } catch(e) {
    console.error(`${ctx.method} ${ctx.url} - ${ctx.response.status}`);
    throw e;
  }
  console.log(`${ctx.method} ${ctx.url} - ${ctx.response.status}`);
});

router.get('/hello', async (ctx) => {
  ctx.body = 'Hello, World!';
});
// router.use('/v1', foo.routes(), foo.allowedMethods());

app.use(router.routes());
app.use(router.allowedMethods());
