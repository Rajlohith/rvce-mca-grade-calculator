(function(){
  const { mount } = window.MCA.site;

  mount({
    active: 'faq',
    trail: [
      { label:'Home', href:'../index.html' },
      { label:'FAQ' }
    ]
  });

  const list = document.getElementById('faqList');
  list.innerHTML = window.MCA.FAQ.map((item, i) => `
    <div class="faq-item" data-idx="${i}">
      <button class="faq-q"><span>${item.q}</span><span class="plus">+</span></button>
      <div class="faq-a"><div class="faq-a-inner">${item.a}</div></div>
    </div>`).join('');

  // FAQPage structured data, built from the same window.MCA.FAQ array the
  // list above renders - so it can never drift out of sync with what's
  // actually on the page. HTML tags are stripped since schema.org's
  // acceptedAnswer.text expects plain text.
  const faqSchema = document.createElement('script');
  faqSchema.type = 'application/ld+json';
  faqSchema.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: window.MCA.FAQ.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      }
    }))
  });
  document.head.appendChild(faqSchema);

  document.querySelectorAll('.faq-item').forEach(item=>{
    item.querySelector('.faq-q').addEventListener('click', ()=>{
      const wasOpen = item.classList.contains('open');
      item.classList.toggle('open');
      if(!wasOpen && window.MCA.achievements) window.MCA.achievements.track('faq_opened', {});
    });
  });

  document.getElementById('faqSearch').addEventListener('input', (e)=>{
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.faq-item').forEach(item=>{
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(q) ? '' : 'none';
    });
    if(q.trim() && window.MCA.achievements) window.MCA.achievements.track('faq_searched', {});
  });
})();
