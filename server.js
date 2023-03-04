const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares)

// Add custom routes before JSON Server router
server.get('/echo', (req, res) => {
  res.jsonp(req.query)
})

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser)
server.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (['POST'].includes(req.method)) {
      req.body.createdAt = Date.now()
    }
    else if (['PUT'].includes(req.method)) {
      req.body.updatedAt = Date.now()
    } if (new Date(req.body.publishDate).getTime() < new Date().getTime()) {
      return res.status(422).send({
        error: {
          publishDate: 'Không được published vào ngày nhỏ hơn ngày hiện tại'
        }
      })
    }
  }
  next()
})

//custom output for list with pagination
router.render= (req,res)=>{
  //check get with pagination
  const queryParam = res.getHeaders()
  const xTotalCount = queryParam['x-total-count']
  //if yes custom output ;
  if(req.method === 'GET' && xTotalCount){
    const convertString = Object.fromEntries(new URLSearchParams(req._parsedUrl.query))
    const result = {
      data : res.locals.data,
      pagination:{
        _limit: Number.parseInt(convertString._limit) ,
        _page : Number.parseInt(convertString._page),
        _totalRows: Number.parseInt(xTotalCount)
      }
    }
   return res.jsonp(result)
  }
  res.jsonp(res.locals.data)
}
// Use default router
server.use('/api',router)
// const POST= 
server.listen(4001, () => {
  console.log('JSON Server is running')
})