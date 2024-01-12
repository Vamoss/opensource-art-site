function isElementInViewport (el) {
	const percentVisible = 50;
	var rect = el.getBoundingClientRect();
	var windowHeight = (window.innerHeight || document.documentElement.clientHeight);
	return !(
		Math.floor(100 - (((rect.top >= 0 ? 0 : rect.top) / +-rect.height) * 100)) < percentVisible ||
		Math.floor(100 - ((rect.bottom - windowHeight) / rect.height) * 100) < percentVisible
	)
}
function onVisibilityChange(el, callback) {
	var old_visible;
	return function (e) {
		var visible = isElementInViewport(el);
		if (visible != old_visible) {
			old_visible = visible;
			if (typeof callback == 'function') {
				callback(visible);
			}
		}
	}
}

function autoP5PlayWhenVisible(p5Script, el){
	var handler = onVisibilityChange(el, function(visible) {
		if(visible){
		p5Script.loop();
		}else{
		p5Script.noLoop();
		}
	});

	addEventListener('scroll', handler, false);
	addEventListener('resize', handler, false);
}


function startP5Script(script, el){
	if(window.p5){
		autoP5PlayWhenVisible(new p5(script), el)
	}else{
		document.getElementById("p5js").addEventListener('load', function() {
		autoP5PlayWhenVisible(new p5(script), el)
		});
	}
}


var s1 = p => {
	var colors;
	var triangles;
	var RADI;//radius

	//GUI
	var config = {
		logo		: true,
		logoY	  	: 5,
		intensity	: 0,
		velocity	: 0.2,
		animate		: true,
	}

	//LOGO
	var A = [[0,8],[0,7],[0,6],[0,5],[0,4],[0,3],[0,2],[0,1],[1,1],[1,0],[2,0],[2,1],[3,1],[3,2],[3,3],[3,4],[3,5],[3,6],[3,7],[3,8],[1,5],[1,4],[2,4],[2,5]];
	var B = [[0,9],[0,8],[0,7],[0,6],[0,5],[0,4],[0,3],[0,2],[0,1],[1,1],[1,2],[2,2],[2,3],[3,3],[3,4],[3,5],[2,5],[2,6],[2,7],[3,7],[3,8],[3,9],[2,9],[2,10],[1,10],[1,9]];
	var C = [[3,7],[2,7],[2,8],[1,8],[1,7],[0,7],[0,6],[0,5],[0,4],[0,3],[0,2],[0,1],[1,1],[1,0],[2,0],[2,1],[3,1]];
	var D = [[1,8],[1,7],[1,6],[1,5],[1,4],[1,3],[1,2],[1,1],[1,0],[2,0],[2,1],[3,1],[3,2],[4,2],[4,3],[4,4],[4,5],[4,6],[3,6],[3,7],[2,7],[2,8]];
	var E = [[3,7],[2,7],[2,8],[1,8],[1,7],[0,7],[0,6],[0,5],[0,4],[0,3],[0,2],[0,1],[1,1],[1,0],[2,0],[2,1],[3,1],[3,2],[3,3],[2,3],[2,4],[1,4],[1,5]];
	var G = [[2,4],[2,5],[3,5],[3,6],[3,7],[2,7],[2,8],[1,8],[1,7],[0,7],[0,6],[0,5],[0,4],[0,3],[0,2],[0,1],[1,1],[1,0],[2,0],[2,1],[3,1]];
	var I = [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8]];
	var O = [[3,7],[2,7],[2,8],[1,8],[1,7],[0,7],[0,6],[0,5],[0,4],[0,3],[0,2],[0,1],[1,1],[1,0],[2,0],[2,1],[3,1],[3,2],[3,3],[3,4],[3,5],[3,6]];
	var R = [[1,8],[1,7],[1,6],[1,5],[1,4],[1,3],[1,2],[1,1],[1,0],[2,0],[2,1],[3,1],[3,2],[4,2],[4,3],[4,4],[3,4],[3,5],[2,5],[2,6],[2,7],[3,7],[3,8],[4,8]];
	var T = [[1,1],[1,0],[2,0],[2,1],[3,1],[3,0],[4,0],[4,1],[5,1],[5,0],[3,2],[3,3],[3,4],[3,5],[3,6],[3,7],[3,8]];
	var Ó = O.slice();Ó.push([2, 0, 1]);

	var word = [[A, 0, 0], [R, 4, 0], [T, 8, 0], [E, 14, 0], [D, 20, 0], [E, 26, 0],
				[C, 0, 10], [Ó, 5, 9, 1], [D, 9, 9, 1], [I, 15, 9, 1], [G, 17, 9, 1], [O, 22, 10],
				[A, 0, 20], [B, 5, 19], [E, 10, 20], [R, 14, 20], [T, 18, 20], [O, 24, 20]];

	const WORD_WIDTH = 30;

	var totalWordTriangles;
	var triangleTween = [];
	var timeline;

	p.setup = function() {
		var canvas = document.getElementById("canvas1");
		p.createCanvas(p.windowWidth, p.windowHeight * 0.7 + 180, p.P2D, canvas);
		RADI = p.width/(WORD_WIDTH+4)*(2/3);//WIDTH / WORD_WIDTH + BORDER[4]) * (2/3)
		RADI = p.min(RADI, 20);
		config.logoY = p.floor(p.height/2/RADI/4) - 3;

		p.noiseDetail(2);
		p.pixelDensity(1);
		p.strokeCap(p.ROUND);
		p.drawingContext.lineJoin = "round";
		
		colors = "900C3F-C70039-E32C36-FF5733-DCA80D-1AC7C4".split("-").map(hex => p.color("#"+hex));
		
		//animations
		timeline = anime.timeline();	
		
		//animate word
		totalWordTriangles = word.reduce((currentCount, letter) => currentCount + letter[0].length, 0);
		for(var i = 0; i < totalWordTriangles; i++){
			triangleTween.push({size: 0});
		}
		timeline.add({
			targets: triangleTween,
			size: 1,
			easing: 'spring(1, 80, 10, 0)',
			delay: anime.stagger(100, {grid: [totalWordTriangles/3, 6], from: 'center', easing: 'cubicBezier(0.000, 0.345, 1.000, 0.690)'})
		});
		
		// animate bg
		timeline.add({
			targets: config,
			intensity: 600,
			easing: 'easeInOutQuad',
			duration: 6000
		}, '-='+1500);

		reset();
	}

	p.draw = function() {
		p.background(255);
		
		timeline.seek(p.frameCount / 30 * 1000);
		
		//BG
		if(config.animate){
			var time = p.frameCount/100 * config.velocity;
			triangles.forEach((t, index, arr) => {
				var n = p.noise(t.x/100, t.y/100+time, time/10);
				var size = RADI + p.pow((p.pow(n, 5)) * RADI, 2) * config.intensity + 0.6;
				arr[index] = customTriangle(t.x, t.y, size, t.startAngle, t.startNoise, t.color);
			});
		}
		
		p.noStroke();
		triangles.forEach((t, index) => {
			p.fill(t.color);
			p.beginShape();
			p.vertex(t.coords[0].x, t.coords[0].y);
			p.vertex(t.coords[1].x, t.coords[1].y);
			p.vertex(t.coords[2].x, t.coords[2].y);
			p.endShape(p.CLOSE);
		});
		
		// stroke(255);
		// line(0, mouseY, RADI + altitude/2, mouseY);
		
		//LOGO
		if(config.logo){
			const altitude = Math.sqrt(3)/2 * RADI;
			p.strokeWeight(1);
			
			var letterX = p.floor(p.floor(p.width/RADI*(2/3))/2 - (WORD_WIDTH+4)/2)
			if(letterX%2==1) letterX++;
			var letterCount = 0;
			word.forEach(letter => {
				letter[0].forEach(t => {
				if(triangleTween[letterCount].size > 0){
					var c = getCoord(t[0]+letter[1] + letterX, t[1]+letter[2], RADI);
					var col = p.color(255);
					if(t[2]==1){
					col = p.color("#1AC7C4");
					}
					var x = c.x + (t[2]==1 ? RADI : 0);
					x += altitude/2 + RADI + 1;

					var y = c.y + (letter[3]==1 ? altitude : 0);
					y += altitude*config.logoY*2;

					var s = triangleTween[letterCount].size;
					var tri = customTriangle(x, y, RADI * s, c.angle, 0, col);
					p.fill(tri.color);
					p.stroke(tri.color);
					p.beginShape();
					p.vertex(tri.coords[0].x, tri.coords[0].y);
					p.vertex(tri.coords[1].x, tri.coords[1].y);
					p.vertex(tri.coords[2].x, tri.coords[2].y);
					p.endShape(p.CLOSE);
				}
				letterCount++;
				});
			});
		}
	}

	function getCoord(indexX, indexY, radius){
		const altitude = Math.sqrt(3)/2 * radius;
		var countX = indexY%2+indexX;
		var x = indexY%2==1
			? radius/2 + countX%2*radius/2 + radius*indexX + radius*p.floor(indexX/2) + (countX+1)%2*radius/2
			: countX%2*radius/2 + radius*indexX + radius*p.floor(indexX/2) + (countX+1)%2*radius/2 + countX%2*radius;
		var y = indexY * altitude + altitude;
		var angle = countX%2*p.PI;
		return {x, y, angle};
	}

	function customTriangle(x, y, size, startAngle, startNoise, color){
		var coords = [];
		for(var a = 0; a < p.TWO_PI; a += p.TWO_PI/3){
			var xx = p.sin(a + startAngle + p.HALF_PI) * size + x;
			var yy = p.cos(a + startAngle + p.HALF_PI) * size + y;
			coords.push({x: xx, y: yy});
		}
		return {coords, x, y, size, startAngle, startNoise, color};
	}

	function reset(){
		p.frameCount = 0;
		triangles = [];
		triangleTween.forEach(c => c.size = 0);
		const altitude = Math.sqrt(3)/2 * RADI;
		var countY = 0;
		for(var y = 0; y < p.height+RADI+300; y += altitude){
			var countX = countY%2;
			for(var x = RADI/2 + countX%2*RADI/2; x < p.width; x += RADI+countX%2*RADI){
				var startNoise = p.random(100);
				triangles.push(customTriangle(x, y, RADI+0.6, countX%2*p.PI, startNoise, p.random(colors)));
				countX++;
			}
			countY++;
		}
	}
}

startP5Script(s1, document.getElementById("canvas1"));