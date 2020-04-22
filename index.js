// SERVER

const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
dotenv.config({path:'.env'})

const indexRouter = require('./routes/index')
const CustomerRouter = require('./routes/Customers')
const ProductsRouter = require('./routes/Products')
const DriversRouter = require('./routes/Drivers')
const OrderRouter = require('./routes/Orders')
const OrderItemRouter = require('./routes/Order_items')

const app = express()

app.use(logger('dev'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

app.use('/', indexRouter)
app.use('/customer', CustomerRouter)
app.use('/product', ProductsRouter)
app.use('/driver', DriversRouter)
app.use('/order', OrderRouter)
app.use('/orderdetail', OrderItemRouter)

const PORT = process.env.PORT || 3000
app.listen(PORT, console.log(`Server running on port : ${PORT}`))


// BOT

const nodeTelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const midtransClient = require('midtrans-client')
const token = '1200240150:AAEZcBC-_3TAPRQaVyVc_r2LD6RQ9kyH2Go'

const bot = new nodeTelegramBot(token, { polling: true });
let cart = []

let snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: 'SB-Mid-server-6-2uwTq2qhdkT-oKHLtZFOSQ',
    clientKey: 'SB-Mid-client-Nw2paJZv9lb_LYlq'
});


bot.onText(/\/start|hi|hallo|hai/, (msg) => {
	bot.sendMessage(
		msg.chat.id,
        `Hai ${msg.from.first_name},\nSelamat datang di Warung Fadhel. 
        \nKirim /menu untuk melihat menu command yang tersedia`,
		{
			parse_mode: 'Markdown'
		}
	);
});

bot.onText(/\/menu/, (msg) => {
	bot.sendMessage(
		msg.chat.id,
		`Berikut adalah daftar menu/command : 
        \n/menu - melihat daftar menu atau command\n/product - melihat daftar product\n/profil - melihat profil anda\n/checkout - melakukan pembayaran`
	);
});

bot.onText(/\/profil/, async (msg)=>{
    const id = msg.from.id
    try {
        const response = await axios.get(`http://localhost:7000/customer/${id}`)
        bot.sendMessage(msg.chat.id, `profil anda : \nNama : ${response.data.data.full_name} \nUsername: ${response.data.data.username}\nEmail: ${response.data.data.email}\nPhone number: ${response.data.data.phone_number}.`, {
            parse_mode:'Markdown'
        })
    } catch (error) {
        console.log(error);
        bot.sendMessage(msg.chat.id, `Maaf, anda belum terdaftar.\nSilahkan mendaftar dengan mengirimkan data dengan format berikut : \n/daftar *nama*-*username*-*email*-*phone number*\nContoh : /daftar *john doe*-*john*-*john@gmail.com*-*09123232*`,{
            parse_mode:"Markdown"
        })
    }
})

bot.onText(/\/daftar (.+)/, async (msg, data)=>{

    const [full_name,username,email,phone_number] = data[1].split('-')
    try {
       const response = await axios.post('http://localhost:7000/customer',{
           "data": {
                "attributes": {
                    "id": msg.from.id,
                    "full_name": full_name,
                    "username": username,
                    "email": email,
                    "phone_number": phone_number
                }
           }
       })
       bot.sendMessage(msg.chat.id, 'Pendaftaran berhasil, silahkan /product untuk memilih products')
    } catch (error) {
        console.log(error);
        bot.sendMessage(msg.chat.id, 'Anda sudah terdaftar, kirim /profil, untuk melihat profil anda')
    }
})

bot.onText(/\/product/, async (msg)=>{

    try {
        const response = await axios.get('http://localhost:7000/product');
        const data = response.data.data;
        bot.sendMessage(msg.chat.id, 'hai selamat adtang di list product')
        data.forEach(e => {
            bot.sendMessage(
              msg.chat.id,
              `*Nama*: ${e.name}\n*Harga*: ${e.price}
        `,{
            "reply_markup": {
                "inline_keyboard": [
                    [
                        {
                            text: "simpan ke keranjang",
                            callback_data: e.id,
                        },
                    ],
                ],
            }, parse_mode:"Markdown"}
            );
          });
      setTimeout(()=>{
        bot.sendMessage(msg.chat.id,'Setelah selesai memilih produk, silahkan melakukan /checkout untuk pembayaran')
    }, 5000)
    } catch (error) {
        console.log(error);
    }
})

bot.on("callback_query", function onCallbackQuery(callbackQuery) {
    const action = parseInt(callbackQuery.data)
    const msg = callbackQuery.message
    const [nama,harga] = callbackQuery.message.text.split('\n')
    const name = nama.replace('Nama: ','')
    const price = harga.replace('Harga: ','')
    const newPrice = parseInt(price)

    const opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        parse_mode:'markdown'
      };
    const data = {
        "product_id": action,
        "name": name,
        "price": newPrice,
        "quantity": 1
    }
   cart.push(data)
   bot.editMessageText(`${name} berhasil ditambahkan ke cart !`, opts)
});

bot.onText(/\/checkout/, async (msg)=>{
    const id = msg.from.id
    try {
        const respon = await axios.get(`http://localhost:7000/customer/${id}`)
        const profil = respon.data
            if(cart.length>0){
                const response = await axios.post('http://localhost:7000/order',{
                    "data": {
                        "attributes": {
                            "user_id": msg.from.id,
                            "order_detail": cart
                        }
                      }
                })
                let subtotal = []
                cart.forEach(e => {
                    subtotal.push(e.quantity*e.price)
                });
                let total = subtotal.reduce((a,b)=>a+b)
                let parameter = {
                    transaction_details: {
                      order_id: `test-transaction-${Date.now()}`,
                      gross_amount: total
                    },
                    credit_card: {
                      secure: true
                    }
                  };
                
                  const transaction = await snap.createTransaction(parameter);

                bot.sendMessage(msg.chat.id, `Hallo ${msg.from.first_name}, berikut adalah pesanan anda`)
                cart.forEach((e) => {
                    bot.sendMessage(msg.chat.id, `- ${e.name}\nRp. ${e.price*e.quantity}`)
                });
                bot.sendMessage(msg.chat.id, `------------------------------
                Total* = *Rp. ${total}*`,{
                    parse_mode:'Markdown'
                })
                bot.sendMessage(msg.chat.id, `Untuk melakukkan pembayaran, silahkan kunjungi ${transaction.redirect_url}`,);
                cart = []
            }else{
                bot.sendMessage(msg.chat.id, 'Anda belum memilih product. Silahkan kirim /product untuk melihat dan memilih product.')
            }
    } catch (error) {
        console.log(error);
        bot.sendMessage(msg.chat.id, `Maaf anda belum terdaftar silahkan daftar dengan format : 
/daftar *nama*-*username*-*email*-*phone number*
        
Contoh : /daftar *john doe*-*john*-*john@gmail.com*-*09123232*`,{
                    parse_mode:"Markdown"
                })
    }
})
