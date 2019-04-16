/* eslint-disable no-undef */
$(function() {
  // eslint-disable-next-line
  let editor = new MediumEditor('#post-body', {
    placeholder : {
      text: '',
      hideOnClick: true
    }
  });

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
  $('.publish-button').on('click', function(e) {
    e.preventDefault();
    removeErrors();
    // $('p.error').remove();
    // $('input').removeClass('error');

    var data = {
      title: $('#post-title').val(), //val() берет значение из input
      body: $('#post-body').html() //html() берет значение из div
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
        $(location).attr('href', '/');
     //   //$('.register h2').after('<p class="success">Отлично!</p>');
     }
    });
  });
});
/* eslint-enable no-undef */
