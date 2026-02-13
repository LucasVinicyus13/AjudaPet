// ===== Page Loader =====
    window.addEventListener('load', function() {
      var loader = document.getElementById('pageLoader');
      setTimeout(function() {
        loader.classList.add('hidden');
        setTimeout(function() { loader.style.display = 'none'; }, 300);
      }, 600);
    });

    // ===== Like Button Toggle =====
    document.querySelectorAll('.like-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var post = this.closest('.post');
        var heartPath = this.querySelector('.heart-icon path');
        var likesEl = post.querySelector('.likes-count');
        var currentLikes = parseInt(post.getAttribute('data-likes'));
        var isLiked = this.classList.contains('liked');

        if (isLiked) {
          // Unlike
          this.classList.remove('liked');
          heartPath.setAttribute('fill', 'none');
          heartPath.setAttribute('stroke', '#262626');
          currentLikes--;
        } else {
          // Like
          this.classList.add('liked');
          heartPath.setAttribute('fill', '#E84855');
          heartPath.setAttribute('stroke', '#262626');
          currentLikes++;
        }

        post.setAttribute('data-likes', currentLikes);
        likesEl.textContent = currentLikes + ' curtidas';
      });
    });

    // ===== Double Tap to Like on Images =====
    document.querySelectorAll('.post-image-container').forEach(function(container) {
      var lastTap = 0;

      container.addEventListener('click', function(e) {
        var currentTime = new Date().getTime();
        var tapLength = currentTime - lastTap;

        if (tapLength < 350 && tapLength > 0) {
          // Double tap detected
          var post = this.closest('.post');
          var likeBtn = post.querySelector('.like-btn');
          var heartPath = likeBtn.querySelector('.heart-icon path');
          var likesEl = post.querySelector('.likes-count');
          var currentLikes = parseInt(post.getAttribute('data-likes'));
          var doubleTapHeart = this.querySelector('.double-tap-heart');

          // Show the big heart animation
          doubleTapHeart.classList.remove('show');
          void doubleTapHeart.offsetWidth; // force reflow
          doubleTapHeart.classList.add('show');

          // Like the post (only if not already liked)
          if (!likeBtn.classList.contains('liked')) {
            likeBtn.classList.add('liked');
            heartPath.setAttribute('fill', '#E84855');
            heartPath.setAttribute('stroke', '#262626');
            currentLikes++;
            post.setAttribute('data-likes', currentLikes);
            likesEl.textContent = currentLikes + ' curtidas';
          }

          // Remove animation class after it finishes
          setTimeout(function() {
            doubleTapHeart.classList.remove('show');
          }, 900);
        }

        lastTap = currentTime;
      });
    });

    // ===== Story Viewer =====
    var storyViewer = document.getElementById('storyViewer');
    var storyViewerImg = document.getElementById('storyViewerImg');
    var storyViewerUsername = document.getElementById('storyViewerUsername');
    var storyViewerAvatar = document.getElementById('storyViewerAvatar');
    var storyViewerCaption = document.getElementById('storyViewerCaption');
    var storyViewerClose = document.getElementById('storyViewerClose');
    var storyViewerLike = document.getElementById('storyViewerLike');
    var storyProgressFill = document.getElementById('storyProgressFill');
    var storyTapLeft = document.getElementById('storyTapLeft');
    var storyTapRight = document.getElementById('storyTapRight');

    var storyItems = document.querySelectorAll('.story-item[data-story-index]');
    var currentStoryIndex = 0;
    var storyTimer = null;
    var storyProgressTimer = null;
    var storyDuration = 5000;
    var storyLiked = {};

    // Avatar color map to reuse existing classes
    var avatarColors = {
      'patinhas': 'linear-gradient(135deg, #E84855, #f78ca2)',
      'abrigofeliz': 'linear-gradient(135deg, #667eea, #764ba2)',
      'resgatapet': 'linear-gradient(135deg, #11998e, #38ef7d)',
      'sos.animais': 'linear-gradient(135deg, #f7971e, #ffd200)',
      'caes.gatos': 'linear-gradient(135deg, #00b4db, #0083b0)',
      'lar.animal': 'linear-gradient(135deg, #a18cd1, #fbc2eb)'
    };

    var avatarLetters = {
      'patinhas': 'P',
      'abrigofeliz': 'A',
      'resgatapet': 'R',
      'sos.animais': 'S',
      'caes.gatos': 'C',
      'lar.animal': 'L'
    };

    function openStory(index) {
      if (index < 0 || index >= storyItems.length) return;
      currentStoryIndex = index;
      var item = storyItems[index];
      var user = item.getAttribute('data-story-user');
      var img = item.getAttribute('data-story-img');
      var caption = item.getAttribute('data-story-caption');

      storyViewerImg.src = img;
      storyViewerUsername.textContent = user;
      storyViewerCaption.textContent = caption;
      storyViewerAvatar.style.background = avatarColors[user] || '#ccc';
      storyViewerAvatar.textContent = avatarLetters[user] || '';
      storyViewerAvatar.style.display = 'flex';
      storyViewerAvatar.style.alignItems = 'center';
      storyViewerAvatar.style.justifyContent = 'center';
      storyViewerAvatar.style.fontWeight = '700';
      storyViewerAvatar.style.fontSize = '14px';
      storyViewerAvatar.style.color = '#ffffff';

      // Reset like state
      var heartPath = storyViewerLike.querySelector('.story-heart-icon path');
      if (storyLiked[index]) {
        heartPath.setAttribute('fill', '#E84855');
        heartPath.setAttribute('stroke', '#ffffff');
        storyViewerLike.classList.add('liked');
      } else {
        heartPath.setAttribute('fill', 'none');
        heartPath.setAttribute('stroke', '#ffffff');
        storyViewerLike.classList.remove('liked');
      }

      // Mark ring as seen
      var ring = item.querySelector('.story-ring');
      ring.classList.add('seen');

      storyViewer.classList.add('active');
      document.body.style.overflow = 'hidden';

      startStoryTimer();
    }

    function closeStory() {
      storyViewer.classList.remove('active');
      document.body.style.overflow = '';
      clearTimeout(storyTimer);
      clearInterval(storyProgressTimer);
      storyProgressFill.style.width = '0%';
    }

    function startStoryTimer() {
      clearTimeout(storyTimer);
      clearInterval(storyProgressTimer);
      storyProgressFill.style.width = '0%';

      var elapsed = 0;
      var interval = 50;
      storyProgressTimer = setInterval(function() {
        elapsed += interval;
        var percent = (elapsed / storyDuration) * 100;
        storyProgressFill.style.width = percent + '%';
        if (elapsed >= storyDuration) {
          clearInterval(storyProgressTimer);
        }
      }, interval);

      storyTimer = setTimeout(function() {
        goToNextStory();
      }, storyDuration);
    }

    function goToNextStory() {
      if (currentStoryIndex < storyItems.length - 1) {
        openStory(currentStoryIndex + 1);
      } else {
        closeStory();
      }
    }

    function goToPrevStory() {
      if (currentStoryIndex > 0) {
        openStory(currentStoryIndex - 1);
      }
    }

    // Click on story items to open
    storyItems.forEach(function(item) {
      item.addEventListener('click', function() {
        var index = parseInt(this.getAttribute('data-story-index'));
        openStory(index);
      });
    });

    // Close button
    storyViewerClose.addEventListener('click', function() {
      closeStory();
    });

    // Tap left / right
    storyTapLeft.addEventListener('click', function() {
      goToPrevStory();
    });

    storyTapRight.addEventListener('click', function() {
      goToNextStory();
    });

    // Like story
    storyViewerLike.addEventListener('click', function() {
      var heartPath = this.querySelector('.story-heart-icon path');
      if (storyLiked[currentStoryIndex]) {
        storyLiked[currentStoryIndex] = false;
        heartPath.setAttribute('fill', 'none');
        heartPath.setAttribute('stroke', '#ffffff');
        this.classList.remove('liked');
      } else {
        storyLiked[currentStoryIndex] = true;
        heartPath.setAttribute('fill', '#E84855');
        heartPath.setAttribute('stroke', '#ffffff');
        this.classList.remove('liked');
        void this.offsetWidth;
        this.classList.add('liked');
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (!storyViewer.classList.contains('active')) return;
      if (e.key === 'Escape') closeStory();
      if (e.key === 'ArrowRight') goToNextStory();
      if (e.key === 'ArrowLeft') goToPrevStory();
    });

    // ===== Notification Popup =====
    var notifBtn = document.getElementById('notifBtn');
    var notifOverlay = document.getElementById('notifOverlay');
    var notifClose = document.getElementById('notifClose');
    var notifPopup = document.getElementById('notifPopup');

    notifBtn.addEventListener('click', function() {
      notifOverlay.classList.add('active');
    });

    notifClose.addEventListener('click', function() {
      notifOverlay.classList.remove('active');
    });

    notifOverlay.addEventListener('click', function(e) {
      if (!notifPopup.contains(e.target)) {
        notifOverlay.classList.remove('active');
      }
    });

    // ===== Smooth scroll to top when clicking Home =====
    document.querySelector('.nav-item.active').addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
