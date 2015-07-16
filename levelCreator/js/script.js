﻿$(function(){
	var coord=[];
	var coord2=[];
	var coord3=[];
	var coord4=[];
	var choose=0;
	var gCanvasElement = document.getElementById("b");
	 var context = gCanvasElement.getContext("2d");
		var x;
		var y;
		var xx;
		var yy;
		var mass;

	function drawCell(mass,color,width,height){
		for(i=0;i<mass.length;i++){
			context.fillStyle = color;
			context.fillRect(mass[i][0],mass[i][1],width,height);

		}
	}

	function draw_b() {
		drawCell(coord,"#cccccc",40,40);
		drawCell(coord2,"#ff0000",10,10);
		drawCell(coord3,"#0000ff",10,10);
		drawCell(coord4,"#ff00ff",10,10);
		context.moveTo(0.5,0.5);
		context.lineTo(1000.5,0.5);
		context.lineTo(1000.5,600.5);
		context.lineTo(0.5,600.5);
		context.lineTo(0.5,0.5);
		var x=0.5;
		var y=0.5;
		for(i=0;i<60;i++){
		y+=10;
		context.moveTo(0.5,y);
		context.lineTo(1000.5,y);
		}
		for(i=0;i<100;i++){
		x+=10;
		context.moveTo(x,0.5);
		context.lineTo(x,600.5);
		}

		context.strokeStyle="#cccccc";
		context.stroke();
		context.strokeStyle = "#00ff00";
		context.strokeRect(650,660,10,10);
		context.strokeStyle = "#ff0000";
		context.strokeRect(660,660,10,10);
		context.strokeStyle = "#0000ff";
		context.strokeRect(670,660,10,10);
		context.strokeStyle = "#ff00ff";
		context.strokeRect(680,660,10,10);
	}

	gCanvasElement.addEventListener("click", halmaOnClick, false);
	gCanvasElement.addEventListener("mousemove", halmaOnHover, false);

	function setCanvasCoords(e) {
		if (e.pageX != undefined && e.pageY != undefined) {
			x = e.pageX;
			y = e.pageY;
		}
		else {
			x = e.clientX + document.body.scrollLeft +
			document.documentElement.scrollLeft;
			y = e.clientY + document.body.scrollTop +
			document.documentElement.scrollTop;
		}
		x -= gCanvasElement.offsetLeft;
		y -= gCanvasElement.offsetTop;
		//console.log(x+','+y);
	}

	function halmaOnClick(e) {
		setCanvasCoords(e);
		positionCheck();

	}

	function halmaOnHover(e) {
		setCanvasCoords(e);
		xx = Math.floor(x/10)*10;
		yy = Math.floor(y/10)*10;
		gCanvasElement.width = gCanvasElement.width;
		draw_b();
		if(xx<=990&&yy<=590){
			switch(choose){
				case 1:
					context.strokeStyle = "#00ff00";
					context.strokeRect(xx,yy,40,40);
					break;
				case 2:
					context.strokeStyle = "#ff0000";
					context.strokeRect(xx,yy,10,10);
					break;
				case 3:
					context.strokeStyle = "#0000ff";
					context.strokeRect(xx,yy,10,10);
					break;
				case 4:
					context.strokeStyle = "#ff00ff";
					context.strokeRect(xx,yy,10,10);
					break;
			}
		}

	}

	function addToMass(mass){

		if(xx<=1000&&yy<=600){

		mass.push([xx,yy]);
		console.log(xx+','+yy);
			console.log(mass);
			for(i=0;i<mass.length-1;i++){
				if(mass[i][0]==xx&&mass[i][1]==yy){
					mass.splice(i,1);
					mass.splice(mass.length-1,1);
				}
			}

		}
	}

	function positionCheck(){
		xx = Math.floor(x/10)*10;
		yy = Math.floor(y/10)*10;
		if(xx==650&&yy==660){
			choose=1;
		}else if(xx==660&&yy==660){
			choose=2;
		}else if(xx==670&&yy==660){
			choose=3;
		}else if(xx==680&&yy==660){
			choose=4;
		}else{

			switch(choose){
				case 1:
					addToMass(coord);
					break;
				case 2:
					addToMass(coord2);
					break;
				case 3:
					addToMass(coord3);
					break;
				case 4:
					addToMass(coord4);
					break;
			}
		}
			gCanvasElement.width = gCanvasElement.width;
			draw_b();
			showCoord(coord,'.wall');
			showCoord(coord2,'.bomb');
			showCoord(coord3,'.gold');
			showCoord(coord4,'.energy');

	}

	$('#container').append('<div class="wall"></div>');
	$('#container').append('<div class="bomb"></div>');
	$('#container').append('<div class="gold"></div>');
	$('#container').append('<div class="energy"></div>');

	function showCoord(mass,obj){
		mas='';
		for(i=0;i<mass.length;i++){
			mas+='['+mass[i]+'],'
		}
		mas='['+mas.substring(0,mas.length-1)+']';
			$(obj).text(mas);
	}

	draw_b();

});
