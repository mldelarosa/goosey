const express = require('express')
const consolidate = require('consolidate')
const handlebars = require('handlebars')
const app = express()
const mergeImages = require('merge-images')
const Canvas = require('canvas')
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const upload = multer({
  dest: 'uploads'
});
const jimp = require("jimp");
const easyimage = require("easyimage");
const converter = easyimage.convert;

app.engine('html', consolidate.handlebars)
app.set('view engine', 'html')
app.set('views', __dirname + '/views')

app.use('/res', express.static(__dirname + '/views/res/'))

app.get('/', (req, res) => {
	res.render('index', {
		title: 'OvO'
	})
})

app.get('/birbify', (req, res) => {
	res.render('birbify/index', {
		title: 'OvO'
	})
})

function birbifyImg() {
	
}

//handle photo upload
app.post('/birbify', upload.single('file'),  (req, res) => {
	
	//upload.single('file')(req, res, (err) => {
	//});
	
	console.log('Birbifying your image')
	if(req.file == null) {
		console.log('posted file is null')
		res.render('error', {
			title: 'ovo;;',
			error_description:'No file selected'
		})
		return
	}
	
	const tempPath = req.file.path;// + path.extname(req.file.originalname);
	
	console.log('Uploaded temp to: ' + tempPath);
	//console.log('Received image of format: ' + path.extname(req.file.originalname).toLowerCase());
	if (path.extname(req.file.originalname).toLowerCase() != ".png") {
		new Promise((resolve, reject) => {
			console.log('Converting image to PNG...');
			converter({
				src: req.file.path,
				dst: req.file.path + '.png'
			}, (err, stdout) => {
				console.log('Converted image to PNG...');
				req.file.path = req.file.path + '.png'
				resolve(req.file.path)
			});
		}).then((data) => {			
			console.log('saved image to ' + req.file.path)
			mergeImages([req.file.path, './views/res/eyes.png', './views/res/mouth.png'], {
				Canvas: Canvas
			})
			.then((birbifiedImg) => {
				res.render('birbify/birbified', {
					title: '>v<',
					birbified_img: birbifiedImg
				})
			}, (error) => {
				console.log(error)
				res.render('error', {
					title: 'ovo;;',
					error_description: 'Hmmmm... had trouble birbifying your image'
				})
			})
		}).catch( (e) => {
			console.log("Error: ", e);
		});
	} else {
		console.log('saved image to ' + req.file.path)
		mergeImages([req.file.path, './views/res/eyes.png', './views/res/mouth.png'], {
			Canvas: Canvas
		})
		.then((birbifiedImg) => {
			res.render('birbify/birbified', {
				title: '>v<',
				birbified_img: birbifiedImg
			})
		}, (error) => {
			console.log(error)
			res.render('error', {
				title: 'ovo;;',
				error_description: 'Hmmmm... had trouble birbifying your image'
			})
		})
	}
})

app.get('/test', (req, res) => {
	res.render('simple-content', {
		title: 'Working',
		body: 'Static content working as intended'
	})
})

app.listen(process.env.PORT || 8443, () => console.log('Example app listening on port!' + (process.env.PORT||8443)))