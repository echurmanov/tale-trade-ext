var rarities = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary'
];

function incomingMessage(message) {
  console.log(message);
  switch (message.message) {
    case "market-stat":
      syncMarketTable(message.data);
      break;
  }
}

function valuesToArray(obj) {
  return Object.keys(obj).map(function (key) { return obj[key]; });
}

function getMinPriceLot(prevValue, currentValue) {
  if (typeof prevValue == 'undefined' || prevValue.price > currentValue.price) {
    return currentValue;
  }
  return prevValue;
}

function syncMarketTable(data) {
  var cardsArray = valuesToArray(data);
  var blockedCards = cardsArray.sort(function(a,b){
    if (rarities.indexOf(a.rarity) > rarities.indexOf(b.rarity)) {
      return 1
    } else if (rarities.indexOf(a.rarity) < rarities.indexOf(b.rarity)) {
      return -1
    } else {
      if (a.cardName > b.cardName) {
        return 1;
      } else {
        return -1;
      }
    }
  });

  var table = $("#new-market-table");

  blockedCards.forEach(function(lot, idx){
    console.log(lot);
    var currentEl = $("#new-market-table > tr[data-card=\""+lot.cardName+"\"]");
    var quickLotId = lot.lots.reduce(getMinPriceLot);
    if (currentEl.length > 0) {

    } else {
      currentEl = $(`<tr data-card="${lot.cardName}">
  <td><span class="${lot.rarity}-card-label" style="cursor: pointer;" data-toggle="tooltip" title="${lot.description}">${lot.cardName}</span></td>
  <td>${lot.lots.length}</td>
  <td><span style="cursor: pointer;" data-toggle="tooltip" title="от ${lot.minPrice} до ${lot.maxPrice}, средняя: ${lot.avgPrice}">от ${lot.minPrice}</span>
  </td>
  <td>
  <a href="/market/${quickLotId.lotId}/purchase" class="btn btn-success pgf-purchase-lot" data-loading-text="Обработка..." data-dialog-id="pgf-purchase-dialog-${quickLotId}" data-success-message="Поздравляем! Вы успешно приобрели «${lot.cardName}»!">купить по минимальной цене</a>
  </td></tr>
`);
      table.append(currentEl);
    }

  });

  table.find('[data-toggle="tooltip"]').tooltip();


  var inject = `
  console.log(API_CLIENT);
  console.log($.ajaxSetup());
  console.log("Inject");
  var links = $('a.pgf-purchase-lot');
  links.off('click');
  links.on('click', function(evt){
    evt.preventDefault();
    var $el = $(evt.currentTarget);
    $el.button('loading');
    $.ajax({
      url: $el.attr('href'),
      type: "post",
      success: function(res) {
        function checkProcess(){
          $.ajax({
            url: res.status_url,
            type: 'get',
            success: function(res){
                console.log("Status", res);
                if (res.status != "processing") {
                    $el.button('reset');
                    if (res.status == "ok") {
                      pgf.ui.dialog.Alert({
                        message: $el.attr("data-success-message"),
                        title: 'Покупка прошла успешно',
                      });
                    } else {
                      pgf.ui.dialog.Create({fromString: "Ошибка"});
                    }
                } else {
                  setTimeout(checkProcess, 300);
                }
            }
          });
        }
        setTimeout(checkProcess,500);
      },
      error: function(res) {
        console.log("error",res);
        $el.button('reset');
      }
    });
  });
  `;

  var s = document.createElement("script");
  s.innerHTML = inject;
  document.body.appendChild(s);
}




function removeOriginalTable() {
  $("#pgf-help-accordion").html("<table id=\"new-market-table\" class=\"table\"></table>");
  var marketTable = $("#new-market-table");
  marketTable.append(`<thead>
  <tr>
    <th>название</th>
    <th width="100">количество</th>
    <th width="100">цены</th>
    <th width="200">операции</th>
  </tr>
</thead>`);
}


function initConnection(){
  var ws = new WebSocket("ws://localhost:3005/");
  var pingInterval = null;

  ws.addEventListener('open', function(evt){
    console.log("Open WS connection");

    pingInterval = setInterval(function(){
      ws.send("ping");
    }, 30000);

    ws.addEventListener('close', function(evt){
      console.log("Lost connection, try reconnect");
      clearInterval(pingInterval);
      setTimeout(function(){
        initConnection();
      }, 10000);
    });

    ws.addEventListener("message", function(evt){
      var message;
      try {
        message = JSON.parse(evt.data);
      } catch (e) {
        console.error(e);
        return;
      }
      incomingMessage(message);
    });
    ws.send("get-stats");
  });

}

(function(){
  removeOriginalTable();
  initConnection();
})();
