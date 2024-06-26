function createSelect(fd) {
  const select = document.createElement('select');
  select.id = fd.Field;
  if (fd.Placeholder) {
    const ph = document.createElement('option');
    ph.textContent = fd.Placeholder;
    ph.setAttribute('selected', '');
    ph.setAttribute('disabled', '');
    select.append(ph);
  }
  fd.Options.split(',').forEach((o) => {
    const option = document.createElement('option');
    option.textContent = o.trim();
    option.value = o.trim();
    select.append(option);
  });
  if (fd.Mandatory === 'x') {
    select.setAttribute('required', 'required');
  }
  return select;
}

function constructPayload(form) {
  const payload = {};
  [...form.elements].forEach((fe) => {
    if (fe.type === 'checkbox') {
      if (fe.checked) payload[fe.id] = fe.value;
    } else if (fe.id) {
      payload[fe.id] = fe.value;
    }
  });
  return payload;
}

async function submitForm(form) {
  const payload = constructPayload(form);
  payload.timestamp = new Date().toJSON();
  const resp = await fetch(form.dataset.action, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: payload }),
  });
  await resp.text();
  return payload;
}

function createButton(fd) {
  const button = document.createElement('button');
  const isIcon = /^:.+:$/.test(fd.Label);
  const icon = fd.Label.replace(/:/g, '');
  button.textContent = isIcon ? '' : fd.Label;
  button.classList.add('button');
  if (isIcon) {
    button.innerHTML = `<div class="hex"><span class="icon icon-${icon}"><img data-icon-name=${icon} alt="${icon}-icon" src="/icons/${icon}.svg" loading="lazy"></span></div>`;
  }
  if (fd.Style) button.classList.add(fd.Style);
  if (fd.Type === 'submit') {
    button.classList.add('submit');
    button.addEventListener('click', async (event) => {
      const form = button.closest('form');
      if (fd.Placeholder) form.dataset.action = fd.Placeholder;
      if (form.checkValidity()) {
        event.preventDefault();
        button.setAttribute('disabled', '');
        await submitForm(form);
        const redirectTo = fd.Extra;
        window.location.href = redirectTo;
      }
    });
  }
  return button;
}

function createHeading(fd, el) {
  const heading = document.createElement(el);
  heading.textContent = fd.Label;
  return heading;
}

function createInput(fd) {
  const input = document.createElement('input');
  input.id = fd.Field;
  input.setAttribute('placeholder', fd.Placeholder);
  if (fd.Mandatory === 'x') {
    input.setAttribute('required', 'required');
  }
  if (fd.Format === 'email') {
    input.type = 'email';
  } else if (fd.Format === 'tel' || fd.Format === 'phone') {
    input.type = 'tel';
    input.addEventListener('input', () => {
      const currentValue = input.value;
      const validValue = currentValue.replace(/[^0-9\-+() ]/g, '');
      if (currentValue !== validValue) {
        input.value = validValue;
      }
    });
  } else {
    input.type = fd.Type;
  }
  return input;
}

function createTextArea(fd) {
  const input = document.createElement('textarea');
  input.id = fd.Field;
  input.setAttribute('placeholder', fd.Placeholder);
  if (fd.Mandatory === 'x') {
    input.setAttribute('required', 'required');
  }
  return input;
}

function createLabel(fd) {
  const label = document.createElement('label');
  label.setAttribute('for', fd.Field);
  label.textContent = fd.Label;
  if (fd.Mandatory === 'x') {
    label.classList.add('required');
  }
  return label;
}

function applyRules(form, rules) {
  const payload = constructPayload(form);
  rules.forEach((field) => {
    const {
      type,
      condition: { key, operator, value },
    } = field.rule;
    if (type === 'visible') {
      if (operator === 'eq') {
        if (payload[key] === value) {
          form.querySelector(`.${field.fieldId}`).classList.remove('hidden');
        } else {
          form.querySelector(`.${field.fieldId}`).classList.add('hidden');
        }
      }
    }
  });
}

function fill(form) {
  const { action } = form.dataset;
  if (action === '/tools/bot/register-form') {
    const loc = new URL(window.location.href);
    form.querySelector('#owner').value = loc.searchParams.get('owner') || '';
    form.querySelector('#installationId').value = loc.searchParams.get('id') || '';
  }
}

async function createForm(formURL) {
  const { pathname } = new URL(formURL);
  const resp = await fetch(pathname);
  const json = await resp.json();
  const form = document.createElement('form');
  const rules = [];
  // eslint-disable-next-line prefer-destructuring
  form.dataset.action = pathname.split('.json')[0];
  json.data.forEach((fd) => {
    fd.Type = fd.Type || 'text';
    const fieldWrapper = document.createElement('div');
    const style = fd.Style ? ` form-${fd.Style}` : '';
    const fieldId = `form-${fd.Type}-wrapper${style}`;
    fieldWrapper.className = fieldId;
    fieldWrapper.classList.add('field-wrapper');
    switch (fd.Type) {
      case 'select':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createSelect(fd));
        break;
      case 'heading':
        fieldWrapper.append(createHeading(fd, 'h3'));
        break;
      case 'legal':
        fieldWrapper.append(createHeading(fd, 'p'));
        break;
      case 'checkbox':
        fieldWrapper.append(createInput(fd));
        fieldWrapper.append(createLabel(fd));
        break;
      case 'text-area':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createTextArea(fd));
        break;
      case 'submit':
        fieldWrapper.append(createButton(fd));
        break;
      default:
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createInput(fd));
    }

    if (fd.Rules) {
      try {
        rules.push({ fieldId, rule: JSON.parse(fd.Rules) });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Invalid Rule ${fd.Rules}: ${e}`);
      }
    }
    form.append(fieldWrapper);
  });

  form.addEventListener('change', () => applyRules(form, rules));
  applyRules(form, rules);
  fill(form);
  return form;
}

export default async function decorate(block) {
  const form = block.querySelector('a[href$=".json"]');
  if (form) {
    form.parentElement.replaceWith(await createForm(form.href));
  }
}

function wrapNeighborElements(findClassName, wrapperClassName) {
  const elements = Array.from(document.querySelectorAll(`.${findClassName}`));
  let currentGroup = [];

  elements.forEach((element) => {
    currentGroup.push(element);
    const next = element.nextElementSibling;
    if (!next || !next.classList.contains(findClassName)) {
      if (currentGroup.length > 1) {
        const wrapper = document.createElement('div');
        wrapper.classList.add(wrapperClassName);
        element.parentElement.insertBefore(wrapper, currentGroup[0]);
        currentGroup.forEach((el) => wrapper.appendChild(el));
      }
      currentGroup = [];
    }
  });
}

function wrapContactInfo() {
  document.querySelectorAll('p').forEach((p) => {
    if (p.querySelector('span.icon') && p.classList.length === 0) {
      p.classList.add('contact-info');
    }
  });
  wrapNeighborElements('contact-info', 'contact-wrapper');

  const contactInfo = document.querySelectorAll('.contact-info');
  contactInfo.forEach((info) => {
    const children = info.childNodes;
    let currentGroup = [];
    children.forEach((child) => {
      currentGroup.push(child);
      const next = child.nextElementSibling;
      if (!next || !next.matches('span, a')) {
        if (currentGroup.length > 1) {
          const wrapper = document.createElement('div');
          wrapper.classList.add('contact-info-line');
          child.parentElement.insertBefore(wrapper, currentGroup[0]);
          currentGroup.forEach((el) => wrapper.appendChild(el));
        }
        currentGroup = [];
      }
    });
  });
}

wrapNeighborElements('button-container', 'social-icons');
wrapContactInfo();
