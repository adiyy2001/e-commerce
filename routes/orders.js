const express = require('express');
const router = express.Router();
const { db } = require('../config/helpers');

router.get('/', (req, res) => {
    db.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'products as p',
                on: 'p.id = od.product_id'
            },
            {
                table: 'users as u',
                on: 'u.id = o.user_id'
            }
        ])
        .withFields(['o.id', 'p.title', 'p.description', 'p.price', 'u.username'])
        .getAll()
        .then(orders => {
            return orders.length > 0
            ? res.json(orders)
            : res.json({message: "No orders found"});

        }).catch(err => res.json(err));
});

router.get('/:id', async (req, res) => {
    let orderId = req.params.id;

    db.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'products as p',
                on: 'p.id = od.product_id'
            },
            {
                table: 'users as u',
                on: 'u.id = o.user_id'
            }
        ])
        .withFields(
            ['o.id', 'p.title', 'p.description', 'p.price', 'p.image', 'od.quantity as quantityOrdered']
         )
        .filter({'o.id': orderId})
        .getAll()
        .then(orders => {
            return orders.length > 0
            ? res.json(orders)
            : res.json({message: "No orders found"});

        }).catch(err => res.json(err));
});

router.post('/new', async (req, res) => {

    let {userId, products} = req.body;

    if (userId !== null && userId > 0) {
        db.table('orders')
            .insert({
                user_id: userId
            }).then((newOrderId) => {

            if (newOrderId > 0) {
                products.forEach(async (p) => {

                    let data = await db.table('products').filter({id: p.id}).withFields(['quantity']).get();



                    let inCart = parseInt(p.incart);

                    // Deduct the number of pieces ordered from the quantity in database

                    if (data.quantity > 0) {
                        data.quantity = data.quantity - inCart;

                        if (data.quantity < 0) {
                            data.quantity = 0;
                        }

                    } else {
                        data.quantity = 0;
                    }

                    // Insert order details w.r.t the newly created order Id
                    db.table('orders_details')
                        .insert({
                            order_id: newOrderId,
                            product_id: p.id,
                            quantity: inCart
                        }).then(_ => {
                        db.table('products')
                            .filter({id: p.id})
                            .update({
                                quantity: data.quantity
                            }).then(_ => {
                        }).catch(err => console.error(err));
                    }).catch(err => console.error(err));
                });

            } else {
                res.json({message: 'New order failed while adding order details', success: false});
            }
            res.json({
                message: `Order successfully placed with order id ${newOrderId}`,
                success: true,
                order_id: newOrderId,
                products: products
            })
        }).catch(err => res.json(err));
    }

    else {
        res.json({message: 'New order failed', success: false});
    }

});

router.post('/payment', (req, res) => {
    setTimeout(() => {
        res.status(200).json({success: true});
    }, 3000)
});


module.exports = router;
