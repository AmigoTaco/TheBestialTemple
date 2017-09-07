window.onload = function () {
	
	document.oncontextmenu = function(a) {
        a.preventDefault()
    };
	var gameArea_width = 800, 
	gameArea_height = 602;
	
	//Images
	var img_crs = new Image();
	img_crs.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAOCAYAAAAWo42rAAAAYElEQVQoU2NkQAJ1VVX/m9raGJHFYGy4IEhRY2srQ311NQM2xQOtEOQ+kKNhbkT3DMjNjMiegClEp0Ea4QqxBQlMDBQSNFAIMh7mTlzWg62GScJ8jk0x2NckmYjPNJgNACXBVybPjlGRAAAAAElFTkSuQmCC';
	var cursor = [0,0,15,15,img_crs];
	
	var img_floor = new Image();
		img_floor.src  ="floor.png";
	var img_playerM = new Image();
		img_playerM.src  ="player.png";
	var img_playerF = new Image();
		img_playerF.src  ="player1.png";
	var img_hoof= new Image();
		img_hoof.src = "footprint.png";
	var img_stone= new Image();
		img_stone.src = "table.png";
	var img_skull= new Image();
		img_skull.src = "skull.png";
	
	var wall = [[2,3,3,5,5,6,2],[0,1,8,8,1,0,0]];
	
	
	//Object of player
	var player = {x:400,y:300,w:gameArea_width/17,h:gameArea_height/12,ff:2,f:2,i:"",mx:0,my:0}
	var path = {x:0,y:0}
	
	///////////////////////////////////////////////////////////////////
	var canvas = document.getElementById('c');
	var ctx = canvas.getContext('2d');
	
	var lsDoors = [];		//Array of doors actives for that room
	var map = [];			//Map on the grid
	var mapN = [];			//Room number in the map
	var i, j;				//Position of the current room on te map array
	var actRoom = 0;		//Number of the current Room
	var nRooms = 100;		//Number of Rooms
	var lsRooms = [];		//List of rooms, position x y on the map 
	var lsExtra = [];		//List of objects extra on each room
	var gameStatus = 0; 	//0: Main Menu 1:Game	
	var frameCount = 0;
	var timer = 0;
	var countDownS = 90;
	var countDown = countDownS;
	var shareTxt = "";
	var endTxt ="";
	var finalRoomCount = 0;

	var doors = [{s:true, x: gameArea_width/8*3,y:0,w:gameArea_width/8*2,h:gameArea_height/7,i:0,j:-1,rx:gameArea_width/8*4, ry:gameArea_height/7*6-player.h-20},
				{s:true, x: gameArea_width/8*3,y:gameArea_height/7*6,w:gameArea_width/8*2,h:gameArea_height/7,i:0,j:1,rx:gameArea_width/8*4, ry:gameArea_height/7+20},
				{s:true, x: 0,y:gameArea_height/7*3,w:gameArea_width/8,h:gameArea_height/7,i:-1,j:0,rx:gameArea_width/7*6-20, ry:gameArea_height/7*3},
				{s:true, x: gameArea_width/8*7,y:gameArea_height/7*3,w:gameArea_width/8,h:gameArea_height/7,i:1,j:0,rx:gameArea_width/7+20, ry:gameArea_height/7*3}]
	

	
	//List of clickables text (buttons, options)
	var btn = [];
	//                   16*5
	var start = [360,300,80,20, "Start",function () 
	{
		newMap();
		countDownS = finalRoomCount * 3;
		countDown = countDownS;
		start[6] = "f";
		gameStatus=1;
		i=10;
		j=4;
		start[4] = "Play Again";
		start[0] = 330;
		start[9] = "#FFFFFF";
		start[12] = "#FFFFFF";
		start[2] = 160;
		btn[1][6] = btn[2][6]= "f";
	}, "t","","","#000000","#AA2255","","#000000"];
	//  6   7  8  9          10      11 12
	btn.push(start);
	
	var twit = [200,450,112,20, "Twitter",function () 
	{
		window.open("https://twitter.com/home?status=" + encodeURIComponent(shareTxt + "http://js13kgames.com/entries/the-bestial-temple"));
	}, "f","","","#FFFFFF","#22AA55","","#FFFFFF"];
	btn.push(twit);
	
	var face = [480,450,112,20, "Facebook",function () 
	{
		window.open("https://www.facebook.com/sharer/sharer.php?u=" + (encodeURIComponent("http://js13kgames.com/entries/the-bestial-temple") + "&description=" + encodeURIComponent(shareTxt)));
	}, "f","","","#FFFFFF","#22AA55","","#FFFFFF"];
	btn.push(face);
	
	
	//Main loop of the game
	var tick;
	var tick2;
	setInterval(function(){
		if (tick === undefined) tick = new Date();
		if (tick2 === undefined) tick2 = new Date();
		//Execute the draw function 60 times per second
		if ((new Date()).getTime() >= tick.getTime() + (1000/60))
		{
			draw();
			tick = new Date();
		} 
		if ((new Date()).getTime() >= tick2.getTime() + 1000)
		{
			timer++;
			if (gameStatus == 1) {
				countDown--;
			}
			tick2 = new Date();
		} 
		//Execute the logic function every 10 miliseconds
		logic();
	}, 10);
	
	//Function to iterate all buttons
	function iterateBtn (fn) {
		for (var i = 0; i < btn.length; i++){
			if (btn[i][6] == "t"){
				fn(btn[i]);
			}
		}
	}
	
	//Function to detect changes on the position of the cursor
	canvas.onmousemove = function (e) {
		//Change the values x y of the cursor
		cursor[0] = e.offsetX ;
		cursor[1] = e.offsetY ;
		
		//Iterate the buttons to apply hover animation
		iterateBtn(function (btn) {
			if (e.offsetX > btn[0] && e.offsetX < btn[0] + btn[2] && e.offsetY > btn[1] && e.offsetY < btn[1] + btn[3]){
				btn[9] = btn[10];
				btn[7] = btn[8];

			} else {
				btn[9] = btn[12];
				btn[7] = btn[11];

			}
		});
	}
	
	//Function to detect the click on the canvas
	canvas.onmousedown = function (e) {

		var E = {X:e.offsetX,Y:e.offsetY}
		//console.log(e.offsetX + " " +e.offsetY);
		
		//Iterate the buttons and if clicked execute the function
		iterateBtn(function (btn) {
			if (E.X > btn[0] && E.X < btn[0] + btn[2] && E.Y > btn[1] && E.Y < btn[1] + btn[3])
			btn[5]();
		});7
		
		var gtd = false;
		if (gameStatus ==1)
		for (q=0; q < 4; q++){
			qq=lsDoors[mapN[i][j]][q];
			
			
			if (qq.s)
			if (E.X>qq.x && E.Y > qq.y)
			if (E.X< (qq.x + qq.w) && E.Y < (qq.y +qq.h)) gtd = true;
		}
		
		if (E.X>gameArea_width/8 && E.Y > gameArea_height/7 || gtd)
		if (E.X<gameArea_width/8*7 && E.Y < gameArea_height/7*6 || gtd){
			//Update the movement of the player
			player.mx = Math.floor((path.x=E.X) - (player.x + player.w/2));
			player.my = Math.floor((path.y=E.Y) - (player.y + player.h));
		}
		

	}
	

	
	//Function that execute the logic of the game
	function logic (){
		
		if (gameStatus == 1) {
			//Dar margen para terminar el movimiento, evita que sea pixel perfect
			if (path.x-5<player.x + player.w/2 && player.x + player.w/2 <path.x+5) player.mx = 0;
			if (path.y-5<player.y + player.h && player.y + player.h <path.y+5) player.my = 0;
			
			//Ejecuta el cambio en x y del personaje
			if (player.mx<0) player.x-=1.5; else if (player.mx>0) player.x+=1.5;
			if (player.my<0) player.y-=1.5; else if (player.my>0) player.y+=1.5;
			
			for (q=0; q < 4; q++){
				qq=lsDoors[mapN[i][j]][q];
				E= {X: player.x + player.w/2, Y:player.y + player.h};
				if (E.X>qq.x && E.Y > qq.y)
				if (E.X< (qq.x + qq.w) && E.Y < (qq.y +qq.h)) {
					i+=qq.i;
					j+=qq.j;
					player.mx= player.my =0;
					
					//TODO
					player.x=qq.rx;
					player.y=qq.ry;
				}
			}
			
			if (countDown <=0) {
				gameStatus = 3; start[6]="t";
				shareTxt  = "Try to beat this labyrinth. I got lost on the room "+mapN[i][j]+". ";
				btn[1][6] = btn[2][6]= "t";
			}
			
			if (mapN[i][j]==nRooms-1) {
				gameStatus = 2; start[6]="t";
				shareTxt  = "I clear the labyrinth with " + countDown +" seconds remaining! ";
				btn[1][6] = btn[2][6]= "t";
				if (Math.floor(Math.random() * 100)<=10) endTxt = "You went back to the ship, reunited with the demigod and went back to home.";
				else endTxt = "You can go back to your family and continue your life young one.";

			} 
			
			if ((player.mx!=0||player.my!=0)&&frameCount>=5){
				if(player.f==1) player.f=0; else player.f=1; frameCount=0}
			if (player.mx==0&&player.my==0) player.f=2;
		}
		

	}	
		
	function draw(){
		frameCount++;
		ctx.fillStyle = "#101010";
		ctx.fillRect(0, 0, gameArea_width, gameArea_height);
		

		
		if (gameStatus==0){

			for (q = 0;q<15;q++)
			for (qq = 0; qq<15;qq++)
			drawSquare(q*gameArea_width/15,qq*gameArea_height/15,gameArea_width/15,gameArea_height/15,3,"#aa9a5a","#9a8a4a",0.25,0.45);

			drawPillar(0,0,"l");
			drawPillar(1,0,"l")
			drawPillar(2,0,"l")
			drawPillar(3,0,"l")
			
			ctx.fillStyle = "#FFFFFF";
			ctx.font = "60px Monospace";
			ctx.fillText("The bestial temple",110,100);
			ctx.font = "25px Monospace";
			ctx.fillStyle = "#000000";
			ctx.fillText("Use the mouse to move the tribute on the maze, you must ",10,410);
			ctx.fillText("find an exit to escape. Pay attention to the environment ",10,430);
			ctx.fillText("to recongise areas you already visited.",10,450);
			ctx.fillText("Check out the time limit on the upper right.",10,470);
		}
		if (gameStatus==1) {
			for (q = 0;q<30;q++)
			for (qq = 0; qq<30;qq++)
			ctx.drawImage(img_floor,q*gameArea_width/30,qq*gameArea_height/30,gameArea_width/30,gameArea_height/30);
			
			
			qq = lsDoors[mapN[i][j]];
			
			for(q=0;q<8;q++){
				if ((q!=3&&q!=4)||!qq[0].s) drawPillar(q,0);
				if ((q!=3&&q!=4)||!qq[1].s) drawSquare(q*gameArea_width/8,gameArea_height/7*6,gameArea_width/8,gameArea_height/7,3,"#aa9a5a","#9a8a4a",0.25,0.45);
			}
			for(q=6;q>=0;q--){
				if (q!=3||!qq[2].s) drawSquare(0,gameArea_height/7*q,gameArea_width/8,gameArea_height/7,3,"#aa9a5a","#9a8a4a",0.3,0.45);
				if (q==2&&qq[2].s) drawPillar(0,q)
				if (q!=3||!qq[3].s) drawSquare(gameArea_width/8*7,gameArea_height/7*q,gameArea_width/8,gameArea_height/7,3,"#aa9a5a","#9a8a4a",0.2,0.45);
				if (q==2&&qq[3].s) drawPillar(7,q)
			}

			
			for (q = 0; q<3;q++){
				if (lsExtra[mapN[i][j]][q][0]!=0){
					a=lsExtra[mapN[i][j]][q];
					img = new Image();
					switch (a[2]) {
						case 1: img = img_hoof; break;
						case 2: img = img_skull; break;
						case 3: img = img_stone; break;
					}
					ctx.drawImage(img, gameArea_width/8*a[1],gameArea_height/7*a[2], 30, 30);
				}
			}
			
			ctx.drawImage(player.i,15*player.f,0,15,20,player.x,player.y,player.w,player.h);
			
			ctx.fillStyle = "#ffc3a0";
			ctx.fillRect(gameArea_width/8*7, 0,  gameArea_width/8*2,  30);
			
			ctx.fillStyle = "#222222";
			ctx.font = "20px Monospace";
			ctx.fillText(countDown +" sec.",gameArea_width/20*18, 20);
		}
		
		if (gameStatus > 1){
			ctx.fillStyle = "#DDDDDD";
			ctx.font = "30px Monospace";
			ctx.fillText("Share it",gameArea_width/40*17, 420);
			ctx.font = "20px Monospace";
			
			if (gameStatus == 2){

				ctx.fillText("You managed to escape... and better than that... Survive!",gameArea_width/20*2, 150);
				ctx.fillText(endTxt,gameArea_width/20*1, 200);
			}
			
			if (gameStatus == 3){
				ctx.fillText("You got caugth...",gameArea_width/20*8, 150);
				ctx.fillText('"I..am...c.ounting on you .. Te..."',gameArea_width/4, 200);
			}
		}
		
		iterateBtn(function (btn) {
			if (btn[7] != ""){
				ctx.fillStyle = btn[7];
				ctx.fillRect(btn[0], btn[1],  btn[2],  btn[3]);
			}
			ctx.fillStyle = btn[9];
			ctx.font = "30px Monospace";
			ctx.fillText(btn[4],btn[0],btn[1]+20);
		});
		
		ctx.drawImage(cursor[4],cursor[0],cursor[1],cursor[2],cursor[3]);
	}
	
function drawSquare(x,y,w,h,l,s,f,a,p){
	ctx.beginPath();
	ctx.lineWidth=l;
	ctx.strokeStyle=s;
	ctx.fillStyle = f;
	ctx.fillRect(x,y,w,h);
	ctx.rect(x,y,w,h); 
	if (s) ctx.stroke();	
	
	ctx.globalAlpha = a;
	if (p) ctx.drawImage(img_floor,1-p,0,img_floor.width*p,img_floor.height*p,x,y,w,h);
	ctx.globalAlpha = 1.0;	
}

function drawPillar(x,y,l){
	var t =gameArea_width/8, u =gameArea_height/7;
	if (l) {t=gameArea_width/4;u =gameArea_height/3.5;}
	drawSquare(x*t,y*u,t,u,"6","#bfaf6f","#bfaf6f",0.3,1);		
	
	drawLine(2,4,"#aaaaaa",x,y,t,u,12);
	
	ctx.beginPath();
	for (r=0;r<wall[0].length;r++){
		ctx.lineWidth=1;
		ctx.fillStyle = ctx.strokeStyle ="#bb7c77";
		ctx.lineTo((x*t)+t/8*wall[0][r], (y*u)+u/8*wall[1][r]);	
	} 
	ctx.stroke();
	ctx.fill();	

	drawLine(3,6,"#ab6c67",x,y,t,u,4);
	drawLine(2,4,"#444444",x,y,t,u,7);
	drawLine(5,7,"#444444",x,y,t,u,15);
	drawLine(5,7,"#eecd4f",x,y,t,u,11);
	drawLine(5,7,"#444444",x,y,t,u,6);

}

function drawLine(i,ii,s,x,y,t,u,l){
	ctx.beginPath();ctx.strokeStyle =s;	ctx.lineWidth=l;
	for (r=i;r<ii;r++){
		ctx.lineTo((x*t)+t/8*wall[0][r], (y*u)+u/8*wall[1][r]);		
	} 
	ctx.stroke();
	ctx.closePath();
}	

	function initVarMap(){
		if(Math.floor(Math.random() * 2)==1) player.i = img_playerF; else player.i=img_playerM;
		
		lsDoors = [];
		lsRooms = [];
		map = [];
		
		for (i = 0; i < nRooms; i++) {
			lsDoors.push([{s:false},{s:false},{s:false},{s:false},false]);	
			lsRooms.push(["","",""]);	
		}

		for (i = 0; i < 21; i++) {
			map.push(['.','.','.','.','.','.','.','.','.','.','.','.','.','.','.']);	
			mapN.push(['.','.','.','.','.','.','.','.','.','.','.','.','.','.','.']);	
		}
		
		i = 10;
		j = 4;
		
		map[i][j] = '1';
	}
		
	function newMap()
	{
			initVarMap();
			
			var nFallas;
			var elegido = true;
			//Ciclo para generar cuartos
			var err;
			var aux = 1;
			for (var p = 0; p < nRooms; p++)
			{
				//Guardar coordenadas de cuarto actual
				lsRooms[p][0] = i;
				lsRooms[p][1] = j;

				mapN[i][j] = p;

				elegido = false;
				err = 0;
				var al;

				//Si es el primer cuarto solo puede crear puerta abajo
				if (p == 0)
				{
					j++;
					map[i][j] = '0';

					lsDoors[p][1] = doors[1];
					lsDoors[p][4] = true;
					aux = 1;
				}
				else //Si no, se crea puerta aleatoriamente
				{
					lsDoors[p][aux - 1] = doors[aux-1]; //Registra puerta de "entrada" al cuarto

					while (elegido == false)
					{
						err++;
						switch (al = Math.floor(Math.random() * 4) + 0) //Se escoge aleatoriamente una dirección de "salida"
						{
						case 0:
							if (j - 1 != 0)
							if (elegido == false && map[i][j - 1] == '.')
							{
								j = j - 1;
								map[i][j] = '0'; //Escribe en map la posicion de cuarto siguiente
								elegido = true;
								lsDoors[p][al] = doors[0];
								aux = 2;
							}
							break;
						case 1:
							if (j + 1 != 12)
							if (elegido == false && map[i][j + 1] == '.')
							{
								j = j + 1;
								map[i][j] = '0';
								elegido = true;
								lsDoors[p][al] = doors[1];
								aux = 1;
							}
							break;
						case 2:
							if (i - 1 != 0)
							if (elegido == false && map[i - 1][j] == '.')
							{
								i = i - 1;
								map[i][j] = '0';
								elegido = true;
								lsDoors[p][al] = doors[2];
								aux = 4;
							}
							break;
						case 3:
							if (i + 1 != 12)
							if (elegido == false && map[i + 1][j] == '.')
							{
								i = i + 1;
								map[i][j] = '0';
								elegido = true;
								lsDoors[p][al] = doors[3];
								aux = 3;
							}
							break;
						}
						if (err > 20){ //Si no encontró una "salida" válida comienza el proceso de nuevo
							initVarMap();
							elegido = true;
							p = -1;
						}
					}
					//
					if (p != nRooms - 1)
					{
						lsExtra.push([
						[(Math.floor(Math.random() * 3) + 0),(Math.floor(Math.random() * 6) + 1),(Math.floor(Math.random() * 5) + 1)],
						[(Math.floor(Math.random() * 3) + 0),(Math.floor(Math.random() * 6) + 1),(Math.floor(Math.random() * 5) + 1)],
						[(Math.floor(Math.random() * 3) + 0),(Math.floor(Math.random() * 6) + 1),(Math.floor(Math.random() * 5) + 1)]]);
					}
				}
				if (p == nRooms - 1) {
					map[i][j] = '.'; //Limpia cuarto "fantasma"
					lsDoors[p][al] = {s:false};
				}
			}
		
		i = lsRooms[99][0];
		j = lsRooms[99][1];

		//Limpia el arreglo Bloquear que indica los cuartos a bloquear
		var cordXBloq = i - 1;
		var cordYBloq = j - 1;
		
		//Se bloquea el área +-1 en torno del cuarto final
		for (var a = 0; a < 3; a++)
		{
			for (var b = 0; b < 3; b++)
			{
				if (cordXBloq + b >=0 && cordXBloq + b <=20)
				if (map[cordXBloq + b][cordYBloq + a] != '.')
				{
					for (var pf = 0; pf < nRooms; pf++)
					{
						if (cordXBloq + b == lsRooms[pf][0] && cordYBloq + a == lsRooms[pf][1])
						{
							lsDoors[pf][4] = true;
							map[lsRooms[pf][0]][lsRooms[pf][1]] = '1';
						}
					}
				}
			}
		}

		//Crea puertas adicionales si el cuarto no esta bloqueado
		for (var pf = 0; pf < nRooms; pf++)
		{
			if (!lsDoors[pf][4]){
				if ((Math.floor(Math.random() * 100) + 0)<60)
			if (map[lsRooms[pf][0]][lsRooms[pf][1] - 1] == '0') {
					lsDoors[pf][0] = doors[0];
					var nCuarto =	mapN[lsRooms[pf][0]][lsRooms[pf][1] - 1];
					lsDoors[nCuarto][1] = doors[1];
				}
				
				if ((Math.floor(Math.random() * 100) + 0)<60)
				if (map[lsRooms[pf][0] - 1][lsRooms[pf][1]] == '0') 
				{
					lsDoors[pf][2] = doors[2];
					var nCuarto = mapN[lsRooms[pf][0]-1][lsRooms[pf][1]];
					lsDoors[nCuarto][3] = doors[3];
				}
			}
		}
		
		var roomCount = 0;
		var s=100;
		
		for (var q = 98; q >= 0; q--){
			d=lsRooms[q];
			var a="";
			if (lsDoors[q][0].s) {
				if ((a=mapN[d[0]][d[1]-1])<s) s=a;
			}
			if (lsDoors[q][1].s) {
				if ((a=mapN[d[0]][d[1]+1])<s) s=a;
			}
			if (lsDoors[q][2].s) {
				if ((a=mapN[d[0]-1][d[1]])<s) s=a;
			}
			if (lsDoors[q][3].s) {
				if ((a=mapN[d[0]+1][d[1]])<s) s=a;
			}
			
			if (s<q) q=s+1;
			roomCount++;

		}
		
		var roomCount2 = 0;
		var s2=0;
		for (var q = 1; q < nRooms-1; q++){
			d=lsRooms[q];
			var a="";
			if (lsDoors[q][0].s) {
				if ((a=mapN[d[0]][d[1]-1])>s2) s2=a;
			}
			if (lsDoors[q][1].s) {
				if ((a=mapN[d[0]][d[1]+1])>s2) s2=a;
			}
			if (lsDoors[q][2].s) {
				if ((a=mapN[d[0]-1][d[1]])>s2) s2=a;
			}
			if (lsDoors[q][3].s) {
				if ((a=mapN[d[0]+1][d[1]])>s2) s2=a;
			}
			
			if (s2>q) q=s2-1;
			roomCount2++;

		}
		
		if (roomCount2<roomCount) roomCount=roomCount2;
		finalRoomCount = Math.floor(roomCount *2);
	}
}