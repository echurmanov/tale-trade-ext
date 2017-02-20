

function replaceCardsBlock(){
  var instance = widgets.actions;

  var rarityLabelMap = {
    0: 'common-card-label',
    1: 'uncommon-card-label',
    2: 'rare-card-label',
    3: 'epic-card-label',
    4: 'legendary-card-label'
  };

  var rarityNameMap = {
    0: 'обычная',
    1: 'не обычная',
    2: 'редкая',
    3: 'эпическая',
    4: 'легендарная'
  };

  var processedCards = {};

  var originCombineDialogFn = pgf.game.CombineCardsDialog;
  pgf.game.CombineCardsDialog = function(dialog) {
    var cardChoicesBlock = dialog.find(".pgf-card-choices");
    var cardSelectedBlock = dialog.find(".pgf-cards-chosen");
    cardSelectedBlock.css({height: "90px"});
    var selectedCards = [];
    var selectedCardsAuc = [];

    var oldCombineBtn = dialog.find(".pgf-do-combine-cards");
    var combineBtn = $(document.createElement('button'));
    combineBtn.text(oldCombineBtn.text());
    var spanResult = $(document.createElement("span"));
    spanResult.css({"display": "block"});
    spanResult.html("Результат:");
    oldCombineBtn.parent().append(spanResult);
    oldCombineBtn.parent().append(combineBtn);
    oldCombineBtn.remove();

    combineBtn.addClass("btn");
    combineBtn.addClass("btn-success");
    combineBtn.addClass("btn-disabled");
    combineBtn.css({"width": "100%"});
    combineBtn.attr('data-select-text', 'Выберите карты для объедения');
    combineBtn.attr('data-more-text', 'Выберите ещу одну или две');

    combineBtn.button('select');
    var n = 0;

    for (var rarity = 0; rarity <= 4; rarity++) {
      for (var cardName in processedCards) {
        if (processedCards.hasOwnProperty(cardName)) {
          var card = processedCards[cardName];
          if (card.rarity == rarity) {
            var captionParts = [];
            if (card.notAuctionNumber > 0) {
              var li = $(document.createElement('li'));
              li.attr('data-original-title','');
              li.addClass(n%2==0?'odd':'even');
              li.append("<a href=\"javascript:void(0);\" data-card-auction=\"false\" data-card-name=\""+cardName+"\" class=\""+rarityLabelMap[rarity]+"\" data-card-name=\""+cardName+"\" style=\"font-size:10pt\">"+cardName+" * ("+card.notAuctionNumber+")</a>");
              cardChoicesBlock.append(li);
              n++;
            }
            if (card.auctionNumber > 0) {
              var li = $(document.createElement('li'));
              li.attr('data-original-title','');
              li.addClass(n%2==0?'odd':'even');
              li.append("<a href=\"javascript:void(0);\" data-card-auction=\"true\" data-card-name=\""+cardName+"\" class=\""+rarityLabelMap[rarity]+"\" data-card-name=\""+cardName+"\" style=\"font-size:10pt\">"+cardName+" ("+card.auctionNumber+")</a>");
              cardChoicesBlock.append(li);
              n++;
            }
          }
        }
      }
    }

    function updateChoseList(selectedCards, selectedCardsAuc)
    {
      var cardsNumb = {};
      cardChoicesBlock.find("a.ext-all-used-cards").removeClass("ext-all-used-cards");

      var rarityText = "";
      if (selectedCards.length > 0) {
        var rarityClass = rarityLabelMap[processedCards[selectedCards[0]].rarity];
        var rarityName = rarityNameMap[processedCards[selectedCards[0]].rarity];
        var auctionStatus = (selectedCardsAuc.indexOf(false) != -1) ? "не продоваемая" : "продоваемая";


        if (selectedCards.length == 3) {
          rarityClass = rarityLabelMap[processedCards[selectedCards[0]].rarity + 1];
          rarityName = rarityNameMap[processedCards[selectedCards[0]].rarity + 1];
        }
        if (selectedCards.length >= 2) {
          rarityText = "<strong class=\"" + rarityClass + "\">" + auctionStatus + " " + rarityName + "</strong>";
        }
      }

      spanResult.html("Результат: " + rarityText);

      switch (selectedCards.length) {
        case 0:
          combineBtn.button('select');
          break;
        case 1:
          combineBtn.button('more');
          break;
        case 2:
        case 3:
          combineBtn.button('reset');
          break;
      }

      for (var i = 0; i < selectedCards.length;i++) {
        if (typeof cardsNumb[selectedCards[i]+"-"+selectedCardsAuc[i]] == 'undefined') {
          cardsNumb[selectedCards[i]+"-"+selectedCardsAuc[i]] = 0;
        }
        cardsNumb[selectedCards[i]+"-"+selectedCardsAuc[i]]++;
        if (cardsNumb[selectedCards[i]+"-false"] >= processedCards[selectedCards[i]].notAuctionNumber) {
          cardChoicesBlock.find("a[data-card-name=\""+selectedCards[i]+"\"][data-card-auction=false]").addClass("ext-all-used-cards");
        }
        if (cardsNumb[selectedCards[i]+"-true"] >= processedCards[selectedCards[i]].auctionNumber) {
          cardChoicesBlock.find("a[data-card-name=\""+selectedCards[i]+"\"][data-card-auction=true]").addClass("ext-all-used-cards");
        }
      }
    }

    cardChoicesBlock.find('a').on('click', function(e){
      var cardLink = $(e.target);
      var push = false;
      var clear = false;
      var cardName = cardLink.attr('data-card-name');
      var cardAuc = cardLink.attr('data-card-auction') == "true";

      if (cardLink.hasClass("ext-all-used-cards") || cardLink.hasClass("ext-missing-card")) {
        return;
      }

      if (typeof processedCards[cardName] == 'undefined') {
        cardLink.addClass('ext-missing-card');
        return;
      }

      if (selectedCards.length == 0 || processedCards[selectedCards[0]].rarity != processedCards[cardName].rarity) {
        combineBtn.button('more');
        push = true;
        selectedCards = [];
        selectedCardsAuc = [];
        selectedCards.push(cardName);
        selectedCardsAuc.push(cardAuc);
      } else if (selectedCards.length < 3) {
        if (selectedCards.length < 2 || processedCards[selectedCards[0]].rarity != 4) {
          selectedCards.push(cardName);
          selectedCardsAuc.push(cardAuc);
          push = true;
        }
        combineBtn.button('reset');
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

        li.append("<a href=\"javascript:void(0);\" data-card-auction=\""+cardAuc+"\" data-card-name=\""+cardName+"\" class=\""+rarityLabelMap[processedCards[cardName].rarity]+"\" style=\"font-size:10pt\">"+cardName+ (cardAuc?"":" *") +"</a>");
        cardSelectedBlock.append(li);
        li.find("a").on('click', function(evt){
          var $el = $(evt.target);
          var cardName = $el.attr('data-card-name');
          var cardAuction = $el.attr('data-card-auction') == "true";
          for (var i = 0; i < selectedCards.length; i++) {
            if (selectedCards[i] == cardName && selectedCardsAuc[i] == cardAuction) {
              selectedCards.splice(i, 1);
              selectedCardsAuc.splice(i, 1);
              break;
            }
          }
          $el.remove();
          updateChoseList(selectedCards, selectedCardsAuc);
        });

        updateChoseList(selectedCards, selectedCardsAuc);

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