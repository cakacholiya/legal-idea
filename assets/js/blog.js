(function () {
  'use strict';

  var STORAGE_KEY = 'legalidea_blog_';

  function getStore(key) {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY + key)) || null; } catch (e) { return null; }
  }
  function setStore(key, val) {
    try { localStorage.setItem(STORAGE_KEY + key, JSON.stringify(val)); } catch (e) {}
  }

  function getPostId() {
    var path = window.location.pathname.split('/').pop().replace('.html', '');
    return path || 'unknown';
  }

  // Like button
  function initLike() {
    var btn = document.querySelector('.like-btn');
    if (!btn) return;
    var postId = getPostId();
    var countEl = btn.querySelector('.like-count');
    var likes = getStore('likes_' + postId) || { count: 0, liked: false };

    function render() {
      countEl.textContent = likes.count;
      if (likes.liked) btn.classList.add('liked');
      else btn.classList.remove('liked');
    }

    render();
    btn.addEventListener('click', function () {
      if (likes.liked) { likes.count = Math.max(0, likes.count - 1); likes.liked = false; }
      else { likes.count++; likes.liked = true; }
      setStore('likes_' + postId, likes);
      render();
    });
  }

  // Share buttons
  function initShare() {
    var url = encodeURIComponent(window.location.href);
    var title = encodeURIComponent(document.title);
    document.querySelectorAll('.share-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var type = this.dataset.share;
        var shareUrl = '';
        switch (type) {
          case 'whatsapp': shareUrl = 'https://api.whatsapp.com/send?text=' + title + '%20' + url; break;
          case 'facebook': shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + url; break;
          case 'twitter': shareUrl = 'https://twitter.com/intent/tweet?text=' + title + '&url=' + url; break;
          case 'linkedin': shareUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + url; break;
          case 'copy':
            if (navigator.clipboard) {
              navigator.clipboard.writeText(window.location.href);
              this.innerHTML = '<i class="fas fa-check"></i>';
              var self = this;
              setTimeout(function () { self.innerHTML = '<i class="fas fa-link"></i>'; }, 2000);
            }
            return;
        }
        if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
      });
    });
  }

  // Comments system
  function initComments() {
    var section = document.querySelector('.comments-section');
    if (!section) return;
    var postId = getPostId();
    var comments = getStore('comments_' + postId) || getDefaultComments(postId);
    var form = section.querySelector('.comment-form');
    var list = section.querySelector('.comment-list');
    var countEl = section.querySelector('.comments-count');

    function renderComments() {
      countEl.textContent = comments.length;
      list.innerHTML = '';
      comments.forEach(function (c, idx) {
        var initials = c.name.split(' ').map(function (w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
        var div = document.createElement('div');
        div.className = 'comment-item';
        div.setAttribute('data-aos', 'fade-up');
        div.innerHTML =
          '<div class="comment-item-header">' +
            '<div class="comment-author">' +
              '<div class="comment-avatar">' + initials + '</div>' +
              '<span class="comment-name">' + escapeHtml(c.name) + '</span>' +
            '</div>' +
            '<span class="comment-date">' + c.date + '</span>' +
          '</div>' +
          '<p class="comment-text">' + escapeHtml(c.text) + '</p>' +
          '<div class="comment-actions">' +
            '<button type="button" class="comment-vote-btn upvote-btn' + (c.userVote === 1 ? ' upvoted' : '') + '" data-idx="' + idx + '"><i class="fas fa-thumbs-up"></i> <span>' + c.upvotes + '</span></button>' +
            '<button type="button" class="comment-vote-btn downvote-btn' + (c.userVote === -1 ? ' downvoted' : '') + '" data-idx="' + idx + '"><i class="fas fa-thumbs-down"></i> <span>' + c.downvotes + '</span></button>' +
          '</div>';
        list.appendChild(div);
      });

      list.querySelectorAll('.upvote-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var i = parseInt(this.dataset.idx);
          if (comments[i].userVote === 1) { comments[i].upvotes--; comments[i].userVote = 0; }
          else { if (comments[i].userVote === -1) comments[i].downvotes--; comments[i].upvotes++; comments[i].userVote = 1; }
          setStore('comments_' + postId, comments);
          renderComments();
        });
      });
      list.querySelectorAll('.downvote-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var i = parseInt(this.dataset.idx);
          if (comments[i].userVote === -1) { comments[i].downvotes--; comments[i].userVote = 0; }
          else { if (comments[i].userVote === 1) comments[i].upvotes--; comments[i].downvotes++; comments[i].userVote = -1; }
          setStore('comments_' + postId, comments);
          renderComments();
        });
      });
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var textarea = form.querySelector('textarea');
        var nameInput = form.querySelector('input[name="commenter-name"]');
        var text = textarea.value.trim();
        var name = nameInput.value.trim() || 'Anonymous';
        if (!text) return;
        var now = new Date();
        comments.unshift({ name: name, text: text, date: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), upvotes: 0, downvotes: 0, userVote: 0 });
        setStore('comments_' + postId, comments);
        textarea.value = '';
        nameInput.value = '';
        renderComments();
      });
    }

    renderComments();
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function getDefaultComments(postId) {
    var defaults = [
      { name: 'Rahul Sharma', text: 'Very informative article! This helped me understand the topic much better. Thank you Legal Idea team.', date: '28 Apr 2026', upvotes: 12, downvotes: 0, userVote: 0 },
      { name: 'Priya Patel', text: 'Great explanation with practical examples. Would love to see more such content.', date: '25 Apr 2026', upvotes: 8, downvotes: 1, userVote: 0 },
      { name: 'Amit Gupta', text: 'I was confused about this topic but this blog cleared all my doubts. Shared with my CA friends as well!', date: '22 Apr 2026', upvotes: 5, downvotes: 0, userVote: 0 }
    ];
    setStore('comments_' + postId, defaults);
    return defaults;
  }

  // Blog filters
  function initFilters() {
    var btns = document.querySelectorAll('.blog-filter-btn');
    var cards = document.querySelectorAll('.blog-card');
    if (!btns.length || !cards.length) return;
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        var cat = this.dataset.filter;
        cards.forEach(function (card) {
          if (cat === 'all' || card.dataset.category === cat) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initLike();
    initShare();
    initComments();
    initFilters();
  });
})();
