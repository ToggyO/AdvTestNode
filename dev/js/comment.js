/* eslint-disable no-undef */
$(function() {
  let commentForm;
  let parentId;

  function form(isNew, comment) {
    $('.reply').show();

    if (commentForm) {
      commentForm.remove();
    }
    parentId = null;

    commentForm = $('.comment').clone(true, true); //Клонирование формы комментариев (зачем??)

    if (isNew) {
      //Поиск в клонированной форме commentForm
      //кнопки cancel, чтобы ее скрыть, если комментарий новый
      commentForm.find('.cancel').hide();
      commentForm.appendTo('.comment-list');
    } else {
      //по клику ( $(this) ) на эелемент с id, отличным от #new,
      //делаем запрос к родительскому комментарию и
      //присваиваем чайлд-комментарию id родительского
      //комментария. Затем, с помощью after, включаем отображаение
      //формы комментария-ответа
      let parentComment = $(comment).parent();
      parentId = parentComment.attr('id');
      $(comment).after(commentForm);
    }

    commentForm.css({ display: 'flex' });


    // if (commentForm) {
    //   commentForm.remove();
    // }
    // parentId = null;
    //
    // commentForm = $('form.comment').clone(true, true); //Клонирование формы комментариев (зачем??)
    //
    // if ($(this).attr('id') === 'new') {
    //   commentForm.appendTo('.comment-list');
    // } else {
    //   //по клику ( $(this) ) на эелемент с id, отличным от #new,
    //   //делаем запрос к родительскому комментарию и
    //   //присваиваем чайлд-комментарию id родительского
    //   //комментария. Затем, с помощью after, включаем отображаение
    //   //формы комментария-ответа
    //   let parentComment = $(this).parent();
    //   parentId = parentComment.attr('id');
    //   $(this).after(commentForm)
    // }
    //
    // commentForm.css({ display: 'flex' });
  }

  //load
  //Вызов формы при загрузке страницы с комментариями
  //true это передача первого параметра функции form(isNew, -)
  form(true);

  //add form
  //Вызов формы по нажатию кнопки reply
  //false передается. если комментарий дочерний
  //$(this).hide скрывает кнопку Ответить, если форма отображается
  $('.reply').on('click', function() {
    form(false, this);
    $(this).hide();
  });

  //hide form
  $('form.comment .cancel').on('click', function(e) {
    e.preventDefault();
    commentForm.remove();
    //load
    //Чтобы при нажатии на cancel отображалась внизу
    //форма для нового комментария
    form(true);
  });

  //publish
  $('form.comment .send').on('click', function(e) {
    e.preventDefault();

    var data = {
      post: $('.comments').attr('id'),
      body: commentForm.find('textarea').val(),
      parent: parentId
    };

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/comment/add'
    }).done(function(data) {
      console.log(data);
     if (!data.ok) {
        if (data.error === undefined) {
          data.error = 'Неизвестная ошибка!';
        }
        //prepend() вставить перед разметкой теги или строку
        $(commentForm).prepend('<p class="error">' + data.error + '</p>');

     } else {
      //Создаем тело комментария без перезагрузки
      let newComment =   '<ul><li style="background-color:#ffffe0;"><div class="head"><a href="/users/'
      + data.login +
      '">'
      + data.login +
      '</a><span class="date">Только что</span></div>'
      + data.body +
      '</li></ul>';

      //Добавление тела ответного комментария Клоинрованной формы
      $(commentForm).after(newComment);
      form(true);
      }
    });
  });
});
