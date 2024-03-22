const onDeleteProduct = (btn) => {
    const productId = btn.parentNode.querySelector('[name=productId]').value
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value
    console.log(productId);
    console.log(csrf);
    fetch(`/admin/product/${productId}`, {
        method: 'DELETE',
        headers:{
            'csrf-token':csrf
        }
    })
    .then(res => {
        console.log(res);
        btn.closest("article").remove()
    })
    .catch(err => {
        console.error(err)
    })
    

}