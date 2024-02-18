function fetchData() {
  fetch('/api/getPublicId')
      .then(response => response.text())
      .then(id => {
          return fetch(`/api/${id}`);
      })
      .then(response => response.json())
      .then(data => {
          const apiResponseDiv = document.getElementById('randomBookPublicInfo');
          const sizeInMegabytes = (data.size / (1024 * 1024)).toFixed(2);
          apiResponseDiv.innerHTML = `
              id: ${data.id}<br>
              uuid: ${data.uuid}<br>
              filename: ${data.filename}<br>
              size: ${sizeInMegabytes} MB<br>
          `;
      })
      .catch(error => {
          console.error('Error fetching API data:', error);
      });
}


function fetchPersonalData() {
  fetch('/api/getPersonalId')
  .then(response => response.text())
  .then(id => {
      return fetch(`/api/${id}`);
  })
  .then(response => response.json())
  .then(data => {
      const apiResponseDiv = document.getElementById('randomBookPersonalInfo');
      const sizeInMegabytes = (data.size / (1024 * 1024)).toFixed(2);
      apiResponseDiv.innerHTML = `
          id: ${data.id}<br>
          uuid: ${data.uuid}<br>
          filename: ${data.filename}<br>
          size: ${sizeInMegabytes} MB<br>
      `;
  })
  .catch(error => {
      console.error('Error fetching API data:', error);
  });
  }