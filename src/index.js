import Koa from 'koa';
import route from 'koa-route';

// import local stuff and set it up

export const app = new Koa();

app.use(
  route.get('/health', async (ctx) => {
    ctx.body = 'Healthy';
  }),
);

// logger
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    console.error(`${ctx.method} ${ctx.url} - ${ctx.response.status}`);
    throw e;
  }
  console.log(`${ctx.method} ${ctx.url} - ${ctx.response.status}`);
});

// Actual routes here (ideally import them)
app.use(
  route.get('/hello', async (ctx) => {
    ctx.body = 'Hello, World!';
  }),
);
