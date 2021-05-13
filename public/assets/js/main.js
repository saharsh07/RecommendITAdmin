const toggleHide = () => {
    document.getElementById('myForm').classList.toggle('hide')
}


const notifyMe = (pname) => {
  
    var product = pname;
    // Let's check whether notification permissions have already been granted
    if (Notification.permission === "granted") {
      // If it's okay let's create a notification
      var notification = new Notification(`Product ${pname} added successfully`);
    }
  
    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          var notification = new Notification("Product added successfully");
        }
      });
    }
  
    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them any more.
  }

  const askPermission = () => {
    if (Notification.permission !== "denied") {
        Notification.requestPermission();
      }
  }
  
  function edit() {
    let productId = document.getElementById('productId').value;
  
    let productName = document.getElementById('productName').value;
    let pictureLink = document.getElementById('pictureLink').value;
    let promo = document.getElementById('promo').value;
    let price = document.getElementById('price').value;
    let description = document.getElementById('description').value;
    let shopLink = document.getElementById('shopLink').value;
    // Send PUT Request here
    console.log("update button clicked");
  
    fetch('/edit/products/' + productId, {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: productId,
        productName: productName,
        pictureLink: pictureLink,
        promo: promo,
        price: price,
        description: description,
        shopLink: shopLink
      })
    });
  }
  function deleteProduct() {
    let productId = document.getElementById('productId').value;
    console.log("Delete button clicked");
  
    fetch('/delete/products/' + productId, {
      method: 'delete',
      headers: { 'Content-Type': 'application/json' }
    }).then(
      window.location.href='/deleted'
    );
  }

    