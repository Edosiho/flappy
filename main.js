
var m_state= {"vertical_distance": 0, "horizontal_distance": 0};
var m_state_dash= {"vertical_distance": 0, "horizontal_distance": 0};
var explore= 0.00;
var action_to_perform= "do_nothing";
var resolution= 1;
var action_to_perform= "do_nothing";
var alpha_QL = 0.7;
var vertical_dist_range = [-280, 300];
var horizontal_dist_range= [0, 360];
var state = "NULL";
var holes = [];
holes.push(60);
var curr_hole =0;
var last_hole =0;
var livepipes = [];
console.log("**** **** INIT **** ****");

      // Vertical Distance
var Q = new Array();
for (var vert_dist = 0; vert_dist < (this.vertical_dist_range[1] - this.vertical_dist_range[0])/resolution; vert_dist++) {
  this.Q[vert_dist] = new Array();

   // Horizontal Distance
 for (var hori_dist = 0; hori_dist < (this.horizontal_dist_range[1] - this.horizontal_dist_range[0])/resolution; hori_dist++) {
  this.Q[vert_dist][hori_dist] = {"click": 0, "do_nothing": 0};
  }
}
console.log(this.Q);



// Create our 'main' state that will contain the game
var mainState = {
  preload: function () {
    // Load the bird sprite
    game.load.image('bird', 'assets/bird.png');
    game.load.image('pipe', 'assets/pipe.png');
    game.load.audio('jump', 'assets/jump.wav'); 
  },

  create: function () {
    // If this is not a desktop (so it's a mobile device) 
    if (game.device.desktop == false) {
      // Set the scaling mode to SHOW_ALL to show all the game
      game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      // Set a minimum and maximum size for the game
      // Here the minimum is half the game size
      // And the maximum is the original game size
      game.scale.setMinMax(game.width/2, game.height/2, 
      game.width, game.height);
    }
    state = "BORN";    
    // Center the game horizontally and vertically
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    // Change the background color of the game to blue
    game.stage.backgroundColor = '#71c5cf';
    // Set the physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);
    // Display the bird at the position x=100 and y=245
    this.bird = game.add.sprite(100, 245, 'bird');   
    // Add physics to the bird
    // Needed for: movements, gravity, collisions, etc.
    game.physics.arcade.enable(this.bird);
    // Add gravity to the bird to make it fall
    this.bird.body.gravity.y = 1000;  
    // Call the 'jump' function when the spacekey is hit
    var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(this.jump, this);
    this.pipes = game.add.group();     
    this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);    
    this.score = -1;
    this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });    
    // Move the anchor to the left and downward
    this.bird.anchor.setTo(-0.2, 0.5);
    // Set audio for the jump
    this.jumpSound = game.add.audio('jump');     
    // Call the 'jump' function when we tap/click on the screen
    game.input.onDown.add(this.jump, this);
    var hole = Math.floor(Math.random() * 4) + 1;
    for (var i = 0; i < 8; i++)      
      if (i != hole && i != hole + 1 && i != hole+2) 
        this.addOnePipe(400, i * 60 );

    
  },

  update: function() {
    // If the bird is out of the screen (too high or too low)
    // Call the 'restartGame' function
    
    if (this.bird.y < 0 || this.bird.y > 490 && state != "DEAD"){
      state = "DYING";
      this.restartGame();    
    }
   
    else{
      state = "RUNNING";
    }
    game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);    
    if (this.bird.angle < 20)
      this.bird.angle += 1; 

    var valid = false;
    var reward = 0;
    switch (state){
      case "BORN" :
        break;
      case "RUNNING" :
        valid = true;
        reward = 1;
        break;
      case "DYING":
        state = "DEAD"
        valid = true;
        reward = -1000;
        break;
      case "DEAD":
        break;
    }
    
    if (valid){
      var horizontal_distance = 9999;
      var vertical_distance = 9999;

      this.pipes.forEachAlive(function(value){
        livepipes.push(value);
      });

       for(var i=0; i< livepipes.length;i++){
        if(livepipes[i].x  >= this.bird.x ){
            var diff = (livepipes[i].x - this.bird.x);
              if (horizontal_distance > diff){
                horizontal_distance = diff;
                if(holes[curr_hole] == undefined){
                  holes[curr_hole] = last_hole;
                  vertical_distance = (this.bird.y- holes[curr_hole]);
                }
                else{
                  vertical_distance = (this.bird.y- holes[curr_hole]);
                  last_hole = holes[curr_hole];
                }
                
            }
          }
      }
      /*
      console.log("birdie in y && currhole \t "+ this.bird.y + "   " + holes[curr_hole]);
      console.log("Vertical: \t" + vertical_distance);
      console.log("Horizontal:\t" + horizontal_distance);
      console.log("--");*/
      m_state_dash.vertical_distance = vertical_distance;
      m_state_dash.horizontal_distance = horizontal_distance;


      var state_bin_v = 
          Math.max( 
            Math.min ( 
              Math.floor((vertical_dist_range[1]-vertical_dist_range[0]-1)/resolution), 
              Math.floor((m_state.vertical_distance - vertical_dist_range[0])/resolution)
            ), 
            0
          );
      var state_bin_h = 
          Math.max( 
            Math.min ( 
              Math.floor((horizontal_dist_range[1]-horizontal_dist_range[0]-1)/resolution), 
              Math.floor( (m_state.horizontal_distance - horizontal_dist_range[0])/resolution )
            ), 
            0
          );


          var state_dash_bin_v = 
          Math.max( 
            Math.min ( 
              Math.floor((vertical_dist_range[1]-vertical_dist_range[0]-1)/resolution), 
              Math.floor( (m_state_dash.vertical_distance - vertical_dist_range[0])/resolution )
            ), 
            0
          );
          
          var state_dash_bin_h = 
          Math.max( 
            Math.min ( 
              Math.floor((horizontal_dist_range[1]-horizontal_dist_range[0]-1)/resolution), 
              Math.floor( (m_state_dash.horizontal_distance - horizontal_dist_range[0])/resolution)
            ), 
            0
          );
        /*
        console.log("state_bin_v  \t"+state_bin_v);
        console.log("state__bin_h  \t"+state_bin_h);
        console.log("state_dash_bin_v  \t"+state_dash_bin_v);
        console.log("state_dash_bin_h  \t"+state_dash_bin_h);
        
        */
        var click_v = Q[state_dash_bin_v][state_dash_bin_h]["click"];
        var do_nothing_v = Q[state_dash_bin_v][state_dash_bin_h]["do_nothing"]
        var V_s_dash_a_dash = Math.max(click_v, do_nothing_v);

        var Q_s_a = Q[state_bin_v][state_bin_h][action_to_perform];
        Q[state_bin_v][state_bin_h][action_to_perform] = 
          Q_s_a + alpha_QL * (reward + V_s_dash_a_dash - Q_s_a);


        // Step 4: S <- S'
        m_state = clone(m_state_dash);

        // Step 1: Select and perform Action A
        if (Math.random() < explore) {
          action_to_perform = Ω.utils.rand(2) == 0 ? "click" : "do_nothing";
        }
        else {
          var state_bin_v = 
          Math.max( 
            Math.min ( 
              Math.floor((vertical_dist_range[1]-vertical_dist_range[0]-1)/resolution), 
              Math.floor( (m_state.vertical_distance - vertical_dist_range[0])/resolution )
            ), 
            0
          );
          
          var state_bin_h = 
          Math.max( 
            Math.min ( 
              Math.floor((horizontal_dist_range[1]-horizontal_dist_range[0]-1)/resolution), 
              Math.floor( (m_state.horizontal_distance - horizontal_dist_range[0])/resolution )
            ), 
            0
          );

          var click_v = Q[state_bin_v][state_bin_h]["click"];
          var do_nothing_v = Q[state_bin_v][state_bin_h]["do_nothing"]
          action_to_perform = click_v > do_nothing_v ? "click" : "do_nothing";

          console.log("State: ["+ state_bin_v + "]["+state_bin_h+"] Action: " +action_to_perform);

        }     
         if (action_to_perform == "click") {
            this.jump();
          
        }

    }
    
      

    livepipes.length =0;

  },
  // Make the bird jump 
  jump: function() {    
    if (this.bird.alive == false)
      return;    
    // Add a vertical velocity to the bird
    this.bird.body.velocity.y = -350;    
    game.add.tween(this.bird).to({angle: -20}, 100).start();    
    this.jumpSound.play(); 

  },

  // Restart the game
  restartGame: function () {
    // Start the 'main' state, which restarts the game
    holes.length =0;
    game.state.start('main');
  },
  
  addOnePipe: function(x, y) {
    // Create a pipe at the position x and y
    var pipe = game.add.sprite(x, y, 'pipe');
    // Add the pipe to our previously created group
    this.pipes.add(pipe);

    // Enable physics on the pipe 
    game.physics.arcade.enable(pipe);
    // Add velocity to the pipe to make it move left
    pipe.body.velocity.x = -200; 
    // Automatically kill the pipe when it's no longer visible 
    pipe.checkWorldBounds = true;
    pipe.outOfBoundsKill = true;
  },
  
  addRowOfPipes: function() {
    // Randomly pick a number between 1 and 5
    // This will be the hole position
    var hole = Math.floor(Math.random() * 4) + 1;
    if(holes[0] == 0){
      holes[0] = hole*60;
    } 
    else{
      holes.push(hole*60);
    } 
    // Add the 5 pipes 
    // With one big hole at position 'hole' and 'hole + 1'
    for (var i = 0; i < 8; i++)      
      if (i != hole && i != hole + 1 && i != hole+2) 
        this.addOnePipe(400, i * 60 );
    this.score += 1;
    curr_hole = this.score;
    this.labelScore.text = this.score;

  },
  
  hitPipe: function() {
    // If the bird has already hit a pipe, do nothing
    // It means the bird is already falling off the screen
    if (this.bird.alive == false)
      return;
    // Set the alive property of the bird to false
    this.bird.alive = false;
    // Prevent new pipes from appearing
    game.time.events.remove(this.timer);
    // Go through all the pipes, and stop their movement
    this.pipes.forEach(function(p){
      p.body.velocity.x = 0;
    }, this);
  }
};

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}
// Initialize Phaser, and create a 400px by 490px game
var game = new Phaser.Game(400, 480);

// Add and start the 'main' state to start the game
game.state.add('main', mainState, true); 