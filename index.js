const express = require('express')
const consolidate = require('consolidate')
const handlebars = require('handlebars')
const app = express()
const mergeImages = require('merge-images')
const Canvas = require('canvas')
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const imageSize = require('image-size');
const upload = multer({
  dest: 'uploads'
});
const jimp = require("jimp");
const easyimage = require("easyimage");
//const converter = easyimage.convert;

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

let birbPaths = [
	'./res/birbify-imgur/honkatiel.png',
	'./res/birbify-imgur/blockatiel.png',
	'./res/birbify-imgur/cockatiel.png',
	//'./res/birbify-imgur/sam.png'
]

function getPathToRandomBirb() {
	return birbPaths[getRandomInt(3)];
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

//handle photo upload
app.post('/birbify', upload.single('file'),  (req, res) => {
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
	new Promise((resolve, reject) => {
		if (path.extname(req.file.originalname).toLowerCase() != ".png") {
			console.log('Converting image to PNG...');
			easyimage.execute(
					'convert',
					[
						req.file.path,
						req.file.path + '.png'
					]
				).then(() => {
					req.file.path = req.file.path + '.png'
					resolve();
				}, (error) => {
					reject(error);
				});
		} else {
			resolve();
		}
	}).then((data) => {			
		console.log('saved image to ' + req.file.path);
		
		birbImgPath = getPathToRandomBirb();
		console.log('getting random image: ' + birbImgPath);
		let imgDimension = imageSize(req.file.path);
		let layerDimension = imageSize(birbImgPath);
		
		let randomOrientation = getRandomInt(2);
		let layerX = 0;
		let layerY = 0;
		
		console.log('Img Dimension Height: ' + imgDimension.height);
		console.log('Img Dimension Width: ' + imgDimension.width);
		
		console.log('Layer Dimension Height: ' + layerDimension.height);
		console.log('Layer Dimension Width: ' + layerDimension.width);
		
		imgDimension.height = Number.parseInt(imgDimension.height);
		imgDimension.width = Number.parseInt(imgDimension.width);
		layerDimension.height = Number.parseInt(layerDimension.height);
		layerDimension.width = Number.parseInt(layerDimension.width);
		
		if(randomOrientation == 0) { // bottom left
			console.log('Orienting to bottom left');
			layerX = 0;
			if(imgDimension.height > layerDimension.height) {
				layerY = imgDimension.height - layerDimension.height;
			} else {
				layerY = 0;
			}
			console.log('Layer placement: ' + layerX + ', ' + layerY);
		} else if(randomOrientation == 1) { //bottom right
			console.log('Orienting to bottom right');
			layerX = imgDimension.width - layerDimension.width;
			if(imgDimension.height > layerDimension.height) {
				layerY = imgDimension.height - layerDimension.height;
			} else {
				layerY = 0;
			}
			console.log('Layer placement: ' + layerX + ', ' + layerY);
		}
		
		mergeImages([
			{ src: req.file.path, x: 0, y: 0 },
			{ src: birbImgPath, x:layerX, y:layerY },
		], {
			Canvas: Canvas,
			width: imgDimension.width,
			height: imgDimension.height
		})
		.then((birbifiedImg) => {
			console.log('did merge images');
			res.render('birbify/birbified', {
				title: '>v<',
				birbified_img: birbifiedImg
			});
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
})

app.get('/test', (req, res) => {
	res.render('simple-content', {
		title: 'Working',
		body: 'Static content working as intended'
	})
})

app.listen(process.env.PORT || 8443, () => console.log('Example app listening on port!' + (process.env.PORT||8443)))