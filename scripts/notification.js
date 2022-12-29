function hideElement(element) {
  element.style.display = 'none';
}

function showElement(element) {
  element.style.opacity = 1;
  element.style.display = 'block';
}

function notificationElement() {
  const body = document.querySelector('body');
  let container = document.querySelector('#riad-notif');
  if (container) {
    showElement(container);
    textElement = container.querySelector('div');
    closeButton = container.querySelector('a');
    return {
      parent: container,
      text: textElement,
      button: closeButton
    };
  }
  // Create the container
  container = document.createElement('div');
  container.id = 'riad-notif';
  container.style = 'display: block; justify-content: space-between; align-items: center; padding: 12px 12px;\
                    position: fixed; top: 0; right: 0; width: 300px; z-index: 9999; margin-right: 20px;\
                    border: 0.5px #868686 solid; border-radius: 4px; background: #242526;'
  // Title Element
  titleElement = document.createElement('h1');
  titleElement.innerText = 'Facebook Sponsor Blocker';
  titleElement.style = 'display: inline; font-family: Arial; font-size: 18px; color: white; user-select: none;'
  container.append(titleElement);
  // Close button
  closeButton = document.createElement('a');
  closeButton.style = 'float: right; font-size: 18px; font-weight: bold; margin-right: 4px; color: white; text-decoration: none;\
                      text-align: center; width: 25px; height: 25px; border: 0.5px white solid';
  closeButton.innerText = 'X';
  closeButton.onclick = () => hideElement(container);
  container.append(closeButton);
  // Create message element
  textElement = document.createElement('div');
  textElement.style = 'display: block; font-family: Arial; font-size: 14px; color: white; margin-top: 8px;'
  container.append(textElement);
  // Add container to the body
  body.append(container);
  return {
    parent: container,
    text: textElement,
    button: closeButton
  };
}

async function notifyBackgroundPage(textElement) {

  function handleResponse(msg) {
    textElement.innerText = `${msg.counter} Removed sponsored posts`
  }

  function handleError(error) {
    console.error(`Error: ${error}`);
  }

  const sending = browser.runtime.sendMessage({
    msg: "request-counter",
  });

  await sending.then(handleResponse, handleError);
}

async function runApp() {
  const notification = notificationElement();
  const container = notification.parent;
  await notifyBackgroundPage(notification.text);
}

runApp();