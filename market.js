function addCols(data) {
  var monthExists = false;
  var allExists = false;
  var result = '';
  if (typeof data !== 'undefined')
  {
    monthExists = (typeof data['month'] !== 'undefined');
    allExists = (typeof data['all'] !== 'undefined');
    result = "<td >"+(monthExists?data['month']['total']:0)+" \/ "+(allExists?data['all']['total']:"???")+"</td>";
    result += "<td >"+(monthExists?data['month']['max']:"")+" \/ "+(allExists?data['all']['max']:"???")+"</td>";
    result += "<td >"+(monthExists?data['month']['min']:"")+" \/ "+(allExists?data['all']['min']:"???")+"</td>";
    result += "<td >"+(monthExists?Math.round(data['month']['avg']):"")+" \/ "+(allExists?Math.round(data['all']['avg']):"???")+"</td>";
  } else {
    result = '<td colspan="4"><em>Нет данных по этой карте</em></td>'
  }

  return result;
}

$.ajax({
  url: 'http://tale-ext.webtricks.pro/trade-history.json',
  success: function(res) {
    var table = $("#pgf-help-accordion table");

    if (table.length == 0) {
      table = $($(".easy-block table")[1]);
    }

    table.find("thead>tr>th:nth-child(1)").after(
      '<th width="70px" >продано</th><th width="70px" >макс.</th>'
      + '<th width="70px" >мин.</th><th width="70px" >сред.</th>'
    );

    table.find("tbody>tr>td:nth-child(2)").each(function(idx, el){
      $(el).css({"font-weight": "bold"});
    });

    var cardBlocks = table.find("tbody>tr>td:nth-child(1)");
    cardBlocks.each(function(idx, el){
      var $td = $(el);
      var cardName = $td.find('span').text().trim();
      var spanInfo = $(document.createElement('span'));

      var addColsHtml = addCols(res[cardName]);
      $td.after(addColsHtml);
    });

  }
});


function replaceTradeDialog()
{
  var originalFunc = pgf.ui.dialog.Create;
  pgf.ui.dialog.Create = function(params){
    var testUrlReg = /\/market\/new-dialog\?good=cards\%23\d+/i;
    if (testUrlReg.test(params.fromUrl)) {
      params.OnOpen = function(dialog) {
        var form = new pgf.forms.Form(jQuery('#pgf-sell-good-form', dialog),
          {OnSuccess: function(form, data){
            location.reload();
          }});
        var formObj = dialog.find("form");
        var submitBtn = dialog.find("input[type=submit]");
        submitBtn.off();
        formObj.off();
        formObj.on('submit', function(e){
          e.preventDefault();
          var $priceBlock = formObj.find("#id_price");
          var $cardBlock = formObj.find("#card_number");
          $priceBlock.parent().removeClass('error');
          $cardBlock.parent().removeClass('error');
          if ($priceBlock.val() < 10) {
            $priceBlock.parent().addClass('error');
            return false;
          }
          if ($cardBlock.val() < 1) {
            $cardBlock.parent().addClass('error');
            return false;
          }

          var sourceLinkObj = $("a.pgf-good-link[href=\""+params.fromUrl+"\"]");
          var cardName = sourceLinkObj.parent().parent().find("td:nth-child(1)>span").html().trim();
          var linksFound = new Array();
          if (cardName) {
            var allTds = sourceLinkObj.parent().parent().parent().find("tr>td:nth-child(1)");
            for (var i = 0; i < allTds.length && linksFound.length < $cardBlock.val(); i++) {
              if ($(allTds[i]).find('span').html().trim() == cardName) {
                linksFound.push($(allTds[i]).parent().find('td>a.pgf-good-link').attr('href'));
              }
            }
          } else {
            linksFound.push(sourceLinkObj.attr('href'));
          }
          var urlReg = /\/market\/new-dialog\?(good=cards%23\d+)/i;
          var statusCheck = {};
          for (var j = 0; j < linksFound.length; j++) {
            var res = urlReg.exec(linksFound[j]);
            if (res) {
              var fd = new FormData();
              fd.append("price", $priceBlock.val());
              statusCheck[j] = 'send';
              (function(idx) {
                $.ajax({
                  url: "/market/create?" + res[1],
                  method: "POST",
                  data: fd,
                  processData: false,
                  contentType: false,
                  type: "POST",
                  success: function (res) {
                    if (res.status == 'processing') {
                      statusCheck[idx] = res.status_url;
                    } else {
                      delete(statusCheck[idx])
                    }
                  }
                });
              })(j);
            }
          }
          var checkTry = 3;
          function checkStatus(){
            checkTry--;
            var n = 0;
            for (var i in statusCheck) {
              n++;
              if (statusCheck[i] != 'send') {
                (function(idx) {
                  $.ajax({
                    url: statusCheck[idx],
                    method: "GET",
                    success: function (res) {
                      if (typeof res.status !== 'undefined' && res.status=="ok") {
                        delete(statusCheck[idx]);
                      }
                    }
                  });
                })(i);
              }
            }
            if (n > 0 && checkTry > 0) {
              setTimeout(checkStatus,1000);
            } else {
              window.location.reload();
            }
          }
          setTimeout(checkStatus,300);
          submitBtn.button('loading');
          return false;
        });
        formObj.find(".pgf-seller-price").append(`
        <div class="pgf-widget control-group"><label for="card_number">Количество карт:</label><input id="card_number" name="card_number" type="number" value="1" required=""></div>
        `);

      }
    }
    originalFunc(params);
  };

}

setTimeout(function(){
  var s = document.createElement("script");
  s.innerHTML = `
(${replaceTradeDialog.toString()})();
`;
  document.body.appendChild(s);
},100);