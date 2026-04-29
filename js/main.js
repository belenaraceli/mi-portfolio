// Scroll suave
$(function() {
    $('a[href*=#]').click(function() {
      if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') 
          && location.hostname == this.hostname) {
  
        var $target = $(this.hash);
        $target = $target.length && $target || $('[name=' + this.hash.slice(1) + ']');
  
        if ($target.length) {
          var targetOffset = $target.offset().top;
          $('html,body').animate({scrollTop: targetOffset}, 1000);
          return false;
        }
      }
    });
  });
  
  document.querySelectorAll('#languageSwitcher span').forEach(span => {
    span.addEventListener('click', () => {
      var lang = span.getAttribute('data-lang');
      var select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
      }
    });
  });
  
  

  const RECAPTCHA_SITE_KEY = '6LdBa88sAAAAADNXqTJNIA5oqvVFzXHe_55W1qj_';

document.getElementById('contact-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const btn = document.getElementById('submit-btn');
    const status = document.getElementById('form-status');
    btn.value = 'Sending...';
    btn.disabled = true;
    status.textContent = '';

    try {
        const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'contact' });

        const formData = new FormData();
        formData.append('nombre', document.getElementById('nombre').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('mensaje', document.getElementById('mensaje').value);
        formData.append('recaptcha_token', token);

        const response = await fetch('mailer.php', { method: 'POST', body: formData });
        const result = await response.json();

        if (result.success) {
            status.textContent = 'Message sent successfully!';
            status.style.color = '#c3b17c';
            document.getElementById('contact-form').reset();
        } else {
            status.textContent = result.message || 'Something went wrong. Try again.';
            status.style.color = '#ff6b6b';
        }
    } catch (err) {
        status.textContent = 'Something went wrong. Try again.';
        status.style.color = '#ff6b6b';
    }

    btn.value = 'Send';
    btn.disabled = false;
});