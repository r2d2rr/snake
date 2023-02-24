  // налаштовуємо полотно 
	let canvas = document.getElementById("canvas");
	let ctx = canvas.getContext("2d");

	// отримуємо ширину і висоту елемента canvas
	let width = canvas.width;
	let height = canvas.height;

	// опрацьовуємо блоки width and hight
	let blockSize = 10;
	let widthInBlocks = width / blockSize;
	let heightInBlocks = height / blockSize;

	// задаємо рахунок на 0
	let score = 0;

	// малюємо межі
	let drawBorder = function () {
		ctx.fillStyle = "Gray";
		ctx.fillRect(0, 0, width, blockSize);
		ctx.fillRect(0, height - blockSize, width, blockSize);
		ctx.fillRect(0, 0, blockSize, height);
		ctx.fillRect(width - blockSize, 0, blockSize, height);
	};

	// малюємо рахунок у верхньому лівому куті 
	let drawScore = function () {
		ctx.font = "20px Courier";
		ctx.fillStyle = "Black";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillText("Score: " + score, blockSize, blockSize);
	};

	// очищуєм інтервал та висвітлюємо текст 
	let gameOver = function () {
		playing = false;
		ctx.font = "60px Courier";
		ctx.fillStyle = "Black";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("Game over", width / 2, height / 2);
	};

	// малюємо коло 
	let circle = function (x, y, radius, fillCircle) {
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2, false);
		if (fillCircle) {
			ctx.fill();
		} else {
			ctx.stroke();
		}
	};

	// конструктор Block 
	let Block = function (col, row) {
		this.col = col;
		this.row = row;
	};

	// малюємо квадрат у локації блока 
	Block.prototype.drawSquare = function (color) {
		let x = this.col * blockSize;
		let y = this.row * blockSize;
		ctx.fillStyle = color;
		ctx.fillRect(x, y, blockSize, blockSize);
	};

	// малюємо коло на локації блоку
	Block.prototype.drawCircle = function (color) {
		let centerX = this.col * blockSize + blockSize / 2;
		let centerY = this.row * blockSize + blockSize / 2;
		ctx.fillStyle = color;
		circle(centerX, centerY, blockSize / 2, true);
	};

	// Провіряєм чи блок не знаходиться на одній локації з блоками
	Block.prototype.equal = function (otherBlock) {
		return this.col === otherBlock.col && this.row === otherBlock.row;
	};

	// конструктор Snake
	let Snake = function () {
		this.segments = [
			new Block(7, 5),
			new Block(6, 5),
			new Block(5, 5)
		];

		this.direction = "right";
		this.nextDirection = "right";
	};

	// малюємо квадрат для кожгого сегменту тіла змійки
	Snake.prototype.draw = function () {
		this.segments[0].drawSquare("LimeGreen");
		let isEvenSegment = false;

		for (let i = 1; i < this.segments.length; i++) {
			if (isEvenSegment) {
				this.segments[i].drawSquare("Blue");
			} else {
				this.segments[i].drawSquare("Yellow");
			}

			isEvenSegment = !isEvenSegment;
		}
	};

	// створюємо нову голову та додаємо її до початку змійки щоб переміщати змійку в поточному напрямку
	Snake.prototype.move = function () {
		let head = this.segments[0];
		let newHead;

		this.direction = this.nextDirection;

		if (this.direction === "right") {
			newHead = new Block(head.col + 1, head.row);
		} else if (this.direction === "down") {
			newHead = new Block(head.col, head.row + 1);
		} else if (this.direction === "left") {
			newHead = new Block(head.col - 1, head.row);
		} else if (this.direction === "up") {
			newHead = new Block(head.col, head.row - 1);
		}

		if (this.checkCollision(newHead)) {
			gameOver();
			return;
		}

		this.segments.unshift(newHead);

		if (newHead.equal(apple.position)) {
			score++;
			animationTime -= 5;
			apple.move(this.segments);
		} else {
			this.segments.pop();
		}
	};

	// перевіряємо чи голова змійки не зіткнулась з стіною або з власним тілом
	Snake.prototype.checkCollision = function (head) {
		let leftCollision = (head.col === 0);
		let topCollision = (head.row === 0);
		let rightCollision = (head.col === widthInBlocks - 1);
		let bottomCollision = (head.row === heightInBlocks - 1);

		let wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;

		let selfCollision = false;

		for (let i = 0; i < this.segments.length; i++) {
			if (head.equal(this.segments[i])) {
				selfCollision = true;
			}
		}

		return wallCollision || selfCollision;
	};

	// задаємо напрям змійки на основі клавіатури
	Snake.prototype.setDirection = function (newDirection) {
		if (this.direction === "up" && newDirection === "down") {
			return;
		} else if (this.direction === "right" && newDirection === "left") {
			return;
		} else if (this.direction === "down" && newDirection === "up") {
			return;
		} else if (this.direction === "left" && newDirection === "right") {
			return;
		}

		this.nextDirection = newDirection;
	};

	// конструктор Apple
	let Apple = function () {
		this.position = new Block(10, 10);
	};

	// малюєм коло на локації яблука
	Apple.prototype.draw = function () {
		this.position.drawCircle("LimeGreen");
	};

	// переміщуємо яблуко на нову випадкову локацію
	Apple.prototype.move = function (occupiedBlocks) {
		let randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
		let randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
		this.position = new Block(randomCol, randomRow);
		
		// перевіряєм чи не появилось яблуко на позиції тіла змійки
		let index = occupiedBlocks.length - 1;
		while ( index >= 0 ) {
			if (this.position.equal(occupiedBlocks[index])) {
				this.move(occupiedBlocks);
				return;
			}
			index--;
		}
	};

	// створюємо обєкти змійки та яблука
	let snake = new Snake();
	let apple = new Apple();

	// запускаємо функцію анімації через setInterval
	let playing = true;
	let animationTime = 100;

	// сворюємо функцію ігрового циклу яка викликає сама себе через setTimeout
	let gameLoop = function () {
		ctx.clearRect(0, 0, width, height);
		drawScore();
		snake.move();
		snake.draw();
		apple.draw();
		drawBorder();

		// встановлюється в false функцією gameOver
		if (playing) {
			setTimeout(gameLoop, animationTime);
		}
	};

	// починаємо ігровий цикл
	gameLoop();

	// конвертуємо ключ коди в напрямки
	let directions = {
		37: "left",
		38: "up",
		39: "right",
		40: "down"
	};

	// маніпуляції напрямками заданими натискання клавіш
	$("body").keydown(function (event) {
		let newDirection = directions[event.keyCode];
		if (newDirection !== undefined) {
			snake.setDirection(newDirection);
		}
	});