
function inject() {
    pgf.game.widgets.CARDS_TRANSFORMATOR_DIALOG = `
<div class="modal hide">

  <div class="modal-header">
    <button type="button" class="close" data-dismiss="modal">×</button>
    <h3 class="pgf-dialog-title dialog-title">Превращение карт</h3>
  </div>

  <div class="modal-body">
    <div class="accordion"id="tte-card-combine-block">
        <div class="accordion-group">
            <div class="accordion-heading">
                <a href="#tte-card-combine-info" class="accordion-toggle" data-toggle="collapse" data-parent="#tte-card-combine-block">
                    Карты можно превращать друг в друга.
                </a>
            </div>
            <div id="tte-card-combine-info"  class="accordion-body collapse">
                <div class="accordion-inner">
                    <ul>
                        <li>Одна карта превращается в случайную карту меньшей редкости.</li>
                        <li>Две карты одной редкости превращаются в случайную карту той же редкости.</li>
                        <li>Три карты одной редкости превращаются в случайную карту большей редкости.</li>
                        <li>Часть карт можно превращать по особым правилам, указанным в описании карт.</li>
                        <li>Если всеми превращаемыми картами можно торговать на рынке, то и новой картой можно будет торговать на рынке.</li>
                        <li>Первыми в обмен отправляются непродаваемые карты.</li>
                        <li>Первыми из обмена забираются продаваемые карты.</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="accordion-group">
            <div class="accordion-heading">
                <a href="#tte-card-combine-settings" class="accordion-toggle"  data-toggle="collapse" data-parent="#tte-card-combine-block">
                    Настройки объеденения
                </a>
            </div>
            <div id="tte-card-combine-settings"  class="accordion-body collapse in">
                <div class="accordion-inner">
                    <div class="row">
                        <div class="span3">
                        <form class="" id="tte-card-combine-settings-form">
                            <div class="control-group">
                                <label class="control-label">Объеденять группами: </label>
                                <div class="control inline">
                                    <label class="radio inline">
                                      <input type="radio"  value="1" name="group-size"> по 1
                                    </label>
                                    <label class="radio inline">
                                      <input type="radio"  value="2" name="group-size"> по 2
                                    </label>
                                    <label class="radio inline">
                                      <input type="radio"  value="3" name="group-size" checked> по 3
                                    </label>
                                </div>
                            </div>
                            <div class="control-group">
                                <label class="control-label">Карты одного типа: </label>
                                <div class="control inline">
                                    <label class="radio inline">
                                      <input type="radio" value="combine" name="same-type" checked> объеденять
                                    </label>
                                    <label class="radio inline">
                                      <input type="radio" value="not-combine" name="same-type" > НЕ объеденять
                                    </label>
                                </div>
                            </div>
                        </form>
                        </div>
                        <div class="span2">
                            <p>Текст</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <table width="100%">
      <thead>
        <tr>
          <th colspan="2">Карты для превращения</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td width="80%">
            <ul class="pgf-cards-in-transformator pgf-scrollable unstyled" style="height: 60px; overflow-y: auto;">
              <li class="pgf-template">
                <a href="#"
                   class="pgf-card-link"
                   style="font-size: 10pt;">
                   <span class="pgf-number" style="color: black;">1</span> x <span class="pgf-card-record"></span>
                </a>
              </li>
            </div>
          </td>
          <td style="vertical-align: middle;">
            <button class="pgf-transform-button pgf-disabled disabled btn btn-large btn-success" type="button">Превратить</button>
          </td>
        </tr>
      </tbody>
    </table>


    <table width="100%">
      <thead>
        <tr>
          <th>Карты в руке</th>
          <th width="50%">Карты в хранилище</th>
        </tr>

      </thead>
        <tr>
          <td colspan="2" >
            <div class="btn-group" style="display:flex; justify-content:center;" data-toggle="buttons-radio" id="tte-move-card-block-size">
              <button type="button" class="btn btn-primary active" data-number="1">1</button>
              <button type="button" class="btn btn-primary" data-number="2">2</button>
              <button type="button" class="btn btn-primary" data-number="3">3</button>
              <button type="button" class="btn btn-primary" data-number="6">6</button>
              <button type="button" class="btn btn-primary" data-number="10">10</button>
            </div>
          </td>
        </tr>
        <tr>
          <td style="vertical-align: top;">
            <ul class="pgf-cards-in-hand pgf-scrollable unstyled" style="height: 200px; overflow-y: auto;">
              <li class="pgf-template">
                <a href="#"
                   class="pgf-card-link"
                   style="font-size: 10pt;">
                   <span class="pgf-number" style="color: black;">1</span> x <span class="pgf-card-record"></span>
                </a>
              </li>
            </ul>
          </td>
          <td style="vertical-align: top;">
            <ul class="pgf-cards-in-storage pgf-scrollable unstyled" style="height: 200px; overflow-y: auto;">
              <li class="pgf-template">
                <a href="#"
                   class="pgf-card-link"
                   style="font-size: 10pt;">
                   <span class="pgf-number" style="color: black;">1</span> x <span class="pgf-card-record"></span>
                </a>
              </li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>

  </div>

</div>
`;

  pgf.game.widgets.Cards = function (params) {

    var instance = this;

    instance.data = {cards: {},
      hand: [],
      storage: [],
      transformator: [],
      cardsInTransformator: []};

    var localVersion = 0;
    var firstRequest = true;

    function Refresh() {
      instance.data.hand = [];
      instance.data.storage = [];
      instance.data.transformator = [];

      for (var i in instance.data.cards) {
        var card = instance.data.cards[i];

        if (jQuery.inArray(card.uid, instance.data.cardsInTransformator) != -1) {
          instance.data.transformator.push(card)
          continue;
        }

        if (card.in_storage) {
          instance.data.storage.push(card);
        }
        else {
          instance.data.hand.push(card);
        }
      }
    }

    this.GetCards = function() {

      var requestedVersion = localVersion + 1;

      jQuery.ajax({
        dataType: 'json',
        type: 'get',
        url: params.getItems,

        success: function(data, request, status) {

          if (requestedVersion <= localVersion) {
            instance.GetCards();
            return;
          }

          localVersion = requestedVersion;

          var oldKeys = [];
          var newKeys = [];

          for (var uid in instance.data.cards)  {
            oldKeys.push(uid);
          }

          for (var i in data.data.cards) {
            var card = data.data.cards[i];
            newKeys.push(card.uid);
          }

          oldKeys.sort();
          newKeys.sort();

          var cardsChanged = !(JSON.stringify(oldKeys) == JSON.stringify(newKeys));

          instance.data.cards = {}

          for (var i in data.data.cards) {
            var card = data.data.cards[i];
            instance.data.cards[card.uid] = card;
          }

          if (cardsChanged || firstRequest) {
            Refresh();
            jQuery(document).trigger(pgf.game.events.CARDS_REFRESHED);
          }

          firstRequest = false;
        },
        error: function() {
        },
        complete: function() {
        }
      });
    };

    this.GetCard = function() {
      pgf.forms.Post({ action: params.getCard,
        OnSuccess: function(data){
          jQuery(document).trigger(pgf.game.events.CARDS_REFRESHED);

          instance.GetCards();

          pgf.ui.dialog.Alert({message: data.data.message,
            title: 'Вы получаете новую карту!',
            OnOk: function(e){}});
          return;
        }
      });
    };

    this.RenderHand = function(widget) {
      var cards = pgf.game.widgets.PrepairCardsRenderSequence(instance.data.hand);
      pgf.base.RenderTemplateList(widget, cards, pgf.game.widgets.RenderCard, {});
    };

    this.RenderStorage = function(widget) {
      var cards = pgf.game.widgets.PrepairCardsRenderSequence(instance.data.storage);
      pgf.base.RenderTemplateList(widget, cards, pgf.game.widgets.RenderCard, {});
    };

    this.RenderTransformator = function(widget) {
      var cards = pgf.game.widgets.PrepairCardsRenderSequence(instance.data.transformator);
      pgf.base.RenderTemplateList(widget, cards, pgf.game.widgets.RenderCard, {});
    };

    this.HasCardsInHand = function() {return instance.data.hand.length > 0;};

    this.CanTransform = function() {
      if (instance.BuildTransformPlan().length == 0) return false;

      return true;
    }

    this.BuildTransformPlan = function () {
      console.log(instance.data.transformator);
      var i, j, card, targetGroup;
      var combinePlane = [];
      var candidateGroups = [];
      var form = $("#tte-card-combine-settings-form").serializeArray().reduce(
        function(prev, el) {
          prev[el.name] = el.value;
          return prev;
        },
        {}
      );
      console.log(form);
      var groupSize = 1 * form['group-size'];
      for (i = 0; i < instance.data.transformator.length; i++) {
          card = instance.data.transformator[i];
          targetGroup = null;
          for (j = 0; j < candidateGroups.length && targetGroup === null; j++) {
            if (form['same-type'] === 'combine') {
              if (candidateGroups[j][0].full_type === card.full_type) {
                targetGroup = candidateGroups[j];
              }
            } else if (form['same-type'] === 'not-combine'){
              if (candidateGroups[j].length == 2 || candidateGroups[j][0].full_type !== card.full_type) {
                targetGroup = candidateGroups[j];
              }
            }
          }

          if (targetGroup === null) {
              targetGroup = [];
              candidateGroups.push(targetGroup);
          }
          targetGroup.push(card);
          if (targetGroup.length === groupSize) {
              if (targetGroup.length === 1 && card.rarity === 0) {
                  continue;
              }
              combinePlane.push(targetGroup);
              candidateGroups.splice(candidateGroups.indexOf(targetGroup), 1);
          }
      }
      console.log("PLane", combinePlane);
      return combinePlane;
    };

    this.OpenStorageDialog = function() {
      pgf.ui.dialog.Create({ fromString: pgf.game.widgets.CARDS_STORAGE_DIALOG,
        OnOpen: function(dialog) {
          pgf.game.CardsStorageDialog(dialog, instance);
        }
      });
    };

    this.OpenTransformatorDialog = function() {
      pgf.ui.dialog.Create({ fromString: pgf.game.widgets.CARDS_TRANSFORMATOR_DIALOG,
        OnOpen: function(dialog) {
          pgf.game.CardsTransformatorDialog(dialog, instance);
        }
      });
    };

    var ChangeStorage = function(cardsIds, inStorage, url, errorMessage) {
      localVersion += 1;

      data = new FormData();

      for (var i in cardsIds) {
        var card = instance.data.cards[cardsIds[i]];
        card.in_storage = inStorage;
        data.append('card', card.uid);
      }

      function Undo(message) {
        localVersion += 1;

        for (var i in cardsIds) {
          instance.data.cards[cardsIds[i]].in_storage = false;
        }

        pgf.ui.dialog.Error({message: message});

        Refresh();

        jQuery(document).trigger(pgf.game.events.CARDS_REFRESHED);
      }

      jQuery.ajax({
        dataType: 'json',
        type: 'post',
        url: url,
        data: data,
        contentType: false,
        processData: false,
        success: function(data, request, status) {
          if (data.status == 'error') {
            Undo(data.error);
            return;
          }

          localVersion += 1;
        },
        error: function() {
          Undo(errorMessage);
        }
      });

      Refresh();

      jQuery(document).trigger(pgf.game.events.CARDS_REFRESHED);
    };

    this.ToStorage = function(cardsIds) {
      ChangeStorage(cardsIds,
        true,
        params.moveToStorage,
        'Неизвестная ошибка при перемещении карт в хранилище. Пожалуйста, обновите страницу.');
    };

    this.ToHand = function(cardsIds) {
      ChangeStorage(cardsIds,
        false,
        params.moveToHand,
        'Неизвестная ошибка при перемещении карт в руку. Пожалуйста, обновите страницу.');
    };

    this.ToTransformator = function(cardId) {
      if (jQuery.inArray(cardId, instance.data.cardsInTransformator) != -1) {
        return;
      }

      instance.data.cardsInTransformator.push(cardId);

      Refresh();
    };

    this.FromTransformator = function(cardId) {
      if (jQuery.inArray(cardId, instance.data.cardsInTransformator) == -1) {
        return;
      }

      instance.data.cardsInTransformator.splice(instance.data.cardsInTransformator.indexOf(cardId), 1)

      Refresh();
    };

    this.Transform = function() {
      if (!instance.CanTransform()) return;

      localVersion += 1;

      data = new FormData();

      var ids = [];

      for (var i in instance.data.transformator) {
        var card = instance.data.transformator[i];
        ids.push(card.uid);
        data.append('card', card.uid);
      }

      pgf.ui.dialog.wait('start');

      jQuery.ajax({
        dataType: 'json',
        type: 'post',
        url: params.transformItems,
        data: data,
        contentType: false,
        processData: false,

        success: function(data, request, status) {
          if (data.status == 'error') {
            pgf.ui.dialog.wait('stop', stopCallback=function(){
              pgf.ui.dialog.Error({message: data.error});
            });
            return;
          }

          pgf.ui.dialog.wait('stop', stopCallback=function() {
            for (var i in ids) {
              var id = ids[i];
              delete instance.data.cards[id];
            }

            localVersion += 1;

            instance.data.cards[data.data.card.uid] = data.data.card;

            pgf.ui.dialog.Alert({message: data.data.message,
              title: 'Превращение прошло успешно'});

            Refresh();

            jQuery(document).trigger(pgf.game.events.CARDS_REFRESHED);
          });
        },
        error: function() {
          pgf.ui.dialog.wait('stop', stopCallback=function(){
            pgf.ui.dialog.Error({message: 'Неизвестная ошибка при превращении карт. Пожалуйста, перезагрузите страницу.'});
          });
        },
        complete: function() {
        }
      });
    };

    this.DeleteCard = function(cardId) {
      localVersion += 1;
      delete instance.data.cards[cardId];
    };

    this.Use = function(cardId) {
      localVersion += 1;
      pgf.ui.dialog.Create({ fromUrl: params.useCardDialog + '?card=' + cardId,
        OnOpen: function(dialog) {
          var cardForm = new pgf.forms.Form(jQuery('.pgf-use-card-form', dialog),
            { OnSuccess: function(form, data) {
              jQuery(document).trigger(pgf.game.events.DATA_REFRESH_NEEDED);

              instance.DeleteCard(cardId);

              Refresh();

              jQuery(document).trigger(pgf.game.events.CARDS_REFRESHED);

              dialog.modal('hide');

              if (data.data.message) {
                pgf.ui.dialog.Alert({message: data.data.message,
                  title: 'Карта использована',
                  OnOk: function(e){}});
              }
            }});
        }
      });
    }

    this.GetCards();
  };

  pgf.game.CardsTransformatorDialog = function(dialog, cardsWidget) {

    var instance = this;

    var handWidget = jQuery('.pgf-cards-in-hand', dialog);
    var storageWidget = jQuery('.pgf-cards-in-storage', dialog);
    var transformatorWidget = jQuery('.pgf-cards-in-transformator', dialog);
    var transformButton = jQuery('.pgf-transform-button', dialog)

    function Initialize() {
      cardsWidget.RenderHand(handWidget);
      cardsWidget.RenderStorage(storageWidget);
      cardsWidget.RenderTransformator(transformatorWidget);
      transformButton.toggleClass('pgf-disabled disabled', !cardsWidget.CanTransform())

      jQuery('.pgf-card-link', handWidget).off().click(function(e){
        e.preventDefault();
        e.stopPropagation();

        var ids = jQuery('.pgf-card-record', e.currentTarget).data('ids');

        var stackSize = $("#tte-move-card-block-size>.active").data('number') || 1;

        do {
          var id = ids.pop();
          if (id) {
            cardsWidget.ToTransformator(id);
          }
          stackSize--;
        } while (id && stackSize > 0);

        Initialize();
      });

      jQuery('.pgf-card-link', storageWidget).off().click(function(e){
        e.preventDefault();
        e.stopPropagation();

        var ids = jQuery('.pgf-card-record', e.currentTarget).data('ids');

        var stackSize = $("#tte-move-card-block-size>.active").data('number') || 1;

        do {
          var id = ids.pop();
          if (id) {
            cardsWidget.ToTransformator(id);
          }
          stackSize--;
        } while (id && stackSize > 0);

        Initialize();
      });

      jQuery('.pgf-card-link', transformatorWidget).off().click(function(e){
        e.preventDefault();
        e.stopPropagation();

        var ids = jQuery('.pgf-card-record', e.currentTarget).data('ids');


        var stackSize = $("#tte-move-card-block-size>.active").data('number') || 1;

        do {
          var id = ids.pop();
          if (id) {
            cardsWidget.FromTransformator(id);
          }
          stackSize--;
        } while (id && stackSize > 0);

        Initialize();
      });

      transformButton.off().click(function(e) {
        e.preventDefault();
        e.stopPropagation();

        cardsWidget.Transform();

        Initialize();
      });
    }

    jQuery(document).bind(pgf.game.events.CARDS_REFRESHED, function(e, diary){
      Initialize();
    });

    Initialize();
  };

  widgets.cards = new pgf.game.widgets.Cards({getItems: "/game/cards/api/get-cards?api_client=the_tale-v0.3.25.4&api_version=2.0",
    getCard: "/game/cards/api/get?api_client=the_tale-v0.3.25.4&api_version=2.0",
    transformItems: "/game/cards/api/combine?api_client=the_tale-v0.3.25.4&api_version=2.0",
    moveToStorage: "/game/cards/api/move-to-storage?api_client=the_tale-v0.3.25.4&api_version=2.0",
    moveToHand: "/game/cards/api/move-to-hand?api_client=the_tale-v0.3.25.4&api_version=2.0",
    useCardDialog: "/game/cards/use-dialog"});
}

setTimeout(() => {
    const injectScript = document.createElement("script");
    const code = document.createTextNode(inject.toString() + ';inject();');
    injectScript.appendChild(code);
    document.body.appendChild(injectScript);

}, 100);
