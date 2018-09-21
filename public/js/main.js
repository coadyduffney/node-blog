$(document).ready(function() {
  $('.delete-article').on('click', function(e) {
    $target = $(e.target);
    const id = $target.attr('data-id');
    $.ajax({
      type: 'DELETE',
      url: '/articles/' + id,
      success: function(response) {
        window.location.href = '/articles/view_articles';
        alert('Article has been deleted.');
      },
      error: function(err) {
        console.log(err);
      }
    });
  });
});
