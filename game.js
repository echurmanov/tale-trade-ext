

function replaceCardsBlock(){
  var instance = widgets.actions;

  var rarityLabelMap = {
    0: 'common-card-label',
    1: 'uncommon-card-label',
    2: 'rare-card-label',
    3: 'epic-card-label',
    4: 'legendary-card-label'
  };

  var processedCards = {};

  var originCombineDialogFn = pgf.game.CombineCardsDialog;
  pgf.game.CombineCardsDialog = function(dialog) {
    console.log(dialog);
    var cardChoicesBlock = dialog.find(".pgf-card-choices");
    var cardSelectedBlock = dialog.find(".pgf-cards-chosen");
    var selectedCards = [];
    console.log(cardChoicesBlock);
    var n = 0;

    for (var rarity = 0; rarity <= 4; rarity++) {
      for (var cardName in processedCards) {
        if (processedCards.hasOwnProperty(cardName)) {
          var card = processedCards[cardName];
          if (card.rarity == rarity) {
            var li = $(document.createElement('li'));
            li.attr('data-original-title','');
            li.addClass(n%2==0?'odd':'even');
            var caption = cardName;
            var captionParts = [];
            var cardUid = 0;
            if (card.notAuctionNumber > 0) {
              cardUid = card.notAuctionUids[0];
              captionParts.push("*" + card.notAuctionNumber);
            }
            if (card.auctionNumber > 0) {
              if (cardUid == 0) {
                cardUid = card.auctionUids[0];
              }
              captionParts.push(card.auctionNumber);
            }
            caption += " ("+captionParts.join('/')+")";

            li.append("<a href=\"javascript:void(0);\" data-card-name=\""+cardName+"\" class=\"pgf-card-uid-"+cardUid+" "+rarityLabelMap[rarity]+"\" data-card-name=\""+cardName+"\" style=\"font-size:10pt\">"+caption+"</a>");
            cardChoicesBlock.append(li);
            n++;
          }
        }
      }
    }

    cardChoicesBlock.find('a').on('click', function(e){
      var cardLink = $(e.target);
      var push = false;
      var clear = false;
      var cardName = cardLink.attr('data-card-name');
      if (typeof processedCards[cardName] == 'undefined') {
        cardLink.addClass('ext-missing-card');
        return;
      }
      if (cardLink.hasClass("ext-all-used-cards")) {
        return;
      }
      if (selectedCards.length == 0 || processedCards[selectedCards[0]].rarity != processedCards[cardName].rarity) {
        push = true;
        selectedCards = [];
        selectedCards.push(cardName);
      } else if (selectedCards.length < 3) {
        if (selectedCards.length < 2 || processedCards[selectedCards[0]].rarity != 4) {
          selectedCards.push(cardName);
          push = true;
        }
      }
      if (selectedCards.length == 1) {
        clear = true;
      }
      if (clear) {
        cardSelectedBlock.find("li[data-original-title]").remove();
      }
      if (push) {
        var li = $(document.createElement('li'));
        li.addClass(n%2==0?'odd':'even');
        li.attr('data-original-title','');
        var caption = cardName;

        li.append("<a href=\"javascript:void(0);\" data-card-name=\""+cardName+"\" class=\""+rarityLabelMap[processedCards[cardName].rarity]+"\" style=\"font-size:10pt\">"+caption+"</a>");
        cardSelectedBlock.append(li);
        var cardsNumb = {};
        cardChoicesBlock.find("a.ext-all-used-cards").removeClass("ext-all-used-cards");
        for (var i = 0; i < selectedCards.length;i++) {
          if (typeof cardsNumb[selectedCards[i]] == 'undefined') {
            cardsNumb[selectedCards[i]] = 0;
          }
          cardsNumb[selectedCards[i]]++;
          if (cardsNumb[selectedCards[i]] >= processedCards[selectedCards[i]].notAuctionNumber + processedCards[selectedCards[i]].auctionNumber) {
            cardChoicesBlock.find("a[data-card-name=\""+selectedCards[i]+"\"]").addClass("ext-all-used-cards");
          }
        }

      }
    });
  };

  function modifiedShowCards(container, filterUIDs) {
    var rawCards = this.GetCards();
    processedCards = {};
    if (rawCards) {
      for (var i = 0; i < rawCards.length; i++) {
        if (typeof processedCards[rawCards[i].name] == 'undefined') {
          processedCards[rawCards[i].name] = {
            auctionNumber: 0,
            notAuctionNumber: 0,
            name: rawCards[i].name,
            rarity: rawCards[i].rarity,
            type: rawCards[i].type,
            auctionUids: [],
            notAuctionUids: []
          }
        }
        if (rawCards[i].auction) {
          processedCards[rawCards[i].name].auctionNumber++;
          processedCards[rawCards[i].name].auctionUids.push(rawCards[i].uid);
        } else {
          processedCards[rawCards[i].name].notAuctionNumber++;
          processedCards[rawCards[i].name].notAuctionUids.push(rawCards[i].uid);
        }
      }
    }
    var n = 0;
    container.find('li[data-original-title]').remove();
    for (var rarity = 0; rarity <= 4; rarity++) {
      for (var cardName in processedCards) {
        if (processedCards.hasOwnProperty(cardName)) {
          var card = processedCards[cardName];
          if (card.rarity == rarity) {
            var li = $(document.createElement('li'));
            li.addClass(n%2==0?'odd':'even');
            li.attr('data-original-title','');
            var caption = cardName;
            var captionParts = [];
            var cardUid = 0;
            if (card.notAuctionNumber > 0) {
              cardUid = card.notAuctionUids[0];
              captionParts.push("*" + card.notAuctionNumber);
            }
            if (card.auctionNumber > 0) {
              if (cardUid == 0) {
                cardUid = card.auctionUids[0];
              }
              captionParts.push(card.auctionNumber);
            }
            caption += " ("+captionParts.join('/')+")";

            li.append("<a href=\"/game/cards/use-dialog\" data-card-uid=\""+cardUid+"\" class=\"pgf-card-uid-"+cardUid+" pgf-card-record pgf-card-link "+rarityLabelMap[rarity]+"\" data-card-name=\""+cardName+"\" style=\"font-size:10pt\">"+caption+"</a>");
            container.append(li);
            n++;
          }
        }
      }
    }
  }
  var originShowCards = widgets.actions.ShowCards;
  widgets.actions.ShowCards = modifiedShowCards.bind(widgets.actions);
  widgets.actions.ShowCards($(".pgf-cards-container"));
}

setTimeout(function(){
  var s = document.createElement("script");
  s.innerHTML = `
(${replaceCardsBlock.toString()})();
`;
  document.body.appendChild(s);
},100);