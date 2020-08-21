/*
** Description histories for Trello
** This program display histories of your card's description in Trello.
** This program is depends on Trello api.
*/

$(function() {
  const cards = $('a.list-card');
  let card_keys_array = []
  moment.locale('ja')
  const update = function(current_url) {
    if (cards.length == 0) {
      return
    }

    let url_splited_array = current_url.split('/')
    let url_type = url_splited_array[url_splited_array.length - 3]
    let api_card_id_key = url_splited_array[url_splited_array.length - 2]
    let last_loaded_card_key = card_keys_array[card_keys_array.length - 1]

    /* chrome.runtime.onMessage.addListener is called multiple times, so get_data() also is called multiple times.
    ** To prevent fire multiple requests, compare last key and latest key.
    ** url_type is used to distinguish card is selected or not. when url_type is `c`, it means that a card is selected, `b` is no card is selected.
    */
    if (url_type == 'c' && last_loaded_card_key != api_card_id_key) {
      card_keys_array.push(api_card_id_key)
      get_histories(api_card_id_key)
    }
  }
  const get_histories = function(api_card_id_key) {
    $.getJSON(`https://trello.com/1/cards/${api_card_id_key}/actions?filter=updateCard:desc`).done(function(datas) {
      const history_section_title = '<div class="window-module-title window-module-title-no-divider description-title"><span class="icon-description icon-lg window-module-title-icon"></span><h3>説明の変更履歴🐈🍮</h3></div>'
      $('.window-module').first().append(history_section_title)
      if (datas.length == 0) {
        $('.window-module').first().append('<div class="history_wrapper"><div class="history_content">履歴がありませんでした。🐾</div></div>')
      } else {
        $.each(datas, function(index, history) {
          append_history(history)
        })
      }
    })
  }

  const append_history = function(history) {
    let history_content = '<div class="history_wrapper">'
    history_content += `<div style="margin-bottom: 10px;"><span class="bold">${history.memberCreator.fullName}</span>さんが変更しました。<span class="date">${moment(history.date).format("YYYY年MM月DD日 HH:mm")}</span></div>`
    history_content += `<div class="history_content"><div style="text-decoration: line-through;">${history.data.old.desc || "-"}</div>`
    history_content += '<div class="bold">↓</div>'
    history_content += `${history.data.card.desc}`
    history_content += '</div></div>'
    $('.window-module').first().append(history_content)
  }
  chrome.runtime.onMessage.addListener(function(tabId, changeInfo, tab) {
    update(location.href);
  });
  update(location.href);
});
