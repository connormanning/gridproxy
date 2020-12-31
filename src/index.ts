import { Agent } from 'https'
import Koa from 'koa'
import Router from '@koa/router'
import fetch, { RequestInit } from 'node-fetch'

const base = 'https://grid.nga.mil/grid/map'
const sessionid = 'rhs6fhajqj8201vsvswtsnw9z7tf3fcx'

const app = new Koa()
const router = new Router()

router.use(async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    ctx.status = ctx.response.status || 500
    ctx.body = { message: ctx.response.message || 'Unknown error' }
  }
})

app.use(async (ctx, next) => {
  ctx.response.set('Access-Control-Allow-Origin', '*')
  ctx.response.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  )
  ctx.response.set('Access-Control-Allow-Headers', '*')
  return next()
})

router.get('/ms', async (ctx) => {
  const { querystring } = ctx
  const response = await request(getUrl('ms', querystring))
  ctx.response.set('content-type', 'image/jpeg')
  ctx.body = await response.buffer()
})
router.get('/smartsearch', async (ctx) => {
  const { querystring } = ctx
  const response = await request(getUrl('smartsearch', querystring))
  ctx.body = await response.json()
})
router.get('/aois', async (ctx) => {
  const { querystring } = ctx
  const response = await request(getUrl('aoi_list', querystring))
  ctx.body = await response.json()
})
router.get('/aois/:id', async (ctx) => {
  const querystring = 'type=aoi'
  const { id } = ctx.params
  const response = await request(getUrl(`getshape/${id}`, querystring))
  ctx.body = await response.json()
})

app.use(router.allowedMethods())
app.use(router.routes())
;(async () => {
  await new Promise((resolve, reject) => {
    const server = app.listen(3002, () => resolve(server))
    app.on('error', reject)
  })
  console.log('Listening on', 3002)
})()

function getUrl(subpath: string, qs?: string) {
  const url = `${base}/${subpath}`
  return qs ? `${url}?${qs}` : url
}
async function request(url: string, data?: RequestInit) {
  console.log(url, data)
  const agent = new Agent({ rejectUnauthorized: false })
  return fetch(url, {
    agent,
    headers: { cookie: `sessionid=${sessionid}` },
    ...data,
  })
}
