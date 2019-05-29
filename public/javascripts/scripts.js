/* eslint-disable no-undef */
$(function() {
  //remove error p.error
  function removeErrors() {
    $('form.login p.error, form.register p.error').remove();
    $('form.login input, form.register input').removeClass('error');
  };

  //toggle
  var flag = true;
  $('.switch-button').on('click', function(e) {
    e.preventDefault();
    //очистка полей при переключении формы
    $('input').val('');
    removeErrors();

    if (flag) {
      flag = false;
      $('.register').show('slow');
      $('.login').hide();
    } else {
      flag = true;
      $('.login').show('slow');
      $('.register').hide();
    }
  });

  // clear
  $('form.login input, form.register input').on('focus', function() {
    removeErrors();
  });

  //register
  $('.register-button').on('click', function(e) {
    e.preventDefault();
    removeErrors();

    var data = {
      login: $('#register-login').val(),
      password: $('#register-password').val(),
      passwordConfirm: $('#register-password-confirm').val(),
    };

    $.ajax({
      method: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/api/auth/register'
    }).done(function(data) {
      if (!data.ok) {
        //СЛЕДУЮЩЕЙ СТРОЧКИ НЕТ В Git Влада (стр.44)
        //$('p.error').remove();
        $('.register h2').after('<p class="error">' + data.error + '</p>');
        if (data.fields) {
         data.fields.forEach(function(item) {
           $('input[name=' + item + ']').addClass('error');
         });
       }
     } else {
       $(location).attr('href', '/');
       //$('.register h2').after('<p class="success">Отлично!</p>');
     }
    });
  });

  //login
  $('.login-button').on('click', function(e) {
    e.preventDefault();
    removeErrors();

    var data = {
      login: $('#login-login').val(),
      password: $('#login-password').val(),

    };

    $.ajax({
      method: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/api/auth/login'
    }).done(function(data) {
      if (!data.ok) {
        //СЛЕДУЮЩЕЙ СТРОЧКИ НЕТ В Git Влада (стр.44)
        //$('p.error').remove();
        $('.login h2').after('<p class="error">' + data.error + '</p>');
        if (data.fields) {
         data.fields.forEach(function(item) {
           $('input[name=' + item + ']').addClass('error');
         });
       }
     } else {
       $(location).attr('href', '/');
       //$('.login h2').after('<p class="success">Отлично!</p>');
     }
    });
  });
});

/* eslint-enable no-undef */

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
