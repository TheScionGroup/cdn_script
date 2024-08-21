const applicationObserver = new MutationObserver((mutationsList, observer) => {
  function findKeyValueIterative(obj, key) {
    if (obj === null || typeof obj !== 'object') {
        return undefined;
    }

    const stack = [obj];

    while (stack.length > 0) {
        const current = stack.pop();

        if (current !== null && typeof current === 'object') {
            if (key in current) {
                return current[key];
            }

            for (let k in current) {
                if (current.hasOwnProperty(k)) {
                    stack.push(current[k]);
                }
            }
        }
    }

    return undefined; // Return undefined if the key is not found
  }

  function removeCircularReferences(e, r = new WeakSet()) {
    if (e !== null && typeof e === 'object') {
        if (r.has(e)) return;

        r.add(e);

        if (Array.isArray(e)) {
            return e.map(item => removeCircularReferences(item, r));
        } else {
            const result = {};
            for (const key in e) {
                if (Object.prototype.hasOwnProperty.call(e, key)) {
                    const value = e[key];
                    if (typeof value === 'function') {
                        // Optionally exclude functions
                        continue;
                    }
                    result[key] = removeCircularReferences(value, r);
                }
            }
            return result;
        }
    }
    return e;
  }

  const applicantFormId = document.querySelector('input[name="application[applicant][id]"]')?.value
  const applicationFormId = document.querySelector('input[name="application[application][id]"]')?.value
  const googleAnalyticsId = findKeyValueIterative(removeCircularReferences(window), 'client_id')
  const applicationEntrataId = typeof dataLayer !== 'undefined' && findKeyValueIterative(dataLayer, 'entrata_user_id')

  const data = {
    applicant_id_from_form: applicantFormId,
    application_id_from_form: applicationFormId,
    google_analytics_id: googleAnalyticsId,
    application_id_from_dataLayer: applicationEntrataId,
    origin_url: window.location.origin,
    timestamp: new Date().toLocaleString(),
  };

  if (applicantFormId || applicationFormId || applicationEntrataId) {
    const proxyUrl = "https://scion-proxy-server-f85cd32d7f03.herokuapp.com/proxy/";

    fetch(proxyUrl, {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(data),
      headers: {
          "Content-Type": "application/json; charset=UTF-8",
      }
    })
    .then(response => console.log("Response:", response.json()))
    .then(data => console.log("Success:", data))
    .catch(error => {
      console.error("Error:", error);
    });
  }
});

applicationObserver.observe(document.body, { childList: true, subtree: true });