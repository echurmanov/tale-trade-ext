

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

    var tableHeader = dialog.find("table>thead");
    tableHeader.append(`<tr>
<th>
<span style="float:left">Возвращать по: </span>
  <div class="btn-group btn-group-xs" role="group" data-toggle="buttons">
    <label class="btn btn-success active">
      <input type="radio" name="return-card" id="return-card-1" autocomplete="off" checked value="1">1
    </label>
    <label class="btn btn-success">
      <input type="radio" name="return-card" id="return-card-5" autocomplete="off" value="5">5
    </label>
    <label class="btn btn-success">
      <input type="radio" name="return-card" id="return-card-10" autocomplete="off" value="10">10
    </label>
  </div>
</th>
<th>
  <span style="float:left">Перемещать по: </span>
  <div class="btn-group btn-group-xs" role="group" data-toggle="buttons">
    <label class="btn btn-success active">
      <input type="radio" name="select-card" id="select-card-1" autocomplete="off" checked value="1">1
    </label>
    <label class="btn btn-success">
      <input type="radio" name="select-card" id="select-card-5" autocomplete="off" value="5">5
    </label>
    <label class="btn btn-success">
      <input type="radio" name="select-card" id="select-card-10" autocomplete="off" value="10">10
    </label>
  </div>
</th>
</tr>`);


    var selectPer = 1;
    var returnPer = 1;

    dialog.find("label.btn > input").parent().on('click', function(evt){
      var input = $(evt.target).find("input");
      input.trigger('click');
    });

    dialog.find("input[name=\"select-card\"]").on('change', function(evt){
      selectPer = $(evt.target).val();
    });

    dialog.find("input[name=\"return-card\"]").on('change', function(evt){
      returnPer = $(evt.target).val();
    });

    var cardChoicesBlock = dialog.find(".pgf-card-choices");
    var cardSelectedBlock = dialog.find(".pgf-cards-chosen");
    cardSelectedBlock.css({height: "200px"});
    var selectedCards = [];
    var selectedCardsAuc = [];

    var oldCombineBtn = dialog.find(".pgf-do-combine-cards");
    var combineBtn = $(document.createElement('button'));
    combineBtn.text(oldCombineBtn.text());
    var spanResult = $(document.createElement("span"));
    spanResult.css({"display": "block"});
    spanResult.html("Результат:");
    var spanResultCombine = $(document.createElement("div"));
    spanResultCombine.css({"margin-top": "15px", "max-height": "90px", "overflow-y": "auto"});
    oldCombineBtn.parent().append(spanResult);
    oldCombineBtn.parent().append(combineBtn);
    oldCombineBtn.parent().append(spanResultCombine);
    oldCombineBtn.remove();

    function resetCauldron () {
      cauldron = {
        raritiesNumber: {
          0: {
            auction: 0,
            notAuction: 0
          },
          1: {
            auction: 0,
            notAuction: 0
          },
          2: {
            auction: 0,
            notAuction: 0
          },
          3: {
            auction: 0,
            notAuction: 0
          },
          4: {
            auction: 0,
            notAuction: 0
          }
        },
        raritiesCards: {
          0: {},
          1: {},
          2: {},
          3: {},
          4: {}
        }
      };
    }

    var cauldron = {
      raritiesNumber: {
        0: {
          auction: 0,
          notAuction: 0
        },
        1: {
          auction: 0,
          notAuction: 0
        },
        2: {
          auction: 0,
          notAuction: 0
        },
        3: {
          auction: 0,
          notAuction: 0
        },
        4: {
          auction: 0,
          notAuction: 0
        }
      },
      raritiesCards: {
        0: {},
        1: {},
        2: {},
        3: {},
        4: {}
      }
    };

    combineBtn.addClass("btn");
    combineBtn.addClass("btn-success");
    combineBtn.css({"width": "100%"});
    combineBtn.attr('data-select-text', 'Выберите карты для объединия');
    combineBtn.attr('data-loading-text', 'Объединяю карты, ждите ...');

    var cardTooltipArgs = jQuery.extend({}, pgf.base.tooltipsArgs);
    cardTooltipArgs.placement = function(tip, element) {
      var offset = jQuery(element).offset();
      if (offset.left == 0 && offset.top == 0) {
        jQuery(tip).addClass('pgf-hidden');
      }
      return 'right';
    };

    combineBtn.button('select');

    var combineProcess = false;


    function rebuildChoseList() {
      var n = 0;
      cardChoicesBlock.find('li[data-original-title]').remove();
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
                li.append("<a href=\"javascript:void(0);\" data-card-number=\""+card.notAuctionNumber+"\" data-card-auction=\"false\" data-card-name=\""+cardName+"\" class=\""+rarityLabelMap[rarity]+"\" data-card-name=\""+cardName+"\" style=\"font-size:10pt\">"+cardName+" * ("+card.notAuctionNumber+")</a>");
                cardChoicesBlock.append(li);
                var tooltipClass = 'pgf-card-tooltip';
                var tooltip = pgf.game.widgets.CreateCardTooltip({
                  type: card.type,
                  rarity: card.rarity,
                  name: card.name,
                  auction: false
                }, tooltipClass);
                pgf.game.widgets.UpdateElementTooltip(li, tooltip, tooltipClass, cardTooltipArgs);
                n++;
              }
              if (card.auctionNumber > 0) {
                var li = $(document.createElement('li'));
                li.attr('data-original-title','');
                li.addClass(n%2==0?'odd':'even');
                li.append("<a href=\"javascript:void(0);\" data-card-number=\""+card.auctionNumber+"\" data-card-auction=\"true\" data-card-name=\""+cardName+"\" class=\""+rarityLabelMap[rarity]+"\" data-card-name=\""+cardName+"\" style=\"font-size:10pt\">"+cardName+" ("+card.auctionNumber+")</a>");
                cardChoicesBlock.append(li);
                var tooltipClass = 'pgf-card-tooltip';
                var tooltip = pgf.game.widgets.CreateCardTooltip({
                  type: card.type,
                  rarity: card.rarity,
                  name: card.name,
                  auction: true
                }, tooltipClass);
                pgf.game.widgets.UpdateElementTooltip(li, tooltip, tooltipClass, cardTooltipArgs);
                n++;
              }
            }
          }
        }
      }

      cardChoicesBlock.find('a').on('click', function(e){
        if (combineProcess) {
          return;
        }

        var move = selectPer;

        var cardLink = $(e.target);
        var cardInfo = processedCards[cardLink.data('card-name')];
        var cardAuction = cardLink.data('card-auction');

        if (cardAuction) {
          if (typeof cauldron.raritiesCards[cardInfo.rarity][cardInfo.name] == 'undefined') {
            cauldron.raritiesCards[cardInfo.rarity][cardInfo.name] = {auction: 0, notAuction: 0};
          }
          if (cauldron.raritiesCards[cardInfo.rarity][cardInfo.name].auction >= cardInfo.auctionNumber) {
            return;
          }

          move = Math.min(move, cardInfo.auctionNumber - cauldron.raritiesCards[cardInfo.rarity][cardInfo.name].auction);

          cauldron.raritiesNumber[cardInfo.rarity].auction += move;
          cauldron.raritiesCards[cardInfo.rarity][cardInfo.name].auction += move;

          cardLink.text(cardLink.data('card-name') + " ("+(cardInfo.auctionNumber - cauldron.raritiesCards[cardInfo.rarity][cardInfo.name].auction)+")");
        } else {
          if (typeof cauldron.raritiesCards[cardInfo.rarity][cardInfo.name] == 'undefined') {
            cauldron.raritiesCards[cardInfo.rarity][cardInfo.name] = {auction: 0, notAuction: 0};
          }
          if (cauldron.raritiesCards[cardInfo.rarity][cardInfo.name].notAuction >= cardInfo.notAuctionNumber) {
            return;
          }

          move = Math.min(move, cardInfo.notAuctionNumber - cauldron.raritiesCards[cardInfo.rarity][cardInfo.name].notAuction);

          cauldron.raritiesNumber[cardInfo.rarity].notAuction += move;
          cauldron.raritiesCards[cardInfo.rarity][cardInfo.name].notAuction += move;

          cardLink.text(cardLink.data('card-name') + " * ("+(cardInfo.notAuctionNumber - cauldron.raritiesCards[cardInfo.rarity][cardInfo.name].notAuction)+")");
        }

        updateChoseList(cauldron);
      });
    }

    combineBtn.on('click', function(){
      if (combineProcess) {
        return;
      }

      var combineSize = 3;

      combineBtn.button('loading');
      combineProcess = true;

      var rarity, cardName;

      var combineRarityPool;
      var combineSchedule = [];
      var combineBlock;
      var combineAuction;
      var rarityCombineSize;

      for (rarity in cauldron.raritiesCards) {
        rarityCombineSize = rarity==4?2:combineSize;
        combineRarityPool = [];
        for (var stage = 0; stage < 2; stage++) {
          combineAuction = stage == 0;
          for (cardName in cauldron.raritiesCards[rarity]) {
            if (combineAuction) {
              combineRarityPool = combineRarityPool.concat(processedCards[cardName].auctionUids.slice(0, cauldron.raritiesCards[rarity][cardName].auction));
            } else {
              combineRarityPool = combineRarityPool.concat(processedCards[cardName].notAuctionUids.slice(0, cauldron.raritiesCards[rarity][cardName].notAuction));
            }
          }
          combineBlock = [];
          while (combineRarityPool.length + combineBlock.length >= rarityCombineSize) {
            combineBlock.push(combineRarityPool.pop());
            if (combineBlock.length == rarityCombineSize) {
              combineSchedule.push(combineBlock);
              combineBlock = [];
            }
          }
        }
      }


      function checkStatus(url) {
        $.ajax({
          url: url,
          type: "get",
          success: function (res) {
            if (res.status == "ok") {
              if (res.data.card_ui_info) {
                var rawCards = res.data.card_ui_info;
                cardsIdMap[rawCards.uid] = rawCards;
                if (typeof processedCards[rawCards.name] == 'undefined') {
                  processedCards[rawCards.name] = {
                    auctionNumber: 0,
                    notAuctionNumber: 0,
                    name: rawCards.name,
                    rarity: rawCards.rarity,
                    type: rawCards.type,
                    auctionUids: [],
                    notAuctionUids: []
                  }
                }
                if (rawCards.auction) {
                  processedCards[rawCards.name].auctionNumber++;
                  processedCards[rawCards.name].auctionUids.push(rawCards.uid);
                } else {
                  processedCards[rawCards.name].notAuctionNumber++;
                  processedCards[rawCards.name].notAuctionUids.push(rawCards.uid);
                }
                var firstDiv = spanResultCombine.find('div:nth-child(1)');
                var cardLabel = "<span class=\""+rarityLabelMap[rawCards.rarity]+"\">"+rawCards.name+(rawCards.auction?"":" *")+"</span>";
                firstDiv.html(firstDiv.html().replace("...", cardLabel));
                var spans = firstDiv.find("span");
                var lastSpan = $(spans[spans.length-1]);

                var tooltipClass = 'pgf-card-tooltip';
                var tooltip = pgf.game.widgets.CreateCardTooltip({
                  type: rawCards.type,
                  rarity: rawCards.rarity,
                  name: rawCards.name,
                  auction: rawCards.auction
                }, tooltipClass);
                pgf.game.widgets.UpdateElementTooltip(lastSpan, tooltip, tooltipClass, cardTooltipArgs);
              }

              if (combineSchedule.length > 0) {
                combineNext();
              } else {
                combineProcess = false;
                resetCauldron();
                rebuildChoseList();
                updateChoseList(cauldron);
              }
            } else if (res.status == 'processing') {
              setTimeout(function () {
                checkStatus(res.status_url);
              }, 400);
            } else if (res.status == 'error') {
              combineProcess = false;
              updateCards();
              resetCauldron();
              rebuildChoseList();
              updateChoseList(cauldron);
              var firstDiv = spanResultCombine.find('div:nth-child(1)');
              firstDiv.html(firstDiv.html().replace("...", "Ошибка: " + JSON.stringify(res)));
            }
          }
        });
      }

      function combineNext() {
        var combineBlock = combineSchedule.shift();
        var combineCardsLabels = [];

        for (var i = 0; i < combineBlock.length; i++) {
          combineCardsLabels.push("<span class=\""+rarityLabelMap[cardsIdMap[combineBlock[i]].rarity]+"\">"
            + cardsIdMap[combineBlock[i]].name + (cardsIdMap[combineBlock[i]].auction?"":"*")
            + "</span>"
          );
        }

        $.ajax({
          url: "/game/cards/api/combine?api_version=1.0&api_client=CrazyNigerTTE-0.3.5&cards=" + combineBlock.join(','),
          type: "post",
          method: "post",
          data: {},
          success: function(res) {
            if (res.status == 'processing') {
              for (var i = 0; i < combineBlock.length; i++) {
                var card = cardsIdMap[combineBlock[i]];
                var cardInfo = processedCards[card.name];
                if (card.auction) {
                  cardInfo.auctionUids.splice(cardInfo.auctionUids.indexOf(card.uid),1);
                  cardInfo.auctionNumber = cardInfo.auctionUids.length;
                } else {
                  cardInfo.notAuctionUids.splice(cardInfo.notAuctionUids.indexOf(card.uid),1);
                  cardInfo.notAuctionNumber = cardInfo.notAuctionUids.length;
                }
              }


              spanResultCombine.prepend("<div>"+combineCardsLabels.join(" + ") + " = ...</div>");
              setTimeout(function(){
                checkStatus(res.status_url);
              }, 200);
            } else {
              combineBtn.button('select');
              combineProcess = false;
              resetCauldron();
              rebuildChoseList();
              updateChoseList(cauldron);
              spanResultCombine.html("<strong>Ошибка:</strong> " + res.error);
            }

          },
          error: function(res) {
            combineProcess = false;
            combineBtn.button('select');
            cardSelectedBlock.find("li[data-original-title]").remove();
            resetCauldron();
            updateChoseList(cauldron);
          }
        });
      }

      spanResultCombine.html("");
      combineNext();
    });

    rebuildChoseList();
    var n = 0;


    function updateChoseList(cauldron, combineNumber) {
      if (typeof combineNumber == 'undefined') {
        combineNumber = 3;
      }
      var totalInRarity, totalResultInRarity, accountInRarity;
      var resultRarity, rarity;
      var results = {
        0: {
          auction: 0,
          notAuction: 0
        },
        1: {
          auction: 0,
          notAuction: 0
        },
        2: {
          auction: 0,
          notAuction: 0
        },
        3: {
          auction: 0,
          notAuction: 0
        },
        4: {
          auction: 0,
          notAuction: 0
        }
      };
      for (rarity in cauldron.raritiesNumber) {
        totalInRarity = cauldron.raritiesNumber[rarity].auction + cauldron.raritiesNumber[rarity].notAuction;
        totalResultInRarity = Math.floor(totalInRarity / ((rarity == 4)?2:combineNumber));
        accountInRarity = Math.floor(cauldron.raritiesNumber[rarity].auction / ((rarity == 4)?2:combineNumber));

        resultRarity = ((rarity == 4 || combineNumber==2)?rarity:(1*rarity + 1*1));

        results[resultRarity].auction += accountInRarity;
        results[resultRarity].notAuction += totalResultInRarity - accountInRarity;
      }

      var resultLabels = [];

      for (var r in results) {
        if (results[r].auction > 0) {
          resultLabels.push("<span class=\""+rarityLabelMap[r]+"\">продаваемая "+rarityNameMap[r]+" x"+results[r].auction+"</span>");
        }
        if (results[r].notAuction > 0) {
          resultLabels.push("<span class=\""+rarityLabelMap[r]+"\">не продаваемая "+rarityNameMap[r]+" x"+results[r].notAuction+"</span>");
        }
      }

      if (resultLabels.length != 0) {
        combineBtn.button('reset');
      } else {
        combineBtn.button('select');
      }

      spanResult.html("Результат: " + resultLabels.join(", "));

      var cardName, li, card, cauldronCard;

      cardSelectedBlock.find('li[data-original-title]').remove();

      for (rarity in cauldron.raritiesCards) {
        for (cardName in cauldron.raritiesCards[rarity]) {
          card = processedCards[cardName];
          cauldronCard = cauldron.raritiesCards[rarity][cardName];
          if (cauldronCard.auction > 0) {
            li = $(document.createElement('li'));
            li.attr('data-original-title','');
            li.append("<a href=\"javascript:void(0);\" class=\""+rarityLabelMap[rarity]+"\"  data-card-auction=\"true\" data-card-name=\""+cardName+"\" style=\"font-size:10pt\">"+cardName+" ("+cauldronCard.auction+")</a>");
            var tooltipClass = 'pgf-card-tooltip';
            var tooltip = pgf.game.widgets.CreateCardTooltip({
              type: card.type,
              rarity: card.rarity,
              name: card.name,
              auction: true
            }, tooltipClass);
            pgf.game.widgets.UpdateElementTooltip(li, tooltip, tooltipClass, cardTooltipArgs);
            cardSelectedBlock.append(li);
          }
          if (cauldronCard.notAuction > 0) {
            li = $(document.createElement('li'));
            li.attr('data-original-title','');
            li.append("<a href=\"javascript:void(0);\" class=\""+rarityLabelMap[rarity]+"\" data-card-auction=\"false\" data-card-name=\""+cardName+"\" style=\"font-size:10pt\">"+cardName+" * ("+cauldronCard.notAuction+")</a>");
            var tooltipClass = 'pgf-card-tooltip';
            var tooltip = pgf.game.widgets.CreateCardTooltip({
              type: card.type,
              rarity: card.rarity,
              name: card.name,
              auction: false
            }, tooltipClass);
            pgf.game.widgets.UpdateElementTooltip(li, tooltip, tooltipClass, cardTooltipArgs);
            cardSelectedBlock.append(li);
          }
        }
      }

      var links = cardSelectedBlock.find("a");
      links.on('click', function(e){
        if (combineProcess) {
          return;
        }
        var $link = $(e.target);
        var cardName = $link.data('card-name');
        var cardAuction = $link.data('card-auction');
        var cardRarity = processedCards[cardName].rarity;

        var cardLeft = 0;

        var move = returnPer;

        if (cardAuction) {
          move = Math.min(move, cauldron.raritiesCards[cardRarity][cardName].auction);
          cauldron.raritiesNumber[cardRarity].auction -= move;
          cauldron.raritiesCards[cardRarity][cardName].auction -= move;

          cardLeft = processedCards[cardName].auctionNumber - cauldron.raritiesCards[cardRarity][cardName].auction;
        } else {
          move = Math.min(move, cauldron.raritiesCards[cardRarity][cardName].notAuction);
          cauldron.raritiesNumber[cardRarity].notAuction -= move;
          cauldron.raritiesCards[cardRarity][cardName].notAuction -= move;
          cardLeft = processedCards[cardName].notAuctionNumber - cauldron.raritiesCards[cardRarity][cardName].notAuction;
        }

        var $a = cardChoicesBlock.find("a[data-card-name=\""+cardName+"\"][data-card-auction="+cardAuction+"]");
        $a.text(cardName + (cardAuction?"":" *") +" ("+cardLeft+")");

        updateChoseList(cauldron);
      });
    }

  };

  var cardsIdMap = {};

  var _instance = null;

  function updateCards()
  {
    var rawCards = _instance.GetCards();
    processedCards = {};
    cardsIdMap = {};
    if (rawCards) {
      for (var i = 0; i < rawCards.length; i++) {
        cardsIdMap[rawCards[i].uid] = rawCards[i];
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
  }

  function modifiedShowCards(container, filterUIDs) {
    _instance = this;
    updateCards();

    var n = 0;
    var cardTooltipArgs = jQuery.extend({}, pgf.base.tooltipsArgs);
    cardTooltipArgs.placement = function(tip, element) {
      var offset = jQuery(element).offset();
      if (offset.left == 0 && offset.top == 0) {
        jQuery(tip).addClass('pgf-hidden');
      }
      return 'right';
    };

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
            var tooltipClass = 'pgf-card-tooltip';
            var tooltip = pgf.game.widgets.CreateCardTooltip({
              type: card.type,
              rarity: card.rarity,
              name: card.name,
              auction: card.auctionNumber > 0
            }, tooltipClass);
            pgf.game.widgets.UpdateElementTooltip(li, tooltip, tooltipClass, cardTooltipArgs);
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