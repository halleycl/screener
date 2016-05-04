Practice = function(trial_clock, diff, game) {
	this.practice = true;
	this.count = 0;
	this.ACC = 0;
	this.attempts = 0;
	this.trial_clock = trial_clock;
	this.diff = diff;
	this.game = game;

	instructions = {};
	instructions['practice'] = "Let's try some practice.\n\nPress SPACEBAR to practice."
	instructions['practice_again'] = "Let's try a little more practice.\n\nPress SPACEBAR to practice some more."
	instructions['practice_success'] = "Great job!  Now let's play for real!\n\nPress SPACEBAR to continue."
	instructions['practice_fail'] = "Looks like you're having trouble, and that's no fun.\n\nPress SPACEBAR to move on to the next experiment."

	this.instructions = instructions;

	//feedback sprites
	this.correct = game.add.sprite(game.world.centerX, game.world.centerY, 'correct');
	this.correct.anchor.x = 0.5;
	this.correct.anchor.y = 0.5;
	this.correct.visible = false;
	this.incorrect = game.add.sprite(game.world.centerX, game.world.centerY, 'incorrect');
	this.incorrect.anchor.x = 0.5;
	this.incorrect.anchor.y = 0.5;
	this.incorrect.visible = false;

	//check accuracy of individual trial and give feedback
	this.check = function() {
		//we do this to suppress the easyness streak calculation
		//otherwise we may quit early if makes a lot of mistakes during practice
		this.diff.grader.Es = [];

		//this.fb.visible = false;
		this.count += 1;
		console.log(this.count);
		this.ACC += this.diff.grader.ACC;

		//provide the feedback
		if (this.diff.grader.ACC == 1) {
			this.correct.visible = true;
		}
		else {
			this.incorrect.visible = true;
		}

		//pause the clock for 400 ms
		this.trial_clock.stop();

		this.game.time.events.add(Phaser.Timer.SECOND * 0.4, function () {
			this.correct.visible = false;
			this.incorrect.visible = false;
			this.trial_clock.go();
			this.check_complete();
		}, this)
	};

	//determine whether to keep practicing...
	this.check_complete = function() {

		if (this.count >= 5) {
			this.trial_clock.stop();

			//reset the grading system
			this.diff.param_space.reset();

			//calculate practice accuracy
			p_acc = this.ACC / this.count;
			this.count = 0;
			var p_fail = false;

			if (p_acc > .5) {
				this.practice = false;
				//reset acc, RT, and EZ list
				text = this.instructions['practice_success'];
			}
			else {
				this.attempts += 1;
				if (this.attempts >= 3) {
					text = this.instructions['practice_fail'];
					p_fail = true;
				}

				else {
					this.count = -1; //TODO - keep trial counter from incrementing
					this.ACC = 0;
					this.practice = true;
					text = this.instructions['practice_again'];
				}
			}
			this.prac_text = this.game.add.text(this.game.world.centerX, this.game.world.centerY, text, ins_style);
			this.prac_text.anchor.x=0.5;
			this.prac_text.anchor.y=0.5;
			instructions.wordWrap = true;
			instructions.wordWrapWidth = window.innerWidth - 400;

			space = this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

    	if (p_fail == false) {
				space.onDown.add(function () {
					this.trial_clock.restart();
					//this.trial_clock.reset();
					this.trial_clock.go();
					this.prac_text.kill();
				}, this);

			} else {
				space.onDown.add(function(e) {
          if (e.key == Crafty.keys.SPACE) {
						this.prac_text.kill();
						this.trial_clock.signal.dispatch('end_task');
          }
        });
      }
		}
		//do another practice trial...
		else {
			this.trial_clock.go();
		}

	};

}
