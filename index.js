const express = require('express')
const consolidate = require('consolidate')
const handlebars = require('handlebars')
const app = express()

app.engine('html', consolidate.handlebars)
app.set('view engine', 'html')
app.set('views', __dirname + '/views')

app.use('/res', express.static(__dirname + '/views/res/'))

app.get('/', (req, res) => {
	res.render('index', {
		title: 'OvO'
	})
})

app.get('/test', (req, res) => {
	res.render('simple-content', {
		title: 'Working',
		body: 'Static content working as intended'
	})
})

app.listen(8080, () => console.log('Example app listening on port 8080!'))