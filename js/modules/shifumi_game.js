class videoElement{
	constructor(width,height){
		this.__videoElement = document.createElement("video");
		this.__width = width;    
    	this.__height = height;     
    	let streaming = false;
    	let constraints = {'video':true,'audio':false};
		this.__promise = navigator.mediaDevices.getUserMedia(constraints)
    		.then((mediaStream) => {
        	this.__videoElement.srcObject = mediaStream;       	
        	
        	this.__videoElement.addEventListener("loadedmetadata", (e) => {
          		this.__videoElement.play();
      		});

        	this.__videoElement.addEventListener('canplay', (ev)=>{
        		if (!streaming) {
          			this.__height = this.__videoElement.videoHeight / (this.__videoElement.videoWidth/this.__width);
    
          			if (isNaN(this.__height)) {
              			this.__height = this.__width;
          			}
    
          			this.__videoElement.setAttribute('width', this.__width);
          			this.__videoElement.setAttribute('height', this.__height);
          			streaming = true;
        		}
    		});

      	})

  	}

    async getVideoElement(){
    	const respons = await this._promise;
    	return this.__videoElement;
    }

}


class consoleMessage{
	contructor(){
		this.__text;;
		this.__div;
	}
	appendTo(parentDiv){
		this.__div = document.createElement("div");
		this.__div.innerHTML = 'Starting ...';
		parentDiv.appendChild(this.__div);
	}
	setText(text){
		this.__text = text;
		this.__div.innerHTML = this.__text;
	}
}


class choice{
	constructor(ctx,score){
		this.__ctx=ctx;
		this.__score=score;
		this.__shifumiItem;
	}
	getShifumiItem(){
		return this.__shifumiItem;
	}
	displayChoice(){
		this.__ctx.clearRect(0,0,328,328);
		this.__ctx.drawImage(this.__shifumiItem.__image,0,0,328,328);
	}
	resetChoice(){
		this.__ctx.clearRect(0,0,328,328);
		this.__shifumiItem = undefined;
	}
	incrementScore(){
		this.__score.incrementScore();
	}
}

class humanChoice extends choice{
	constructor(ctx,score){
		super(ctx,score);
	}
	setShifumiItem(shifumiItem){
		this.__shifumiItem = shifumiItem;
		console.log(`${shifumiItem.__name} has just been identified`);
		//this.displayChoice();
	}
	validateChoice(){
		console.log(`${this.__shifumiItem} has just been validated`);
		this.displayChoice();
	}
}

class computerChoice extends choice{
	constructor(shifumiSet,ctx,score){
		super(ctx,score);
		this.__shifumiSet = shifumiSet;
	}
	setShifumiItem(){	
		this.__shifumiItem = this.__shifumiSet.getAnyShifumiItem();
		console.log(`${this.__shifumiItem.__name} has just been elected by computer`);
		this.displayChoice();
	}
}


class classic_match {
	constructor(){
		this.__matrix = {
			rock :     {rock:0,  paper:-1, scissors:1},
			paper :    {rock:1,  paper:0,  scissors:-1},
			scissors : {rock:-1, paper:1,  scissors:0}
		};
	}
	setScore(choice1,choice2){
		console.log(`Calling Match beetween ${choice1.getShifumiItem().__name} and ${choice2.getShifumiItem().__name}`);
		//TODO : faire un test que choice{1,2} sont bien de class choice
		//console.log(`un match entre ${choice1.getShifumiItem().__name} et ${choice2.getShifumiItem().__name} : ${this.__matrix[choice1.getShifumiItem().__name][choice2.getShifumiItem().__name]}`);
		if (choice1.getShifumiItem() !== undefined && choice2.getShifumiItem() !== undefined){
			switch(this.__matrix[choice1.getShifumiItem().__name][choice2.getShifumiItem().__name]){
				case -1:
					// choice2 wins;
					choice2.incrementScore();
					break;
				case 0:
					// draw
					break;
				case 1: 
					//choice1 wins
					choice1.incrementScore();
					break;
				default:
					console.log("Dead End");
			}
		}
	}
}


class score_item {
	constructor(id,text){
		this.__id = id;
		this.__text = text;
		this.__value = 0;
		this.__div;
	}
	appendTo(parentDiv){
		this.__div = document.createElement("div");
		parentDiv.appendChild(this.__div);
		this.setScore(0);
	}
	setScore(score){
		this.__value  = score;
		this.displayScore();	
	}
	getScore(){
		return this.__value;
	}
	incrementScore(){
		this.__value ++;
		this.displayScore();
	}
	displayScore(){
		this.__div.innerText = `${this.__text} ${this.__value}`;
	}
}



class shifumi_game {
	constructor(shifumi_div, shifumi_set){
		this.shifumi_div = shifumi_div;

		
		this.__shifumiSet = shifumi_set;
		this.__shifumiSet.display();
		
		//A conserver
		this.__humanChoiceCtx;

		this.__humanCtx;
		this.__computerCtx;

		//
		this.__humanScore = new score_item("human","human score is :");
		this.__computerScore = new score_item("computer","computer score is :");


		this.__width = 328;    
    	this.__height = 328;     
    	let streaming = false;
    	let constraints = {'video':true,'audio':false};
		this.__videoElement = document.createElement("video");
		this.__videoElement.id="videoElement";
		navigator.mediaDevices.getUserMedia(constraints)
    	.then((mediaStream) => {
        	this.__videoElement.srcObject = mediaStream;       	
        	this.__videoElement.onloadedmetadata = (e) => {
          		this.__videoElement.play();
      		};
      	})
    	.catch((err) => { 
      		console.log(err.name + ": " + err.message); 
    	}); // always check for errors at the end.

  		this.__videoElement.addEventListener('canplay', (ev)=>{
        	if (!streaming) {
          		this.__height = this.__videoElement.videoHeight / (this.__videoElement.videoWidth/this.__width);
    
          		if (isNaN(this.__height)) {
              		this.__height = this.__width;
          		}
    
          		this.__videoElement.setAttribute('width', this.__width);
          		this.__videoElement.setAttribute('height', this.__height);
          		streaming = true;
        	}
    	}, false);
		this.setGameBoard(this.shifumi_div);
		this.__humanChoice = new humanChoice(this.__humanCtx,this.__humanScore);
		this.__computerChoice = new computerChoice(this.__shifumiSet,this.__computerCtx, this.__computerScore);
	
		this.__match = new classic_match();

	//
		this.__numRounds = 5; //number of rounds
		this.__delayToPlay = 10; //in sec
		this.__cptLoop = 0;
		this.__cptGame = 0;
	
	//
		this.__gameLoop = setInterval(()=>{this.playGame()},1000); //nécessaire pour ne pas perdre le contexte...
		
	}

	

	setGameBoard(shifumiDiv){


		//Messages
		this.__consoleMessage = new consoleMessage();
		this.__consoleMessage.appendTo(shifumiDiv);

		/*
		//Reset Game
		const resetButton = document.createElement("button");
		resetButton.innerText = "Reset Game";
		resetButton.addEventListener("click",()=>{this.resetGame()});
		shifumiDiv.appendChild(resetButton);
		*/

		//scores
		const scoreDiv = document.createElement("div");
		this.__humanScore.appendTo(scoreDiv);		
		this.__computerScore.appendTo(scoreDiv);
		shifumiDiv.appendChild(scoreDiv);

		//////////////////////
		//MATCH DIV
		const matchDiv = document.createElement("div");
		const matchFieldSet = document.createElement("fieldset");
		matchFieldSet.setAttribute("class","fieldset-auto-width");
		let matchLegend = document.createElement("legend");
		matchLegend.innerText ="Shifumi inputs...";
		matchFieldSet.appendChild(matchLegend);
		matchDiv.appendChild(matchFieldSet);
		shifumiDiv.appendChild(matchDiv);
		///

		const humanPlayerCanvas = document.createElement("canvas");
		this.__humanCtx = humanPlayerCanvas.getContext("2d");
		humanPlayerCanvas.setAttribute("width",this.__width);
		humanPlayerCanvas.setAttribute("height",this.__height);
		matchDiv.appendChild(humanPlayerCanvas);
		//
		const humanPlayerCanvasSpan = document.createElement("span");
		const humanPlayerCanvasFieldSet = document.createElement("fieldset");
		humanPlayerCanvasFieldSet.setAttribute("class","fieldset-auto-width");
		const humanPlayerCanvasLegend = document.createElement("Legend");
		humanPlayerCanvasLegend.innerText = "Human played ...";
		humanPlayerCanvasFieldSet.appendChild(humanPlayerCanvasLegend);
		humanPlayerCanvasFieldSet.appendChild(humanPlayerCanvas);
		humanPlayerCanvasSpan.appendChild(humanPlayerCanvasFieldSet);
		matchFieldSet.appendChild(humanPlayerCanvasSpan);

		///
		const computerPlayerCanvas = document.createElement("canvas");
		this.__computerCtx = computerPlayerCanvas.getContext("2d");
		computerPlayerCanvas.setAttribute("width",this.__width);
		computerPlayerCanvas.setAttribute("height",this.__height);
		matchDiv.appendChild(computerPlayerCanvas);
		//
		const computerPlayerCanvasSpan = document.createElement("span");
		const computerPlayerCanvasFieldSet = document.createElement("fieldset");
		computerPlayerCanvasFieldSet.setAttribute("class","fieldset-auto-width");
		const computerPlayerCanvasLegend = document.createElement("Legend");
		computerPlayerCanvasLegend.innerText = "Computer played...";
		computerPlayerCanvasFieldSet.appendChild(computerPlayerCanvasLegend);
		computerPlayerCanvasFieldSet.appendChild(computerPlayerCanvas);
		computerPlayerCanvasSpan.appendChild(computerPlayerCanvasFieldSet);
		matchFieldSet.appendChild(computerPlayerCanvasSpan);
		///////////////////////

		//human Controls
		const controlDiv = document.createElement("div");
		const controlFieldSet = document.createElement("fieldset");
		controlFieldSet.setAttribute("class","fieldset-auto-width");
		let controlLegend = document.createElement("legend");
		controlLegend.innerText ="Human Controls";
		controlFieldSet.appendChild(controlLegend);
		controlDiv.appendChild(controlFieldSet);
		shifumiDiv.appendChild(controlDiv);

		const humanChoiceCanvas = document.createElement("canvas");
		this.__humanChoiceCtx = humanChoiceCanvas.getContext("2d");
		humanChoiceCanvas.setAttribute("id","humanChoiceCanvas");
		humanChoiceCanvas.setAttribute("width",this.__width);
		humanChoiceCanvas.setAttribute("height",this.__height);

		const humanChoiceCanvasSpan = document.createElement("span");
		const humanChoiceCanvasFieldSet = document.createElement("fieldset");
		humanChoiceCanvasFieldSet.setAttribute("class","fieldset-auto-width");
		const humanChoiceCanvasLegend = document.createElement("Legend");
		humanChoiceCanvasLegend.innerText = "What is recognized...";
		humanChoiceCanvasFieldSet.appendChild(humanChoiceCanvasLegend);
		humanChoiceCanvasFieldSet.appendChild(humanChoiceCanvas);
		humanChoiceCanvasSpan.appendChild(humanChoiceCanvasFieldSet);
		controlFieldSet.appendChild(humanChoiceCanvasSpan);

		
		const humanChoiceVideoSpan = document.createElement("span");
		const humanChoiceVideoFieldSet = document.createElement("fieldset");
		humanChoiceVideoFieldSet.setAttribute("class","fieldset-auto-width");
		const humanChoiceVideoLegend = document.createElement("Legend");
		humanChoiceVideoLegend.innerText = "What is seen...";
		humanChoiceVideoFieldSet.appendChild(humanChoiceVideoLegend);
		humanChoiceVideoFieldSet.appendChild(this.__videoElement);
		humanChoiceVideoSpan.appendChild(humanChoiceVideoFieldSet);
		controlFieldSet.appendChild(humanChoiceVideoSpan);


	}

	setHumanChoiceReco(shifumiLabel,shifumiConfidenceArray){
		//shifumiConfidenceArray.map((item)=>console.log(`conf : ${item} `));
		this.__humanChoiceCtx.clearRect(0,0,this.__width,this.__height);
		const shifumiItem = this.__shifumiSet.getShifumiByName(shifumiLabel);
		this.__humanChoiceCtx.drawImage(shifumiItem.__image,0,0,this.__width,this.__height);
		this.__humanChoice.setShifumiItem(shifumiItem);
	}
	

	playGame(){
		let diff = this.__delayToPlay-this.__cptLoop;
		console.log(`playGame : diff is ${diff}, __cptLoop is ${this.__cptLoop}`);
		if(diff>1){
			this.__consoleMessage.setText(`Round #${this.__cptGame+1} : ${diff} seconds left ! `);
		}else{
			this.__consoleMessage.setText("<br>");
		}
		this.__cptLoop += 1;
		if(this.__cptLoop == this.__delayToPlay){
			this.__humanChoice.validateChoice();
			this.__computerChoice.setShifumiItem();
			this.setScore();
		}

		if(this.__cptLoop == this.__delayToPlay + 3){
			this.__consoleMessage.setText(`Round #${this.__cptGame+2} : in ${this.__delayToPlay + 3 - this.__cptLoop} seconds. `);
			this.__cptLoop=0;
			this.nextRound();
		}

	}


	setScore(){
		this.__match.setScore(this.__humanChoice,this.__computerChoice);
	}


	nextRound(){
		this.__cptGame++;
		this.__computerChoice.resetChoice();
		this.__humanChoice.resetChoice();
		if(this.__cptGame == this.__numRounds){
			//this.resetGame();
			clearInterval(this.__gameLoop); // End Ganme
			this.__consoleMessage.setText(`The Game is Over ! `);
		} else {
			//this.ableAllButtons();
		}
	}

	resetGame(){		
		this.__gameLoop = setInterval(()=>{this.playGame()},1000);
	}



}



export { consoleMessage,choice, humanChoice, computerChoice, classic_match, score_item, shifumi_game };