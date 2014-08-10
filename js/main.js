$(function() {
    var config = null;
    var state = {
	selected: null
    };

    function findSize(target) {
	for (i=target/4; i<target; i++) {
	    if (target % i == 0)
		return Array(i, target / i);
	}
	console.error("Can't find size for target length", target);
	return Array(0, 0);
    }


    function showCard($card) {
	$card.css("background-image", "url(" + $card.data("card") + ")")
	    .data("showing", true);
    }

    function hideCard($card) {
	$card.css("background-image", "url(" + config.back + ")")
	    .data("showing", false);
    }
    

    function onCardClick() {
	var $self = $(this);

	if ($self.data("showing") || state.loading)
	    return
	
	showCard($self);

	if (state.selected === null) {
	    state.selected = $self;
	} else {
	    if (state.selected.data("card") == $self.data("card")) {
		state.score[$(".team.current").data("team")] += 1;
		showScore();
	    } else {
		state.loading = true;
		setTimeout(function(images) {
		    var $current = $(".team.current");
		    hideCard(images[0]);
		    hideCard(images[1]);
		    state.loading = false;
		    $current.removeClass("current").data("next-team").addClass("current");
		    
		}, config.showingTimeout, Array($self, state.selected));
	    }
	    state.selected = null;
	}
    }
    

    function createGrid($parent) {
	var i = 0;
	for (posX = 0; posX < config.height; posX++) {
	    var $row = $("<div><div>");
	    $parent.append($row);
	    for (posY = 0; posY < config.width; posY++, i++) {
		$row.append(
		    $("<div></div>")
			.addClass("card")
			.addClass("img-rounded")
			.css("background-image", "url("+config.back+")")
			.data("posX", posX)
			.data("posY", posY)
			.data("card", config.cards[i])
			.bind('click', onCardClick)
		);
	    }
	}
    }


    function createScoreboard($parent) {
	var $teams = Array();
	for (i=0; i<config.teams.length; i++) {
	    $teams[i] = $("<div></div>")
                .data("team", config.teams[i])
		.addClass((i == 0) ? "current" : "")
		.addClass("team")
		.addClass("img-rounded")
		.addClass("bg-info")
		.append(
		    $("<h1></h1>").html(config.teams[i]),
		    $("<span></span>").addClass("score")
		);
	}

	state.score = Object();
	for (i=0; i<config.teams.length; i++) {
	    state.score[config.teams[i]] = 0;
	    $parent.append($teams[i]);
	    $teams[i].data("next-team", $teams[(i+1) % config.teams.length]);
	}
	showScore();
    }


    function showScore() {
	$("#scoreboard").find(".team").each(function() {
	    var $self = $(this)
	      , score = state.score[$self.data("team")];
	    $self.find(".score").html("Punteggio: " + score)
	});
    }
    

    $.get("memory.json", function(obj) {
	var cards = _.shuffle(obj.pictures.concat(obj.pictures))
	  , size = findSize(cards.length)

	config = obj;
	config.width = size[0];
	config.height = size[1];
	config.cards = cards;

	createGrid($("#memory"));
	createScoreboard($("#scoreboard"));
    });
});
