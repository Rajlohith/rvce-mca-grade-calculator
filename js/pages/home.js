(function(){
  window.MCA.site.mount({ active: 'home' });
  const { bookOpen, trendingUp, fileText, arrowRight } = window.MCA.icons;
  document.getElementById('quickLinks').innerHTML = `
    <a class="list-card" href="pages/cgpa.html">
      <div class="icon-badge solid green">${trendingUp}</div>
      <div class="list-card-body">
        <div class="list-card-title">CGPA Calculator</div>
        <div class="list-card-sub">Across all four semesters</div>
      </div>
      <div class="list-card-arrow">${arrowRight}</div>
    </a>
    <a class="list-card" href="pages/guide.html">
      <div class="icon-badge solid purple">${bookOpen}</div>
      <div class="list-card-body">
        <div class="list-card-title">Guide</div>
        <div class="list-card-sub">Which calculator to use, and when</div>
      </div>
      <div class="list-card-arrow">${arrowRight}</div>
    </a>
    <div class="list-card" style="cursor:default;">
      <div class="icon-badge solid orange">${fileText}</div>
      <div class="list-card-body">
        <div class="list-card-title">Syllabus PDF</div>
        <div class="list-card-sub" style="margin-bottom:8px;">Choose a scheme, Semester I&ndash;IV</div>
        ${window.MCA.site.renderPdfChoice()}
      </div>
    </div>`;
})();
