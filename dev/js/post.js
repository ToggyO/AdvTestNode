/* eslint-disable no-undef */
$(function() {

  //remove error p.error
  function removeErrors() {
    $('.post-form p.error').remove();
    $('.post-form input, #post-body').removeClass('error');
  };

  // clear
    $('post-form.login input, #post-body').on('focus', function() {
      removeErrors();
    });

  //publish
  $('.publish-button, .save-button').on('click', function(e) {
    e.preventDefault();
    removeErrors();
    // $('p.error').remove();
    // $('input').removeClass('error');

    //Определяем нужный класс из составного класса путем разеделни строки составного касса и выбираем первый элемент полученного массива
    const isDraft =
      $(this)
      .attr('class')
      .split(' ')[0] === 'save-button';

    var data = {
      title: $('#post-title').val(), //val() берет значение из input
      body: $('#post-body').val(), //html() берет значение из div
      isDraft: isDraft,
      postId: $('#post-id').val(),

    };

    $.ajax({
      method: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/post/add'
    }).done(function(data) {

      console.log(data);
     if (!data.ok) {

        //$('p.error').remove();
        $('.post-form h2').after('<p class="error">' + data.error + '</p>');
        if (data.fields) {
         data.fields.forEach(function(item) {
           $('#post-' + item).addClass('error');
         });
       }
     } else {
      
     // $('.register h2').after('<p class="success">Отлично!</p>');
       if (isDraft) {
         $(location).attr('href', '/post/edit/' + data.post.id);
       } else {
         $(location).attr('href', '/posts/' + data.post.url);
       }
     }
    });
  });

  //upload
  $('#fileinfo').on('submit', function(e) {
    e.preventDefault();

    // FormData класс для работы с формами в браузере
    let formData = new FormData(this);

    $.ajax({
      type: 'POST',
      url: '/upload/image',
      data: formData,
      processData: false, //форма не будет отправлять "лишние" данные
      contentType: false, // не будем валидировать форму
      success: function (r) {
        console.log(r);
      },
      error: function (e) {
        console.log(e);
      }
    });
  });
});
/* eslint-enable no-undef */
