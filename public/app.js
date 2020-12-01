const toCurrency = price => {
    return new Intl.NumberFormat('de-DE', {
        currency: 'EUR',
        style: 'currency'
    }).format(price)
}

const toDate = date => {
    return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date(date))
}

document.querySelectorAll('.price').forEach(node => {
    node.textContent = toCurrency(node.textContent)
})

document.querySelectorAll('.date').forEach(node => {
    node.textContent = toDate(node.textContent)
})

const $cart = document.querySelector('#cart')
if ($cart) {
    $cart.addEventListener('click', event => {
        if(event.target.classList.contains('js-remove')) {
            const id = event.target.dataset.id
            const csrf = event.target.dataset.csrf
        
            fetch('/cart/remove/' + id, {
                method: 'delete',
                headers: {
                    'X-XSRF-TOKEN': csrf
                }
            }).then(res => res.json())
              .then(cart => {
                if (cart.courses.length) {
                    const html = cart.courses.map(course => {
                        return `
                        <tr>
                            <td>${course.title}</td>
                            <td>${course.count}</td>
                            <td>
                                <button class="btn btn-small red darken-4 js-remove" data-id="${course._id}" data-csrf="${csrf}">Delete</button>
                            </td>
                        </tr>
                        `
                    }).join('')
                    $cart.querySelector('tbody').innerHTML = html
                    $cart.querySelector('.price').textContent = toCurrency(cart.price)
                } else {
                    $cart.innerHTML = '<p>Your shopping cart is empty</p>'
                }
            })
        }
    })
}

//to init tabs from materialize
M.Tabs.init(document.querySelectorAll('.tabs'))

