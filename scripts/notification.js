function notificationElement() {
  const body = document.querySelector('body');
  let container = document.querySelector('#riad-notif');
  if (container) {
    container.style.display = "flex";
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
  container.style = "display: flex; justify-content: space-between; align-items: center; padding: 12px 12px;\
                    position: fixed; top: 0; right: 0; z-index: 9999; width: 200px; margin-right: 20px;\
                    border: 1px white solid; opacity: 0.98; background: #242526;"
  container.onclick = () => { container.style.display = 'none'; }
  // Create message element
  textElement = document.createElement('div');
  textElement.style = "font-size: 14px; color: white; user-select: none;"
  textElement.onclick = () => { container.style.display = 'none'; }
  container.append(textElement);
  // Close button
  closeButton = document.createElement('a');
  closeButton.style = 'font-size: 16px; color: white; text-decoration: none;';
  closeButton.innerText = 'X';
  closeButton.onclick = () => { container.style.display = 'none'; }
  container.append(closeButton);
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

function fadeOutEffect(fadeTarget) {
  fadeTarget.style.opacity = 1;
  const fadeEffect = setInterval(function () {
      if (fadeTarget.style.opacity >= 0.6) {
          fadeTarget.style.opacity -= 0.01;
      } else {
        fadeTarget.style.display = "none";
          clearInterval(fadeEffect);
      }
  }, 100);
}


async function runApp() {
  const notification = notificationElement();
  const container = notification.parent;
  await notifyBackgroundPage(notification.text);
  fadeOutEffect(container);
}



runApp();