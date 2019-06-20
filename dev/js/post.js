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
  $('#file').on('change', function() {
    // e.preventDefault();

    // FormData класс для работы с формами в браузере
    // Берем данные с инпутов с параметром
    //  name=postId и name=file и с помощью append
    // а потом МАГИЯ!
    let formData = new FormData();
    formData.append('postId', $('#post-id').val());
    formData.append('file', $('#file')[0].files[0]);

    $.ajax({
      type: 'POST',
      url: '/upload/image',
      data: formData,
      processData: false, //форма не будет отправлять "лишние" данные
      contentType: false, // не будем валидировать форму
      success: function (data) {
        console.log(data);
        $('#fileinfo').prepend('<div class="img-container"><img src="/uploads' + data.filePath + '" alt="" /></div>'
        );
      },
      error: function (e) {
        console.log(e);
      }
    });
  });

  // inserting post (НЕ ОЧЕНЬ ПОНЯЛ, КАК ЭТО РАБОТАЕТ)
  $('.img-container').on('click', function() {
    let imageId = $(this).attr('id'); //берем атрибут id из .img-container
    let txt = $('#post-body'); // записываем в переменную содержимое из #post-body
    let caretPos = txt[0].selectionStart; // определяем положение курсора в #post-body
    let textAreaTxt = txt.val(); // бля, я хз, для чего брать значение из #post-body
    let txtToAdd = "![alt text](image" + imageId + ")"; // добавляем markdown разметку с оптсанием картинки в перемнную
    txt.val(textAreaTxt.substring(0, caretPos) + txtToAdd + textAreaTxt.substring(caretPos)); // c помощью val(...) добавляем на метоположение курсора при клике на картинку маркдаун разметку
  });

});
/* eslint-enable no-undef */
