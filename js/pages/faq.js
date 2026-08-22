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

  document.querySelectorAll('.faq-item').forEach(item=>{
    item.querySelector('.faq-q').addEventListener('click', ()=>item.classList.toggle('open'));
  });

  document.getElementById('faqSearch').addEventListener('input', (e)=>{
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.faq-item').forEach(item=>{
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(q) ? '' : 'none';
    });
  });
})();
