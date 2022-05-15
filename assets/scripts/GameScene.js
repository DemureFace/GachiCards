class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
  }
  preload() {
    this.load.image("bg", "/sprites/bg.png");
    this.load.image("card", "/sprites/card-bg.png");
    this.load.image("card1", "/sprites/01.png");
    this.load.image("card2", "/sprites/02.png");
    this.load.image("card3", "/sprites/03.png");
    this.load.image("card4", "/sprites/04.png");
    this.load.image("card5", "/sprites/05.png");
    this.load.audio('card', '/assets/music/true.mp3');
    this.load.audio("complete", "/assets/music/win.mp3");
    this.load.audio("success", "/assets/music/miss.mp3");
    this.load.audio("theme", "/assets/music/fon.mp3");
    this.load.audio("timeout", "/assets/music/lose.mp3");
  }

  createText() {
    this.timeoutText = this.add.text(520, 10, "", {
      font: "36px Lora",
      fill: "Red",
    });
  }

  onTimerTick() {
      this.timeoutText.setText("Fisting Time: " + this.timeout);
      if (this.timeout <= 0) {
        this.timer.paused = true;
        this.sounds.timeout.play();
        this.restart();
      } else {
        --this.timeout;
      }
  }

  createTimer() {
      this.timer = this.time.addEvent({
        delay: 1000,
        callback: this.onTimerTick,
        callbackScope: this,
        loop: true
      });
  }
  createSounds() {
    this.sounds = {
      card: this.sound.add("card"),
      complete: this.sound.add("complete"),
      success: this.sound.add("success"),
      theme: this.sound.add("theme"),
      timeout: this.sound.add("timeout"),
    };
    this.sounds.theme.play({volume: .3});
  }
  create() {
    this.timeout = config.timeout;
    this.createSounds();
    this.createTimer();
    this.createBackgrouund();
    this.createText();
    this.createCards();
    this.start();
  }

  restart() {
    let count = 0;
    let onCardMoveComplete = () => {
      ++count;
      if (count >= this.cards.length) {
          this.start();
      }
    };
        this.cards.forEach((card) => {
          card.move({
            x: this.sys.game.config.width + card.width,
            y: this.sys.game.config.height + card.height,
            delay: card.position.delay,
            callback: onCardMoveComplete
          });
        });
  }

  start() {
    this.initCardsPositions();
    this.timeout = config.timeout;
    this.openedCard = null;
    this.openedCardsCount = 0;
    this.timer.paused = false;
    this.initCards();
    this.showCards();
  }
  initCards() {
    let positions = Phaser.Utils.Array.Shuffle(this.positions);
    
    this.cards.forEach(card => {
      card.init(positions.pop());
    });
  }
  showCards() {
    this.cards.forEach(card => {

      card.depth = card.position.delay;
      card.move({
        x: card.position.x,
        y: card.position.y,
        delay: card.position.delay
      })
    })
  }
  createBackgrouund() {
    this.add.sprite(0, 0, "bg").setOrigin(0, 0);
  }
  createCards() {
    this.cards = [];
    
    for (let value of config.cards) {
      for (let i = 0; i < 2; i++) {
        this.cards.push(new Card(this, value));
      }
      
    }
    this.input.on("gameobjectdown", this.onCardClicked, this);
  }
  onCardClicked(pointer, card) {
    if (card.opened) {
      return false;
    }

    this.sounds.card.play({volume: 1.7});
    
    if (this.openedCard) {
        if (this.openedCard.value ===card.value) {
          this.sounds.success.play({ volume: 2});
          this.openedCard = null;
          ++this.openedCardsCount;
        } else {
          this.openedCard.close();
          this.openedCard = card;
        }
    }else {
      this.openedCard = card;
    }

    card.open(() => {
      if (this.openedCardsCount === this.cards.length / 2) {
        this.sounds.complete.play({ volume: 4 });
        this.restart();
      }
    });
    
    
  }
  initCardsPositions() {
    let positions = [];
    let cardTexture = this.textures.get("card").getSourceImage();
    let cardWidth = cardTexture.width + 5;
    let cardHeight = cardTexture.height + 5;
    let offsetX = (this.sys.game.config.width - cardWidth * config.cols) / 2 + cardWidth / 2;
    let offsetY = (this.sys.game.config.height - cardHeight * config.rows) / 2 + cardHeight / 2;

    let id = 0;
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        positions.push({
          delay: ++id * 200,
          x: offsetX + col * cardWidth,
          y: offsetY + row * cardHeight,
        });
      }
    }

    this.positions = positions;
  }
}
