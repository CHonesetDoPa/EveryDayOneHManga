function fetchData() {
    fetch('/api/getPublicId')
        .then(response => response.text())
        .then(id => {
            return fetch(`/api/${id}`);
        })
        .then(response => response.json())
        .then(data => {
            const apiResponseDiv = document.getElementById('randomBookPublicInfo');
            apiResponseDiv.innerHTML = `
                id: ${data.id}<br>
                uuid: ${data.uuid}<br>
                filename: ${data.filename}<br>
                path: ${data.path}<br>
                size: ${data.size}<br>
            `;
        })
        .catch(error => {
            console.error('Error fetching API data:', error);
        });
}

function fetchPersonalData() {
    fetch('/api/getPresonalId')
      .then(response => response.json())
      .then(data => {
        const id = data.uniqueId;
  
        // 使用uniqueId访问/api/id
        return fetch(`/api/${id}`);
      })
      .then(response => response.json())
      .then(data => {
        const apiResponseDiv = document.getElementById('randomBookPersonalInfo');
            apiResponseDiv.innerHTML = `
                id: ${data.id}<br>
                uuid: ${data.uuid}<br>
                filename: ${data.filename}<br>
                path: ${data.path}<br>
                size: ${data.size}<br>
            `;
        })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  
function testFetchPersonalId(){
    fetch('/api/getPresonalId')
      .then(response => response.json())
      .then(data => {
        const id = data.uniqueId;
        console.log(id);
      })
}