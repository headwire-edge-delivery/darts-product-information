function handleClick() {
  const modalContainer = document.getElementById('modal-container');

  modalContainer.className = 'modal-open';
  document.body.classList.add('modal-active');
  const closeButton = document.querySelector('.modal-close span');
  closeButton.tabIndex = 0;
  modalContainer.addEventListener('click', (event) => {
    if (event.target === modalContainer) {
      modalContainer.classList.add('out');
      setTimeout(() => {
        document.body.classList.remove('modal-active');
      }, 1000);
    }
  });
}

function addModalButton() {
  const unfoldModal = document.querySelector('.unfold-modal');
  const buttonContainer = unfoldModal.firstElementChild;
  buttonContainer.classList.add('modal-button-container');
  const modalButton = buttonContainer.firstElementChild;
  modalButton.classList.add('modal-button');
  modalButton.id = 'modal-button';
  modalButton.tabIndex = 0;
  modalButton.addEventListener('click', handleClick);

  if (modalButton.querySelector('a')) {
    const link = modalButton.querySelector('a');
    link.href = '#';
    link.addEventListener('click', (event) => {
      event.preventDefault();
    });
  }

  modalButton.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  });

  const modalBackground = document.createElement('div');
  modalBackground.classList.add('modal-background');
  const modalContainer = document.createElement('div');
  modalContainer.id = 'modal-container';
  modalContainer.classList.add('modal-container');
  const closeButton = document.createElement('div');
  closeButton.classList.add('modal-close');
  closeButton.innerHTML =
    '<span tabindex="-1" class="icon icon-close"><img data-icon-name="close" alt="close-icon" src="/icons/x.svg" loading="lazy"></span>';

  const closeModal = () => {
    modalContainer.classList.add('out');
    setTimeout(() => {
      document.body.classList.remove('modal-active');
    }, 1000);
    modalContainer.removeEventListener('click', (event) => {
      if (event.target === modalContainer) {
        modalContainer.classList.add('out');
        setTimeout(() => {
          document.body.classList.remove('modal-active');
        }, 1000);
      }
    });
  };
  closeButton.addEventListener('click', closeModal);
  closeButton.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      closeModal();
    }
  });

  modalContainer.append(closeButton);
  for (let i = 1; i < unfoldModal.children.length; i + 1) {
    modalContainer.append(unfoldModal.children[i]);
  }
  modalBackground.append(modalContainer);
  unfoldModal.appendChild(modalBackground);
}

function unfoldModalFunction() {
  function handleKeyDown(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      const modalContainer = document.getElementById('modal-container');
      if (modalContainer.classList.contains('modal-open')) {
        modalContainer.classList.add('out');
        setTimeout(() => {
          document.body.classList.remove('modal-active');
        }, 1000);
        modalContainer.removeEventListener('click', (event) => {
          if (event.target === modalContainer) {
            modalContainer.classList.add('out');
            setTimeout(() => {
              document.body.classList.remove('modal-active');
            }, 1000);
          }
        });
      }
    }
  }

  document.addEventListener('keydown', handleKeyDown);
}

unfoldModalFunction();
addModalButton();
